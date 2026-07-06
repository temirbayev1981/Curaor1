import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { apiSuccess, apiError } from '@/lib/api/response';
import { contractService } from '@/domain/contract/contract.service';
import { getAuthContext, AuthError } from '@/lib/auth/rbac';
import { verifyBookingOwnership } from '@/lib/auth/ownership';
import { auditService } from '@/domain/audit/audit.service';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const requestId = randomUUID();
  const { bookingId } = await params;

  try {
    const ctx = await getAuthContext();
    if (!ctx) {
      return Response.json(apiError('UNAUTHORIZED', 'Authentication required', requestId), {
        status: 401,
      });
    }

    await verifyBookingOwnership(ctx.tenantId, ctx.userId, bookingId);

    const contract = await contractService.getByBooking(ctx.tenantId, bookingId);
    if (!contract) {
      const created = await contractService.createForBooking(ctx.tenantId, bookingId);
      return Response.json(apiSuccess(created, requestId));
    }
    return Response.json(apiSuccess(contract, requestId));
  } catch (err) {
    if (err instanceof AuthError) {
      const status = err.code === 'NOT_FOUND' ? 404 : err.code === 'FORBIDDEN' ? 403 : 401;
      return Response.json(apiError(err.code, err.message, requestId), { status });
    }
    const message = err instanceof Error ? err.message : 'Contract fetch failed';
    return Response.json(apiError('CONTRACT_ERROR', message, requestId), { status: 500 });
  }
}

const signSchema = z.object({
  signatureDataUrl: z.string().startsWith('data:image/'),
  signerName: z.string().min(1).max(200),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const requestId = randomUUID();
  const { bookingId } = await params;
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;

  try {
    const ctx = await getAuthContext();
    if (!ctx) {
      return Response.json(apiError('UNAUTHORIZED', 'Authentication required', requestId), {
        status: 401,
      });
    }

    await verifyBookingOwnership(ctx.tenantId, ctx.userId, bookingId);

    const body: unknown = await request.json();
    const parsed = signSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        apiError('VALIDATION_ERROR', parsed.error.message, requestId),
        { status: 400 }
      );
    }

    let contract = await contractService.getByBooking(ctx.tenantId, bookingId);
    if (!contract) {
      contract = await contractService.createForBooking(ctx.tenantId, bookingId);
    }

    const signed = await contractService.sign(ctx.tenantId, contract.id, {
      signatureDataUrl: parsed.data.signatureDataUrl,
      signerName: parsed.data.signerName,
      signedByUserId: ctx.userId,
      signedAt: new Date().toISOString(),
      bookingId,
    });

    await auditService.log({
      tenantId: ctx.tenantId,
      actorId: ctx.userId,
      action: 'contract.signed',
      resourceType: 'contract',
      resourceId: contract.id,
      details: { bookingId, signerName: parsed.data.signerName },
      ipAddress: ip,
    });

    return Response.json(apiSuccess(signed, requestId));
  } catch (err) {
    if (err instanceof AuthError) {
      const status = err.code === 'NOT_FOUND' ? 404 : err.code === 'FORBIDDEN' ? 403 : 401;
      return Response.json(apiError(err.code, err.message, requestId), { status });
    }
    const message = err instanceof Error ? err.message : 'Signing failed';
    return Response.json(apiError('SIGN_ERROR', message, requestId), { status: 500 });
  }
}

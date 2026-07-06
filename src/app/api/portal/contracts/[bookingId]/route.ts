import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { apiSuccess, apiError } from '@/lib/api/response';
import { contractService } from '@/domain/contract/contract.service';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const requestId = randomUUID();
  const { bookingId } = await params;
  const tenantId = request.nextUrl.searchParams.get('tenantId');

  if (!tenantId) {
    return Response.json(apiError('VALIDATION_ERROR', 'tenantId required', requestId), {
      status: 400,
    });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json(apiError('UNAUTHORIZED', 'Authentication required', requestId), {
      status: 401,
    });
  }

  try {
    const contract = await contractService.getByBooking(tenantId, bookingId);
    if (!contract) {
      const created = await contractService.createForBooking(tenantId, bookingId);
      return Response.json(apiSuccess(created, requestId));
    }
    return Response.json(apiSuccess(contract, requestId));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Contract fetch failed';
    return Response.json(apiError('CONTRACT_ERROR', message, requestId), { status: 500 });
  }
}

const signSchema = z.object({
  tenantId: z.string().uuid(),
  signatureDataUrl: z.string().startsWith('data:image/'),
  signerName: z.string().min(1).max(200),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const requestId = randomUUID();
  const { bookingId } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json(apiError('UNAUTHORIZED', 'Authentication required', requestId), {
      status: 401,
    });
  }

  try {
    const body: unknown = await request.json();
    const parsed = signSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        apiError('VALIDATION_ERROR', parsed.error.message, requestId),
        { status: 400 }
      );
    }

    let contract = await contractService.getByBooking(parsed.data.tenantId, bookingId);
    if (!contract) {
      contract = await contractService.createForBooking(parsed.data.tenantId, bookingId);
    }

    const signed = await contractService.sign(parsed.data.tenantId, contract.id, {
      signatureDataUrl: parsed.data.signatureDataUrl,
      signerName: parsed.data.signerName,
      signedByUserId: user.id,
      signedAt: new Date().toISOString(),
      bookingId,
    });

    return Response.json(apiSuccess(signed, requestId));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Signing failed';
    return Response.json(apiError('SIGN_ERROR', message, requestId), { status: 500 });
  }
}

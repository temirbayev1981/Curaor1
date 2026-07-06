import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { apiSuccess, apiError } from '@/lib/api/response';
import { paymentService } from '@/domain/payment/payment.service';
import { getAuthContext, AuthError } from '@/lib/auth/rbac';
import { verifyBookingOwnership } from '@/lib/auth/ownership';
import { auditService } from '@/domain/audit/audit.service';

const checkoutSchema = z.object({
  bookingId: z.string().uuid(),
  paymentType: z.enum(['deposit', 'balance', 'full']),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export async function POST(request: NextRequest) {
  const requestId = randomUUID();
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;

  try {
    const ctx = await getAuthContext();
    if (!ctx) {
      return Response.json(apiError('UNAUTHORIZED', 'Authentication required', requestId), {
        status: 401,
      });
    }

    const body: unknown = await request.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        apiError('VALIDATION_ERROR', parsed.error.message, requestId),
        { status: 400 }
      );
    }

    await verifyBookingOwnership(ctx.tenantId, ctx.userId, parsed.data.bookingId);

    const session = await paymentService.createCheckoutSession(
      ctx.tenantId,
      parsed.data.bookingId,
      parsed.data.paymentType,
      parsed.data.successUrl,
      parsed.data.cancelUrl
    );

    await auditService.log({
      tenantId: ctx.tenantId,
      actorId: ctx.userId,
      action: 'payment.checkout_created',
      resourceType: 'booking',
      resourceId: parsed.data.bookingId,
      details: { paymentType: parsed.data.paymentType },
      ipAddress: ip,
    });

    return Response.json(apiSuccess(session, requestId));
  } catch (err) {
    if (err instanceof AuthError) {
      const status = err.code === 'NOT_FOUND' ? 404 : err.code === 'FORBIDDEN' ? 403 : 401;
      return Response.json(apiError(err.code, err.message, requestId), { status });
    }
    const message = err instanceof Error ? err.message : 'Payment error';
    return Response.json(apiError('PAYMENT_ERROR', message, requestId), { status: 500 });
  }
}

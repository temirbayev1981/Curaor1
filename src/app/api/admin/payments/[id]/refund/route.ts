import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { apiSuccess, apiError } from '@/lib/api/response';
import { requireStaff, AuthError } from '@/lib/auth/rbac';
import { paymentService } from '@/domain/payment/payment.service';
import { auditService } from '@/domain/audit/audit.service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = randomUUID();
  const { id: paymentId } = await params;
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;

  try {
    const ctx = await requireStaff();
    const payment = await paymentService.refund(ctx.tenantId, paymentId);

    await auditService.log({
      tenantId: ctx.tenantId,
      actorId: ctx.userId,
      action: 'payment.refunded',
      resourceType: 'payment',
      resourceId: paymentId,
      details: { bookingId: payment.booking_id, amount: payment.amount },
      ipAddress: ip,
    });

    return Response.json(apiSuccess(payment, requestId));
  } catch (err) {
    if (err instanceof AuthError) {
      return Response.json(apiError(err.code, err.message, requestId), {
        status: err.code === 'FORBIDDEN' ? 403 : 401,
      });
    }
    const message = err instanceof Error ? err.message : 'Refund failed';
    return Response.json(apiError('REFUND_ERROR', message, requestId), { status: 500 });
  }
}

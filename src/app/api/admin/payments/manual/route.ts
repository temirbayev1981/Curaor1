import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { apiSuccess, apiError } from '@/lib/api/response';
import { requireStaff, AuthError } from '@/lib/auth/rbac';
import { createAdminClient } from '@/lib/supabase/admin';
import { auditService } from '@/domain/audit/audit.service';

const schema = z.object({
  bookingId: z.string().uuid(),
  amount: z.number().positive(),
  paymentType: z.enum(['deposit', 'balance', 'full']),
  note: z.string().max(500).optional(),
});

export async function POST(request: NextRequest) {
  const requestId = randomUUID();
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;

  try {
    const ctx = await requireStaff();
    const body = schema.parse(await request.json());
    const supabase = createAdminClient();

    const { data: payment, error } = await supabase
      .from('payments')
      .insert({
        tenant_id: ctx.tenantId,
        booking_id: body.bookingId,
        amount: body.amount,
        payment_type: body.paymentType,
        status: 'succeeded',
        metadata: { manual: true, note: body.note ?? null },
      })
      .select()
      .single();

    if (error || !payment) {
      throw new Error(error?.message ?? 'Failed to record payment');
    }

    await auditService.log({
      tenantId: ctx.tenantId,
      actorId: ctx.userId,
      action: 'payment.manual_recorded',
      resourceType: 'payment',
      resourceId: payment.id,
      details: { bookingId: body.bookingId, amount: body.amount },
      ipAddress: ip,
    });

    return Response.json(apiSuccess(payment, requestId), { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) {
      return Response.json(apiError(err.code, err.message, requestId), {
        status: err.code === 'FORBIDDEN' ? 403 : 401,
      });
    }
    if (err instanceof z.ZodError) {
      return Response.json(
        apiError('VALIDATION_ERROR', err.message, requestId),
        { status: 400 }
      );
    }
    const message = err instanceof Error ? err.message : 'Payment failed';
    return Response.json(apiError('PAYMENT_ERROR', message, requestId), { status: 500 });
  }
}

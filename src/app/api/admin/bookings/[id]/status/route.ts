import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { apiSuccess, apiError } from '@/lib/api/response';
import { requireStaff, AuthError } from '@/lib/auth/rbac';
import { bookingService } from '@/domain/booking/booking.service';
import { auditService } from '@/domain/audit/audit.service';
import { transitionBookingSchema } from '@/domain/booking/booking.schema';

const bodySchema = transitionBookingSchema.extend({
  tenantId: z.string().uuid(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = randomUUID();
  const { id: bookingId } = await params;
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;

  try {
    const ctx = await requireStaff();
    const body: unknown = await request.json();
    const parsed = bodySchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        apiError('VALIDATION_ERROR', parsed.error.message, requestId),
        { status: 400 }
      );
    }

    if (parsed.data.tenantId !== ctx.tenantId) {
      return Response.json(apiError('FORBIDDEN', 'Tenant mismatch', requestId), {
        status: 403,
      });
    }

    const updated = await bookingService.transition(
      ctx.tenantId,
      bookingId,
      parsed.data.status
    );

    await auditService.log({
      tenantId: ctx.tenantId,
      actorId: ctx.userId,
      action: 'booking.status_changed',
      resourceType: 'booking',
      resourceId: bookingId,
      details: { status: parsed.data.status },
      ipAddress: ip,
    });

    return Response.json(apiSuccess(updated, requestId));
  } catch (err) {
    if (err instanceof AuthError) {
      return Response.json(apiError(err.code, err.message, requestId), {
        status: err.code === 'FORBIDDEN' ? 403 : 401,
      });
    }
    const message = err instanceof Error ? err.message : 'Update failed';
    return Response.json(apiError('UPDATE_ERROR', message, requestId), { status: 500 });
  }
}

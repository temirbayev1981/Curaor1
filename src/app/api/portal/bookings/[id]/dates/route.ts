import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { apiSuccess, apiError } from '@/lib/api/response';
import { bookingService } from '@/domain/booking/booking.service';
import { updateBookingDatesSchema } from '@/domain/booking/booking.schema';
import { getAuthContext, AuthError } from '@/lib/auth/rbac';
import { verifyBookingOwnership } from '@/lib/auth/ownership';
import { auditService } from '@/domain/audit/audit.service';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = randomUUID();
  const { id: bookingId } = await params;
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;

  try {
    const ctx = await getAuthContext();
    if (!ctx) {
      return Response.json(apiError('UNAUTHORIZED', 'Authentication required', requestId), {
        status: 401,
      });
    }

    const body: unknown = await request.json();
    const parsed = updateBookingDatesSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        apiError('VALIDATION_ERROR', parsed.error.message, requestId),
        { status: 400 }
      );
    }

    await verifyBookingOwnership(ctx.tenantId, ctx.userId, bookingId);

    const updated = await bookingService.updateDates(
      ctx.tenantId,
      bookingId,
      {
        bookingStart: parsed.data.bookingStart,
        bookingEnd: parsed.data.bookingEnd,
      }
    );

    await auditService.log({
      tenantId: ctx.tenantId,
      actorId: ctx.userId,
      action: 'booking.dates_updated',
      resourceType: 'booking',
      resourceId: bookingId,
      details: {
        bookingStart: parsed.data.bookingStart,
        bookingEnd: parsed.data.bookingEnd,
      },
      ipAddress: ip,
    });

    return Response.json(apiSuccess(updated, requestId));
  } catch (err) {
    if (err instanceof AuthError) {
      const status = err.code === 'NOT_FOUND' ? 404 : err.code === 'FORBIDDEN' ? 403 : 401;
      return Response.json(apiError(err.code, err.message, requestId), { status });
    }
    const message = err instanceof Error ? err.message : 'Update failed';
    return Response.json(apiError('UPDATE_ERROR', message, requestId), { status: 500 });
  }
}

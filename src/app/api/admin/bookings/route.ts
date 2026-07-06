import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { apiSuccess, apiError } from '@/lib/api/response';
import { requireStaff, AuthError } from '@/lib/auth/rbac';
import { bookingService } from '@/domain/booking/booking.service';

export async function GET(request: NextRequest) {
  const requestId = randomUUID();

  try {
    const ctx = await requireStaff();
    const bookings = await bookingService.getByTenant(ctx.tenantId);
    return Response.json(apiSuccess(bookings, requestId));
  } catch (err) {
    if (err instanceof AuthError) {
      return Response.json(apiError(err.code, err.message, requestId), {
        status: err.code === 'FORBIDDEN' ? 403 : 401,
      });
    }
    const message = err instanceof Error ? err.message : 'Fetch failed';
    return Response.json(apiError('FETCH_ERROR', message, requestId), { status: 500 });
  }
}

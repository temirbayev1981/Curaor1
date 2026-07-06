import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { apiSuccess, apiError } from '@/lib/api/response';
import { bookingService } from '@/domain/booking/booking.service';
import { getAuthContext, AuthError } from '@/lib/auth/rbac';

export async function GET() {
  const requestId = randomUUID();

  try {
    const ctx = await getAuthContext();
    if (!ctx) {
      return Response.json(apiError('UNAUTHORIZED', 'Authentication required', requestId), {
        status: 401,
      });
    }

    const { getCustomerIdForUser } = await import('@/lib/auth/ownership');
    const customerId = await getCustomerIdForUser(ctx.tenantId, ctx.userId);

    if (!customerId) {
      return Response.json(apiSuccess([], requestId));
    }

    const bookings = await bookingService.getByCustomer(ctx.tenantId, customerId);
    return Response.json(apiSuccess(bookings, requestId));
  } catch (err) {
    if (err instanceof AuthError) {
      return Response.json(apiError(err.code, err.message, requestId), { status: 401 });
    }
    const message = err instanceof Error ? err.message : 'Fetch failed';
    return Response.json(apiError('FETCH_ERROR', message, requestId), { status: 500 });
  }
}

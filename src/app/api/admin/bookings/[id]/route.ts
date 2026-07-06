import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { apiSuccess, apiError } from '@/lib/api/response';
import { requireStaff, AuthError } from '@/lib/auth/rbac';
import { bookingService } from '@/domain/booking/booking.service';
import { paymentService } from '@/domain/payment/payment.service';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Booking, Customer, Payment } from '@/types/database';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = randomUUID();
  const { id: bookingId } = await params;

  try {
    const ctx = await requireStaff();
    const booking = await bookingService.getById(ctx.tenantId, bookingId);

    const supabase = createAdminClient();
    const [customerRes, payments] = await Promise.all([
      supabase
        .from('customers')
        .select('*')
        .eq('id', booking.customer_id)
        .single(),
      paymentService.getByBooking(ctx.tenantId, bookingId),
    ]);

    return Response.json(
      apiSuccess(
        {
          booking,
          customer: (customerRes.data ?? null) as Customer | null,
          payments: payments as Payment[],
        },
        requestId
      )
    );
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

const notesSchema = z.object({
  notes: z.string().max(2000),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = randomUUID();
  const { id: bookingId } = await params;

  try {
    const ctx = await requireStaff();
    const body = notesSchema.parse(await request.json());
    const booking = await bookingService.updateNotes(
      ctx.tenantId,
      bookingId,
      body.notes
    );

    return Response.json(apiSuccess(booking as Booking, requestId));
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
    const message = err instanceof Error ? err.message : 'Update failed';
    return Response.json(apiError('UPDATE_ERROR', message, requestId), { status: 500 });
  }
}

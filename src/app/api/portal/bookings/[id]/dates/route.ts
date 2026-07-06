import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { apiSuccess, apiError } from '@/lib/api/response';
import { bookingService } from '@/domain/booking/booking.service';
import { updateBookingDatesSchema } from '@/domain/booking/booking.schema';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = randomUUID();
  const { id: bookingId } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json(apiError('UNAUTHORIZED', 'Authentication required', requestId), {
      status: 401,
    });
  }

  try {
    const body: unknown = await request.json();
    const parsed = updateBookingDatesSchema.extend({
      tenantId: z.string().uuid(),
    }).safeParse(body);

    if (!parsed.success) {
      return Response.json(
        apiError('VALIDATION_ERROR', parsed.error.message, requestId),
        { status: 400 }
      );
    }

    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('tenant_id', parsed.data.tenantId)
      .eq('user_id', user.id)
      .single();

    if (!customer) {
      return Response.json(apiError('FORBIDDEN', 'Access denied', requestId), { status: 403 });
    }

    const { data: booking } = await supabase
      .from('bookings')
      .select('customer_id, status')
      .eq('id', bookingId)
      .eq('tenant_id', parsed.data.tenantId)
      .single();

    if (!booking || (booking as { customer_id: string }).customer_id !== (customer as { id: string }).id) {
      return Response.json(apiError('FORBIDDEN', 'Booking not found', requestId), { status: 403 });
    }

    const updated = await bookingService.updateDates(
      parsed.data.tenantId,
      bookingId,
      {
        bookingStart: parsed.data.bookingStart,
        bookingEnd: parsed.data.bookingEnd,
      }
    );

    return Response.json(apiSuccess(updated, requestId));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Update failed';
    return Response.json(apiError('UPDATE_ERROR', message, requestId), { status: 500 });
  }
}

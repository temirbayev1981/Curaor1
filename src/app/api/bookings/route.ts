import '@/domain/events/register-consumers';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { apiSuccess, apiError } from '@/lib/api/response';
import { checkBookingRateLimit } from '@/lib/api/rate-limit';
import { bookingService } from '@/domain/booking/booking.service';
import { createBookingSchema } from '@/domain/booking/booking.schema';
import { calculateDistance } from '@/domain/maps/distance.service';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { linkCustomerToUser } from '@/lib/auth/rbac';

const publicBookingSchema = createBookingSchema.extend({
  fullName: z.string().min(1).max(200),
  email: z.string().email(),
  phone: z.string().optional(),
}).omit({ customerId: true }).extend({
  customerId: z.string().uuid().optional(),
});

export async function POST(request: NextRequest) {
  const requestId = randomUUID();
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';

  const allowed = await checkBookingRateLimit(ip);
  if (!allowed) {
    return Response.json(
      apiError('RATE_LIMITED', 'Too many booking requests. Max 3 per minute.', requestId),
      { status: 429 }
    );
  }

  try {
    const body: unknown = await request.json();
    const parsed = publicBookingSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        apiError('VALIDATION_ERROR', parsed.error.message, requestId),
        { status: 400 }
      );
    }

    const input = parsed.data;
    const supabase = createAdminClient();
    const authSupabase = await createClient();
    const { data: { user } } = await authSupabase.auth.getUser();

    if (user) {
      await linkCustomerToUser(input.tenantId, user.id, input.email);
    }

    let customerId: string;
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id, user_id')
      .eq('tenant_id', input.tenantId)
      .eq('email', input.email)
      .maybeSingle();

    if (existingCustomer?.id) {
      customerId = existingCustomer.id as string;
      if (user && !(existingCustomer as { user_id: string | null }).user_id) {
        await supabase
          .from('customers')
          .update({ user_id: user.id })
          .eq('id', customerId);
      }
    } else {
      const { data: newCustomer, error: customerError } = await supabase
        .from('customers')
        .insert({
          tenant_id: input.tenantId,
          email: input.email,
          full_name: input.fullName,
          phone: input.phone ?? null,
        })
        .select('id')
        .single();

      if (customerError || !newCustomer) {
        return Response.json(
          apiError('CUSTOMER_ERROR', 'Failed to create customer', requestId),
          { status: 500 }
        );
      }
      customerId = newCustomer.id as string;
    }

    let deliveryDistanceMiles = input.deliveryDistanceMiles;
    if (!deliveryDistanceMiles && input.venueAddress) {
      try {
        const distance = await calculateDistance(
          `${input.venueAddress}, ${input.venueCity}, ${input.venueState}`
        );
        deliveryDistanceMiles = distance.distanceMiles;
      } catch {
        // Distance calculation optional if Mapbox not configured
      }
    }

    const booking = await bookingService.create({
      ...input,
      customerId,
      deliveryDistanceMiles,
    });

    return Response.json(apiSuccess(booking, requestId), { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return Response.json(apiError('BOOKING_ERROR', message, requestId), { status: 500 });
  }
}

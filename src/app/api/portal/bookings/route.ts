import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { apiSuccess, apiError } from '@/lib/api/response';
import { bookingService } from '@/domain/booking/booking.service';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const requestId = randomUUID();
  const tenantId = request.nextUrl.searchParams.get('tenantId');

  if (!tenantId) {
    return Response.json(apiError('VALIDATION_ERROR', 'tenantId required', requestId), {
      status: 400,
    });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json(apiError('UNAUTHORIZED', 'Authentication required', requestId), {
      status: 401,
    });
  }

  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('tenant_id', tenantId)
    .eq('user_id', user.id)
    .single();

  if (!customer) {
    return Response.json(apiSuccess([], requestId));
  }

  const bookings = await bookingService.getByCustomer(tenantId, customer.id);
  return Response.json(apiSuccess(bookings, requestId));
}

import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { apiSuccess, apiError } from '@/lib/api/response';
import { requireStaff, AuthError } from '@/lib/auth/rbac';
import { calculateDistanceBetween } from '@/domain/maps/distance.service';
import { calculateDeliveryCost } from '@/lib/config/hierarchy';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Tenant } from '@/types/database';
import { resolveConfig } from '@/lib/config/hierarchy';
import { bookingService } from '@/domain/booking/booking.service';

const schema = z.object({
  originAddress: z.string().min(3),
  destinationAddress: z.string().min(3),
  bookingId: z.string().uuid().optional(),
});

export async function POST(request: NextRequest) {
  const requestId = randomUUID();

  try {
    const ctx = await requireStaff();
    const body = schema.parse(await request.json());

    const supabase = createAdminClient();
    const { data: tenant } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', ctx.tenantId)
      .single();

    const config = resolveConfig({
      tenantSettings: (tenant as Tenant).settings,
      adminOverrides: (tenant as Tenant).admin_overrides as Record<string, unknown>,
    });

    const route = await calculateDistanceBetween(
      body.originAddress,
      body.destinationAddress
    );
    const deliveryCost = calculateDeliveryCost(route.distanceMiles, config.price_per_mile);

    let booking = null;
    if (body.bookingId) {
      booking = await bookingService.updateDelivery(
        ctx.tenantId,
        body.bookingId,
        route.distanceMiles,
        deliveryCost
      );
    }

    return Response.json(
      apiSuccess(
        {
          ...route,
          pricePerMile: config.price_per_mile,
          deliveryCost,
          booking,
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
    if (err instanceof z.ZodError) {
      return Response.json(apiError('VALIDATION_ERROR', err.message, requestId), {
        status: 400,
      });
    }
    const message = err instanceof Error ? err.message : 'Calculation failed';
    return Response.json(apiError('DISTANCE_ERROR', message, requestId), { status: 500 });
  }
}

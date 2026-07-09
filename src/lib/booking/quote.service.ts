import { createAdminClient } from '@/lib/supabase/admin';
import {
  calculateBookingTotals,
  calculateDeliveryCost,
  getDepositPercent,
  resolveConfig,
} from '@/lib/config/hierarchy';
import { calculateDistance } from '@/domain/maps/distance.service';
import {
  calculateEventPrice,
  isPackageTierId,
  type PackageTierId,
} from './packages';
import type { Tenant } from '@/types/database';

export interface QuoteInput {
  tenantId: string;
  guestCount: number;
  depositPercent?: 25 | 50 | 100;
  packageTier?: PackageTierId;
  venueAddress?: string;
  venueCity?: string;
  venueState?: string;
  deliveryDistanceMiles?: number;
  date?: string;
  bookingStart?: string;
  bookingEnd?: string;
}

export interface QuoteResult {
  packageTier: PackageTierId;
  baseEventPrice: number;
  packageBasePrice: number;
  deliveryDistanceMiles: number | null;
  deliveryCost: number;
  subtotal: number;
  depositPercent: 25 | 50 | 100;
  depositAmount: number;
  balanceDue: number;
  currency: string;
  availability: {
    available: boolean;
    message: string;
  };
}

export async function buildBookingQuote(input: QuoteInput): Promise<QuoteResult> {
  const supabase = createAdminClient();
  const { data: tenant, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', input.tenantId)
    .single();

  if (error || !tenant) {
    throw new Error('Tenant not found');
  }

  const typedTenant = tenant as Tenant;
  const config = resolveConfig({
    tenantSettings: typedTenant.settings,
    adminOverrides: typedTenant.admin_overrides as Record<string, unknown>,
  });

  const packageTier =
    input.packageTier && isPackageTierId(input.packageTier)
      ? input.packageTier
      : 'shamrock';

  const depositPercent = getDepositPercent(config, input.depositPercent);
  const packageBasePrice = calculateEventPrice(
    config.base_event_price,
    packageTier,
    input.guestCount
  );

  let deliveryDistanceMiles = input.deliveryDistanceMiles ?? null;
  if (deliveryDistanceMiles == null && input.venueAddress && input.venueCity) {
    try {
      const distance = await calculateDistance(
        `${input.venueAddress}, ${input.venueCity}, ${input.venueState ?? 'NC'}`
      );
      deliveryDistanceMiles = distance.distanceMiles;
    } catch {
      deliveryDistanceMiles = null;
    }
  }

  const deliveryCost =
    deliveryDistanceMiles != null
      ? calculateDeliveryCost(deliveryDistanceMiles, config.price_per_mile)
      : 0;

  const { subtotal, depositAmount, balanceDue } = calculateBookingTotals(
    packageBasePrice,
    deliveryCost,
    depositPercent
  );

  const availability = await checkAvailability(
    input.tenantId,
    input.date,
    input.bookingStart,
    input.bookingEnd
  );

  return {
    packageTier,
    baseEventPrice: config.base_event_price,
    packageBasePrice,
    deliveryDistanceMiles,
    deliveryCost,
    subtotal,
    depositPercent,
    depositAmount,
    balanceDue,
    currency: config.currency,
    availability,
  };
}

async function checkAvailability(
  tenantId: string,
  date?: string,
  bookingStart?: string,
  bookingEnd?: string
): Promise<{ available: boolean; message: string }> {
  if (!date && !bookingStart) {
    return { available: true, message: 'select_date' };
  }

  const supabase = createAdminClient();
  const query = supabase
    .from('bookings')
    .select('id, booking_start, booking_end, status')
    .eq('tenant_id', tenantId)
    .neq('status', 'cancelled');

  if (bookingStart && bookingEnd) {
    const { data, error } = await query;
    if (error) return { available: true, message: 'unknown' };

    const start = new Date(bookingStart).getTime();
    const end = new Date(bookingEnd).getTime();
    const conflict = (data ?? []).some((row) => {
      const rowStart = new Date(row.booking_start as string).getTime();
      const rowEnd = new Date(row.booking_end as string).getTime();
      return start < rowEnd && end > rowStart;
    });

    return conflict
      ? { available: false, message: 'slot_taken' }
      : { available: true, message: 'slot_open' };
  }

  if (date) {
    const dayStart = `${date}T00:00:00.000Z`;
    const dayEnd = `${date}T23:59:59.999Z`;
    const { data, error } = await query
      .gte('booking_start', dayStart)
      .lte('booking_start', dayEnd);

    if (error) return { available: true, message: 'unknown' };

    const count = data?.length ?? 0;
    if (count >= 2) {
      return { available: false, message: 'day_full' };
    }
    if (count === 1) {
      return { available: true, message: 'day_limited' };
    }
    return { available: true, message: 'day_open' };
  }

  return { available: true, message: 'unknown' };
}

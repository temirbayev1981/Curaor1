import { resolveConfig, SYSTEM_DEFAULTS, type ConfigContext } from '@/lib/config/hierarchy';
import {
  calculateEventPrice,
  INTIMATE_GUEST_TIERS,
  type PackageTierId,
} from '@/lib/booking/packages';
import type { TenantSettings } from '@/types/database';

export const SERVICE_EVENT_QUOTES = {
  weddings: { tier: 'emerald', guestCount: 80 },
  corporate: { tier: 'emerald', guestCount: 60 },
  private: { tier: 'shamrock', guestCount: 30 },
  stpatricks: { tier: 'shamrock', guestCount: 40 },
} as const satisfies Record<
  string,
  { tier: PackageTierId; guestCount: number }
>;

export type ServiceEventKey = keyof typeof SERVICE_EVENT_QUOTES;

export interface ServicesPricing {
  currency: string;
  events: Record<ServiceEventKey, number>;
  guestPackages: Record<(typeof INTIMATE_GUEST_TIERS)[number], number>;
}

export function buildServicesPricing(settings: TenantSettings): ServicesPricing {
  const events = {} as ServicesPricing['events'];
  for (const [key, quote] of Object.entries(SERVICE_EVENT_QUOTES)) {
    events[key as ServiceEventKey] = calculateEventPrice(
      settings.base_event_price,
      quote.tier,
      quote.guestCount
    );
  }

  const guestPackages = {} as ServicesPricing['guestPackages'];
  for (const guests of INTIMATE_GUEST_TIERS) {
    guestPackages[guests] = calculateEventPrice(
      settings.base_event_price,
      'shamrock',
      guests
    );
  }

  return {
    currency: settings.currency,
    events,
    guestPackages,
  };
}

export function buildServicesPricingFromContext(ctx: ConfigContext = {}): ServicesPricing {
  return buildServicesPricing(resolveConfig(ctx));
}

export function getDefaultServicesPricing(): ServicesPricing {
  return buildServicesPricing(SYSTEM_DEFAULTS);
}

import { resolveConfig, SYSTEM_DEFAULTS, type ConfigContext } from '@/lib/config/hierarchy';
import {
  calculatePackagePrice,
  PACKAGE_TIER_IDS,
  type PackageTierId,
} from '@/lib/booking/packages';
import type { TenantSettings } from '@/types/database';

export const SERVICE_EVENT_PACKAGES: Record<string, PackageTierId> = {
  weddings: 'g60',
  corporate: 'g60',
  private: 'g35',
  stpatricks: 'g35',
};

export type ServiceEventKey = keyof typeof SERVICE_EVENT_PACKAGES;

export interface PackagePricing {
  currency: string;
  packages: Record<PackageTierId, number>;
}

export interface ServicesPricing {
  currency: string;
  events: Record<ServiceEventKey, number>;
}

export function buildPackagePricing(settings: TenantSettings): PackagePricing {
  const packages = {} as PackagePricing['packages'];
  for (const id of PACKAGE_TIER_IDS) {
    packages[id] = calculatePackagePrice(settings.base_event_price, id);
  }

  return {
    currency: settings.currency,
    packages,
  };
}

export function buildServicesPricing(settings: TenantSettings): ServicesPricing {
  const events = {} as ServicesPricing['events'];
  for (const [key, packageId] of Object.entries(SERVICE_EVENT_PACKAGES)) {
    events[key as ServiceEventKey] = calculatePackagePrice(
      settings.base_event_price,
      packageId
    );
  }

  return {
    currency: settings.currency,
    events,
  };
}

export function buildServicesPricingFromContext(ctx: ConfigContext = {}): ServicesPricing {
  return buildServicesPricing(resolveConfig(ctx));
}

export function buildPackagePricingFromContext(ctx: ConfigContext = {}): PackagePricing {
  return buildPackagePricing(resolveConfig(ctx));
}

export function getDefaultServicesPricing(): ServicesPricing {
  return buildServicesPricing(SYSTEM_DEFAULTS);
}

export function getDefaultPackagePricing(): PackagePricing {
  return buildPackagePricing(SYSTEM_DEFAULTS);
}

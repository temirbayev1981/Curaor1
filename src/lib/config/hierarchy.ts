import type { TenantSettings } from '@/types/database';
import { getSupportEmail } from '@/lib/config/env';

export const SYSTEM_DEFAULTS: TenantSettings = {
  price_per_mile: 2.5,
  default_deposit_percent: 25,
  base_event_price: 1500,
  currency: 'USD',
  timezone: 'America/New_York',
  notification_email: getSupportEmail(),
  telegram_chat_id: null,
};

export interface ConfigContext {
  tenantSettings?: Partial<TenantSettings>;
  adminOverrides?: Partial<TenantSettings>;
  runtimeOverrides?: Partial<TenantSettings>;
}

export function resolveConfig(ctx: ConfigContext): TenantSettings {
  return {
    ...SYSTEM_DEFAULTS,
    ...ctx.tenantSettings,
    ...ctx.adminOverrides,
    ...ctx.runtimeOverrides,
  };
}

export function getDepositPercent(
  config: TenantSettings,
  override?: 25 | 50 | 100
): 25 | 50 | 100 {
  return override ?? config.default_deposit_percent;
}

export function calculateDeliveryCost(
  distanceMiles: number,
  pricePerMile: number
): number {
  return Math.round(distanceMiles * pricePerMile * 100) / 100;
}

export function calculateBookingTotals(
  basePrice: number,
  deliveryCost: number,
  depositPercent: 25 | 50 | 100
): { subtotal: number; depositAmount: number; balanceDue: number } {
  const subtotal = basePrice + deliveryCost;
  const depositAmount = Math.round(subtotal * (depositPercent / 100) * 100) / 100;
  const balanceDue = Math.round((subtotal - depositAmount) * 100) / 100;
  return { subtotal, depositAmount, balanceDue };
}

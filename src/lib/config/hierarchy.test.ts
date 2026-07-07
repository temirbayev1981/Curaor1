import { describe, it, expect } from 'vitest';
import {
  resolveConfig,
  calculateDeliveryCost,
  calculateBookingTotals,
  getDepositPercent,
  SYSTEM_DEFAULTS,
} from '@/lib/config/hierarchy';

describe('ConfigHierarchy', () => {
  it('resolves config with correct priority', () => {
    const config = resolveConfig({
      tenantSettings: { price_per_mile: 3.0 },
      adminOverrides: { price_per_mile: 3.5 },
      runtimeOverrides: { price_per_mile: 4.0 },
    });
    expect(config.price_per_mile).toBe(4.0);
    expect(config.base_event_price).toBe(SYSTEM_DEFAULTS.base_event_price);
  });

  it('calculates delivery cost', () => {
    expect(calculateDeliveryCost(10, 2.5)).toBe(25);
    expect(calculateDeliveryCost(15.5, 2.5)).toBe(38.75);
  });

  it('calculates booking totals with deposit', () => {
    const totals = calculateBookingTotals(1500, 50, 25);
    expect(totals.subtotal).toBe(1550);
    expect(totals.depositAmount).toBe(387.5);
    expect(totals.balanceDue).toBe(1162.5);
  });

  it('uses override deposit percent when provided', () => {
    const config = resolveConfig({});
    expect(getDepositPercent(config, 100)).toBe(100);
    expect(getDepositPercent(config)).toBe(25);
  });
});

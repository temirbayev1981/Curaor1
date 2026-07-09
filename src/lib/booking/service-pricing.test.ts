import { describe, expect, it } from 'vitest';
import { buildPackagePricing, buildServicesPricing } from './service-pricing';
import { SYSTEM_DEFAULTS } from '@/lib/config/hierarchy';

describe('service-pricing', () => {
  it('builds package prices for all guest tiers', () => {
    const pricing = buildPackagePricing(SYSTEM_DEFAULTS);

    expect(pricing.packages.g10).toBe(1260);
    expect(pricing.packages.g20).toBe(1860);
    expect(pricing.packages.g35).toBe(2400);
    expect(pricing.packages.g60).toBe(3000);
  });

  it('builds service starting prices from recommended packages', () => {
    const pricing = buildServicesPricing(SYSTEM_DEFAULTS);

    expect(pricing.events.weddings).toBe(3000);
    expect(pricing.events.corporate).toBe(3000);
    expect(pricing.events.private).toBe(2400);
    expect(pricing.events.stpatricks).toBe(2400);
  });

  it('scales with admin base_event_price overrides', () => {
    const pricing = buildPackagePricing({
      ...SYSTEM_DEFAULTS,
      base_event_price: 1200,
    });

    expect(pricing.packages.g10).toBe(1008);
    expect(pricing.packages.g60).toBe(2400);
  });
});

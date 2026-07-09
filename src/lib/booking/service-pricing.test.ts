import { describe, expect, it } from 'vitest';
import { buildServicesPricing } from './service-pricing';
import { SYSTEM_DEFAULTS } from '@/lib/config/hierarchy';

describe('service-pricing', () => {
  it('builds event and guest package prices from tenant settings', () => {
    const pricing = buildServicesPricing(SYSTEM_DEFAULTS);

    expect(pricing.events.weddings).toBe(2025);
    expect(pricing.events.corporate).toBe(2025);
    expect(pricing.events.private).toBe(1125);
    expect(pricing.events.stpatricks).toBe(1500);

    expect(pricing.guestPackages[10]).toBe(630);
    expect(pricing.guestPackages[15]).toBe(780);
    expect(pricing.guestPackages[20]).toBe(930);
    expect(pricing.guestPackages[30]).toBe(1125);
  });

  it('scales with admin base_event_price overrides', () => {
    const pricing = buildServicesPricing({
      ...SYSTEM_DEFAULTS,
      base_event_price: 1200,
    });

    expect(pricing.guestPackages[10]).toBe(504);
    expect(pricing.events.stpatricks).toBe(1200);
  });
});

import { describe, expect, it } from 'vitest';
import { calculatePackageBasePrice } from './packages';

describe('booking packages', () => {
  it('scales price by tier and extra guests', () => {
    expect(calculatePackageBasePrice(1500, 'shamrock', 50)).toBe(1500);
    expect(calculatePackageBasePrice(1500, 'shamrock', 60)).toBe(1620);
    expect(calculatePackageBasePrice(1500, 'emerald', 100)).toBe(2025);
    expect(calculatePackageBasePrice(1500, 'legend', 200)).toBe(2625);
  });
});

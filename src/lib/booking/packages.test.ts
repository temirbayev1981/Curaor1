import { describe, expect, it } from 'vitest';
import {
  calculateEventPrice,
  calculateIntimatePackagePrice,
  calculatePackageBasePrice,
} from './packages';

describe('booking packages', () => {
  it('scales price by tier and extra guests', () => {
    expect(calculatePackageBasePrice(1500, 'shamrock', 50)).toBe(1500);
    expect(calculatePackageBasePrice(1500, 'shamrock', 60)).toBe(1620);
    expect(calculatePackageBasePrice(1500, 'emerald', 100)).toBe(2025);
    expect(calculatePackageBasePrice(1500, 'legend', 200)).toBe(2625);
  });

  it('applies intimate launch pricing for small guest counts', () => {
    expect(calculateIntimatePackagePrice(1500, 10)).toBe(630);
    expect(calculateIntimatePackagePrice(1500, 15)).toBe(780);
    expect(calculateIntimatePackagePrice(1500, 20)).toBe(930);
    expect(calculateIntimatePackagePrice(1500, 30)).toBe(1125);
    expect(calculateIntimatePackagePrice(1500, 31)).toBeNull();
  });

  it('prefers intimate pricing over package tiers for ≤30 guests', () => {
    expect(calculateEventPrice(1500, 'emerald', 25)).toBe(1125);
    expect(calculateEventPrice(1500, 'legend', 30)).toBe(1125);
    expect(calculateEventPrice(1500, 'shamrock', 50)).toBe(1500);
  });
});

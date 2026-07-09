import { describe, expect, it } from 'vitest';
import {
  calculateEventPrice,
  calculatePackagePrice,
  normalizePackageTier,
  resolveGuestPackage,
} from './packages';

describe('booking packages', () => {
  it('prices guest-count packages from tenant base price', () => {
    expect(calculatePackagePrice(1500, 'g10')).toBe(630);
    expect(calculatePackagePrice(1500, 'g20')).toBe(930);
    expect(calculatePackagePrice(1500, 'g35')).toBe(1200);
    expect(calculatePackagePrice(1500, 'g60')).toBe(1500);
  });

  it('charges extra guests above package capacity', () => {
    expect(calculatePackagePrice(1500, 'g60', 70)).toBe(1600);
  });

  it('resolves package tier from guest count', () => {
    expect(resolveGuestPackage(8)).toBe('g10');
    expect(resolveGuestPackage(18)).toBe('g20');
    expect(resolveGuestPackage(30)).toBe('g35');
    expect(resolveGuestPackage(55)).toBe('g60');
  });

  it('maps legacy package names to new tiers', () => {
    expect(normalizePackageTier('shamrock', 40)).toBe('g35');
    expect(normalizePackageTier('emerald', 40)).toBe('g60');
    expect(normalizePackageTier('legend', 40)).toBe('g60');
  });

  it('derives event price from guest count', () => {
    expect(calculateEventPrice(1500, 25)).toBe(1200);
    expect(calculateEventPrice(1500, 45)).toBe(1500);
  });
});

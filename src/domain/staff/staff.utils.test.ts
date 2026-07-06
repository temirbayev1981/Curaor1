import { describe, expect, it } from 'vitest';
import { calculateShiftHours, calculateShiftPay } from './staff.utils';

describe('staff.utils', () => {
  it('calculates shift hours', () => {
    const hours = calculateShiftHours('2026-07-06T10:00:00Z', '2026-07-06T18:00:00Z');
    expect(hours).toBe(8);
  });

  it('calculates shift pay', () => {
    expect(calculateShiftPay(8, 20)).toBe(160);
  });
});

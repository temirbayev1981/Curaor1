import { describe, it, expect } from 'vitest';
import {
  createStaffMemberSchema,
  createStaffShiftSchema,
  updateStaffMemberSchema,
} from './staff.schema';

describe('staff schemas', () => {
  it('validates staff member creation', () => {
    expect(
      createStaffMemberSchema.safeParse({
        fullName: 'Pat OBrien',
        role: 'bartender',
        hourlyRate: 22,
      }).success
    ).toBe(true);
  });

  it('validates partial staff update', () => {
    expect(updateStaffMemberSchema.safeParse({ hourlyRate: 25 }).success).toBe(true);
  });

  it('validates shift creation', () => {
    expect(
      createStaffShiftSchema.safeParse({
        staffMemberId: 'a0000000-0000-4000-8000-000000000001',
        shiftStart: '2026-09-15T18:00:00Z',
        shiftEnd: '2026-09-15T23:00:00Z',
      }).success
    ).toBe(true);
  });
});

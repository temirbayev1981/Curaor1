import { describe, it, expect } from 'vitest';
import { isStaffRole } from '@/lib/auth/rbac';

describe('RBAC', () => {
  it('identifies staff roles', () => {
    expect(isStaffRole('owner')).toBe(true);
    expect(isStaffRole('admin')).toBe(true);
    expect(isStaffRole('staff')).toBe(true);
    expect(isStaffRole('customer')).toBe(false);
  });
});

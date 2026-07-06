import { describe, it, expect } from 'vitest';
import { AuthError } from '@/lib/auth/rbac';

describe('AuthError', () => {
  it('carries code and message', () => {
    const err = new AuthError('FORBIDDEN', 'Access denied');
    expect(err.code).toBe('FORBIDDEN');
    expect(err.message).toBe('Access denied');
    expect(err.name).toBe('AuthError');
  });
});

describe('ownership module', () => {
  it('exports verifyBookingOwnership function', async () => {
    const mod = await import('@/lib/auth/ownership');
    expect(typeof mod.verifyBookingOwnership).toBe('function');
    expect(typeof mod.getCustomerIdForUser).toBe('function');
  });
});

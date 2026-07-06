import { describe, it, expect } from 'vitest';
import { isApiRoute, needsLocaleRedirect } from './paths';

describe('middleware paths', () => {
  it('treats all /api/* as API routes (no locale prefix)', () => {
    expect(isApiRoute('/api/portal/bookings')).toBe(true);
    expect(isApiRoute('/api/admin/bookings')).toBe(true);
    expect(isApiRoute('/api/auth/register')).toBe(true);
    expect(isApiRoute('/api/payments/checkout')).toBe(true);
    expect(isApiRoute('/en/portal')).toBe(false);
  });

  it('does not locale-redirect API routes', () => {
    expect(needsLocaleRedirect('/api/portal/bookings')).toBe(false);
    expect(needsLocaleRedirect('/api/admin/settings')).toBe(false);
    expect(needsLocaleRedirect('/api/webhooks/stripe')).toBe(false);
  });

  it('locale-redirects page routes without locale', () => {
    expect(needsLocaleRedirect('/')).toBe(true);
    expect(needsLocaleRedirect('/book')).toBe(true);
    expect(needsLocaleRedirect('/en/portal')).toBe(false);
    expect(needsLocaleRedirect('/ru/admin')).toBe(false);
  });
});

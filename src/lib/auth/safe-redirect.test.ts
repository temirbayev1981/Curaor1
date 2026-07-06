import { describe, it, expect } from 'vitest';
import { isSafeRedirect, resolveRedirect } from './safe-redirect';

describe('safe-redirect', () => {
  it('allows relative locale paths', () => {
    expect(isSafeRedirect('/en/portal')).toBe(true);
    expect(isSafeRedirect('/ru/admin/bookings')).toBe(true);
  });

  it('blocks external and protocol URLs', () => {
    expect(isSafeRedirect('https://evil.com')).toBe(false);
    expect(isSafeRedirect('//evil.com')).toBe(false);
    expect(isSafeRedirect('/en//hack')).toBe(false);
    expect(isSafeRedirect('javascript:alert(1)')).toBe(false);
  });

  it('resolves to fallback when unsafe', () => {
    expect(resolveRedirect('https://evil.com', '/en/portal')).toBe('/en/portal');
    expect(resolveRedirect('/en/admin', '/en/portal')).toBe('/en/admin');
    expect(resolveRedirect(null, '/en/portal')).toBe('/en/portal');
  });
});

import { describe, expect, it } from 'vitest';
import { extractTenantSlugFromHost, resolveTenantSlug } from './extract-slug';

describe('extractTenantSlugFromHost', () => {
  it('returns slug from subdomain', () => {
    expect(extractTenantSlugFromHost('emerald-pour.example.com')).toBe('emerald-pour');
  });

  it('returns null for bare domain', () => {
    expect(extractTenantSlugFromHost('curaor1.vercel.app')).toBeNull();
  });

  it('returns null for localhost', () => {
    expect(extractTenantSlugFromHost('localhost:3000')).toBeNull();
  });

  it('ignores reserved subdomains', () => {
    expect(extractTenantSlugFromHost('www.emeraldpour.com')).toBeNull();
  });
});

describe('resolveTenantSlug', () => {
  it('prefers query param over host', () => {
    expect(resolveTenantSlug('emerald-pour.example.com', 'other-tenant')).toBe('other-tenant');
  });

  it('falls back to host subdomain', () => {
    expect(resolveTenantSlug('emerald-pour.example.com', null, null)).toBe('emerald-pour');
  });

  it('falls back to cookie then default', () => {
    expect(resolveTenantSlug('example.com', null, 'emerald-pour')).toBe('emerald-pour');
    expect(resolveTenantSlug('example.com', null, null)).toBe('emerald-pour');
  });
});

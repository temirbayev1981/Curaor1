import { describe, it, expect, afterEach } from 'vitest';
import { absoluteUrl, getSiteUrl, getDefaultTenantId, isSupabaseConfigured } from './env';

describe('env config', () => {
  const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const originalSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const originalAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const originalServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  afterEach(() => {
    if (originalSiteUrl === undefined) {
      delete process.env.NEXT_PUBLIC_SITE_URL;
    } else {
      process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
    }
    if (originalSupabaseUrl === undefined) {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    } else {
      process.env.NEXT_PUBLIC_SUPABASE_URL = originalSupabaseUrl;
    }
    if (originalAnonKey === undefined) {
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    } else {
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalAnonKey;
    }
    if (originalServiceKey === undefined) {
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    } else {
      process.env.SUPABASE_SERVICE_ROLE_KEY = originalServiceKey;
    }
  });

  it('defaults site URL to localhost', () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    expect(getSiteUrl()).toBe('http://localhost:3000');
  });

  it('strips trailing slash from site URL', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://emeraldpour.com/';
    expect(getSiteUrl()).toBe('https://emeraldpour.com');
  });

  it('builds absolute URLs', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://emeraldpour.com';
    expect(absoluteUrl('/en/portal')).toBe('https://emeraldpour.com/en/portal');
  });

  it('has default tenant id', () => {
    expect(getDefaultTenantId()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );
  });

  it('rejects placeholder Supabase config', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://your-project.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'your-anon-key';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'Qaz123**';
    expect(isSupabaseConfigured()).toBe(false);
  });

  it('accepts JWT-shaped Supabase config', () => {
    const jwt = 'eyJ'.padEnd(120, 'x');
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://abcd1234.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = jwt;
    process.env.SUPABASE_SERVICE_ROLE_KEY = jwt;
    expect(isSupabaseConfigured()).toBe(true);
  });

  it('reads optional integrations and defaults', async () => {
    const {
      isMapboxConfigured,
      isStripeConfigured,
      getBusinessPhone,
      getGoogleReviewsUrl,
      getMapboxOrigin,
    } = await import('./env');

    delete process.env.MAPBOX_ACCESS_TOKEN;
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.NEXT_PUBLIC_BUSINESS_PHONE;
    delete process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID;

    expect(isMapboxConfigured()).toBe(false);
    expect(isStripeConfigured()).toBe(false);
    expect(getBusinessPhone()).toBe('+1-704-555-0199');
    expect(getGoogleReviewsUrl()).toContain('google.com/maps');
    expect(getMapboxOrigin()).toEqual({ lat: 35.2271, lng: -80.8431 });

    process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID = 'ChIJ-test';
    expect(getGoogleReviewsUrl()).toContain('ChIJ-test');
  });

  it('throws when required secrets are missing', async () => {
    const { getStripeSecretKey, getMapboxToken } = await import('./env');
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.MAPBOX_ACCESS_TOKEN;
    expect(() => getStripeSecretKey()).toThrow('STRIPE_SECRET_KEY');
    expect(() => getMapboxToken()).toThrow('MAPBOX_ACCESS_TOKEN');
  });
});

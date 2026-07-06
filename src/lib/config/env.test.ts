import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { absoluteUrl, getSiteUrl, getDefaultTenantId } from './env';

describe('env config', () => {
  const original = process.env.NEXT_PUBLIC_SITE_URL;

  afterEach(() => {
    if (original === undefined) {
      delete process.env.NEXT_PUBLIC_SITE_URL;
    } else {
      process.env.NEXT_PUBLIC_SITE_URL = original;
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
});

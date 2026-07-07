import { DEFAULT_TENANT_SLUG } from '@/lib/tenant/constants';

const RESERVED_SUBDOMAINS = new Set([
  'www',
  'api',
  'admin',
  'app',
  'curaor1',
  'localhost',
]);

/**
 * Extract tenant slug from hostname (e.g. emerald-pour.example.com → emerald-pour).
 * Returns null when no tenant subdomain is present.
 */
export function extractTenantSlugFromHost(hostname: string): string | null {
  const host = hostname.split(':')[0]?.toLowerCase() ?? '';

  if (!host || host === 'localhost' || host.endsWith('.localhost')) {
    return null;
  }

  const parts = host.split('.');

  if (parts.length < 3) {
    return null;
  }

  const subdomain = parts[0];
  if (!subdomain || RESERVED_SUBDOMAINS.has(subdomain)) {
    return null;
  }

  return subdomain;
}

export function resolveTenantSlug(
  hostname: string,
  querySlug?: string | null,
  cookieSlug?: string | null
): string {
  if (querySlug?.trim()) {
    return querySlug.trim().toLowerCase();
  }

  const fromHost = extractTenantSlugFromHost(hostname);
  if (fromHost) return fromHost;

  if (cookieSlug?.trim()) {
    return cookieSlug.trim().toLowerCase();
  }

  return DEFAULT_TENANT_SLUG;
}

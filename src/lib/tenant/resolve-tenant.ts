import { DEFAULT_TENANT_ID, DEFAULT_TENANT_SLUG } from '@/lib/tenant/constants';

export function resolveTenantId(
  hostname?: string,
  slug?: string | null
): string {
  if (slug === DEFAULT_TENANT_SLUG || !slug) {
    return DEFAULT_TENANT_ID;
  }
  // Future: lookup tenant by slug from DB
  if (hostname?.startsWith('localhost') || hostname?.includes('vercel.app')) {
    return DEFAULT_TENANT_ID;
  }
  return DEFAULT_TENANT_ID;
}

export { DEFAULT_TENANT_ID, DEFAULT_TENANT_SLUG };

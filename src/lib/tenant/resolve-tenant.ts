import { DEFAULT_TENANT_ID, DEFAULT_TENANT_SLUG } from '@/lib/tenant/constants';
import { resolveTenantSlug } from '@/lib/tenant/extract-slug';

/** @deprecated Use tenantService.resolveIdBySlug or getPublicTenantId instead */
export function resolveTenantId(
  hostname?: string,
  slug?: string | null
): string {
  const resolvedSlug = resolveTenantSlug(hostname ?? '', slug, null);
  if (resolvedSlug === DEFAULT_TENANT_SLUG) {
    return DEFAULT_TENANT_ID;
  }
  return DEFAULT_TENANT_ID;
}

export { DEFAULT_TENANT_ID, DEFAULT_TENANT_SLUG };

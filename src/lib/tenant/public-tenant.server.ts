import { cookies } from 'next/headers';
import { DEFAULT_TENANT_ID } from '@/lib/tenant/constants';
import { resolveTenantSlug } from '@/lib/tenant/extract-slug';
import { tenantService } from '@/domain/tenant/tenant.service';
import { isSupabaseConfigured } from '@/lib/config/env';

export async function getPublicTenantId(hostname?: string): Promise<string> {
  const cookieStore = await cookies();
  const host = hostname?.split(':')[0] ?? '';

  if (!isSupabaseConfigured()) {
    return DEFAULT_TENANT_ID;
  }

  try {
    if (host) {
      const byDomain = await tenantService.getByCustomDomain(host);
      if (byDomain) return byDomain.id;
    }

    const slug = resolveTenantSlug(
      hostname ?? '',
      null,
      cookieStore.get('tenant_slug')?.value ?? null
    );
    return await tenantService.resolveIdBySlug(slug);
  } catch {
    return DEFAULT_TENANT_ID;
  }
}

export async function getPublicTenantSlug(): Promise<string> {
  const cookieStore = await cookies();
  return resolveTenantSlug('', null, cookieStore.get('tenant_slug')?.value ?? null);
}

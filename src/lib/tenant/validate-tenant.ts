import { tenantService } from '@/domain/tenant/tenant.service';
import { DEFAULT_TENANT_ID } from '@/lib/tenant/constants';
import { isSupabaseConfigured } from '@/lib/config/env';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function assertPublicTenantId(tenantId: string): void {
  if (!UUID_RE.test(tenantId)) {
    throw new Error('Invalid tenant');
  }

  if (!isSupabaseConfigured() && tenantId !== DEFAULT_TENANT_ID) {
    throw new Error('Invalid tenant');
  }
}

export async function validatePublicTenantId(tenantId: string): Promise<void> {
  assertPublicTenantId(tenantId);

  if (!isSupabaseConfigured()) {
    if (tenantId !== DEFAULT_TENANT_ID) throw new Error('Invalid tenant');
    return;
  }

  const tenant = await tenantService.getById(tenantId).catch(() => null);
  if (!tenant?.is_active) {
    throw new Error('Invalid tenant');
  }
}

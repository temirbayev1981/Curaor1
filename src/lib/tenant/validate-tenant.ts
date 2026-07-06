import { DEFAULT_TENANT_ID } from '@/lib/tenant/constants';

export function assertPublicTenantId(tenantId: string): void {
  if (tenantId !== DEFAULT_TENANT_ID) {
    throw new Error('Invalid tenant');
  }
}

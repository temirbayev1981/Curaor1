import { createAdminClient } from '@/lib/supabase/admin';
import { resolveConfig } from '@/lib/config/hierarchy';
import type { Tenant, TenantSettings } from '@/types/database';
import type { UpdateSettingsInput } from './tenant.schema';

export class TenantService {
  async getById(tenantId: string): Promise<Tenant> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', tenantId)
      .single();

    if (error || !data) throw new Error('Tenant not found');
    return data as Tenant;
  }

  async getResolvedSettings(tenantId: string): Promise<TenantSettings> {
    const tenant = await this.getById(tenantId);
    return resolveConfig({
      tenantSettings: tenant.settings,
      adminOverrides: tenant.admin_overrides as Partial<TenantSettings>,
    });
  }

  async updateSettings(
    tenantId: string,
    input: UpdateSettingsInput
  ): Promise<Tenant> {
    const supabase = createAdminClient();
    const tenant = await this.getById(tenantId);

    const updates: Record<string, unknown> = {};

    if (input.settings) {
      updates.settings = { ...tenant.settings, ...input.settings };
    }
    if (input.admin_overrides) {
      updates.admin_overrides = {
        ...(tenant.admin_overrides as Record<string, unknown>),
        ...input.admin_overrides,
      };
    }

    const { data, error } = await supabase
      .from('tenants')
      .update(updates)
      .eq('id', tenantId)
      .select()
      .single();

    if (error || !data) throw new Error(error?.message ?? 'Update failed');
    return data as Tenant;
  }
}

export const tenantService = new TenantService();

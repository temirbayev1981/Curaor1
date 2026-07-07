import { createAdminClient } from '@/lib/supabase/admin';
import { resolveConfig } from '@/lib/config/hierarchy';
import { DEFAULT_TENANT_ID, DEFAULT_TENANT_SLUG } from '@/lib/tenant/constants';
import type { Tenant, TenantSettings } from '@/types/database';
import type { UpdateSettingsInput } from './tenant.schema';

const SLUG_CACHE_TTL_MS = 60_000;
const slugCache = new Map<string, { id: string; expires: number }>();

export class TenantService {
  async getBySlug(slug: string): Promise<Tenant | null> {
    const normalized = slug.toLowerCase();
    const cached = slugCache.get(normalized);
    if (cached && cached.expires > Date.now()) {
      return this.getById(cached.id);
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('slug', normalized)
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return null;

    slugCache.set(normalized, {
      id: (data as Tenant).id,
      expires: Date.now() + SLUG_CACHE_TTL_MS,
    });

    return data as Tenant;
  }

  async resolveIdBySlug(slug: string): Promise<string> {
    const tenant = await this.getBySlug(slug);
    if (tenant) return tenant.id;

    if (slug === DEFAULT_TENANT_SLUG) {
      return DEFAULT_TENANT_ID;
    }

    throw new Error('Tenant not found');
  }

  async getByCustomDomain(hostname: string): Promise<Tenant | null> {
    const host = hostname.split(':')[0]?.toLowerCase() ?? '';
    if (!host || host === 'localhost' || host.endsWith('.localhost')) {
      return null;
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('custom_domain', host)
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return (data as Tenant) ?? null;
  }

  async listPublic(): Promise<Array<{ slug: string; name: string }>> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('tenants')
      .select('slug, name')
      .eq('is_active', true)
      .order('name');

    if (error) throw new Error(error.message);
    return (data ?? []) as Array<{ slug: string; name: string }>;
  }

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

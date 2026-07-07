import { describe, it, expect, vi, afterEach } from 'vitest';
import { assertPublicTenantId } from './validate-tenant';
import { DEFAULT_TENANT_ID } from '@/lib/tenant/constants';
import * as env from '@/lib/config/env';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('assertPublicTenantId', () => {
  it('accepts default tenant', () => {
    expect(() => assertPublicTenantId(DEFAULT_TENANT_ID)).not.toThrow();
  });

  it('rejects unknown tenant when supabase is not configured', () => {
    vi.spyOn(env, 'isSupabaseConfigured').mockReturnValue(false);
    expect(() =>
      assertPublicTenantId('b0000000-0000-4000-8000-000000000002')
    ).toThrow('Invalid tenant');
  });

  it('rejects malformed tenant id', () => {
    expect(() => assertPublicTenantId('not-a-uuid')).toThrow('Invalid tenant');
  });

  it('accepts valid uuid when supabase is configured', () => {
    vi.spyOn(env, 'isSupabaseConfigured').mockReturnValue(true);
    expect(() =>
      assertPublicTenantId('b0000000-0000-4000-8000-000000000002')
    ).not.toThrow();
  });
});

describe('validatePublicTenantId', () => {
  it('validates active tenant from database', async () => {
    vi.spyOn(env, 'isSupabaseConfigured').mockReturnValue(true);
    const { tenantService } = await import('@/domain/tenant/tenant.service');
    vi.spyOn(tenantService, 'getById').mockResolvedValue({
      id: DEFAULT_TENANT_ID,
      slug: 'emerald-pour',
      name: 'The Emerald Pour',
      settings: {},
      is_active: true,
      custom_domain: null,
      created_at: '',
      updated_at: '',
    });

    const { validatePublicTenantId } = await import('./validate-tenant');
    await expect(validatePublicTenantId(DEFAULT_TENANT_ID)).resolves.toBeUndefined();
  });

  it('rejects inactive tenant', async () => {
    vi.spyOn(env, 'isSupabaseConfigured').mockReturnValue(true);
    const { tenantService } = await import('@/domain/tenant/tenant.service');
    vi.spyOn(tenantService, 'getById').mockResolvedValue({
      id: DEFAULT_TENANT_ID,
      slug: 'emerald-pour',
      name: 'The Emerald Pour',
      settings: {},
      is_active: false,
      custom_domain: null,
      created_at: '',
      updated_at: '',
    });

    const { validatePublicTenantId } = await import('./validate-tenant');
    await expect(validatePublicTenantId(DEFAULT_TENANT_ID)).rejects.toThrow('Invalid tenant');
  });

  it('rejects tenant when lookup fails', async () => {
    vi.spyOn(env, 'isSupabaseConfigured').mockReturnValue(true);
    const { tenantService } = await import('@/domain/tenant/tenant.service');
    vi.spyOn(tenantService, 'getById').mockRejectedValue(new Error('db error'));

    const { validatePublicTenantId } = await import('./validate-tenant');
    await expect(validatePublicTenantId(DEFAULT_TENANT_ID)).rejects.toThrow('Invalid tenant');
  });
});

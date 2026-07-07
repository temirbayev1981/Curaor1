import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DEFAULT_TENANT_ID, DEFAULT_TENANT_SLUG } from '@/lib/tenant/constants';

const mockMaybeSingle = vi.fn();
const mockSingle = vi.fn();
const mockOrder = vi.fn();
const mockFrom = vi.fn();

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ from: mockFrom }),
}));

describe('TenantService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: mockMaybeSingle,
            single: mockSingle,
            order: mockOrder,
          }),
          maybeSingle: mockMaybeSingle,
          single: mockSingle,
          order: mockOrder,
        }),
        order: mockOrder,
      }),
    });
    mockOrder.mockResolvedValue({
      data: [
        { slug: 'emerald-pour', name: 'The Emerald Pour' },
        { slug: 'shamrock-mobile', name: 'Shamrock Mobile Bar' },
      ],
    });
  });

  it('resolves default slug to default tenant id', async () => {
    mockMaybeSingle.mockResolvedValue({
      data: { id: DEFAULT_TENANT_ID, slug: DEFAULT_TENANT_SLUG, is_active: true },
      error: null,
    });
    mockSingle.mockResolvedValue({
      data: { id: DEFAULT_TENANT_ID, slug: DEFAULT_TENANT_SLUG, is_active: true },
      error: null,
    });

    const { tenantService } = await import('@/domain/tenant/tenant.service');
    const id = await tenantService.resolveIdBySlug(DEFAULT_TENANT_SLUG);
    expect(id).toBe(DEFAULT_TENANT_ID);
  });

  it('lists public tenants', async () => {
    const { tenantService } = await import('@/domain/tenant/tenant.service');
    const tenants = await tenantService.listPublic();
    expect(tenants).toHaveLength(2);
  });

  it('returns null for localhost custom domain lookup', async () => {
    const { tenantService } = await import('@/domain/tenant/tenant.service');
    const tenant = await tenantService.getByCustomDomain('localhost:3000');
    expect(tenant).toBeNull();
  });

  it('throws when slug cannot be resolved', async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });

    const { tenantService } = await import('@/domain/tenant/tenant.service');
    await expect(tenantService.resolveIdBySlug('missing-tenant')).rejects.toThrow(
      'Tenant not found'
    );
  });

  it('loads tenant by custom domain', async () => {
    mockMaybeSingle.mockResolvedValue({
      data: {
        id: 'b0000000-0000-4000-8000-000000000002',
        slug: 'shamrock-mobile',
        is_active: true,
      },
      error: null,
    });

    const { tenantService } = await import('@/domain/tenant/tenant.service');
    const tenant = await tenantService.getByCustomDomain('book.shamrock.example');
    expect(tenant?.slug).toBe('shamrock-mobile');
  });
});

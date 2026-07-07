import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockCookies = vi.fn();
const mockGetByCustomDomain = vi.fn();
const mockResolveIdBySlug = vi.fn();

vi.mock('next/headers', () => ({
  cookies: () => mockCookies(),
}));

vi.mock('@/domain/tenant/tenant.service', () => ({
  tenantService: {
    getByCustomDomain: (...args: unknown[]) => mockGetByCustomDomain(...args),
    resolveIdBySlug: (...args: unknown[]) => mockResolveIdBySlug(...args),
  },
}));

vi.mock('@/lib/config/env', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/config/env')>();
  return {
    ...actual,
    isSupabaseConfigured: vi.fn(),
  };
});

describe('getPublicTenantId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCookies.mockResolvedValue({ get: () => undefined });
  });

  it('returns default tenant when supabase is not configured', async () => {
    const { isSupabaseConfigured } = await import('@/lib/config/env');
    vi.mocked(isSupabaseConfigured).mockReturnValue(false);

    const { getPublicTenantId } = await import('@/lib/tenant/public-tenant.server');
    const id = await getPublicTenantId('localhost:3000');
    expect(id).toBe('a0000000-0000-4000-8000-000000000001');
  });

  it('resolves tenant by custom domain', async () => {
    const { isSupabaseConfigured } = await import('@/lib/config/env');
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
    mockGetByCustomDomain.mockResolvedValue({
      id: 'b0000000-0000-4000-8000-000000000002',
    });

    const { getPublicTenantId } = await import('@/lib/tenant/public-tenant.server');
    const id = await getPublicTenantId('shamrock.example.com');
    expect(id).toBe('b0000000-0000-4000-8000-000000000002');
    expect(mockGetByCustomDomain).toHaveBeenCalledWith('shamrock.example.com');
  });

  it('falls back to slug resolution', async () => {
    const { isSupabaseConfigured } = await import('@/lib/config/env');
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
    mockGetByCustomDomain.mockResolvedValue(null);
    mockResolveIdBySlug.mockResolvedValue('a0000000-0000-4000-8000-000000000001');

    const { getPublicTenantId } = await import('@/lib/tenant/public-tenant.server');
    const id = await getPublicTenantId('curaor1.vercel.app');
    expect(id).toBe('a0000000-0000-4000-8000-000000000001');
  });

  it('falls back to default tenant on resolution errors', async () => {
    const { isSupabaseConfigured } = await import('@/lib/config/env');
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
    mockGetByCustomDomain.mockResolvedValue(null);
    mockResolveIdBySlug.mockRejectedValue(new Error('db down'));

    const { getPublicTenantId } = await import('@/lib/tenant/public-tenant.server');
    const id = await getPublicTenantId('curaor1.vercel.app');
    expect(id).toBe('a0000000-0000-4000-8000-000000000001');
  });

  it('reads tenant slug from cookie', async () => {
    mockCookies.mockResolvedValue({
      get: (name: string) => (name === 'tenant_slug' ? { value: 'shamrock-mobile' } : undefined),
    });

    const { getPublicTenantSlug } = await import('@/lib/tenant/public-tenant.server');
    const slug = await getPublicTenantSlug();
    expect(slug).toBe('shamrock-mobile');
  });
});

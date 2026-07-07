import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockListPublic = vi.fn();

vi.mock('@/domain/tenant/tenant.service', () => ({
  tenantService: {
    listPublic: (...args: unknown[]) => mockListPublic(...args),
  },
}));

vi.mock('@/lib/config/env', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/config/env')>();
  return {
    ...actual,
    isSupabaseConfigured: vi.fn(),
  };
});

describe('GET /api/tenants', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns fallback tenants when supabase is not configured', async () => {
    const { isSupabaseConfigured } = await import('@/lib/config/env');
    vi.mocked(isSupabaseConfigured).mockReturnValue(false);

    const { GET } = await import('@/app/api/tenants/route');
    const response = await GET();
    const json = await response.json();

    expect(json.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ slug: 'emerald-pour' }),
        expect.objectContaining({ slug: 'shamrock-mobile' }),
      ])
    );
  });

  it('returns tenants from database when configured', async () => {
    const { isSupabaseConfigured } = await import('@/lib/config/env');
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
    mockListPublic.mockResolvedValue([
      { slug: 'emerald-pour', name: 'The Emerald Pour' },
      { slug: 'shamrock-mobile', name: 'Shamrock Mobile Bar' },
    ]);

    const { GET } = await import('@/app/api/tenants/route');
    const response = await GET();
    const json = await response.json();

    expect(json.data).toHaveLength(2);
    expect(mockListPublic).toHaveBeenCalled();
  });

  it('returns 500 when tenant loading fails', async () => {
    const { isSupabaseConfigured } = await import('@/lib/config/env');
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
    mockListPublic.mockRejectedValue(new Error('db unavailable'));

    const { GET } = await import('@/app/api/tenants/route');
    const response = await GET();
    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.error?.code).toBe('TENANT_ERROR');
  });
});

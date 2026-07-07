import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/config/env', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/config/env')>();
  return {
    ...actual,
    isMapboxConfigured: vi.fn(),
    isOpenAiConfigured: vi.fn(),
    isStripeConfigured: vi.fn(),
  };
});

vi.mock('@/lib/auth/rbac', () => ({
  requireStaff: vi.fn().mockResolvedValue({ tenantId: 't1', role: 'admin' }),
  AuthError: class AuthError extends Error {},
}));

describe('GET /api/admin/integrations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns integration status for staff', async () => {
    const env = await import('@/lib/config/env');
    vi.mocked(env.isMapboxConfigured).mockReturnValue(true);
    vi.mocked(env.isOpenAiConfigured).mockReturnValue(false);
    vi.mocked(env.isStripeConfigured).mockReturnValue(true);

    const { GET } = await import('@/app/api/admin/integrations/route');
    const response = await GET();
    const json = await response.json();

    expect(json.data).toEqual({ mapbox: true, openai: false, stripe: true });
  });
});

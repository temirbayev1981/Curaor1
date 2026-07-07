import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGetUser = vi.fn();
const mockMaybeSingle = vi.fn();
const mockGetUserById = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: () => mockGetUser() },
  }),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => {
    const chain = {
      eq: vi.fn(),
      limit: vi.fn(),
      maybeSingle: mockMaybeSingle,
      single: vi.fn(),
      update: vi.fn(),
      insert: vi.fn(),
    };
    chain.eq.mockReturnValue(chain);
    chain.limit.mockReturnValue(chain);
    chain.update.mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });
    chain.insert.mockResolvedValue({ error: null });

    return {
      from: vi.fn(() => ({
        select: vi.fn().mockReturnValue(chain),
        update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
        insert: vi.fn().mockResolvedValue({ error: null }),
      })),
      auth: {
        admin: {
          getUserById: (...args: unknown[]) => mockGetUserById(...args),
        },
      },
    };
  },
}));

describe('RBAC', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('identifies staff roles', async () => {
    const { isStaffRole } = await import('@/lib/auth/rbac');
    expect(isStaffRole('owner')).toBe(true);
    expect(isStaffRole('admin')).toBe(true);
    expect(isStaffRole('staff')).toBe(true);
    expect(isStaffRole('customer')).toBe(false);
  });

  it('returns null when user is not signed in', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const { getAuthContext } = await import('@/lib/auth/rbac');
    expect(await getAuthContext()).toBeNull();
  });

  it('returns auth context for signed-in staff', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'u1', email: 'admin@example.com' } },
    });
    mockMaybeSingle.mockResolvedValue({
      data: { tenant_id: 't1', role: 'admin' },
    });

    const { getAuthContext } = await import('@/lib/auth/rbac');
    const ctx = await getAuthContext();
    expect(ctx).toEqual({
      userId: 'u1',
      email: 'admin@example.com',
      tenantId: 't1',
      role: 'admin',
    });
  });

  it('throws when staff access required for customer', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'u2', email: 'user@example.com' } },
    });
    mockMaybeSingle.mockResolvedValue({
      data: { tenant_id: 't1', role: 'customer' },
    });

    const { requireStaff, AuthError } = await import('@/lib/auth/rbac');
    await expect(requireStaff()).rejects.toBeInstanceOf(AuthError);
  });

  it('requires specific roles', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'u4', email: 'owner@example.com' } },
    });
    mockMaybeSingle.mockResolvedValue({
      data: { tenant_id: 't1', role: 'owner' },
    });

    const { requireRole } = await import('@/lib/auth/rbac');
    const ctx = await requireRole(['owner', 'admin']);
    expect(ctx.role).toBe('owner');
  });

  it('rejects users without required role', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'u5', email: 'staff@example.com' } },
    });
    mockMaybeSingle.mockResolvedValue({
      data: { tenant_id: 't1', role: 'staff' },
    });

    const { requireRole, AuthError } = await import('@/lib/auth/rbac');
    await expect(requireRole(['owner'])).rejects.toBeInstanceOf(AuthError);
  });

  it('links existing customer record to user', async () => {
    mockMaybeSingle.mockResolvedValue({
      data: { id: 'c1', user_id: null },
    });

    const { linkCustomerToUser } = await import('@/lib/auth/rbac');
    await linkCustomerToUser('t1', 'u3', 'guest@example.com');
    expect(mockMaybeSingle).toHaveBeenCalled();
  });
});

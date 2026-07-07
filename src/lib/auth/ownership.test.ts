import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthError } from '@/lib/auth/rbac';

const mockMaybeSingle = vi.fn();
const mockFrom = vi.fn();

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ from: mockFrom }),
}));

describe('ownership', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: mockMaybeSingle,
          }),
          maybeSingle: mockMaybeSingle,
        }),
      }),
    });
  });

  it('returns customer id for user', async () => {
    mockMaybeSingle.mockResolvedValueOnce({ data: { id: 'c1' }, error: null });
    const { getCustomerIdForUser } = await import('@/lib/auth/ownership');
    await expect(getCustomerIdForUser('t1', 'u1')).resolves.toBe('c1');
  });

  it('verifies booking ownership', async () => {
    mockMaybeSingle
      .mockResolvedValueOnce({ data: { id: 'c1' }, error: null })
      .mockResolvedValueOnce({ data: { customer_id: 'c1' }, error: null });

    const { verifyBookingOwnership } = await import('@/lib/auth/ownership');
    await expect(verifyBookingOwnership('t1', 'u1', 'b1')).resolves.toBeUndefined();
  });

  it('denies access when customer does not own booking', async () => {
    mockMaybeSingle
      .mockResolvedValueOnce({ data: { id: 'c1' }, error: null })
      .mockResolvedValueOnce({ data: { customer_id: 'c2' }, error: null });

    const { verifyBookingOwnership } = await import('@/lib/auth/ownership');
    await expect(verifyBookingOwnership('t1', 'u1', 'b1')).rejects.toBeInstanceOf(AuthError);
  });
});

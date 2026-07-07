import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSingle = vi.fn();
const mockFrom = vi.fn();

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: mockFrom,
    storage: { from: vi.fn() },
  }),
}));

describe('ContractService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                maybeSingle: mockSingle,
              }),
            }),
            single: mockSingle,
          }),
          single: mockSingle,
        }),
      }),
    });
  });

  it('returns contract for booking when found', async () => {
    mockSingle.mockResolvedValue({
      data: {
        id: 'ct1',
        tenant_id: 't1',
        booking_id: 'b1',
        storage_path: 't1/b1/contract.pdf',
        status: 'sent',
        signed_at: null,
        signature_data: null,
        created_at: '',
      },
      error: null,
    });

    const { contractService } = await import('@/domain/contract/contract.service');
    const contract = await contractService.getByBooking('t1', 'b1');
    expect(contract?.status).toBe('sent');
  });

  it('returns null when no contract exists', async () => {
    mockSingle.mockResolvedValue({ data: null, error: null });

    const { contractService } = await import('@/domain/contract/contract.service');
    const contract = await contractService.getByBooking('t1', 'missing');
    expect(contract).toBeNull();
  });
});

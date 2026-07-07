import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFrom = vi.fn();

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ from: mockFrom }),
}));

describe('CustomerService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('aggregates booking stats per customer', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'customers') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: [
                  {
                    id: 'c1',
                    tenant_id: 't1',
                    email: 'a@test.com',
                    full_name: 'Alice',
                    phone: null,
                    user_id: null,
                    created_at: '',
                    updated_at: '',
                  },
                ],
              }),
            }),
          }),
        };
      }
      if (table === 'bookings') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: [
                { customer_id: 'c1', subtotal: 500, status: 'completed' },
                { customer_id: 'c1', subtotal: 200, status: 'cancelled' },
              ],
            }),
          }),
        };
      }
      return { select: vi.fn() };
    });

    const { customerService } = await import('@/domain/customer/customer.service');
    const rows = await customerService.listWithStats('t1');

    expect(rows[0]?.booking_count).toBe(2);
    expect(rows[0]?.total_spent).toBe(500);
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/domain/inventory/inventory.service', () => ({
  inventoryService: {
    list: vi.fn().mockResolvedValue([
      {
        id: '1',
        tenant_id: 't1',
        name: 'Guinness',
        sku: 'BEER-001',
        category: 'beer',
        quantity: 10,
        unit_cost: 85,
        unit_price: 150,
        reorder_level: 4,
        created_at: '',
        updated_at: '',
      },
    ]),
  },
}));

vi.mock('@/domain/staff/staff.service', () => ({
  staffService: {
    listShifts: vi.fn().mockResolvedValue([
      {
        hours: 5,
        pay: 90,
        member: { full_name: 'Pat' },
      },
    ]),
  },
}));

const mockSingle = vi.fn();
const mockEq = vi.fn();
const mockFrom = vi.fn();

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ from: mockFrom }),
}));

describe('ProfitService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEq.mockReturnValue({ eq: mockEq, single: mockSingle });
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({ eq: mockEq }),
    });
    mockSingle.mockResolvedValue({
      data: {
        id: 'b1',
        tenant_id: 't1',
        guest_count: 80,
        delivery_cost: 50,
      },
      error: null,
    });
    mockEq.mockImplementation(() => ({
      eq: mockEq,
      single: mockSingle,
      data: [{ amount: 1200, status: 'succeeded' }],
      error: null,
    }));
  });

  it('calculates event profitability', async () => {
    let call = 0;
    mockFrom.mockImplementation((table: string) => {
      if (table === 'bookings') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {
                    id: 'b1',
                    tenant_id: 't1',
                    guest_count: 80,
                    delivery_cost: 50,
                  },
                  error: null,
                }),
              }),
            }),
          }),
        };
      }
      if (table === 'payments') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({
                  data: [{ amount: 1200 }],
                }),
              }),
            }),
          }),
        };
      }
      call += 1;
      return { select: vi.fn() };
    });

    const { profitService } = await import('@/domain/profit/profit.service');
    const result = await profitService.getEventProfitability('t1', 'b1');

    expect(result.revenue).toBe(1200);
    expect(result.deliveryCost).toBe(50);
    expect(result.laborCost).toBe(90);
    expect(result.cogs).toBeGreaterThan(0);
  });
});

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
        quantity: 1,
        unit_cost: 85,
        unit_price: 150,
        reorder_level: 4,
        created_at: '',
        updated_at: '',
      },
    ]),
  },
}));

const mockFrom = vi.fn();

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ from: mockFrom }),
}));

describe('ProcurementService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists purchase orders with items', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [
              {
                id: 'po1',
                tenant_id: 't1',
                title: 'Restock',
                status: 'draft',
                total_cost: 85,
                booking_id: null,
                notes: null,
                created_at: '',
                updated_at: '',
                purchase_order_items: [],
              },
            ],
            error: null,
          }),
        }),
      }),
    });

    const { procurementService } = await import('@/domain/procurement/procurement.service');
    const orders = await procurementService.list('t1');
    expect(orders).toHaveLength(1);
    expect(orders[0]?.title).toBe('Restock');
  });
});

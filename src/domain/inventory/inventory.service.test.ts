import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSingle = vi.fn();
const mockSelect = vi.fn();
const mockFrom = vi.fn();

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ from: mockFrom }),
}));

describe('InventoryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({
      select: mockSelect,
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({ single: mockSingle }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({ single: mockSingle }),
          }),
        }),
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
      }),
    });
    mockSelect.mockReturnValue({
      eq: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
        single: mockSingle,
      }),
    });
  });

  it('calculates COGS from inventory', async () => {
    const { inventoryService } = await import('@/domain/inventory/inventory.service');
    const cogs = inventoryService.calculateCogs([
      {
        id: '1',
        tenant_id: 't1',
        name: 'Keg',
        sku: 'BEER-001',
        category: 'beer',
        quantity: 2,
        unit_cost: 85,
        unit_price: 150,
        reorder_level: 1,
        created_at: '',
        updated_at: '',
      },
    ]);
    expect(cogs).toBe(170);
  });

  it('adjusts quantity for existing item', async () => {
    const item = {
      id: '1',
      tenant_id: 't1',
      name: 'Keg',
      sku: 'BEER-001',
      category: 'beer',
      quantity: 5,
      unit_cost: 85,
      unit_price: 150,
      reorder_level: 1,
      created_at: '',
      updated_at: '',
    };

    const selectChain = {
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: item, error: null }),
    };
    const updateChain = {
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: { ...item, quantity: 6 }, error: null }),
      }),
    };

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue(selectChain),
      update: vi.fn().mockReturnValue(updateChain),
    });

    const { inventoryService } = await import('@/domain/inventory/inventory.service');
    const updated = await inventoryService.adjustQuantity('t1', '1', 1);
    expect(updated.quantity).toBe(6);
  });
});

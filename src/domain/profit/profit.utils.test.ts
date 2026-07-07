import { describe, expect, it } from 'vitest';
import { calculateMargin, estimateEventCogs } from './profit.utils';
import type { InventoryItem } from '@/types/database';

const inventory: InventoryItem[] = [
  {
    id: '1',
    tenant_id: 'a0000000-0000-4000-8000-000000000001',
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
  {
    id: '2',
    tenant_id: 'a0000000-0000-4000-8000-000000000001',
    name: 'Jameson',
    sku: 'SPIR-001',
    category: 'spirits',
    quantity: 8,
    unit_cost: 28,
    unit_price: 55,
    reorder_level: 3,
    created_at: '',
    updated_at: '',
  },
];

describe('estimateEventCogs', () => {
  it('scales consumption with guest count', () => {
    const result = estimateEventCogs(80, inventory);
    expect(result.breakdown.find((row) => row.sku === 'BEER-001')?.quantity).toBe(2);
    expect(result.total).toBeGreaterThan(0);
  });

  it('returns zero when inventory is empty', () => {
    expect(estimateEventCogs(50, [])).toEqual({ total: 0, breakdown: [] });
  });
});

describe('calculateMargin', () => {
  it('calculates margin and percent', () => {
    expect(calculateMargin(1000, 600)).toEqual({ margin: 400, marginPercent: 40 });
  });

  it('handles zero revenue', () => {
    expect(calculateMargin(0, 100)).toEqual({ margin: -100, marginPercent: 0 });
  });
});

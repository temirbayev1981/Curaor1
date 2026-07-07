import { describe, expect, it } from 'vitest';
import { createInventoryItemSchema } from './inventory.schema';

describe('createInventoryItemSchema', () => {
  it('accepts valid inventory input', () => {
    const result = createInventoryItemSchema.safeParse({
      name: 'Guinness Keg',
      sku: 'BEER-002',
      category: 'beer',
      quantity: 5,
      unitCost: 120,
      unitPrice: 200,
      reorderLevel: 2,
    });

    expect(result.success).toBe(true);
  });

  it('rejects negative quantity', () => {
    const result = createInventoryItemSchema.safeParse({
      name: 'Test',
      sku: 'T-1',
      category: 'supplies',
      quantity: -1,
      unitCost: 1,
    });

    expect(result.success).toBe(false);
  });
});

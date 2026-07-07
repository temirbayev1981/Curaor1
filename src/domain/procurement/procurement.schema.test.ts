import { describe, it, expect } from 'vitest';
import {
  createPurchaseOrderSchema,
  generateLowStockSchema,
  purchaseOrderStatusSchema,
} from './procurement.schema';

describe('procurement schemas', () => {
  it('validates purchase order status', () => {
    expect(purchaseOrderStatusSchema.safeParse('draft').success).toBe(true);
    expect(purchaseOrderStatusSchema.safeParse('shipped').success).toBe(false);
  });

  it('accepts create purchase order payload', () => {
    const result = createPurchaseOrderSchema.safeParse({
      title: 'Low stock restock',
      items: [{ itemName: 'Guinness', quantity: 2, unitCost: 85 }],
    });
    expect(result.success).toBe(true);
  });

  it('accepts generate low stock payload', () => {
    expect(generateLowStockSchema.safeParse({ title: 'Auto order' }).success).toBe(true);
  });
});

import { z } from 'zod';

export const purchaseOrderStatusSchema = z.enum(['draft', 'ordered', 'received']);

export const createPurchaseOrderSchema = z.object({
  title: z.string().min(1).max(200),
  bookingId: z.string().uuid().nullable().optional(),
  notes: z.string().max(1000).optional(),
  items: z
    .array(
      z.object({
        inventoryItemId: z.string().uuid().nullable().optional(),
        itemName: z.string().min(1),
        sku: z.string().optional(),
        quantity: z.number().int().positive(),
        unitCost: z.number().min(0),
      })
    )
    .min(1),
});

export const updatePurchaseOrderSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  status: purchaseOrderStatusSchema.optional(),
  bookingId: z.string().uuid().nullable().optional(),
  notes: z.string().max(1000).optional(),
});

export const generateLowStockSchema = z.object({
  bookingId: z.string().uuid().nullable().optional(),
  title: z.string().min(1).max(200).optional(),
});

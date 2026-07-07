import { z } from 'zod';

export const createInventoryItemSchema = z.object({
  name: z.string().min(1).max(200),
  sku: z.string().min(1).max(50),
  category: z.string().min(1).max(100),
  quantity: z.number().int().min(0).default(0),
  unitCost: z.number().min(0),
  unitPrice: z.number().min(0).default(0),
  reorderLevel: z.number().int().min(0).default(10),
});

export const updateInventoryItemSchema = createInventoryItemSchema.partial();

export type CreateInventoryItemInput = z.infer<typeof createInventoryItemSchema>;
export type UpdateInventoryItemInput = z.infer<typeof updateInventoryItemSchema>;

import { createAdminClient } from '@/lib/supabase/admin';
import { inventoryService } from '@/domain/inventory/inventory.service';
import type { PurchaseOrder, PurchaseOrderItem } from '@/types/database';
import type {
  createPurchaseOrderSchema,
  generateLowStockSchema,
  updatePurchaseOrderSchema,
} from './procurement.schema';
import type { z } from 'zod';

export interface PurchaseOrderWithItems extends PurchaseOrder {
  items: PurchaseOrderItem[];
}

export class ProcurementService {
  async list(tenantId: string): Promise<PurchaseOrderWithItems[]> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('purchase_orders')
      .select('*, purchase_order_items(*)')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    return (data ?? []).map((row) => {
      const order = row as PurchaseOrder & { purchase_order_items: PurchaseOrderItem[] };
      return {
        ...order,
        items: order.purchase_order_items ?? [],
      };
    });
  }

  async getById(tenantId: string, orderId: string): Promise<PurchaseOrderWithItems> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('purchase_orders')
      .select('*, purchase_order_items(*)')
      .eq('id', orderId)
      .eq('tenant_id', tenantId)
      .single();

    if (error || !data) throw new Error('Purchase order not found');
    const order = data as PurchaseOrder & { purchase_order_items: PurchaseOrderItem[] };
    return { ...order, items: order.purchase_order_items ?? [] };
  }

  async create(
    tenantId: string,
    input: z.infer<typeof createPurchaseOrderSchema>
  ): Promise<PurchaseOrderWithItems> {
    const supabase = createAdminClient();
    const totalCost = input.items.reduce(
      (sum, item) => sum + item.quantity * item.unitCost,
      0
    );

    const { data: order, error: orderError } = await supabase
      .from('purchase_orders')
      .insert({
        tenant_id: tenantId,
        title: input.title,
        booking_id: input.bookingId ?? null,
        notes: input.notes ?? null,
        total_cost: Math.round(totalCost * 100) / 100,
        status: 'draft',
      })
      .select()
      .single();

    if (orderError || !order) {
      throw new Error(orderError?.message ?? 'Failed to create purchase order');
    }

    const lineItems = input.items.map((item) => ({
      purchase_order_id: order.id,
      inventory_item_id: item.inventoryItemId ?? null,
      item_name: item.itemName,
      sku: item.sku ?? null,
      quantity: item.quantity,
      unit_cost: item.unitCost,
      line_total: Math.round(item.quantity * item.unitCost * 100) / 100,
    }));

    const { data: items, error: itemsError } = await supabase
      .from('purchase_order_items')
      .insert(lineItems)
      .select();

    if (itemsError) throw new Error(itemsError.message);

    return {
      ...(order as PurchaseOrder),
      items: (items ?? []) as PurchaseOrderItem[],
    };
  }

  async update(
    tenantId: string,
    orderId: string,
    input: z.infer<typeof updatePurchaseOrderSchema>
  ): Promise<PurchaseOrder> {
    const supabase = createAdminClient();
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (input.title !== undefined) patch.title = input.title;
    if (input.status !== undefined) patch.status = input.status;
    if (input.bookingId !== undefined) patch.booking_id = input.bookingId;
    if (input.notes !== undefined) patch.notes = input.notes;

    const { data, error } = await supabase
      .from('purchase_orders')
      .update(patch)
      .eq('id', orderId)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    if (error || !data) throw new Error(error?.message ?? 'Failed to update purchase order');
    return data as PurchaseOrder;
  }

  async generateFromLowStock(
    tenantId: string,
    input: z.infer<typeof generateLowStockSchema> = {}
  ): Promise<PurchaseOrderWithItems> {
    const items = await inventoryService.list(tenantId);
    const lowStock = items.filter((item) => item.quantity <= item.reorder_level);

    if (lowStock.length === 0) {
      throw new Error('No low-stock items found');
    }

    const orderItems = lowStock.map((item) => {
      const targetQty = Math.max(item.reorder_level * 2, item.reorder_level + 1);
      const quantity = Math.max(1, targetQty - item.quantity);
      return {
        inventoryItemId: item.id,
        itemName: item.name,
        sku: item.sku,
        quantity,
        unitCost: Number(item.unit_cost),
      };
    });

    const title =
      input.title ??
      `Restock list — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

    return this.create(tenantId, {
      title,
      bookingId: input.bookingId ?? null,
      notes: 'Auto-generated from items at or below reorder level.',
      items: orderItems,
    });
  }
}

export const procurementService = new ProcurementService();

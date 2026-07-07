import { createAdminClient } from '@/lib/supabase/admin';
import type { InventoryItem } from '@/types/database';
import type { CreateInventoryItemInput, UpdateInventoryItemInput } from './inventory.schema';

export class InventoryService {
  async list(tenantId: string): Promise<InventoryItem[]> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('name');

    if (error) throw new Error(error.message);
    return (data ?? []) as InventoryItem[];
  }

  async adjustQuantity(
    tenantId: string,
    itemId: string,
    delta: number
  ): Promise<InventoryItem> {
    const supabase = createAdminClient();

    const { data: item, error: fetchError } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('id', itemId)
      .eq('tenant_id', tenantId)
      .single();

    if (fetchError || !item) throw new Error('Inventory item not found');

    const newQuantity = (item as InventoryItem).quantity + delta;
    if (newQuantity < 0) throw new Error('Insufficient inventory');

    const { data: updated, error } = await supabase
      .from('inventory_items')
      .update({ quantity: newQuantity })
      .eq('id', itemId)
      .select()
      .single();

    if (error || !updated) throw new Error(error?.message ?? 'Update failed');
    return updated as InventoryItem;
  }

  async create(tenantId: string, input: CreateInventoryItemInput): Promise<InventoryItem> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('inventory_items')
      .insert({
        tenant_id: tenantId,
        name: input.name,
        sku: input.sku,
        category: input.category,
        quantity: input.quantity,
        unit_cost: input.unitCost,
        unit_price: input.unitPrice,
        reorder_level: input.reorderLevel,
      })
      .select()
      .single();

    if (error || !data) throw new Error(error?.message ?? 'Create failed');
    return data as InventoryItem;
  }

  async update(
    tenantId: string,
    itemId: string,
    input: UpdateInventoryItemInput
  ): Promise<InventoryItem> {
    const supabase = createAdminClient();
    const patch: Record<string, unknown> = {};

    if (input.name !== undefined) patch.name = input.name;
    if (input.sku !== undefined) patch.sku = input.sku;
    if (input.category !== undefined) patch.category = input.category;
    if (input.quantity !== undefined) patch.quantity = input.quantity;
    if (input.unitCost !== undefined) patch.unit_cost = input.unitCost;
    if (input.unitPrice !== undefined) patch.unit_price = input.unitPrice;
    if (input.reorderLevel !== undefined) patch.reorder_level = input.reorderLevel;

    const { data, error } = await supabase
      .from('inventory_items')
      .update(patch)
      .eq('id', itemId)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    if (error || !data) throw new Error(error?.message ?? 'Update failed');
    return data as InventoryItem;
  }

  async delete(tenantId: string, itemId: string): Promise<void> {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', itemId)
      .eq('tenant_id', tenantId);

    if (error) throw new Error(error.message);
  }

  calculateCogs(items: InventoryItem[]): number {
    return items.reduce((sum, item) => sum + item.quantity * item.unit_cost, 0);
  }

  /** Deduct standard supplies when an event is marked completed. */
  async consumeForEvent(tenantId: string, guestCount: number): Promise<void> {
    const items = await this.list(tenantId);
    const kegs = Math.max(1, Math.ceil(guestCount / 40));
    const whiskey = Math.max(1, Math.ceil(guestCount / 60));
    const glassPacks = Math.max(1, Math.ceil(guestCount / 50));
    const bunting = Math.max(1, Math.ceil(guestCount / 80));

    const deductions: Array<{ sku: string; delta: number }> = [
      { sku: 'BEER-001', delta: -kegs },
      { sku: 'SPIR-001', delta: -whiskey },
      { sku: 'SUPP-001', delta: -glassPacks },
      { sku: 'DECO-001', delta: -bunting },
    ];

    for (const { sku, delta } of deductions) {
      const item = items.find((i) => i.sku === sku);
      if (!item) continue;
      try {
        await this.adjustQuantity(tenantId, item.id, delta);
      } catch {
        // Skip if insufficient stock — admin can reconcile manually
      }
    }
  }
}

export const inventoryService = new InventoryService();

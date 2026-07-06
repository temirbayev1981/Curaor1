import { createAdminClient } from '@/lib/supabase/admin';
import type { InventoryItem } from '@/types/database';

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

  calculateCogs(items: InventoryItem[]): number {
    return items.reduce((sum, item) => sum + item.quantity * item.unit_cost, 0);
  }
}

export const inventoryService = new InventoryService();

import type { InventoryItem } from '@/types/database';

export const EVENT_CONSUMPTION_RULES = [
  { sku: 'BEER-001', perGuests: 40, min: 1 },
  { sku: 'SPIR-001', perGuests: 60, min: 1 },
  { sku: 'SUPP-001', perGuests: 50, min: 1 },
  { sku: 'DECO-001', perGuests: 80, min: 1 },
] as const;

export interface CogsBreakdownRow {
  name: string;
  sku: string;
  quantity: number;
  cost: number;
}

export function estimateEventCogs(
  guestCount: number,
  inventory: InventoryItem[]
): { total: number; breakdown: CogsBreakdownRow[] } {
  const breakdown: CogsBreakdownRow[] = [];
  let total = 0;

  for (const rule of EVENT_CONSUMPTION_RULES) {
    const item = inventory.find((i) => i.sku === rule.sku);
    if (!item) continue;
    const quantity = Math.max(rule.min, Math.ceil(guestCount / rule.perGuests));
    const cost = Math.round(quantity * Number(item.unit_cost) * 100) / 100;
    total += cost;
    breakdown.push({
      name: item.name,
      sku: item.sku,
      quantity,
      cost,
    });
  }

  return { total: Math.round(total * 100) / 100, breakdown };
}

export function calculateMargin(
  revenue: number,
  totalCosts: number
): { margin: number; marginPercent: number } {
  const margin = Math.round((revenue - totalCosts) * 100) / 100;
  const marginPercent = revenue > 0 ? Math.round((margin / revenue) * 10000) / 100 : 0;
  return { margin, marginPercent };
}

import { createAdminClient } from '@/lib/supabase/admin';
import { inventoryService } from '@/domain/inventory/inventory.service';
import { staffService } from '@/domain/staff/staff.service';
import type { Booking, InventoryItem, Payment } from '@/types/database';

export interface EventProfitability {
  bookingId: string;
  revenue: number;
  cogs: number;
  deliveryCost: number;
  laborCost: number;
  totalCosts: number;
  margin: number;
  marginPercent: number;
  cogsBreakdown: Array<{ name: string; sku: string; quantity: number; cost: number }>;
  laborBreakdown: Array<{ name: string; hours: number; pay: number }>;
}

const EVENT_CONSUMPTION_RULES = [
  { sku: 'BEER-001', perGuests: 40, min: 1 },
  { sku: 'SPIR-001', perGuests: 60, min: 1 },
  { sku: 'SUPP-001', perGuests: 50, min: 1 },
  { sku: 'DECO-001', perGuests: 80, min: 1 },
] as const;

function estimateEventCogs(
  guestCount: number,
  inventory: InventoryItem[]
): { total: number; breakdown: EventProfitability['cogsBreakdown'] } {
  const breakdown: EventProfitability['cogsBreakdown'] = [];
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

export class ProfitService {
  async getEventProfitability(
    tenantId: string,
    bookingId: string
  ): Promise<EventProfitability> {
    const supabase = createAdminClient();

    const [bookingRes, paymentsRes, inventory, laborShifts] = await Promise.all([
      supabase.from('bookings').select('*').eq('id', bookingId).eq('tenant_id', tenantId).single(),
      supabase
        .from('payments')
        .select('*')
        .eq('booking_id', bookingId)
        .eq('tenant_id', tenantId)
        .eq('status', 'succeeded'),
      inventoryService.list(tenantId),
      staffService.listShifts(tenantId, { bookingId }),
    ]);

    if (bookingRes.error || !bookingRes.data) {
      throw new Error('Booking not found');
    }

    const booking = bookingRes.data as Booking;
    const payments = (paymentsRes.data ?? []) as Payment[];
    const revenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const deliveryCost = Number(booking.delivery_cost);
    const { total: cogs, breakdown: cogsBreakdown } = estimateEventCogs(
      booking.guest_count,
      inventory
    );
    const laborBreakdown = laborShifts.map((shift) => ({
      name: shift.member.full_name,
      hours: shift.hours,
      pay: shift.pay,
    }));
    const laborCost = Math.round(
      laborBreakdown.reduce((sum, row) => sum + row.pay, 0) * 100
    ) / 100;
    const totalCosts = Math.round((cogs + deliveryCost + laborCost) * 100) / 100;
    const margin = Math.round((revenue - totalCosts) * 100) / 100;
    const marginPercent =
      revenue > 0 ? Math.round((margin / revenue) * 10000) / 100 : 0;

    return {
      bookingId,
      revenue,
      cogs,
      deliveryCost,
      laborCost,
      totalCosts,
      margin,
      marginPercent,
      cogsBreakdown,
      laborBreakdown,
    };
  }
}

export const profitService = new ProfitService();

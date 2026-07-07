import { createAdminClient } from '@/lib/supabase/admin';
import { inventoryService } from '@/domain/inventory/inventory.service';
import { staffService } from '@/domain/staff/staff.service';
import { calculateMargin, estimateEventCogs } from '@/domain/profit/profit.utils';
import type { Booking, Payment } from '@/types/database';

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
    const { margin, marginPercent } = calculateMargin(revenue, totalCosts);

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

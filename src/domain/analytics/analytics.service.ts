import { createAdminClient } from '@/lib/supabase/admin';
import type { Booking, Payment, InventoryItem } from '@/types/database';

export interface DashboardMetrics {
  netProfit: number;
  roi: number;
  cogs: number;
  customerLtv: number;
  conversionRate: number;
  totalBookings: number;
  completedBookings: number;
  totalRevenue: number;
}

export class AnalyticsService {
  async getDashboardMetrics(tenantId: string): Promise<DashboardMetrics> {
    const supabase = createAdminClient();

    const [bookingsRes, paymentsRes, inventoryRes, customersRes] =
      await Promise.all([
        supabase.from('bookings').select('*').eq('tenant_id', tenantId),
        supabase
          .from('payments')
          .select('*')
          .eq('tenant_id', tenantId)
          .eq('status', 'succeeded'),
        supabase.from('inventory_items').select('*').eq('tenant_id', tenantId),
        supabase.from('customers').select('id').eq('tenant_id', tenantId),
      ]);

    const bookings = (bookingsRes.data ?? []) as Booking[];
    const payments = (paymentsRes.data ?? []) as Payment[];
    const inventory = (inventoryRes.data ?? []) as InventoryItem[];

    const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const cogs = inventory.reduce(
      (sum, item) => sum + item.quantity * item.unit_cost,
      0
    );
    const netProfit = totalRevenue - cogs;
    const roi = cogs > 0 ? ((netProfit / cogs) * 100) : 0;

    const completedBookings = bookings.filter((b) => b.status === 'completed').length;
    const totalBookings = bookings.length;
    const customerCount = customersRes.data?.length ?? 0;
    const customerLtv = customerCount > 0 ? totalRevenue / customerCount : 0;
    const conversionRate =
      totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0;

    return {
      netProfit: Math.round(netProfit * 100) / 100,
      roi: Math.round(roi * 100) / 100,
      cogs: Math.round(cogs * 100) / 100,
      customerLtv: Math.round(customerLtv * 100) / 100,
      conversionRate: Math.round(conversionRate * 100) / 100,
      totalBookings,
      completedBookings,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
    };
  }
}

export const analyticsService = new AnalyticsService();

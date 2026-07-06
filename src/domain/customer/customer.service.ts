import { createAdminClient } from '@/lib/supabase/admin';
import type { Customer } from '@/types/database';

export interface CustomerWithStats extends Customer {
  booking_count: number;
  total_spent: number;
}

export class CustomerService {
  async listWithStats(tenantId: string): Promise<CustomerWithStats[]> {
    const supabase = createAdminClient();

    const { data: customers, error } = await supabase
      .from('customers')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    const { data: bookings } = await supabase
      .from('bookings')
      .select('customer_id, subtotal, status')
      .eq('tenant_id', tenantId);

    const stats = new Map<string, { count: number; spent: number }>();
    for (const b of bookings ?? []) {
      const id = b.customer_id as string;
      const current = stats.get(id) ?? { count: 0, spent: 0 };
      current.count += 1;
      if (b.status !== 'cancelled') {
        current.spent += Number(b.subtotal);
      }
      stats.set(id, current);
    }

    return ((customers ?? []) as Customer[]).map((c) => ({
      ...c,
      booking_count: stats.get(c.id)?.count ?? 0,
      total_spent: stats.get(c.id)?.spent ?? 0,
    }));
  }
}

export const customerService = new CustomerService();

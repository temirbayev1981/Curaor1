import { DashboardWidgets } from '@/components/admin/DashboardWidgets';
import { RevenueChart } from '@/components/admin/RevenueChart';
import { RecentActivity } from '@/components/admin/RecentActivity';
import { analyticsService } from '@/domain/analytics/analytics.service';
import { createAdminClient } from '@/lib/supabase/admin';
import { DEFAULT_TENANT_ID } from '@/lib/tenant/constants';
import type { AuditLog } from '@/types/database';
import type { Locale } from '@/lib/i18n/config';

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  let metrics = {
    netProfit: 0,
    roi: 0,
    cogs: 0,
    customerLtv: 0,
    conversionRate: 0,
    totalBookings: 0,
    completedBookings: 0,
    totalRevenue: 0,
  };
  let monthlyRevenue = [
    { month: 'Jan', revenue: 0 },
    { month: 'Feb', revenue: 0 },
    { month: 'Mar', revenue: 0 },
    { month: 'Apr', revenue: 0 },
    { month: 'May', revenue: 0 },
    { month: 'Jun', revenue: 0 },
  ];
  let recentLogs: AuditLog[] = [];

  try {
    const [m, r] = await Promise.all([
      analyticsService.getDashboardMetrics(DEFAULT_TENANT_ID),
      analyticsService.getMonthlyRevenue(DEFAULT_TENANT_ID),
    ]);
    metrics = m;
    monthlyRevenue = r;

    const supabase = createAdminClient();
    const { data } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('tenant_id', DEFAULT_TENANT_ID)
      .order('created_at', { ascending: false })
      .limit(6);
    recentLogs = (data ?? []) as AuditLog[];
  } catch {
    // DB not connected in dev — show zeroed metrics
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Dashboard</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Business overview and recent activity
        </p>
      </div>

      <DashboardWidgets metrics={metrics} />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <RevenueChart data={monthlyRevenue} />
        </div>
        <div className="lg:col-span-2">
          <RecentActivity logs={recentLogs} locale={locale as Locale} />
        </div>
      </div>
    </div>
  );
}

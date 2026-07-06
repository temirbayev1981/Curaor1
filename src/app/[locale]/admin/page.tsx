import { DashboardWidgets } from '@/components/admin/DashboardWidgets';
import { analyticsService } from '@/domain/analytics/analytics.service';

const DEFAULT_TENANT_ID = 'a0000000-0000-4000-8000-000000000001';

export default async function AdminDashboardPage() {
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

  try {
    metrics = await analyticsService.getDashboardMetrics(DEFAULT_TENANT_ID);
  } catch {
    // DB not connected in dev — show zeroed metrics
  }

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-white">Dashboard</h2>
      <DashboardWidgets metrics={metrics} />
    </div>
  );
}

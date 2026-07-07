import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFrom = vi.fn();

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ from: mockFrom }),
}));

describe('AnalyticsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();

    mockFrom.mockImplementation((table: string) => {
      if (table === 'bookings') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: [
                { status: 'completed', subtotal: 1000 },
                { status: 'pending', subtotal: 500 },
              ],
            }),
          }),
        };
      }
      if (table === 'payments') {
        const payload = {
          data: [{ amount: 800, status: 'succeeded', created_at: '2026-06-01T00:00:00Z' }],
        };
        const secondEq = vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue(payload),
          then(resolve: (value: typeof payload) => void) {
            resolve(payload);
          },
        });
        const firstEq = vi.fn().mockReturnValue({ eq: secondEq });
        return {
          select: vi.fn().mockReturnValue({ eq: firstEq }),
        };
      }
      if (table === 'inventory_items') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: [{ quantity: 2, unit_cost: 50 }] }),
          }),
        };
      }
      if (table === 'customers') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: [{ id: 'c1' }, { id: 'c2' }] }),
          }),
        };
      }
      const order = vi.fn().mockResolvedValue({ data: [] });
      const secondEq = vi.fn().mockReturnValue({ order });
      const firstEq = vi.fn().mockReturnValue({ eq: secondEq });
      return { select: vi.fn().mockReturnValue({ eq: firstEq }) };
    });
  });

  it('computes dashboard metrics', async () => {
    const { analyticsService } = await import('@/domain/analytics/analytics.service');
    const metrics = await analyticsService.getDashboardMetrics('a0000000-0000-4000-8000-000000000001');

    expect(metrics.totalRevenue).toBe(800);
    expect(metrics.cogs).toBe(100);
    expect(metrics.netProfit).toBe(700);
    expect(metrics.totalBookings).toBe(2);
    expect(metrics.completedBookings).toBe(1);
    expect(metrics.customerLtv).toBe(400);
  });

  it('returns monthly revenue buckets', async () => {
    const { analyticsService } = await import('@/domain/analytics/analytics.service');
    const months = await analyticsService.getMonthlyRevenue('a0000000-0000-4000-8000-000000000001');
    expect(months).toHaveLength(6);
    expect(months[0]).toHaveProperty('revenue');
  });
});

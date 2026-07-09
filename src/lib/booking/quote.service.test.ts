import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/domain/maps/distance.service', () => ({
  calculateDistance: vi.fn().mockResolvedValue({ distanceMiles: 10, durationMinutes: 20 }),
}));

const mockSingle = vi.fn();
const mockFrom = vi.fn();

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ from: mockFrom }),
}));

describe('buildBookingQuote', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('builds quote with package pricing and delivery', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'tenants') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  id: 'a0000000-0000-4000-8000-000000000001',
                  settings: { base_event_price: 1500, price_per_mile: 2.5, default_deposit_percent: 25 },
                  admin_overrides: {},
                },
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === 'bookings') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              neq: vi.fn().mockReturnValue({
                gte: vi.fn().mockReturnValue({
                  lte: vi.fn().mockResolvedValue({ data: [], error: null }),
                }),
                data: [],
                error: null,
              }),
            }),
          }),
        };
      }
      return { select: vi.fn() };
    });

    const { buildBookingQuote } = await import('@/lib/booking/quote.service');
    const quote = await buildBookingQuote({
      tenantId: 'a0000000-0000-4000-8000-000000000001',
      guestCount: 80,
      packageTier: 'g35',
      venueAddress: '123 Main',
      venueCity: 'Charlotte',
      venueState: 'NC',
      date: '2026-12-01',
    });

    expect(quote.packageTier).toBe('g35');
    expect(quote.deliveryCost).toBe(25);
    expect(quote.subtotal).toBeGreaterThan(0);
    expect(quote.depositPercent).toBe(25);
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getMonthAvailability } from './availability.service';

const mockSelect = vi.fn();

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: () => ({
      select: mockSelect,
    }),
  }),
}));

describe('getMonthAvailability', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('marks days with 2+ bookings as full', async () => {
    mockSelect.mockReturnValue({
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockResolvedValue({
        data: [
          { booking_start: '2026-07-05T18:00:00.000Z' },
          { booking_start: '2026-07-05T20:00:00.000Z' },
        ],
        error: null,
      }),
    });

    const days = await getMonthAvailability('tenant-1', '2026-07');
    const july5 = days.find((d) => d.date === '2026-07-05');

    expect(july5?.status).toBe('full');
    expect(july5?.bookingCount).toBe(2);
  });

  it('marks days with 1 booking as limited', async () => {
    mockSelect.mockReturnValue({
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockResolvedValue({
        data: [{ booking_start: '2026-07-10T18:00:00.000Z' }],
        error: null,
      }),
    });

    const days = await getMonthAvailability('tenant-1', '2026-07');
    const july10 = days.find((d) => d.date === '2026-07-10');

    expect(july10?.status).toBe('limited');
  });

  it('returns correct number of days for the month', async () => {
    mockSelect.mockReturnValue({
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockResolvedValue({ data: [], error: null }),
    });

    const days = await getMonthAvailability('tenant-1', '2026-07');
    expect(days).toHaveLength(31);
    expect(days[0]?.status).toBe('open');
  });

  it('falls back to open days when bookings table is missing', async () => {
    mockSelect.mockReturnValue({
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockResolvedValue({
        data: null,
        error: { message: "Could not find the table 'public.bookings' in the schema cache" },
      }),
    });

    const days = await getMonthAvailability('tenant-1', '2026-07');
    expect(days).toHaveLength(31);
    expect(days.every((day) => day.status === 'open')).toBe(true);
  });
});

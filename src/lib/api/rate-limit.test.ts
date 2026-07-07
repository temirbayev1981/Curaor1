import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSingle = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockFrom = vi.fn();

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ from: mockFrom }),
}));

describe('rate-limit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mockInsert.mockResolvedValue({ error: null });
    mockUpdate.mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ single: mockSingle }),
      }),
      insert: mockInsert,
      update: mockUpdate,
    });
  });

  it('allows first booking request for new bucket', async () => {
    mockSingle.mockResolvedValue({ data: null, error: { code: 'PGRST116' } });
    const { checkBookingRateLimit } = await import('@/lib/api/rate-limit');
    await expect(checkBookingRateLimit('1.2.3.4')).resolves.toBe(true);
    expect(mockInsert).toHaveBeenCalled();
  });

  it('blocks when booking rate limit exceeded', async () => {
    mockSingle.mockResolvedValue({
      data: {
        id: 'b1',
        request_count: 3,
        window_start: new Date().toISOString(),
      },
      error: null,
    });
    const { checkBookingRateLimit } = await import('@/lib/api/rate-limit');
    await expect(checkBookingRateLimit('1.2.3.4')).resolves.toBe(false);
  });

  it('checks quote rate limit', async () => {
    mockSingle.mockResolvedValue({ data: null, error: { code: 'PGRST116' } });
    const { checkQuoteRateLimit } = await import('@/lib/api/rate-limit');
    await expect(checkQuoteRateLimit('1.2.3.4')).resolves.toBe(true);
  });

  it('resets bucket after window expires', async () => {
    mockSingle.mockResolvedValue({
      data: {
        id: 'b2',
        request_count: 3,
        window_start: new Date(Date.now() - 120_000).toISOString(),
      },
      error: null,
    });
    const { checkBookingRateLimit } = await import('@/lib/api/rate-limit');
    await expect(checkBookingRateLimit('9.9.9.9')).resolves.toBe(true);
    expect(mockUpdate).toHaveBeenCalled();
  });

  it('increments request count within active window', async () => {
    mockSingle.mockResolvedValue({
      data: {
        id: 'b3',
        request_count: 1,
        window_start: new Date().toISOString(),
      },
      error: null,
    });
    const { checkAuthRateLimit } = await import('@/lib/api/rate-limit');
    await expect(checkAuthRateLimit('5.5.5.5')).resolves.toBe(true);
    expect(mockUpdate).toHaveBeenCalled();
  });

  it('checks AI generation rate limit', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockResolvedValue({ count: 2 }),
          }),
        }),
      }),
    });
    const { checkAiRateLimit } = await import('@/lib/api/rate-limit');
    await expect(checkAiRateLimit('t1')).resolves.toBe(true);
  });
});

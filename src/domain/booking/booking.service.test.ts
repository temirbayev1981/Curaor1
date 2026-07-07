import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/domain/events/event-bus', () => ({
  eventBus: { publish: vi.fn().mockResolvedValue('evt-1') },
}));

vi.mock('@/domain/inventory/inventory.service', () => ({
  inventoryService: { consumeForEvent: vi.fn().mockResolvedValue(undefined) },
}));

const mockSingle = vi.fn();
const mockFrom = vi.fn();

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ from: mockFrom }),
}));

describe('BookingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('loads booking by id', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'b1', tenant_id: 't1', status: 'pending' },
              error: null,
            }),
          }),
        }),
      }),
    });

    const { bookingService } = await import('@/domain/booking/booking.service');
    const booking = await bookingService.getById('t1', 'b1');
    expect(booking.id).toBe('b1');
  });

  it('transitions booking status', async () => {
    const booking = {
      id: 'b1',
      tenant_id: 't1',
      status: 'pending',
      guest_count: 50,
    };
    const updated = { ...booking, status: 'deposit_paid' };

    const selectChain = {
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: booking, error: null }),
    };
    const updateChain = {
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: updated, error: null }),
      }),
    };

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue(selectChain),
      update: vi.fn().mockReturnValue(updateChain),
    });

    const { bookingService } = await import('@/domain/booking/booking.service');
    const result = await bookingService.transition('t1', 'b1', 'deposit_paid');
    expect(result.status).toBe('deposit_paid');
  });
});

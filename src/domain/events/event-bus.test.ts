import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSingle = vi.fn();
const mockInsert = vi.fn();
const mockFrom = vi.fn();

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ from: mockFrom }),
}));

describe('EventBus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mockInsert.mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: mockSingle,
      }),
    });
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: mockSingle,
          }),
          single: mockSingle,
        }),
      }),
      insert: mockInsert,
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    });
  });

  it('returns existing event id when idempotency key matches', async () => {
    mockSingle.mockResolvedValueOnce({ data: { id: 'evt-existing' }, error: null });

    const { eventBus } = await import('@/domain/events/event-bus');
    const id = await eventBus.publish({
      tenantId: 'a0000000-0000-4000-8000-000000000001',
      eventType: 'booking.created.v1',
      aggregateId: 'b1',
      aggregateType: 'booking',
      payload: {},
      idempotencyKey: 'booking.created:b1',
    });

    expect(id).toBe('evt-existing');
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('publishes new event when idempotency key is new', async () => {
    mockSingle
      .mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } })
      .mockResolvedValueOnce({ data: { id: 'evt-new', processed_by: [] }, error: null })
      .mockResolvedValueOnce({ data: { id: 'evt-new', processed_by: [] }, error: null });

    mockSingle.mockImplementationOnce(() =>
      Promise.resolve({ data: null, error: { code: 'PGRST116' } })
    );
    mockSingle.mockImplementationOnce(() =>
      Promise.resolve({ data: { id: 'evt-new' }, error: null })
    );

    const { eventBus } = await import('@/domain/events/event-bus');

    mockSingle.mockReset();
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi
              .fn()
              .mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } })
              .mockResolvedValue({ data: { processed_by: [] }, error: null }),
          }),
        }),
      }),
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: 'evt-new' }, error: null }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    });

    const id = await eventBus.publish({
      tenantId: 'a0000000-0000-4000-8000-000000000001',
      eventType: 'booking.created.v1',
      aggregateId: 'b2',
      aggregateType: 'booking',
      payload: { bookingId: 'b2' },
      idempotencyKey: 'booking.created:b2',
    });

    expect(id).toBe('evt-new');
  });
});

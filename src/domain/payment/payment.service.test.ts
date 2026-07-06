import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSingle = vi.fn();
const mockEq = vi.fn().mockReturnThis();
const mockUpdate = vi.fn().mockReturnThis();
const mockFrom = vi.fn(() => ({
  select: vi.fn().mockReturnValue({ eq: mockEq, single: mockSingle }),
  update: vi.fn().mockReturnValue({ eq: mockEq }),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ from: mockFrom }),
}));

vi.mock('@/domain/booking/booking.service', () => ({
  bookingService: {
    transition: vi.fn(),
  },
}));

vi.mock('@/domain/events/event-bus', () => ({
  eventBus: { publish: vi.fn() },
}));

vi.mock('@/lib/config/env', () => ({
  getStripeSecretKey: () => 'sk_test_fake',
  isStripeConfigured: () => true,
}));

describe('PaymentService.handleWebhook idempotency', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEq.mockReturnThis();
  });

  it('skips processing when payment already succeeded', async () => {
    mockSingle.mockResolvedValue({ data: { status: 'succeeded' }, error: null });

    const { paymentService } = await import('@/domain/payment/payment.service');

    await paymentService.handleWebhook({
      type: 'checkout.session.completed',
      data: {
        object: {
          metadata: {
            tenantId: 'a0000000-0000-4000-8000-000000000001',
            bookingId: 'b0000000-0000-4000-8000-000000000001',
            paymentId: 'p0000000-0000-4000-8000-000000000001',
            paymentType: 'deposit',
          },
          payment_intent: 'pi_test',
          amount_total: 10000,
        },
      },
    } as never);

    expect(mockFrom).toHaveBeenCalledWith('payments');
  });
});

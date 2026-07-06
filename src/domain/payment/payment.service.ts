import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import { eventBus } from '@/domain/events/event-bus';
import { EVENT_TYPES } from '@/domain/events/event.types';
import { bookingService } from '@/domain/booking/booking.service';
import type { Payment, PaymentType } from '@/types/database';

function getStripe(): Stripe {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-06-24.dahlia',
  });
}

export class PaymentService {
  async createCheckoutSession(
    tenantId: string,
    bookingId: string,
    paymentType: PaymentType,
    successUrl: string,
    cancelUrl: string
  ): Promise<{ sessionId: string; url: string }> {
    const supabase = createAdminClient();

    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*, customers(email, full_name)')
      .eq('id', bookingId)
      .eq('tenant_id', tenantId)
      .single();

    if (error || !booking) {
      throw new Error('Booking not found');
    }

    const amount =
      paymentType === 'deposit'
        ? Number(booking.deposit_amount)
        : paymentType === 'balance'
          ? Number(booking.balance_due)
          : Number(booking.subtotal);

    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        tenant_id: tenantId,
        booking_id: bookingId,
        amount,
        payment_type: paymentType,
        status: 'pending',
      })
      .select()
      .single();

    if (paymentError || !payment) {
      throw new Error(`Failed to create payment record: ${paymentError?.message}`);
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `The Emerald Pour — ${paymentType} payment`,
              description: `Booking ${bookingId}`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        tenantId,
        bookingId,
        paymentId: payment.id,
        paymentType,
      },
    });

    await supabase
      .from('payments')
      .update({ stripe_checkout_session_id: session.id })
      .eq('id', payment.id);

    return { sessionId: session.id, url: session.url! };
  }

  async handleWebhook(event: Stripe.Event): Promise<void> {
    if (event.type !== 'checkout.session.completed') return;

    const session = event.data.object as Stripe.Checkout.Session;
    const { tenantId, bookingId, paymentId, paymentType } = session.metadata ?? {};

    if (!tenantId || !bookingId || !paymentId) return;

    const supabase = createAdminClient();

    await supabase
      .from('payments')
      .update({
        status: 'succeeded',
        stripe_payment_intent_id: session.payment_intent as string,
      })
      .eq('id', paymentId);

    if (paymentType === 'deposit' || paymentType === 'full') {
      await bookingService.transition(tenantId, bookingId, 'deposit_paid');
    }

    await eventBus.publish({
      tenantId,
      eventType: EVENT_TYPES.PAYMENT_SUCCEEDED,
      aggregateId: paymentId,
      aggregateType: 'payment',
      payload: { bookingId, paymentType, amount: session.amount_total },
      idempotencyKey: `payment.succeeded:${paymentId}`,
    });
  }

  async getByBooking(tenantId: string, bookingId: string): Promise<Payment[]> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('booking_id', bookingId);

    if (error) throw new Error(error.message);
    return (data ?? []) as Payment[];
  }
}

export const paymentService = new PaymentService();

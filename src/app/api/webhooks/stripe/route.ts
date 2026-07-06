import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { getStripeSecretKey, getStripeWebhookSecret } from '@/lib/config/env';
import '@/domain/events/register-consumers';
import { paymentService } from '@/domain/payment/payment.service';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return Response.json({ error: 'Missing signature' }, { status: 400 });
  }

  const stripe = new Stripe(getStripeSecretKey(), {
    apiVersion: '2026-06-24.dahlia',
  });

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      getStripeWebhookSecret()
    );

    await paymentService.handleWebhook(event);
    return Response.json({ received: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook error';
    return Response.json({ error: message }, { status: 400 });
  }
}

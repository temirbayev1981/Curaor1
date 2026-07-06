import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

interface NotificationPayload {
  tenantId: string;
  to: string;
  subject: string;
  bookingId: string;
  template: 'confirmation' | 'invoice' | 'reminder';
}

serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  if (!RESEND_API_KEY) {
    return new Response(JSON.stringify({ error: 'Email not configured' }), {
      status: 503,
    });
  }

  const body = (await req.json()) as NotificationPayload;

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { data: booking } = await supabase
    .from('bookings')
    .select('*, customers(full_name, email)')
    .eq('id', body.bookingId)
    .single();

  if (!booking) {
    return new Response(JSON.stringify({ error: 'Booking not found' }), { status: 404 });
  }

  const html = generateEmailHtml(body.template, booking);

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'The Emerald Pour <bookings@emeraldpour.com>',
      to: body.to,
      subject: body.subject,
      html,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    return new Response(JSON.stringify({ error }), { status: 500 });
  }

  return new Response(JSON.stringify({ sent: true }), { status: 200 });
});

function generateEmailHtml(
  template: string,
  booking: Record<string, unknown>
): string {
  const customer = booking.customers as Record<string, string> | null;
  const name = customer?.full_name ?? 'Guest';
  const date = new Date(booking.booking_start as string).toLocaleDateString();

  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #10b981;">The Emerald Pour</h1>
      <p>Hello ${name},</p>
      <p>Your ${template} for your event on <strong>${date}</strong> in ${booking.venue_city}.</p>
      <p>Event: ${booking.event_type} | Guests: ${booking.guest_count}</p>
      <p>Total: $${booking.subtotal} | Deposit: $${booking.deposit_amount}</p>
      <p style="color: #666;">Thank you for choosing The Emerald Pour!</p>
    </div>
  `;
}

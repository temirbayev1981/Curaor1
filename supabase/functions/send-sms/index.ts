import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const TWILIO_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
const TWILIO_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
const TWILIO_PHONE = Deno.env.get('TWILIO_PHONE_NUMBER');

interface SmsPayload {
  tenantId: string;
  eventType: string;
  payload: Record<string, unknown>;
}

serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  if (!TWILIO_SID || !TWILIO_TOKEN || !TWILIO_PHONE) {
    return new Response(JSON.stringify({ error: 'Twilio not configured' }), {
      status: 503,
    });
  }

  const body = (await req.json()) as SmsPayload;
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const bookingId = body.payload.bookingId as string | undefined;
  if (!bookingId) {
    return new Response(JSON.stringify({ skipped: true }), { status: 200 });
  }

  const { data: booking } = await supabase
    .from('bookings')
    .select('*, customers(phone, full_name)')
    .eq('id', bookingId)
    .single();

  if (!booking) {
    return new Response(JSON.stringify({ error: 'Booking not found' }), { status: 404 });
  }

  const customer = booking.customers as { phone: string | null; full_name: string } | null;
  if (!customer?.phone) {
    return new Response(JSON.stringify({ skipped: true, reason: 'no phone' }), { status: 200 });
  }

  const message = formatSms(body.eventType, booking);

  const auth = btoa(`${TWILIO_SID}:${TWILIO_TOKEN}`);
  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: customer.phone,
        From: TWILIO_PHONE,
        Body: message,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    return new Response(JSON.stringify({ error }), { status: 500 });
  }

  return new Response(JSON.stringify({ sent: true }), { status: 200 });
});

function formatSms(eventType: string, booking: Record<string, unknown>): string {
  const city = booking.venue_city;
  const date = new Date(booking.booking_start as string).toLocaleDateString();

  switch (eventType) {
    case 'booking.created.v1':
      return `The Emerald Pour: Your ${booking.event_type} booking in ${city} on ${date} has been received. We'll confirm within 24hrs.`;
    case 'payment.succeeded.v1':
      return `The Emerald Pour: Payment received for your event in ${city} on ${date}. Thank you!`;
    default:
      return `The Emerald Pour: Update on your booking in ${city}.`;
  }
}

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { unauthorizedResponse, verifyEdgeRequest } from '../_shared/auth.ts';

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');

interface EventPayload {
  eventId: string;
  tenantId: string;
  eventType: string;
  payload: Record<string, unknown>;
}

serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  if (!verifyEdgeRequest(req)) {
    return unauthorizedResponse();
  }

  if (!TELEGRAM_BOT_TOKEN) {
    return new Response(JSON.stringify({ error: 'Telegram not configured' }), {
      status: 503,
    });
  }

  const body = (await req.json()) as EventPayload;
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { data: tenant } = await supabase
    .from('tenants')
    .select('settings')
    .eq('id', body.tenantId)
    .single();

  const chatId = (tenant?.settings as Record<string, unknown>)?.telegram_chat_id;
  if (!chatId) {
    return new Response(JSON.stringify({ skipped: true }), { status: 200 });
  }

  const message = formatMessage(body.eventType, body.payload);

  const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  await fetch(telegramUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' }),
  });

  return new Response(JSON.stringify({ sent: true }), { status: 200 });
});

function formatMessage(eventType: string, payload: Record<string, unknown>): string {
  switch (eventType) {
    case 'booking.created.v1':
      return `🍀 <b>New Booking</b>\nCustomer: ${payload.customerId}\nBooking: ${payload.bookingId}`;
    case 'payment.succeeded.v1':
      return `💰 <b>Payment Received</b>\nBooking: ${payload.bookingId}\nAmount: $${(Number(payload.amount) / 100).toFixed(2)}`;
    default:
      return `📋 Event: ${eventType}`;
  }
}

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface DirectPayload {
  tenantId: string;
  bookingId: string;
}

interface EventBusPayload {
  eventId?: string;
  tenantId: string;
  eventType?: string;
  payload?: Record<string, unknown>;
}

type RequestBody = DirectPayload & EventBusPayload;

serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const refreshToken = Deno.env.get('GOOGLE_CALENDAR_REFRESH_TOKEN');
  const clientId = Deno.env.get('GOOGLE_CALENDAR_CLIENT_ID');
  const clientSecret = Deno.env.get('GOOGLE_CALENDAR_CLIENT_SECRET');

  if (!refreshToken || !clientId || !clientSecret) {
    return new Response(JSON.stringify({ error: 'Calendar not configured' }), {
      status: 503,
    });
  }

  const body = (await req.json()) as RequestBody;
  const bookingId = body.bookingId ?? (body.payload?.bookingId as string | undefined);
  const tenantId = body.tenantId;

  if (!bookingId || !tenantId) {
    return new Response(JSON.stringify({ error: 'bookingId and tenantId required' }), {
      status: 400,
    });
  }

  if (body.payload?.to === 'cancelled') {
    return new Response(JSON.stringify({ skipped: true, reason: 'cancelled' }), {
      status: 200,
    });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { data: booking } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .eq('tenant_id', tenantId)
    .single();

  if (!booking) {
    return new Response(JSON.stringify({ error: 'Booking not found' }), { status: 404 });
  }

  const accessToken = await getAccessToken(clientId, clientSecret, refreshToken);

  const event = {
    summary: `Emerald Pour — ${booking.event_type}`,
    location: `${booking.venue_address}, ${booking.venue_city}, ${booking.venue_state}`,
    description: `${booking.guest_count} guests`,
    start: { dateTime: booking.booking_start, timeZone: 'America/New_York' },
    end: { dateTime: booking.booking_end, timeZone: 'America/New_York' },
  };

  const calResponse = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    }
  );

  if (!calResponse.ok) {
    const error = await calResponse.text();
    return new Response(JSON.stringify({ error }), { status: 500 });
  }

  const calEvent = (await calResponse.json()) as { id: string };

  await supabase
    .from('bookings')
    .update({ google_calendar_event_id: calEvent.id })
    .eq('id', bookingId);

  return new Response(JSON.stringify({ eventId: calEvent.id }), { status: 200 });
});

async function getAccessToken(
  clientId: string,
  clientSecret: string,
  refreshToken: string
): Promise<string> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  const data = (await response.json()) as { access_token: string };
  return data.access_token;
}

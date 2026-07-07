import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { unauthorizedResponse, verifyEdgeRequest } from '../_shared/auth.ts';

serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  if (!verifyEdgeRequest(req)) {
    return unauthorizedResponse();
  }

  const refreshToken = Deno.env.get('GOOGLE_CALENDAR_REFRESH_TOKEN');
  const clientId = Deno.env.get('GOOGLE_CALENDAR_CLIENT_ID');
  const clientSecret = Deno.env.get('GOOGLE_CALENDAR_CLIENT_SECRET');

  if (!refreshToken || !clientId || !clientSecret) {
    return new Response(JSON.stringify({ error: 'Calendar not configured' }), {
      status: 503,
    });
  }

  const body = (await req.json()) as {
    tenantId: string;
    bookingId?: string;
    payload?: { bookingId?: string; to?: string; from?: string };
  };

  const bookingId = body.bookingId ?? body.payload?.bookingId;
  const tenantId = body.tenantId;
  const newStatus = body.payload?.to;

  if (!bookingId || !tenantId) {
    return new Response(JSON.stringify({ error: 'bookingId and tenantId required' }), {
      status: 400,
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
  const eventId = booking.google_calendar_event_id as string | null;

  if (newStatus === 'cancelled' && eventId) {
    const delResponse = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (delResponse.ok || delResponse.status === 404 || delResponse.status === 410) {
      await supabase
        .from('bookings')
        .update({ google_calendar_event_id: null })
        .eq('id', bookingId);
    }

    return new Response(JSON.stringify({ deleted: true }), { status: 200 });
  }

  if (newStatus === 'cancelled') {
    return new Response(JSON.stringify({ skipped: true }), { status: 200 });
  }

  const event = {
    summary: `Emerald Pour — ${booking.event_type}`,
    location: `${booking.venue_address}, ${booking.venue_city}, ${booking.venue_state}`,
    description: `${booking.guest_count} guests`,
    start: { dateTime: booking.booking_start, timeZone: 'America/New_York' },
    end: { dateTime: booking.booking_end, timeZone: 'America/New_York' },
  };

  if (eventId) {
    const patchResponse = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }
    );

    if (patchResponse.ok) {
      return new Response(JSON.stringify({ eventId, updated: true }), { status: 200 });
    }
  }

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

import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
  isSupabaseConfigured,
} from '@/lib/config/env';

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = request.headers.get('authorization');
  return auth === `Bearer ${secret}`;
}

async function runReminders(requestId: string) {
  if (!isSupabaseConfigured()) {
    return Response.json({ error: 'Not configured', requestId }, { status: 503 });
  }

  const supabase = createAdminClient();
  const now = new Date();
  const in7days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const in1day = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const { data: bookings } = await supabase
    .from('bookings')
    .select('id, tenant_id, booking_start, status')
    .in('status', ['confirmed', 'deposit_paid'])
    .gte('booking_start', now.toISOString())
    .lte('booking_start', in7days.toISOString());

  let sent = 0;

  for (const booking of bookings ?? []) {
    const eventDate = new Date(booking.booking_start as string);
    const isTomorrow =
      eventDate.getTime() <= in1day.getTime() + 12 * 60 * 60 * 1000 &&
      eventDate.getTime() > now.getTime();

    const template = isTomorrow ? 'reminder' : 'confirmation';

    try {
      const response = await fetch(`${getSupabaseUrl()}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getSupabaseServiceRoleKey()}`,
        },
        body: JSON.stringify({
          tenantId: booking.tenant_id,
          bookingId: booking.id,
          template,
        }),
      });

      if (response.ok) sent += 1;
    } catch {
      // Continue with next booking
    }
  }

  return Response.json({ requestId, sent, checked: bookings?.length ?? 0 });
}

export async function GET(request: NextRequest) {
  const requestId = randomUUID();

  if (!isAuthorized(request)) {
    return Response.json({ error: 'Unauthorized', requestId }, { status: 401 });
  }

  return runReminders(requestId);
}

export async function POST(request: NextRequest) {
  const requestId = randomUUID();

  if (!isAuthorized(request)) {
    return Response.json({ error: 'Unauthorized', requestId }, { status: 401 });
  }

  return runReminders(requestId);
}

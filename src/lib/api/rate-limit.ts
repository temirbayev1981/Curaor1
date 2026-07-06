import { createAdminClient } from '@/lib/supabase/admin';

const BOOKING_RATE_LIMIT = 3;
const BOOKING_WINDOW_MS = 60_000;
const AUTH_RATE_LIMIT = 10;
const AUTH_WINDOW_MS = 60_000;
const QUOTE_RATE_LIMIT = 30;
const QUOTE_WINDOW_MS = 60_000;

async function checkRateLimit(
  bucketKey: string,
  maxRequests: number,
  windowMs: number
): Promise<boolean> {
  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from('rate_limit_buckets')
    .select('id, request_count, window_start')
    .eq('bucket_key', bucketKey)
    .single();

  if (!existing) {
    await supabase.from('rate_limit_buckets').insert({
      bucket_key: bucketKey,
      request_count: 1,
      window_start: new Date().toISOString(),
    });
    return true;
  }

  if (new Date(existing.window_start).getTime() < Date.now() - windowMs) {
    await supabase
      .from('rate_limit_buckets')
      .update({ request_count: 1, window_start: new Date().toISOString() })
      .eq('id', existing.id);
    return true;
  }

  if (existing.request_count >= maxRequests) {
    return false;
  }

  await supabase
    .from('rate_limit_buckets')
    .update({ request_count: existing.request_count + 1 })
    .eq('id', existing.id);

  return true;
}

export async function checkBookingRateLimit(ip: string): Promise<boolean> {
  return checkRateLimit(`booking:${ip}`, BOOKING_RATE_LIMIT, BOOKING_WINDOW_MS);
}

export async function checkAuthRateLimit(ip: string): Promise<boolean> {
  return checkRateLimit(`auth:${ip}`, AUTH_RATE_LIMIT, AUTH_WINDOW_MS);
}

export async function checkQuoteRateLimit(ip: string): Promise<boolean> {
  return checkRateLimit(`quote:${ip}`, QUOTE_RATE_LIMIT, QUOTE_WINDOW_MS);
}

export async function checkAiRateLimit(tenantId: string): Promise<boolean> {
  const supabase = createAdminClient();
  const oneHourAgo = new Date(Date.now() - 3_600_000).toISOString();

  const { count } = await supabase
    .from('audit_logs')
    .select('id', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .eq('action', 'ai.article.generated')
    .gte('created_at', oneHourAgo);

  return (count ?? 0) < 10;
}

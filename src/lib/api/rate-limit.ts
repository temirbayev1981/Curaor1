import { createAdminClient } from '@/lib/supabase/admin';

const BOOKING_RATE_LIMIT = 3;
const BOOKING_WINDOW_MS = 60_000;

export async function checkBookingRateLimit(ip: string): Promise<boolean> {
  const supabase = createAdminClient();
  const bucketKey = `booking:${ip}`;

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

  if (new Date(existing.window_start).getTime() < Date.now() - BOOKING_WINDOW_MS) {
    await supabase
      .from('rate_limit_buckets')
      .update({ request_count: 1, window_start: new Date().toISOString() })
      .eq('id', existing.id);
    return true;
  }

  if (existing.request_count >= BOOKING_RATE_LIMIT) {
    return false;
  }

  await supabase
    .from('rate_limit_buckets')
    .update({ request_count: existing.request_count + 1 })
    .eq('id', existing.id);

  return true;
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

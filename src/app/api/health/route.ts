import { apiSuccess } from '@/lib/api/response';
import { isSupabaseConfigured } from '@/lib/config/env';
import { createAdminClient } from '@/lib/supabase/admin';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';

async function pingDatabase(): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from('tenants').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
}

export async function GET() {
  const requestId = randomUUID();
  const supabaseConfigured = isSupabaseConfigured();
  const database = supabaseConfigured ? await pingDatabase() : false;
  const healthy = supabaseConfigured && database;

  return Response.json(
    apiSuccess(
      {
        status: healthy ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version ?? '0.1.0',
        supabase: supabaseConfigured,
        database,
      },
      requestId
    ),
    { status: healthy ? 200 : 503 }
  );
}

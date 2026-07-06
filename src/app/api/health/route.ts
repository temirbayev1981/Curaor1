import { apiSuccess } from '@/lib/api/response';
import { isSupabaseConfigured } from '@/lib/config/env';
import { randomUUID } from 'crypto';

export async function GET() {
  const requestId = randomUUID();
  return Response.json(
    apiSuccess(
      {
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version ?? '0.1.0',
        supabase: isSupabaseConfigured(),
      },
      requestId
    )
  );
}

import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { apiSuccess, apiError } from '@/lib/api/response';
import { createAdminClient } from '@/lib/supabase/admin';
import type { SeoArticle } from '@/types/database';

export async function GET(request: NextRequest) {
  const requestId = randomUUID();
  const tenantId = request.nextUrl.searchParams.get('tenantId');

  if (!tenantId) {
    return Response.json(apiError('VALIDATION_ERROR', 'tenantId required', requestId), {
      status: 400,
    });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('seo_articles')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });

  if (error) {
    return Response.json(apiError('FETCH_ERROR', error.message, requestId), { status: 500 });
  }

  return Response.json(apiSuccess((data ?? []) as SeoArticle[], requestId));
}

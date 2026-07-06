import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { apiSuccess, apiError } from '@/lib/api/response';
import { requireStaff, AuthError } from '@/lib/auth/rbac';
import { createAdminClient } from '@/lib/supabase/admin';
import type { SeoArticle } from '@/types/database';

export async function GET() {
  const requestId = randomUUID();

  try {
    const ctx = await requireStaff();
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('seo_articles')
      .select('*')
      .eq('tenant_id', ctx.tenantId)
      .order('created_at', { ascending: false });

    if (error) {
      return Response.json(apiError('FETCH_ERROR', error.message, requestId), { status: 500 });
    }

    return Response.json(apiSuccess((data ?? []) as SeoArticle[], requestId));
  } catch (err) {
    if (err instanceof AuthError) {
      return Response.json(apiError(err.code, err.message, requestId), {
        status: err.code === 'FORBIDDEN' ? 403 : 401,
      });
    }
    return Response.json(apiError('FETCH_ERROR', 'Failed', requestId), { status: 500 });
  }
}

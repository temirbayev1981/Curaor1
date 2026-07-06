import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { apiSuccess, apiError } from '@/lib/api/response';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import type { SeoArticle } from '@/types/database';

const bodySchema = z.object({ tenantId: z.string().uuid() });

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = randomUUID();
  const { id: articleId } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json(apiError('UNAUTHORIZED', 'Authentication required', requestId), {
      status: 401,
    });
  }

  try {
    const body: unknown = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(apiError('VALIDATION_ERROR', parsed.error.message, requestId), {
        status: 400,
      });
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from('seo_articles')
      .update({ status: 'rejected' })
      .eq('id', articleId)
      .eq('tenant_id', parsed.data.tenantId)
      .eq('status', 'pending_approval')
      .select()
      .single();

    if (error || !data) {
      return Response.json(apiError('REJECT_ERROR', 'Article not found', requestId), {
        status: 404,
      });
    }

    return Response.json(apiSuccess(data as SeoArticle, requestId));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Rejection failed';
    return Response.json(apiError('REJECT_ERROR', message, requestId), { status: 500 });
  }
}

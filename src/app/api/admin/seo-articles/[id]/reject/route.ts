import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { apiSuccess, apiError } from '@/lib/api/response';
import { requireStaff, AuthError } from '@/lib/auth/rbac';
import { createAdminClient } from '@/lib/supabase/admin';
import { auditService } from '@/domain/audit/audit.service';
import type { SeoArticle } from '@/types/database';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = randomUUID();
  const { id: articleId } = await params;
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;

  try {
    const ctx = await requireStaff();
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('seo_articles')
      .update({ status: 'rejected' })
      .eq('id', articleId)
      .eq('tenant_id', ctx.tenantId)
      .eq('status', 'pending_approval')
      .select()
      .single();

    if (error || !data) {
      return Response.json(apiError('REJECT_ERROR', 'Article not found', requestId), {
        status: 404,
      });
    }

    await auditService.log({
      tenantId: ctx.tenantId,
      actorId: ctx.userId,
      action: 'article.rejected',
      resourceType: 'seo_article',
      resourceId: articleId,
      ipAddress: ip,
    });

    return Response.json(apiSuccess(data as SeoArticle, requestId));
  } catch (err) {
    if (err instanceof AuthError) {
      return Response.json(apiError(err.code, err.message, requestId), {
        status: err.code === 'FORBIDDEN' ? 403 : 401,
      });
    }
    const message = err instanceof Error ? err.message : 'Rejection failed';
    return Response.json(apiError('REJECT_ERROR', message, requestId), { status: 500 });
  }
}

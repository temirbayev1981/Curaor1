import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { apiSuccess, apiError } from '@/lib/api/response';
import { requireStaff, AuthError } from '@/lib/auth/rbac';
import { aiContentService } from '@/domain/ai/ai-content.service';
import { auditService } from '@/domain/audit/audit.service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = randomUUID();
  const { id: articleId } = await params;
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;

  try {
    const ctx = await requireStaff();

    const article = await aiContentService.approveArticle(
      ctx.tenantId,
      articleId,
      ctx.userId
    );

    await auditService.log({
      tenantId: ctx.tenantId,
      actorId: ctx.userId,
      action: 'article.approved',
      resourceType: 'seo_article',
      resourceId: articleId,
      ipAddress: ip,
    });

    return Response.json(apiSuccess(article, requestId));
  } catch (err) {
    if (err instanceof AuthError) {
      return Response.json(apiError(err.code, err.message, requestId), {
        status: err.code === 'FORBIDDEN' ? 403 : 401,
      });
    }
    const message = err instanceof Error ? err.message : 'Approval failed';
    return Response.json(apiError('APPROVE_ERROR', message, requestId), { status: 500 });
  }
}

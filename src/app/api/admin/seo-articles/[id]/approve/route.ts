import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { apiSuccess, apiError } from '@/lib/api/response';
import { aiContentService } from '@/domain/ai/ai-content.service';
import { createClient } from '@/lib/supabase/server';

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

    const article = await aiContentService.approveArticle(
      parsed.data.tenantId,
      articleId,
      user.id
    );

    return Response.json(apiSuccess(article, requestId));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Approval failed';
    return Response.json(apiError('APPROVE_ERROR', message, requestId), { status: 500 });
  }
}

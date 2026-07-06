import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { apiSuccess, apiError } from '@/lib/api/response';
import { requireStaff, AuthError } from '@/lib/auth/rbac';
import { aiContentService } from '@/domain/ai/ai-content.service';

const generateSchema = z.object({
  citySlug: z.string().min(1),
  locale: z.enum(['en', 'ru']),
});

export async function POST(request: NextRequest) {
  const requestId = randomUUID();

  try {
    const ctx = await requireStaff();
    const body: unknown = await request.json();
    const parsed = generateSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        apiError('VALIDATION_ERROR', parsed.error.message, requestId),
        { status: 400 }
      );
    }

    const article = await aiContentService.generateSeoArticle(
      ctx.tenantId,
      parsed.data.citySlug,
      parsed.data.locale
    );

    return Response.json(apiSuccess(article, requestId), { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) {
      return Response.json(apiError(err.code, err.message, requestId), {
        status: err.code === 'FORBIDDEN' ? 403 : 401,
      });
    }
    const message = err instanceof Error ? err.message : 'AI generation failed';
    return Response.json(apiError('AI_ERROR', message, requestId), { status: 500 });
  }
}

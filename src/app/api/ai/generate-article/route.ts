import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { apiSuccess, apiError } from '@/lib/api/response';
import { aiContentService } from '@/domain/ai/ai-content.service';
import { createClient } from '@/lib/supabase/server';

const generateSchema = z.object({
  tenantId: z.string().uuid(),
  citySlug: z.string().min(1),
  locale: z.enum(['en', 'ru']),
});

export async function POST(request: NextRequest) {
  const requestId = randomUUID();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json(apiError('UNAUTHORIZED', 'Authentication required', requestId), {
      status: 401,
    });
  }

  try {
    const body: unknown = await request.json();
    const parsed = generateSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        apiError('VALIDATION_ERROR', parsed.error.message, requestId),
        { status: 400 }
      );
    }

    const article = await aiContentService.generateSeoArticle(
      parsed.data.tenantId,
      parsed.data.citySlug,
      parsed.data.locale
    );

    return Response.json(apiSuccess(article, requestId), { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'AI generation failed';
    return Response.json(apiError('AI_ERROR', message, requestId), { status: 500 });
  }
}

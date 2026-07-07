import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { apiSuccess, apiError } from '@/lib/api/response';
import { requireStaff, AuthError } from '@/lib/auth/rbac';
import { mediaService } from '@/domain/media/media.service';

const schema = z.object({
  assetIds: z.array(z.string().uuid()).min(1).max(100),
  tag: z.string().min(1).max(50),
  action: z.enum(['add', 'remove']).default('add'),
});

export async function POST(request: NextRequest) {
  const requestId = randomUUID();

  try {
    const ctx = await requireStaff();
    const parsed = schema.safeParse(await request.json());

    if (!parsed.success) {
      return Response.json(
        apiError('VALIDATION_ERROR', parsed.error.message, requestId),
        { status: 400 }
      );
    }

    const assets = await mediaService.bulkUpdateTags(
      ctx.tenantId,
      parsed.data.assetIds,
      parsed.data.tag,
      parsed.data.action
    );

    return Response.json(apiSuccess({ assets, updated: assets.length }, requestId));
  } catch (err) {
    if (err instanceof AuthError) {
      return Response.json(apiError(err.code, err.message, requestId), {
        status: err.code === 'FORBIDDEN' ? 403 : 401,
      });
    }
    const message = err instanceof Error ? err.message : 'Bulk tag failed';
    return Response.json(apiError('MEDIA_ERROR', message, requestId), { status: 500 });
  }
}

import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { apiSuccess, apiError } from '@/lib/api/response';
import { requireStaff, AuthError } from '@/lib/auth/rbac';
import { mediaService } from '@/domain/media/media.service';

const schema = z.object({
  orderedIds: z.array(z.string().uuid()).min(1).max(200),
});

export async function POST(request: NextRequest) {
  const requestId = randomUUID();

  try {
    const ctx = await requireStaff();
    const body = schema.parse(await request.json());
    await mediaService.updateSortOrder(ctx.tenantId, body.orderedIds);
    return Response.json(apiSuccess({ ok: true }, requestId));
  } catch (err) {
    if (err instanceof AuthError) {
      return Response.json(apiError(err.code, err.message, requestId), {
        status: err.code === 'FORBIDDEN' ? 403 : 401,
      });
    }
    if (err instanceof z.ZodError) {
      return Response.json(
        apiError('VALIDATION_ERROR', err.message, requestId),
        { status: 400 }
      );
    }
    const message = err instanceof Error ? err.message : 'Reorder failed';
    return Response.json(apiError('MEDIA_ERROR', message, requestId), { status: 500 });
  }
}

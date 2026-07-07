import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { apiSuccess, apiError } from '@/lib/api/response';
import { requireStaff, AuthError } from '@/lib/auth/rbac';
import { mediaService } from '@/domain/media/media.service';

const schema = z.object({
  assetIds: z.array(z.string().uuid()).min(1).max(100),
  folderId: z.string().uuid().nullable(),
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

    await mediaService.moveToFolder(ctx.tenantId, parsed.data.assetIds, parsed.data.folderId);
    return Response.json(
      apiSuccess({ moved: parsed.data.assetIds.length }, requestId)
    );
  } catch (err) {
    if (err instanceof AuthError) {
      return Response.json(apiError(err.code, err.message, requestId), {
        status: err.code === 'FORBIDDEN' ? 403 : 401,
      });
    }
    const message = err instanceof Error ? err.message : 'Move failed';
    return Response.json(apiError('MEDIA_ERROR', message, requestId), { status: 500 });
  }
}

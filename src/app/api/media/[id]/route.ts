import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { apiSuccess, apiError } from '@/lib/api/response';
import { requireStaff, AuthError } from '@/lib/auth/rbac';
import { mediaService } from '@/domain/media/media.service';

const tagsSchema = z.object({
  tags: z.array(z.string().min(1)).max(20),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = randomUUID();
  const { id } = await params;

  try {
    const ctx = await requireStaff();
    const body = tagsSchema.parse(await request.json());
    const asset = await mediaService.updateTags(ctx.tenantId, id, body.tags);
    const path = asset.thumbnail_path ?? asset.webp_path ?? asset.storage_path;
    const url = await mediaService.getSignedUrl(path);

    return Response.json(apiSuccess({ asset, url }, requestId));
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
    const message = err instanceof Error ? err.message : 'Update failed';
    return Response.json(apiError('MEDIA_ERROR', message, requestId), { status: 500 });
  }
}

import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { apiSuccess, apiError } from '@/lib/api/response';
import { requireStaff, AuthError } from '@/lib/auth/rbac';
import { mediaService } from '@/domain/media/media.service';

const createSchema = z.object({
  name: z.string().min(1).max(100),
  parentId: z.string().uuid().optional(),
});

export async function GET() {
  const requestId = randomUUID();

  try {
    const ctx = await requireStaff();
    const folders = await mediaService.listFolders(ctx.tenantId);
    return Response.json(apiSuccess(folders, requestId));
  } catch (err) {
    if (err instanceof AuthError) {
      return Response.json(apiError(err.code, err.message, requestId), {
        status: err.code === 'FORBIDDEN' ? 403 : 401,
      });
    }
    const message = err instanceof Error ? err.message : 'Folder fetch failed';
    return Response.json(apiError('MEDIA_ERROR', message, requestId), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const requestId = randomUUID();

  try {
    const ctx = await requireStaff();
    const parsed = createSchema.safeParse(await request.json());

    if (!parsed.success) {
      return Response.json(
        apiError('VALIDATION_ERROR', parsed.error.message, requestId),
        { status: 400 }
      );
    }

    const folder = await mediaService.createFolder(
      ctx.tenantId,
      parsed.data.name,
      parsed.data.parentId
    );
    return Response.json(apiSuccess(folder, requestId), { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) {
      return Response.json(apiError(err.code, err.message, requestId), {
        status: err.code === 'FORBIDDEN' ? 403 : 401,
      });
    }
    const message = err instanceof Error ? err.message : 'Folder create failed';
    return Response.json(apiError('MEDIA_ERROR', message, requestId), { status: 500 });
  }
}

import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { apiSuccess, apiError } from '@/lib/api/response';
import { mediaService } from '@/domain/media/media.service';
import { DEFAULT_TENANT_ID } from '@/lib/tenant/constants';

export async function GET(request: NextRequest) {
  const requestId = randomUUID();
  const tenantId = request.nextUrl.searchParams.get('tenantId') ?? DEFAULT_TENANT_ID;

  try {
    const { assets, urls } = await mediaService.listPublicGallery(tenantId);
    return Response.json(apiSuccess({ assets, urls }, requestId));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gallery fetch failed';
    return Response.json(apiError('GALLERY_ERROR', message, requestId), { status: 500 });
  }
}

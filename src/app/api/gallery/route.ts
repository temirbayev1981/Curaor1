import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { apiSuccess } from '@/lib/api/response';
import { mediaService } from '@/domain/media/media.service';
import { isSupabaseConfigured } from '@/lib/config/env';
import { DEFAULT_TENANT_ID } from '@/lib/tenant/constants';

export async function GET(request: NextRequest) {
  const requestId = randomUUID();
  const tenantId = request.nextUrl.searchParams.get('tenantId') ?? DEFAULT_TENANT_ID;

  if (!isSupabaseConfigured()) {
    return Response.json(apiSuccess({ assets: [], urls: {} }, requestId));
  }

  try {
    const { assets, urls } = await mediaService.listPublicGallery(tenantId);
    return Response.json(apiSuccess({ assets, urls }, requestId));
  } catch {
    // DB not migrated or media table missing — return empty so client shows stock photos
    return Response.json(apiSuccess({ assets: [], urls: {} }, requestId));
  }
}

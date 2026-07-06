import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { apiSuccess, apiError } from '@/lib/api/response';
import { mediaService } from '@/domain/media/media.service';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  const requestId = randomUUID();
  const tenantId = request.nextUrl.searchParams.get('tenantId');

  if (!tenantId) {
    return Response.json(apiError('VALIDATION_ERROR', 'tenantId required', requestId), {
      status: 400,
    });
  }

  try {
    const { assets, total } = await mediaService.listAssets(tenantId);
    const urls: Record<string, string> = {};

    await Promise.all(
      assets.map(async (asset) => {
        try {
          const path = asset.webp_path ?? asset.thumbnail_path ?? asset.storage_path;
          urls[asset.id] = await mediaService.getSignedUrl(path);
        } catch {
          urls[asset.id] = '';
        }
      })
    );

    return Response.json(apiSuccess({ assets, urls, total }, requestId));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Media fetch failed';
    return Response.json(apiError('MEDIA_ERROR', message, requestId), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const requestId = randomUUID();

  try {
    const formData = await request.formData();
    const tenantId = formData.get('tenantId') as string;
    const files = formData.getAll('files') as File[];

    if (!tenantId || files.length === 0) {
      return Response.json(
        apiError('VALIDATION_ERROR', 'tenantId and files required', requestId),
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const uploaded = [];

    for (const file of files) {
      const ext = file.name.split('.').pop() ?? 'bin';
      const storagePath = `${tenantId}/${randomUUID()}.${ext}`;

      const buffer = await file.arrayBuffer();
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(storagePath, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) continue;

      const asset = await mediaService.registerAsset(tenantId, {
        tenant_id: tenantId,
        folder_id: null,
        storage_path: storagePath,
        filename: file.name,
        mime_type: file.type,
        size_bytes: file.size,
        width: null,
        height: null,
        thumbnail_path: null,
        webp_path: file.type.startsWith('image/') ? storagePath : null,
        tags: [],
        alt_text: null,
      });

      uploaded.push(asset);

      if (file.type.startsWith('image/') && process.env.NEXT_PUBLIC_SUPABASE_URL) {
        void fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/process-media`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            },
            body: JSON.stringify({
              tenantId,
              assetId: asset.id,
              storagePath,
            }),
          }
        );
      }
    }

    return Response.json(apiSuccess(uploaded, requestId), { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed';
    return Response.json(apiError('UPLOAD_ERROR', message, requestId), { status: 500 });
  }
}

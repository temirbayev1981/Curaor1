import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { apiSuccess, apiError } from '@/lib/api/response';
import { requireStaff, AuthError } from '@/lib/auth/rbac';
import {
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
  isSupabaseConfigured,
} from '@/lib/config/env';
import { mediaService } from '@/domain/media/media.service';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  const requestId = randomUUID();
  const folderId = request.nextUrl.searchParams.get('folderId');

  try {
    const ctx = await requireStaff();
    const [folders, { assets, total }] = await Promise.all([
      mediaService.listFolders(ctx.tenantId),
      mediaService.listAssets(
        ctx.tenantId,
        folderId === 'all' ? undefined : folderId === 'root' || !folderId ? null : folderId
      ),
    ]);
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

    return Response.json(apiSuccess({ assets, urls, total, folders }, requestId));
  } catch (err) {
    if (err instanceof AuthError) {
      return Response.json(apiError(err.code, err.message, requestId), {
        status: err.code === 'FORBIDDEN' ? 403 : 401,
      });
    }
    const message = err instanceof Error ? err.message : 'Media fetch failed';
    return Response.json(apiError('MEDIA_ERROR', message, requestId), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const requestId = randomUUID();

  try {
    const ctx = await requireStaff();
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const folderId = formData.get('folderId') as string | null;

    if (files.length === 0) {
      return Response.json(
        apiError('VALIDATION_ERROR', 'files required', requestId),
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const uploaded = [];

    for (const file of files) {
      const ext = file.name.split('.').pop() ?? 'bin';
      const storagePath = `${ctx.tenantId}/${randomUUID()}.${ext}`;

      const buffer = await file.arrayBuffer();
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(storagePath, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) continue;

      const asset = await mediaService.registerAsset(ctx.tenantId, {
        tenant_id: ctx.tenantId,
        folder_id: folderId && folderId !== 'root' ? folderId : null,
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
        sort_order: 0,
      });

      uploaded.push(asset);

      if (file.type.startsWith('image/') && isSupabaseConfigured()) {
        void fetch(`${getSupabaseUrl()}/functions/v1/process-media`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getSupabaseServiceRoleKey()}`,
          },
            body: JSON.stringify({
              tenantId: ctx.tenantId,
              assetId: asset.id,
              storagePath,
            }),
          }
        );
      }
    }

    return Response.json(apiSuccess(uploaded, requestId), { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) {
      return Response.json(apiError(err.code, err.message, requestId), {
        status: err.code === 'FORBIDDEN' ? 403 : 401,
      });
    }
    const message = err instanceof Error ? err.message : 'Upload failed';
    return Response.json(apiError('UPLOAD_ERROR', message, requestId), { status: 500 });
  }
}

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { unauthorizedResponse, verifyEdgeRequest } from '../_shared/auth.ts';
import {
  ImageMagick,
  initializeImageMagick,
  MagickFormat,
} from 'https://deno.land/x/imagemagick_deno@0.0.31/mod.ts';

let magickReady = false;

async function ensureMagick() {
  if (!magickReady) {
    await initializeImageMagick();
    magickReady = true;
  }
}

interface ProcessMediaPayload {
  tenantId: string;
  assetId: string;
  storagePath: string;
}

serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  if (!verifyEdgeRequest(req)) {
    return unauthorizedResponse();
  }

  const body = (await req.json()) as ProcessMediaPayload;
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { data: fileData, error: downloadError } = await supabase.storage
    .from('media')
    .download(body.storagePath);

  if (downloadError || !fileData) {
    return new Response(JSON.stringify({ error: 'Download failed' }), { status: 500 });
  }

  const buffer = new Uint8Array(await fileData.arrayBuffer());
  const mimeType = fileData.type;

  if (!mimeType.startsWith('image/')) {
    return new Response(JSON.stringify({ skipped: true, reason: 'not an image' }), {
      status: 200,
    });
  }

  await ensureMagick();

  const thumbnailPath = body.storagePath.replace(/(\.[^.]+)$/, '_thumb$1');
  const webpPath = body.storagePath.replace(/\.[^.]+$/, '.webp');

  let width = 0;
  let height = 0;

  await ImageMagick.read(buffer, async (img) => {
    width = img.width;
    height = img.height;

    await img.write(MagickFormat.Webp, async (webpData) => {
      await supabase.storage.from('media').upload(webpPath, webpData, {
        contentType: 'image/webp',
        upsert: true,
      });
    });

    img.resize(300, 300);
    await img.write(MagickFormat.Webp, async (thumbData) => {
      await supabase.storage.from('media').upload(thumbnailPath, thumbData, {
        contentType: 'image/webp',
        upsert: true,
      });
    });
  });

  await supabase
    .from('media_assets')
    .update({
      webp_path: webpPath,
      thumbnail_path: thumbnailPath,
      width,
      height,
    })
    .eq('id', body.assetId)
    .eq('tenant_id', body.tenantId);

  return new Response(
    JSON.stringify({ webpPath, thumbnailPath, width, height }),
    { status: 200 }
  );
});

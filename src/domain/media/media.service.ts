import { createAdminClient } from '@/lib/supabase/admin';
import type { MediaAsset, MediaFolder } from '@/types/database';

export class MediaService {
  async listFolders(tenantId: string): Promise<MediaFolder[]> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('media_folders')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('name');

    if (error) throw new Error(error.message);
    return (data ?? []) as MediaFolder[];
  }

  async listAssets(
    tenantId: string,
    folderId?: string | null,
    page = 0,
    pageSize = 24
  ): Promise<{ assets: MediaAsset[]; total: number }> {
    const supabase = createAdminClient();
    let query = supabase
      .from('media_assets')
      .select('*', { count: 'exact' })
      .eq('tenant_id', tenantId)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (folderId !== undefined) {
      query = folderId
        ? query.eq('folder_id', folderId)
        : query.is('folder_id', null);
    }

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);
    return { assets: (data ?? []) as MediaAsset[], total: count ?? 0 };
  }

  async getSignedUrl(storagePath: string, expiresIn = 3600): Promise<string> {
    const supabase = createAdminClient();
    const { data, error } = await supabase.storage
      .from('media')
      .createSignedUrl(storagePath, expiresIn);

    if (error || !data?.signedUrl) {
      throw new Error(`Failed to generate signed URL: ${error?.message}`);
    }
    return data.signedUrl;
  }

  async createFolder(
    tenantId: string,
    name: string,
    parentId?: string
  ): Promise<MediaFolder> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('media_folders')
      .insert({ tenant_id: tenantId, name, parent_id: parentId ?? null })
      .select()
      .single();

    if (error || !data) throw new Error(error?.message ?? 'Failed to create folder');
    return data as MediaFolder;
  }

  async registerAsset(
    tenantId: string,
    asset: Omit<MediaAsset, 'id' | 'created_at'>
  ): Promise<MediaAsset> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('media_assets')
      .insert({ ...asset, tenant_id: tenantId })
      .select()
      .single();

    if (error || !data) throw new Error(error?.message ?? 'Failed to register asset');
    return data as MediaAsset;
  }

  async updateTags(
    tenantId: string,
    assetId: string,
    tags: string[]
  ): Promise<MediaAsset> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('media_assets')
      .update({ tags })
      .eq('id', assetId)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    if (error || !data) throw new Error(error?.message ?? 'Update failed');
    return data as MediaAsset;
  }

  async updateAsset(
    tenantId: string,
    assetId: string,
    updates: { tags?: string[]; alt_text?: string | null }
  ): Promise<MediaAsset> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('media_assets')
      .update(updates)
      .eq('id', assetId)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    if (error || !data) throw new Error(error?.message ?? 'Update failed');
    return data as MediaAsset;
  }

  async updateSortOrder(tenantId: string, orderedIds: string[]): Promise<void> {
    const supabase = createAdminClient();
    await Promise.all(
      orderedIds.map((id, index) =>
        supabase
          .from('media_assets')
          .update({ sort_order: index })
          .eq('id', id)
          .eq('tenant_id', tenantId)
      )
    );
  }

  async listPublicGallery(
    tenantId: string
  ): Promise<{ assets: MediaAsset[]; urls: Record<string, string> }> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('media_assets')
      .select('*')
      .eq('tenant_id', tenantId)
      .contains('tags', ['gallery'])
      .order('created_at', { ascending: false })
      .limit(48);

    if (error) throw new Error(error.message);

    const assets = (data ?? []) as MediaAsset[];
    const urls: Record<string, string> = {};

    await Promise.all(
      assets.map(async (asset) => {
        try {
          const path = asset.thumbnail_path ?? asset.webp_path ?? asset.storage_path;
          urls[asset.id] = await this.getSignedUrl(path);
        } catch {
          urls[asset.id] = '';
        }
      })
    );

    return { assets, urls };
  }
}

export const mediaService = new MediaService();

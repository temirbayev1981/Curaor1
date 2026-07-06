-- Add sort order for media library drag-and-drop
ALTER TABLE media_assets ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_media_assets_sort ON media_assets(tenant_id, sort_order);

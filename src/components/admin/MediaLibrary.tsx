'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Upload, Folder, Tag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { MediaAsset } from '@/types/database';

function SortableAsset({ asset, url }: { asset: MediaAsset; url: string }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: asset.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="group relative aspect-square overflow-hidden rounded-xl border border-admin-border bg-admin-bg transition hover:border-emerald-500/30"
    >
      {asset.mime_type.startsWith('image/') ? (
        <img
          src={url}
          alt={asset.alt_text ?? asset.filename}
          loading="lazy"
          className="h-full w-full object-cover transition group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full items-center justify-center text-zinc-500">
          {asset.filename}
        </div>
      )}
      {asset.tags.length > 0 && (
        <div className="absolute bottom-2 left-2 flex gap-1">
          {asset.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded bg-black/60 px-1.5 py-0.5 text-xs text-zinc-300"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function MediaLibrary() {
  const { t } = useTranslation();
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    void (async () => {
      const res = await fetch('/api/media');
      const json = (await res.json()) as {
        data: { assets: MediaAsset[]; urls: Record<string, string> } | null;
      };
      if (json.data) {
        setAssets(json.data.assets);
        setUrls(json.data.urls);
        setLoading(false);
      }
    })();
  }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);

    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append('files', file));

    await fetch('/api/media', { method: 'POST', body: formData });
    const res = await fetch('/api/media');
    const json = (await res.json()) as {
      data: { assets: MediaAsset[]; urls: Record<string, string> } | null;
    };
    if (json.data) {
      setAssets(json.data.assets);
      setUrls(json.data.urls);
    }
    setUploading(false);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setAssets((items) => {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      const reordered = [...items];
      const [moved] = reordered.splice(oldIndex, 1);
      if (moved) reordered.splice(newIndex, 0, moved);
      return reordered;
    });
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton aspect-square rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <label className="inline-flex cursor-pointer">
          <input
            type="file"
            multiple
            accept="image/*,.pdf"
            className="hidden"
            onChange={handleUpload}
          />
          <span className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-400">
            <Upload className="h-4 w-4" />
            {uploading ? t('admin.mediaLibrary.uploading') : t('admin.mediaLibrary.upload')}
          </span>
        </label>
        <Button variant="outline" size="sm" disabled>
          <Folder className="h-4 w-4" />
          {t('admin.mediaLibrary.newFolder')}
        </Button>
        <Button variant="outline" size="sm" disabled>
          <Tag className="h-4 w-4" />
          {t('admin.mediaLibrary.tagSelected')}
        </Button>
      </div>

      {assets.length > 0 ? (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={assets.map((a) => a.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {assets.map((asset) => (
                <SortableAsset
                  key={asset.id}
                  asset={asset}
                  url={urls[asset.id] ?? ''}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-admin-border py-16 text-zinc-500">
          <Upload className="mb-4 h-12 w-12 text-zinc-600" />
          <p>{t('admin.mediaLibrary.empty')}</p>
        </div>
      )}
    </div>
  );
}

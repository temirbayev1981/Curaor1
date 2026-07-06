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
import { Upload, Folder, Tag, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { MediaAsset } from '@/types/database';

function SortableAsset({
  asset,
  url,
  onToggleGallery,
  onAltTextChange,
}: {
  asset: MediaAsset;
  url: string;
  onToggleGallery: (asset: MediaAsset) => void;
  onAltTextChange: (asset: MediaAsset, altText: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: asset.id,
  });
  const [editingAlt, setEditingAlt] = useState(false);
  const [altDraft, setAltDraft] = useState(asset.alt_text ?? '');

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
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleGallery(asset);
        }}
        className={`absolute right-2 top-2 rounded-lg p-1.5 backdrop-blur-sm transition ${
          asset.tags.includes('gallery')
            ? 'bg-emerald-500 text-white'
            : 'bg-black/50 text-zinc-300 hover:bg-black/70'
        }`}
        title="Toggle gallery"
      >
        <ImageIcon className="h-4 w-4" />
      </button>
      {editingAlt ? (
        <div
          className="absolute inset-x-0 bottom-0 bg-black/80 p-2"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            value={altDraft}
            onChange={(e) => setAltDraft(e.target.value)}
            onBlur={() => {
              setEditingAlt(false);
              if (altDraft !== (asset.alt_text ?? '')) {
                onAltTextChange(asset, altDraft);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setEditingAlt(false);
                onAltTextChange(asset, altDraft);
              }
            }}
            className="w-full rounded border border-white/20 bg-black/50 px-2 py-1 text-xs text-white"
            placeholder="Alt text"
            autoFocus
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setEditingAlt(true);
          }}
          className="absolute bottom-2 right-2 rounded bg-black/60 px-1.5 py-0.5 text-xs text-zinc-300 opacity-0 transition group-hover:opacity-100"
        >
          Alt
        </button>
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

  async function toggleGalleryTag(asset: MediaAsset) {
    const hasGallery = asset.tags.includes('gallery');
    const tags = hasGallery
      ? asset.tags.filter((tag) => tag !== 'gallery')
      : [...asset.tags, 'gallery'];

    const res = await fetch(`/api/media/${asset.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tags }),
    });
    const json = (await res.json()) as { data: { asset: MediaAsset } | null };
    if (json.data?.asset) {
      setAssets((prev) =>
        prev.map((a) => (a.id === asset.id ? json.data!.asset : a))
      );
    }
  }

  async function updateAltText(asset: MediaAsset, altText: string) {
    const res = await fetch(`/api/media/${asset.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alt_text: altText || null }),
    });
    const json = (await res.json()) as { data: { asset: MediaAsset } | null };
    if (json.data?.asset) {
      setAssets((prev) =>
        prev.map((a) => (a.id === asset.id ? json.data!.asset : a))
      );
    }
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

      void fetch('/api/media/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds: reordered.map((a) => a.id) }),
      });

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
                  onToggleGallery={toggleGalleryTag}
                  onAltTextChange={updateAltText}
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

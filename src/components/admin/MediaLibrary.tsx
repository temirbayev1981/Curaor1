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
import { Upload, Folder, Tag, ImageIcon, CheckSquare, Square } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { MediaAsset, MediaFolder } from '@/types/database';

function SortableAsset({
  asset,
  url,
  selected,
  selectionMode,
  onToggleSelect,
  onToggleGallery,
  onAltTextChange,
  t,
}: {
  asset: MediaAsset;
  url: string;
  selected: boolean;
  selectionMode: boolean;
  onToggleSelect: (asset: MediaAsset) => void;
  onToggleGallery: (asset: MediaAsset) => void;
  onAltTextChange: (asset: MediaAsset, altText: string) => void;
  t: (key: string) => string;
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
      className={`group relative aspect-square overflow-hidden rounded-xl border bg-admin-bg transition hover:border-emerald-500/30 ${
        selected ? 'border-emerald-500' : 'border-admin-border'
      }`}
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
      {selectionMode && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect(asset);
          }}
          className="absolute left-2 top-2 rounded-lg bg-black/60 p-1.5 text-white"
        >
          {selected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
        </button>
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
        title={t('admin.mediaLibrary.toggleGallery')}
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
            placeholder={t('admin.mediaLibrary.altText')}
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
          {t('admin.mediaLibrary.altTextShort')}
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
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [folderFilter, setFolderFilter] = useState<'all' | 'root' | string>('all');
  const [ready, setReady] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = () => setReloadToken((n) => n + 1);

  useEffect(() => {
    let cancelled = false;
    const query =
      folderFilter === 'all'
        ? '?folderId=all'
        : folderFilter === 'root'
          ? '?folderId=root'
          : `?folderId=${folderFilter}`;

    fetch(`/api/media${query}`)
      .then((res) => res.json())
      .then((json: { data: { assets: MediaAsset[]; urls: Record<string, string>; folders: MediaFolder[] } | null }) => {
        if (cancelled || !json.data) return;
        setAssets(json.data.assets);
        setUrls(json.data.urls);
        setFolders(json.data.folders);
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [folderFilter, reloadToken]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    setError('');

    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append('files', file));
    if (folderFilter !== 'all' && folderFilter !== 'root') {
      formData.append('folderId', folderFilter);
    }

    await fetch('/api/media', { method: 'POST', body: formData });
    reload();
    setUploading(false);
  }

  async function createFolder() {
    const name = window.prompt(t('admin.mediaLibrary.folderNamePrompt'));
    if (!name?.trim()) return;

    const res = await fetch('/api/media/folders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() }),
    });

    if (!res.ok) {
      setError(t('admin.mediaLibrary.folderError'));
      return;
    }

    reload();
  }

  async function bulkTag() {
    const tag = window.prompt(t('admin.mediaLibrary.tagPrompt'));
    if (!tag?.trim() || selectedIds.size === 0) return;

    const res = await fetch('/api/media/bulk-tag', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assetIds: [...selectedIds],
        tag: tag.trim(),
        action: 'add',
      }),
    });

    const json = (await res.json()) as {
      data: { assets: MediaAsset[] } | null;
      error: { message: string } | null;
    };

    if (!res.ok || !json.data) {
      setError(json.error?.message ?? t('admin.mediaLibrary.tagError'));
      return;
    }

    setAssets((prev) => {
      const map = new Map(json.data!.assets.map((a) => [a.id, a]));
      return prev.map((a) => map.get(a.id) ?? a);
    });
    setSelectedIds(new Set());
    setSelectionMode(false);
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

  function toggleSelect(asset: MediaAsset) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(asset.id)) next.delete(asset.id);
      else next.add(asset.id);
      return next;
    });
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

  if (!ready) {
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
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFolderFilter('all')}
          className={`rounded-lg px-3 py-1.5 text-sm transition ${
            folderFilter === 'all'
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'text-zinc-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          {t('admin.mediaLibrary.allFiles')}
        </button>
        <button
          type="button"
          onClick={() => setFolderFilter('root')}
          className={`rounded-lg px-3 py-1.5 text-sm transition ${
            folderFilter === 'root'
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'text-zinc-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          {t('admin.mediaLibrary.uncategorized')}
        </button>
        {folders.map((folder) => (
          <button
            key={folder.id}
            type="button"
            onClick={() => setFolderFilter(folder.id)}
            className={`rounded-lg px-3 py-1.5 text-sm transition ${
              folderFilter === folder.id
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'text-zinc-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            {folder.name}
          </button>
        ))}
      </div>

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
        <Button variant="outline" size="sm" onClick={createFolder}>
          <Folder className="h-4 w-4" />
          {t('admin.mediaLibrary.newFolder')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSelectionMode((v) => !v);
            setSelectedIds(new Set());
          }}
        >
          <Tag className="h-4 w-4" />
          {selectionMode ? t('admin.mediaLibrary.cancelSelect') : t('admin.mediaLibrary.selectMode')}
        </Button>
        {selectionMode && selectedIds.size > 0 && (
          <Button size="sm" onClick={bulkTag}>
            {t('admin.mediaLibrary.tagSelected')} ({selectedIds.size})
          </Button>
        )}
      </div>

      {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

      {assets.length > 0 ? (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={assets.map((a) => a.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {assets.map((asset) => (
                <SortableAsset
                  key={asset.id}
                  asset={asset}
                  url={urls[asset.id] ?? ''}
                  selected={selectedIds.has(asset.id)}
                  selectionMode={selectionMode}
                  onToggleSelect={toggleSelect}
                  onToggleGallery={toggleGalleryTag}
                  onAltTextChange={updateAltText}
                  t={t}
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

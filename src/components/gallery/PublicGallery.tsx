'use client';

import { useEffect, useState } from 'react';
import type { MediaAsset } from '@/types/database';
import { DEFAULT_TENANT_ID } from '@/lib/tenant/constants';

export function PublicGallery() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/gallery?tenantId=${DEFAULT_TENANT_ID}`)
      .then((res) => res.json())
      .then((json: { data: { assets: MediaAsset[]; urls: Record<string, string> } | null }) => {
        if (json.data) {
          setAssets(json.data.assets);
          setUrls(json.data.urls);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton aspect-square rounded-xl" />
        ))}
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <p className="text-center text-zinc-500">
        Gallery coming soon — check back after our next event!
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {assets.map((asset) => (
        <div
          key={asset.id}
          className="group relative aspect-square overflow-hidden rounded-xl border border-white/10"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={urls[asset.id] ?? ''}
            alt={asset.alt_text ?? asset.filename}
            loading="lazy"
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        </div>
      ))}
    </div>
  );
}

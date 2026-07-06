'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ImageIcon } from 'lucide-react';
import type { MediaAsset } from '@/types/database';
import { DEFAULT_TENANT_ID } from '@/lib/tenant/constants';

export function PublicGallery() {
  const { t } = useTranslation();
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<MediaAsset | null>(null);

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
      <div className="flex flex-col items-center py-20 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
          <ImageIcon className="h-8 w-8 text-emerald-400" />
        </div>
        <p className="max-w-md text-zinc-500">{t('gallery.empty')}</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {assets.map((asset, i) => (
          <motion.button
            key={asset.id}
            type="button"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setLightbox(asset)}
            className="group relative aspect-square overflow-hidden rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={urls[asset.id] ?? ''}
              alt={asset.alt_text ?? asset.filename}
              loading="lazy"
              className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/30" />
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
            onClick={() => setLightbox(null)}
          >
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-4 right-4 rounded-lg p-2 text-white hover:bg-white/10"
            >
              <X className="h-6 w-6" />
            </button>
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={urls[lightbox.id] ?? ''}
              alt={lightbox.alt_text ?? lightbox.filename}
              className="max-h-[85vh] max-w-full rounded-xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

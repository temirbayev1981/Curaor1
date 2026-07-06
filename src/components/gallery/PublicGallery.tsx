'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { STOCK_GALLERY_IMAGES } from '@/lib/media/landing-images';
import type { MediaAsset } from '@/types/database';
import { DEFAULT_TENANT_ID } from '@/lib/tenant/constants';

interface StockItem {
  id: string;
  src: string;
  alt: string;
}

export function PublicGallery() {
  const { t } = useTranslation();
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<StockItem | null>(null);
  const [usingStock, setUsingStock] = useState(false);

  const stockItems: StockItem[] = STOCK_GALLERY_IMAGES.map((img, i) => ({
    id: `stock-${i}`,
    src: img.src,
    alt: img.alt,
  }));

  useEffect(() => {
    fetch(`/api/gallery?tenantId=${DEFAULT_TENANT_ID}`)
      .then((res) => res.json())
      .then((json: { data: { assets: MediaAsset[]; urls: Record<string, string> } | null }) => {
        if (json.data?.assets.length) {
          setAssets(json.data.assets);
          setUrls(json.data.urls);
          setUsingStock(false);
        } else {
          setUsingStock(true);
        }
        setLoading(false);
      })
      .catch(() => {
        setUsingStock(true);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="skeleton aspect-square rounded-xl" />
        ))}
      </div>
    );
  }

  const displayStock = usingStock || assets.length === 0;

  return (
    <>
      {displayStock && (
        <p className="mb-6 text-center text-sm text-zinc-500">{t('gallery.stockNote')}</p>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {displayStock
          ? stockItems.map((item, i) => (
              <motion.button
                key={item.id}
                type="button"
                initial={false}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
                onClick={() => setLightbox(item)}
                className="group relative aspect-square overflow-hidden rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  className="object-cover transition duration-300 group-hover:scale-110"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/30" />
              </motion.button>
            ))
          : assets.map((asset, i) => (
              <motion.button
                key={asset.id}
                type="button"
                initial={false}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
                onClick={() =>
                  setLightbox({
                    id: asset.id,
                    src: urls[asset.id] ?? '',
                    alt: asset.alt_text ?? asset.filename,
                  })
                }
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
              type="button"
              onClick={() => setLightbox(null)}
              className="absolute top-4 right-4 rounded-lg p-2 text-white hover:bg-white/10"
            >
              <X className="h-6 w-6" />
            </button>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative h-[70vh] w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              {lightbox.src.startsWith('/') ? (
                <Image
                  src={lightbox.src}
                  alt={lightbox.alt}
                  fill
                  className="rounded-xl object-contain"
                  sizes="90vw"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={lightbox.src}
                  alt={lightbox.alt}
                  className="max-h-[85vh] max-w-full rounded-xl object-contain mx-auto"
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

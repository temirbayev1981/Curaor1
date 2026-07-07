'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { STOCK_GALLERY_IMAGES, type LandingImage } from '@/lib/media/landing-images';
import type { MediaAsset } from '@/types/database';
import { DEFAULT_TENANT_ID } from '@/lib/tenant/constants';

interface GalleryItem {
  id: string;
  src: string;
  alt: string;
}

function toStockItems(images: LandingImage[]): GalleryItem[] {
  return images.map((img, i) => ({
    id: `stock-${i}`,
    src: img.src,
    alt: img.alt,
  }));
}

export function PublicGallery() {
  const { t } = useTranslation();
  const [items, setItems] = useState<GalleryItem[]>(() =>
    toStockItems(STOCK_GALLERY_IMAGES)
  );
  const [usingStock, setUsingStock] = useState(true);
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null);

  useEffect(() => {
    fetch(`/api/gallery?tenantId=${DEFAULT_TENANT_ID}`)
      .then((res) => res.json())
      .then(
        (json: {
          data: { assets: MediaAsset[]; urls: Record<string, string> } | null;
        }) => {
          const assets = json.data?.assets ?? [];
          if (assets.length === 0) return;

          setUsingStock(false);
          setItems(
            assets.map((asset) => ({
              id: asset.id,
              src: json.data!.urls[asset.id] ?? '',
              alt: asset.alt_text ?? asset.filename,
            }))
          );
        }
      )
      .catch(() => {
        /* keep stock images */
      });
  }, []);

  const isRemote = (src: string) => src.startsWith('http');

  return (
    <>
      {usingStock && (
        <p className="mb-6 text-center text-sm text-zinc-500">{t('gallery.stockNote')}</p>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {items.map((item, i) => (
          <motion.button
            key={item.id}
            type="button"
            initial={false}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: Math.min(i * 0.03, 0.3) }}
            onClick={() => setLightbox(item)}
            className="group relative aspect-square overflow-hidden rounded-xl focus:outline-none focus:ring-2 focus:ring-irish/50"
          >
            {isRemote(item.src) ? (
              <Image
                src={item.src}
                alt={item.alt}
                fill
                unoptimized
                className="object-cover transition duration-300 group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.src}
                alt={item.alt}
                loading="lazy"
                className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
              />
            )}
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
              {isRemote(lightbox.src) ? (
                <Image
                  src={lightbox.src}
                  alt={lightbox.alt}
                  fill
                  unoptimized
                  className="rounded-xl object-contain"
                  sizes="90vw"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={lightbox.src}
                  alt={lightbox.alt}
                  className="mx-auto max-h-[85vh] max-w-full rounded-xl object-contain"
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

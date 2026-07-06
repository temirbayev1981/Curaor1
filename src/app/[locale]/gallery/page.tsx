import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { PublicGallery } from '@/components/gallery/PublicGallery';
import { getTranslations } from '@/lib/i18n/server';
import type { Locale } from '@/lib/i18n/config';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = getTranslations(locale as Locale);
  return { title: t.nav.gallery };
}

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = getTranslations(locale as Locale);

  return (
    <>
      <PublicHeader locale={locale as Locale} />
      <main className="relative min-h-screen pt-24 pb-16">
        <div className="bg-grid fixed inset-0 opacity-20" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <h1 className="mb-4 text-4xl font-bold text-white">{t.nav.gallery}</h1>
          <p className="mb-12 text-lg text-zinc-400">{t.gallery.subtitle}</p>
          <PublicGallery />
        </div>
      </main>
      <PublicFooter locale={locale as Locale} />
    </>
  );
}

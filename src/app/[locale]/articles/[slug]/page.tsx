import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { createAdminClient } from '@/lib/supabase/admin';
import { DEFAULT_TENANT_ID } from '@/lib/tenant/constants';
import { getTranslations } from '@/lib/i18n/server';
import type { SeoArticle } from '@/types/database';
import type { Locale } from '@/lib/i18n/config';
import { ArrowLeft } from 'lucide-react';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const article = await fetchArticle(slug, locale as Locale);
  if (!article) return { title: 'Not Found' };

  return {
    title: article.title,
    description: article.meta_description ?? undefined,
    alternates: {
      canonical: `https://emeraldpour.com/${locale}/articles/${slug}`,
    },
    openGraph: {
      title: article.title,
      description: article.meta_description ?? undefined,
    },
  };
}

async function fetchArticle(slug: string, locale: Locale): Promise<SeoArticle | null> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('seo_articles')
      .select('*')
      .eq('tenant_id', DEFAULT_TENANT_ID)
      .eq('locale', locale)
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();
    return (data as SeoArticle) ?? null;
  } catch {
    return null;
  }
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const loc = locale as Locale;
  const article = await fetchArticle(slug, loc);
  if (!article) notFound();

  const tr = getTranslations(loc);

  return (
    <>
      <PublicHeader locale={loc} />
      <main className="relative min-h-screen pt-24 pb-16">
        <div className="bg-grid fixed inset-0 opacity-20" />
        <article className="relative mx-auto max-w-3xl px-4 sm:px-6">
          <Link
            href={`/${locale}/locations/${article.city_slug}`}
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-emerald-400 hover:text-emerald-300"
          >
            <ArrowLeft className="h-4 w-4" />
            {tr.articles.backToCity}
          </Link>
          <h1 className="mb-4 text-4xl font-bold text-white">{article.title}</h1>
          {article.meta_description && (
            <p className="mb-8 text-lg text-zinc-400">{article.meta_description}</p>
          )}
          <div
            className="prose prose-invert max-w-none prose-headings:text-emerald-400 prose-a:text-emerald-400"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </article>
      </main>
      <PublicFooter locale={loc} />
    </>
  );
}

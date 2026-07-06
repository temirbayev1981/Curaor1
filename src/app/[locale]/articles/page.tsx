import Link from 'next/link';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { createAdminClient } from '@/lib/supabase/admin';
import { DEFAULT_TENANT_ID } from '@/lib/tenant/constants';
import type { Locale } from '@/lib/i18n/config';
import { getTranslations } from '@/lib/i18n/server';
import type { SeoArticle } from '@/types/database';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = getTranslations(locale as Locale);
  return { title: t.articles.indexTitle, description: t.articles.indexDesc };
}

export default async function ArticlesIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = getTranslations(locale as Locale);
  let articles: Pick<SeoArticle, 'slug' | 'title' | 'updated_at'>[] = [];

  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('seo_articles')
      .select('slug, title, updated_at')
      .eq('tenant_id', DEFAULT_TENANT_ID)
      .eq('locale', locale)
      .eq('status', 'published')
      .order('updated_at', { ascending: false });
    articles = (data ?? []) as typeof articles;
  } catch {
    articles = [];
  }

  return (
    <>
      <PublicHeader locale={locale as Locale} />
      <main className="min-h-screen pt-24 pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h1 className="mb-3 text-3xl font-bold text-white">{t.articles.indexTitle}</h1>
          <p className="mb-10 text-zinc-400">{t.articles.indexDesc}</p>

          {articles.length === 0 ? (
            <p className="text-zinc-500">{t.articles.empty}</p>
          ) : (
            <ul className="space-y-4">
              {articles.map((article) => (
                <li key={article.slug}>
                  <Link
                    href={`/${locale}/articles/${article.slug}`}
                    className="block rounded-xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-emerald-500/30"
                  >
                    <h2 className="font-semibold text-white">{article.title}</h2>
                    <p className="mt-1 text-xs text-zinc-500">
                      {new Date(article.updated_at).toLocaleDateString(
                        locale === 'ru' ? 'ru-RU' : 'en-US'
                      )}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
      <PublicFooter locale={locale as Locale} />
    </>
  );
}

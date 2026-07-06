import type { MetadataRoute } from 'next';
import { CAROLINA_CITIES } from '@/domain/ai/ai-content.service';
import { absoluteUrl } from '@/lib/config/env';
import { createAdminClient } from '@/lib/supabase/admin';
import { DEFAULT_TENANT_ID } from '@/lib/tenant/constants';
import type { SeoArticle } from '@/types/database';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = ['', '/book', '/gallery', '/locations', '/faq', '/articles', '/terms', '/privacy'];
  const eventTypes = ['wedding', 'corporate', 'private', 'stpatricks'] as const;
  const locales = ['en', 'ru'] as const;

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const path of staticPaths) {
      entries.push({
        url: absoluteUrl(`/${locale}${path}`),
        lastModified: new Date(),
        changeFrequency: path === '' ? 'weekly' : 'monthly',
        priority: path === '' ? 1 : 0.8,
      });
    }

    for (const city of Object.keys(CAROLINA_CITIES)) {
      entries.push({
        url: absoluteUrl(`/${locale}/locations/${city}`),
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    }

    for (const eventType of eventTypes) {
      entries.push({
        url: absoluteUrl(`/${locale}/events/${eventType}`),
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.75,
      });
    }
  }

  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('seo_articles')
      .select('slug, locale, updated_at')
      .eq('tenant_id', DEFAULT_TENANT_ID)
      .eq('status', 'published');

    for (const article of (data ?? []) as Pick<SeoArticle, 'slug' | 'locale' | 'updated_at'>[]) {
      entries.push({
        url: absoluteUrl(`/${article.locale}/articles/${article.slug}`),
        lastModified: new Date(article.updated_at),
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    }
  } catch {
    // DB not available at build time
  }

  return entries;
}

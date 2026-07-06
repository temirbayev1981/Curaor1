import OpenAI from 'openai';
import DOMPurify from 'isomorphic-dompurify';
import { createAdminClient } from '@/lib/supabase/admin';
import { checkAiRateLimit } from '@/lib/api/rate-limit';
import { eventBus } from '@/domain/events/event-bus';
import { EVENT_TYPES } from '@/domain/events/event.types';
import type { Locale, SeoArticle } from '@/types/database';

const CAROLINA_CITIES: Record<string, { en: string; ru: string; state: string }> = {
  charlotte: { en: 'Charlotte', ru: 'Шарлотт', state: 'NC' },
  raleigh: { en: 'Raleigh', ru: 'Роли', state: 'NC' },
  greensboro: { en: 'Greensboro', ru: 'Гринсборо', state: 'NC' },
  greenville: { en: 'Greenville', ru: 'Гринвилл', state: 'NC' },
  charleston: { en: 'Charleston', ru: 'Чарлстон', state: 'SC' },
  columbia: { en: 'Columbia', ru: 'Колумбия', state: 'SC' },
  wilmington: { en: 'Wilmington', ru: 'Уилмингтон', state: 'NC' },
  'myrtle-beach': { en: 'Myrtle Beach', ru: 'Миртл-Бич', state: 'SC' },
  laurinburg: { en: 'Laurinburg', ru: 'Лоринбург', state: 'NC' },
};

export { CAROLINA_CITIES };

export class AiContentService {
  async generateSeoArticle(
    tenantId: string,
    citySlug: string,
    locale: Locale
  ): Promise<SeoArticle> {
    const allowed = await checkAiRateLimit(tenantId);
    if (!allowed) {
      throw new Error('AI rate limit exceeded. Max 10 articles per hour.');
    }

    const city = CAROLINA_CITIES[citySlug];
    if (!city) throw new Error('Invalid city slug');

    const cityName = city[locale];
    const lang = locale === 'ru' ? 'Russian' : 'English';

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an SEO content writer for The Emerald Pour, a mobile Irish pub catering service. Write in ${lang}. Output clean HTML only (h2, h3, p, ul, li tags). No script tags.`,
        },
        {
          role: 'user',
          content: `Write a 1500-word SEO article about mobile Irish pub catering in ${cityName}, ${city.state}. Include local event venues, St. Patrick's Day parties, corporate events, and wedding receptions. Use natural keywords.`,
        },
      ],
      max_tokens: 4000,
    });

    const rawContent = completion.choices[0]?.message?.content ?? '';
    const sanitized = DOMPurify.sanitize(rawContent, {
      ALLOWED_TAGS: ['h2', 'h3', 'p', 'ul', 'ol', 'li', 'strong', 'em', 'a'],
      ALLOWED_ATTR: ['href'],
    });

    const title =
      locale === 'ru'
        ? `Мобильный ирландский паб в ${cityName} — The Emerald Pour`
        : `Mobile Irish Pub Catering in ${cityName} — The Emerald Pour`;

    const slug = `mobile-irish-pub-${citySlug}-${locale}`;
    const metaDescription =
      locale === 'ru'
        ? `Аренда мобильного ирландского паба в ${cityName}. Корпоративы, свадьбы, День Святого Патрика.`
        : `Rent a mobile Irish pub in ${cityName}, ${city.state}. Corporate events, weddings, St. Patrick's Day parties.`;

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('seo_articles')
      .insert({
        tenant_id: tenantId,
        locale,
        city_slug: citySlug,
        title,
        slug,
        content: sanitized,
        meta_description: metaDescription,
        status: 'pending_approval',
        ai_generated: true,
      })
      .select()
      .single();

    if (error || !data) throw new Error(error?.message ?? 'Failed to save article');

    await supabase.from('audit_logs').insert({
      tenant_id: tenantId,
      action: 'ai.article.generated',
      resource_type: 'seo_article',
      resource_id: data.id,
      details: { citySlug, locale },
    });

    return data as SeoArticle;
  }

  async approveArticle(
    tenantId: string,
    articleId: string,
    approverId: string
  ): Promise<SeoArticle> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('seo_articles')
      .update({
        status: 'published',
        approved_by: approverId,
        approved_at: new Date().toISOString(),
      })
      .eq('id', articleId)
      .eq('tenant_id', tenantId)
      .eq('status', 'pending_approval')
      .select()
      .single();

    if (error || !data) throw new Error('Article not found or not pending approval');

    await eventBus.publish({
      tenantId,
      eventType: EVENT_TYPES.ARTICLE_PUBLISHED,
      aggregateId: articleId,
      aggregateType: 'seo_article',
      payload: {
        articleId,
        slug: data.slug,
        locale: data.locale,
        citySlug: data.city_slug,
      },
      idempotencyKey: `article.published:${articleId}`,
    });

    return data as SeoArticle;
  }
}

export const aiContentService = new AiContentService();

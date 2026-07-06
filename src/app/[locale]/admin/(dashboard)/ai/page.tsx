import { AiAssistant } from '@/components/admin/AiAssistant';
import { SeoArticleManager } from '@/components/admin/SeoArticleManager';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { getTranslations } from '@/lib/i18n/server';
import type { Locale } from '@/lib/i18n/config';

export default async function AdminAiPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = getTranslations(locale as Locale);

  return (
    <div className="space-y-8">
      <AdminPageHeader title={t.admin.ai} description={t.admin.aiDesc} />
      <AiAssistant locale={locale as Locale} />
      <SeoArticleManager />
    </div>
  );
}

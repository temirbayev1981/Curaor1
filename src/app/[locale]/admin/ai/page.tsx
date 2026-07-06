import { AiAssistant } from '@/components/admin/AiAssistant';
import { SeoArticleManager } from '@/components/admin/SeoArticleManager';
import type { Locale } from '@/lib/i18n/config';

export default async function AdminAiPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="space-y-8">
      <AiAssistant locale={locale as Locale} />
      <SeoArticleManager />
    </div>
  );
}

import { AiAssistant } from '@/components/admin/AiAssistant';
import type { Locale } from '@/lib/i18n/config';

export default async function AdminAiPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div>
      <AiAssistant locale={locale as Locale} />
    </div>
  );
}

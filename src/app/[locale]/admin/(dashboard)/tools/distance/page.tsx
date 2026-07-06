import { DistanceCalculatorTool } from '@/components/admin/DistanceCalculatorTool';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { getTranslations } from '@/lib/i18n/server';
import type { Locale } from '@/lib/i18n/config';

export default async function AdminDistancePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = getTranslations(locale as Locale);

  return (
    <div>
      <AdminPageHeader title={t.admin.distance.title} description={t.admin.distance.desc} />
      <DistanceCalculatorTool />
    </div>
  );
}

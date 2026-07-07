import { ProcurementManager } from '@/components/admin/ProcurementManager';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { getTranslations } from '@/lib/i18n/server';
import type { Locale } from '@/lib/i18n/config';

export default async function AdminProcurementPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = getTranslations(locale as Locale);

  return (
    <div>
      <AdminPageHeader
        title={t.admin.procurementTools.title}
        description={t.admin.procurementTools.desc}
      />
      <ProcurementManager />
    </div>
  );
}

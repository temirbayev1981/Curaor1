import { OperationsCalendar } from '@/components/admin/OperationsCalendar';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { getTranslations } from '@/lib/i18n/server';
import type { Locale } from '@/lib/i18n/config';

export default async function AdminCalendarPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = getTranslations(locale as Locale);

  return (
    <div className="space-y-6">
      <AdminPageHeader title={t.admin.operationsCalendar.title} description={t.admin.operationsCalendar.desc} />
      <OperationsCalendar locale={locale as Locale} />
    </div>
  );
}

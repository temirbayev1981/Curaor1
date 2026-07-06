import { SettingsForm } from '@/components/admin/SettingsForm';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { getTranslations } from '@/lib/i18n/server';
import type { Locale } from '@/lib/i18n/config';

export default async function AdminSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = getTranslations(locale as Locale);

  return (
    <div>
      <AdminPageHeader
        title={t.admin.settings}
        description={t.admin.settingsDesc}
      />
      <div className="rounded-2xl border border-admin-border bg-admin-surface p-6">
        <SettingsForm />
      </div>
    </div>
  );
}

import { AdminChangePasswordForm } from '@/components/auth/AdminChangePasswordForm';
import type { Locale } from '@/lib/i18n/config';
import { getTranslations } from '@/lib/i18n/server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = getTranslations(locale as Locale);

  return {
    title: t.auth.admin.changePasswordTitle,
  };
}

export default async function AdminChangePasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return <AdminChangePasswordForm locale={locale as Locale} />;
}

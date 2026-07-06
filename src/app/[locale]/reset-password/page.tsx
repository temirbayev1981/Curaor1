import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import type { Locale } from '@/lib/i18n/config';

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <ResetPasswordForm locale={locale as Locale} />;
}

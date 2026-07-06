import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import type { Locale } from '@/lib/i18n/config';

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <Suspense>
      <LoginForm locale={locale as Locale} />
    </Suspense>
  );
}

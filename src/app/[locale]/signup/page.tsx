import { Suspense } from 'react';
import { SignupForm } from '@/components/auth/SignupForm';
import type { Locale } from '@/lib/i18n/config';

export default async function SignupPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <Suspense>
      <SignupForm locale={locale as Locale} />
    </Suspense>
  );
}

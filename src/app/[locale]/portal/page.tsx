import { Suspense } from 'react';
import { CustomerPortal } from '@/components/portal/CustomerPortal';
import { ToastProvider } from '@/components/ui/Toast';
import type { Locale } from '@/lib/i18n/config';

export default async function PortalPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <ToastProvider>
      <Suspense>
        <CustomerPortal locale={locale as Locale} />
      </Suspense>
    </ToastProvider>
  );
}

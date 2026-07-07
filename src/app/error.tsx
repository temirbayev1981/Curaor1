'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { captureError } from '@/lib/observability/capture';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslation();

  useEffect(() => {
    captureError(error, { digest: error.digest, tags: { surface: 'error-boundary' } });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#070b09] px-4">
      <div className="text-center">
        <h1 className="mb-3 text-2xl font-bold text-white">{t('errors.genericTitle')}</h1>
        <p className="mb-8 text-zinc-400">{t('errors.genericDesc')}</p>
        <div className="flex justify-center gap-3">
          <Button onClick={reset}>{t('errors.tryAgain')}</Button>
          <Link href="/en">
            <Button variant="outline">{t('errors.backHome')}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

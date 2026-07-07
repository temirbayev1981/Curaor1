'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslation();

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

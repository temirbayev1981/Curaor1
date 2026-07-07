'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { X } from 'lucide-react';
import type { Locale } from '@/lib/i18n/config';

const STORAGE_KEY = 'emerald-pour-cookie-consent';

export function CookieConsent({ locale }: { locale: Locale }) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !localStorage.getItem(STORAGE_KEY);
  });

  function accept() {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    setVisible(false);
    window.dispatchEvent(new Event('cookie-consent-accepted'));
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-nav/95 p-4 backdrop-blur-md md:bottom-0 md:left-auto md:right-4 md:mb-4 md:max-w-md md:rounded-xl md:border">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-secondary">
          {t('cookies.message')}{' '}
          <Link href={`/${locale}/privacy`} className="text-irish hover:underline">
            {t('footer.privacy')}
          </Link>
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={accept}
            className="btn-primary px-4 py-2 text-sm font-medium"
          >
            {t('cookies.accept')}
          </button>
          <button
            type="button"
            onClick={() => setVisible(false)}
            className="rounded-lg p-2 text-zinc-500 hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

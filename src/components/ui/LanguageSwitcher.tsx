'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Globe } from 'lucide-react';
import { locales, type Locale } from '@/lib/i18n/config';
import { useTranslation } from 'react-i18next';

export function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();

  const currentLocale = (pathname.split('/')[1] ?? 'en') as Locale;

  function switchLocale(newLocale: Locale) {
    const segments = pathname.split('/');
    segments[1] = newLocale;
    const newPath = segments.join('/') || `/${newLocale}`;
    document.cookie = `locale=${newLocale};path=/;max-age=31536000`;
    router.push(newPath);
  }

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-emerald-400" aria-hidden />
      <label htmlFor="locale-select" className="sr-only">
        {t('language.switch')}
      </label>
      <select
        id="locale-select"
        value={currentLocale}
        onChange={(e) => switchLocale(e.target.value as Locale)}
        className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-sm text-white backdrop-blur-sm"
      >
        {locales.map((locale) => (
          <option key={locale} value={locale} className="bg-gray-900">
            {t(`language.${locale}`)}
          </option>
        ))}
      </select>
    </div>
  );
}

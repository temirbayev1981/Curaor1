'use client';

import { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';
import type { Locale } from '@/lib/i18n/config';
import en from '@/lib/i18n/locales/en.json';
import ru from '@/lib/i18n/locales/ru.json';

const resources = {
  en: { translation: en },
  ru: { translation: ru },
};

export function I18nProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const [i18n] = useState(() => {
    const instance = createInstance();
    instance.use(initReactI18next).init({
      lng: locale,
      fallbackLng: 'en',
      resources,
      interpolation: { escapeValue: false },
    });
    return instance;
  });

  useEffect(() => {
    i18n.changeLanguage(locale);
  }, [locale, i18n]);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

import { createInstance, type i18n } from 'i18next';
import { initReactI18next } from 'react-i18next/initReactI18next';
import { defaultLocale, type Locale } from './config';
import en from './locales/en.json';
import ru from './locales/ru.json';

const resources = {
  en: { translation: en },
  ru: { translation: ru },
};

export async function initI18n(locale: Locale): Promise<i18n> {
  const i18nInstance = createInstance();
  await i18nInstance.use(initReactI18next).init({
    lng: locale,
    fallbackLng: defaultLocale,
    resources,
    interpolation: { escapeValue: false },
  });
  return i18nInstance;
}

export function getTranslations(locale: Locale) {
  return resources[locale].translation;
}

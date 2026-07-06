'use client';

import { CookieConsent } from '@/components/layout/CookieConsent';
import { ScrollToTop, StickyMobileCta } from '@/components/layout/SiteEnhancements';
import type { Locale } from '@/lib/i18n/config';

export function PublicSiteExtras({ locale }: { locale: Locale }) {
  return (
    <>
      <ScrollToTop />
      <StickyMobileCta locale={locale} />
      <CookieConsent locale={locale} />
    </>
  );
}

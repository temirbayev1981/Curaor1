'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

const CONSENT_KEY = 'emerald-pour-cookie-consent';

export function GoogleAnalytics() {
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    function sync() {
      setEnabled(localStorage.getItem(CONSENT_KEY) === 'accepted');
    }

    sync();
    window.addEventListener('cookie-consent-accepted', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('cookie-consent-accepted', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  if (!id || !enabled) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${id}');
        `}
      </Script>
    </>
  );
}

'use client';

import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';

const SECTIONS: Record<'privacy' | 'terms', readonly string[]> = {
  privacy: ['s1', 's2', 's3', 's4', 's5'],
  terms: ['s1', 's2', 's3', 's4'],
};

export function LegalDocument({ namespace }: { namespace: 'privacy' | 'terms' }) {
  const { t } = useTranslation();
  const sections = SECTIONS[namespace];

  return (
    <div className="relative">
      <div className="bg-grid fixed inset-0 opacity-20" />
      <div className="relative mx-auto max-w-3xl px-4 pt-24 pb-16 sm:px-6">
        <h1 className="mb-2 text-4xl font-bold text-white">{t(`${namespace}.title`)}</h1>
        <p className="mb-10 text-sm text-zinc-500">{t(`${namespace}.lastUpdated`)}</p>
        <div className="space-y-6">
          {sections.map((key) => (
            <Card key={key}>
              <h2 className="mb-3 text-xl font-semibold text-emerald-400">
                {t(`${namespace}.${key}Title`)}
              </h2>
              <p className="leading-relaxed text-zinc-300">{t(`${namespace}.${key}Body`)}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

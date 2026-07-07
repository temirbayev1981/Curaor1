'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Field, AdminSelect } from '@/components/ui/Input';
import { IntegrationNotice } from '@/components/admin/IntegrationNotice';
import { CAROLINA_CITIES } from '@/domain/ai/ai-content.service';
import type { Locale } from '@/lib/i18n/config';

interface IntegrationStatus {
  mapbox: boolean;
  openai: boolean;
  stripe: boolean;
}

export function AiAssistant({ locale }: { locale: Locale }) {
  const { t } = useTranslation();
  const [citySlug, setCitySlug] = useState('charlotte');
  const [articleLocale, setArticleLocale] = useState<Locale>(locale);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [integrations, setIntegrations] = useState<IntegrationStatus | null>(null);

  useEffect(() => {
    fetch('/api/admin/integrations')
      .then((res) => res.json())
      .then((json: { data: IntegrationStatus | null }) => setIntegrations(json.data))
      .catch(() => setIntegrations(null));
  }, []);

  async function handleGenerate() {
    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/ai/generate-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          citySlug,
          locale: articleLocale,
        }),
      });

      const json = (await res.json()) as {
        data: { title: string; status: string } | null;
        error: { code?: string; message: string } | null;
      };

      if (!res.ok || json.error) {
        setStatus('error');
        setMessage(
          json.error?.code === 'NOT_CONFIGURED'
            ? t('admin.aiAssistant.notConfigured')
            : (json.error?.message ?? t('admin.aiAssistant.generateFailed'))
        );
        return;
      }

      setStatus('success');
      setMessage(
        t('admin.aiAssistant.articleCreated', {
          title: json.data?.title ?? '',
          status: json.data?.status ?? '',
        })
      );
    } catch {
      setStatus('error');
      setMessage(t('admin.aiAssistant.generateFailed'));
    }
  }

  return (
    <div className="rounded-2xl border border-admin-border bg-admin-surface p-6">
      {integrations && !integrations.openai && (
        <IntegrationNotice
          title={t('admin.aiAssistant.notConfiguredTitle')}
          description={t('admin.aiAssistant.notConfigured')}
          envVar="OPENAI_API_KEY"
        />
      )}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
          <Sparkles className="h-5 w-5 text-emerald-400" />
        </div>
        <h2 className="text-xl font-semibold text-white">{t('admin.ai')}</h2>
      </div>

      <p className="mb-6 text-sm leading-relaxed text-zinc-400">
        {t('admin.aiAssistant.description')}
      </p>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <Field label={t('admin.aiAssistant.city')}>
          <AdminSelect
            value={citySlug}
            onChange={(e) => setCitySlug(e.target.value)}
          >
            {Object.entries(CAROLINA_CITIES).map(([slug, city]) => (
              <option key={slug} value={slug}>
                {city[articleLocale]}, {city.state}
              </option>
            ))}
          </AdminSelect>
        </Field>
        <Field label={t('admin.aiAssistant.language')}>
          <AdminSelect
            value={articleLocale}
            onChange={(e) => setArticleLocale(e.target.value as Locale)}
          >
            <option value="en">{t('language.en')}</option>
            <option value="ru">{t('language.ru')}</option>
          </AdminSelect>
        </Field>
      </div>

      <Button
        onClick={handleGenerate}
        loading={status === 'loading'}
        disabled={integrations !== null && !integrations.openai}
      >
        <Sparkles className="h-4 w-4" />
        {status === 'loading'
          ? t('admin.aiAssistant.generating')
          : t('admin.aiAssistant.generate')}
      </Button>

      {message && (
        <p
          className={`mt-4 rounded-lg px-4 py-2 text-sm ${
            status === 'error'
              ? 'border border-red-500/20 bg-red-500/5 text-red-400'
              : 'border border-emerald-500/20 bg-emerald-500/5 text-emerald-400'
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}

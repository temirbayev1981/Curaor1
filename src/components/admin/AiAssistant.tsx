'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import { CAROLINA_CITIES } from '@/domain/ai/ai-content.service';
import type { Locale } from '@/lib/i18n/config';

const DEFAULT_TENANT_ID = 'a0000000-0000-4000-8000-000000000001';

export function AiAssistant({ locale }: { locale: Locale }) {
  const { t } = useTranslation();
  const [citySlug, setCitySlug] = useState('charlotte');
  const [articleLocale, setArticleLocale] = useState<Locale>(locale);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleGenerate() {
    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/ai/generate-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: DEFAULT_TENANT_ID,
          citySlug,
          locale: articleLocale,
        }),
      });

      const json = (await res.json()) as {
        data: { title: string; status: string } | null;
        error: { message: string } | null;
      };

      if (json.error) {
        setStatus('error');
        setMessage(json.error.message);
        return;
      }

      setStatus('success');
      setMessage(
        `Article "${json.data?.title}" created with status: ${json.data?.status}. Awaiting manual approval.`
      );
    } catch {
      setStatus('error');
      setMessage('Failed to generate article');
    }
  }

  return (
    <div className="rounded-xl border border-admin-border bg-admin-surface p-6">
      <div className="mb-6 flex items-center gap-3">
        <Sparkles className="h-6 w-6 text-emerald-400" />
        <h2 className="text-xl font-semibold text-white">{t('admin.ai')}</h2>
      </div>

      <p className="mb-6 text-sm text-zinc-400">
        Generate 1500-word localized SEO articles. All outputs are sanitized and require manual approval before publishing.
      </p>

      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-zinc-400">City</label>
          <select
            value={citySlug}
            onChange={(e) => setCitySlug(e.target.value)}
            className="w-full rounded-lg border border-admin-border bg-admin-bg px-4 py-2 text-white"
          >
            {Object.entries(CAROLINA_CITIES).map(([slug, city]) => (
              <option key={slug} value={slug}>
                {city.en}, {city.state}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-400">Language</label>
          <select
            value={articleLocale}
            onChange={(e) => setArticleLocale(e.target.value as Locale)}
            className="w-full rounded-lg border border-admin-border bg-admin-bg px-4 py-2 text-white"
          >
            <option value="en">English</option>
            <option value="ru">Russian</option>
          </select>
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={status === 'loading'}
        className="rounded-lg bg-emerald-500 px-6 py-2 font-medium text-white hover:bg-emerald-600 disabled:opacity-50"
      >
        {status === 'loading' ? 'Generating...' : 'Generate SEO Article'}
      </button>

      {message && (
        <p
          className={`mt-4 text-sm ${status === 'error' ? 'text-red-400' : 'text-emerald-400'}`}
        >
          {message}
        </p>
      )}
    </div>
  );
}

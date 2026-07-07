'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { createClient } from '@/lib/supabase/client';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Input';
import { DEFAULT_TENANT_ID } from '@/lib/tenant/constants';
import type { Locale } from '@/lib/i18n/config';

export function SignupForm({ locale }: { locale: Locale }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenantId: DEFAULT_TENANT_ID,
        email,
        password,
        fullName,
        phone: phone || undefined,
      }),
    });

    const json = (await res.json()) as { error: { message: string } | null };

    if (!res.ok || json.error) {
      setError(json.error?.message ?? t('auth.registrationFailed'));
      setLoading(false);
      return;
    }

    const supabase = createClient();
    await supabase.auth.signInWithPassword({ email, password });
    router.push(`/${locale}/portal`);
  }

  return (
    <AuthLayout
      locale={locale}
      title={t('auth.signUp')}
      subtitle={t('auth.signupSubtitle')}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label={t('auth.fullName')}>
          <Input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </Field>
        <Field label={t('auth.email')}>
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field label={t('auth.phone')}>
          <Input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </Field>
        <Field label={t('auth.password')}>
          <Input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        {error && (
          <p className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}
        <Button type="submit" loading={loading} className="w-full">
          {loading ? t('auth.creatingAccount') : t('auth.signUp')}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-zinc-400">
        {t('auth.hasAccount')}{' '}
        <Link href={`/${locale}/login`} className="text-irish hover:underline">
          {t('auth.signInLink')}
        </Link>
      </p>
    </AuthLayout>
  );
}

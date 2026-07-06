'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { createClient } from '@/lib/supabase/client';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Input';
import type { Locale } from '@/lib/i18n/config';

export function LoginForm({ locale }: { locale: Locale }) {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    await fetch('/api/auth/link-customer', { method: 'POST' });

    const redirect = searchParams.get('redirect') ?? `/${locale}/portal`;
    router.push(redirect);
  }

  async function handleForgotPassword() {
    if (!email) {
      setError(t('auth.enterEmailFirst'));
      return;
    }
    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${globalThis.location.origin}/${locale}/reset-password`,
    });
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setResetSent(true);
  }

  return (
    <AuthLayout locale={locale} title={t('auth.signIn')}>
      {resetSent ? (
        <p className="text-center text-emerald-300">
          {t('auth.resetSent', { email })}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label={t('auth.email')}>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field label={t('auth.password')}>
            <Input
              type="password"
              required
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
            {loading ? t('auth.signingIn') : t('auth.signIn')}
          </Button>
          <button
            type="button"
            onClick={handleForgotPassword}
            className="w-full text-sm text-zinc-400 transition hover:text-emerald-400"
          >
            {t('auth.forgotPassword')}
          </button>
        </form>
      )}
      <p className="mt-6 text-center text-sm text-zinc-400">
        {t('auth.noAccount')}{' '}
        <Link href={`/${locale}/signup`} className="text-emerald-400 hover:underline">
          {t('auth.createOne')}
        </Link>
      </p>
    </AuthLayout>
  );
}

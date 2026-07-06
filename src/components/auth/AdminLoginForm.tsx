'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { createClient } from '@/lib/supabase/client';
import { resolveAdminEmail } from '@/lib/auth/admin-auth';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Input';
import type { Locale } from '@/lib/i18n/config';

export function AdminLoginForm({ locale }: { locale: Locale }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [username, setUsername] = useState('Admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const email = resolveAdminEmail(username);
    if (!email) {
      setError(t('auth.admin.invalidUsername'));
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(t('auth.admin.invalidCredentials'));
      setLoading(false);
      return;
    }

    const mustChange = data.user?.user_metadata?.must_change_password === true;
    router.push(
      mustChange
        ? `/${locale}/admin/change-password`
        : `/${locale}/admin`
    );
  }

  return (
    <AuthLayout
      locale={locale}
      title={t('auth.admin.title')}
      subtitle={t('auth.admin.subtitle')}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label={t('auth.admin.username')}>
          <Input
            type="text"
            required
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </Field>
        <Field label={t('auth.password')}>
          <Input
            type="password"
            required
            autoComplete="current-password"
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
          {loading ? t('auth.signingIn') : t('auth.admin.signIn')}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-zinc-400">
        <Link href={`/${locale}`} className="text-emerald-400 hover:underline">
          {t('errors.backHome')}
        </Link>
      </p>
    </AuthLayout>
  );
}

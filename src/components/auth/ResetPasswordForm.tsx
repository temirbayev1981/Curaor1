'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { createClient } from '@/lib/supabase/client';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Input';
import type { Locale } from '@/lib/i18n/config';

export function ResetPasswordForm({ locale }: { locale: Locale }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError(t('auth.passwordMismatch'));
      return;
    }
    if (password.length < 8) {
      setError(t('auth.passwordTooShort'));
      return;
    }

    setLoading(true);
    setError('');
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    router.push(`/${locale}/portal`);
  }

  return (
    <AuthLayout locale={locale} title={t('auth.resetPassword')} subtitle={t('auth.resetPasswordDesc')}>
      {!ready ? (
        <p className="text-center text-zinc-400">{t('auth.resetLinkInvalid')}</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label={t('auth.newPassword')}>
            <Input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          <Field label={t('auth.confirmPassword')}>
            <Input
              type="password"
              required
              minLength={8}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </Field>
          {error && (
            <p className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          )}
          <Button type="submit" loading={loading} className="w-full">
            {t('auth.updatePassword')}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}

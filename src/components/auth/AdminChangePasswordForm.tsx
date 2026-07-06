'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { createClient } from '@/lib/supabase/client';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Input';
import type { Locale } from '@/lib/i18n/config';

const DEFAULT_ADMIN_PASSWORD = '12345678';

export function AdminChangePasswordForm({ locale }: { locale: Locale }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    if (password === DEFAULT_ADMIN_PASSWORD) {
      setError(t('auth.admin.mustUseNewPassword'));
      return;
    }

    setLoading(true);
    setError('');

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password,
      data: { must_change_password: false },
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    router.push(`/${locale}/admin`);
    router.refresh();
  }

  return (
    <AuthLayout
      locale={locale}
      title={t('auth.admin.changePasswordTitle')}
      subtitle={t('auth.admin.changePasswordDesc')}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label={t('auth.newPassword')}>
          <Input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <Field label={t('auth.confirmPassword')}>
          <Input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
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
    </AuthLayout>
  );
}

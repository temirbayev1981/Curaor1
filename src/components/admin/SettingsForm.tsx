'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DollarSign, Bell } from 'lucide-react';
import type { TenantSettings } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Field, AdminInput, AdminSelect } from '@/components/ui/Input';

export function SettingsForm() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<TenantSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((json: { data: TenantSettings | null }) => {
        if (json.data) setSettings(json.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setMessage('');

    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings }),
    });

    const json = (await res.json()) as { error: { message: string } | null };
    setSaving(false);
    if (json.error) {
      setIsError(true);
      setMessage(json.error.message);
    } else {
      setIsError(false);
      setMessage(t('admin.settingsForm.saved'));
    }
  }

  if (loading || !settings) {
    return <div className="skeleton h-64 rounded-xl" />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <div className="mb-4 flex items-center gap-2 text-emerald-400">
          <DollarSign className="h-5 w-5" />
          <h3 className="font-semibold text-white">{t('admin.settingsForm.pricing')}</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t('admin.settingsForm.basePrice')}>
            <AdminInput
              type="number"
              step="0.01"
              value={settings.base_event_price}
              onChange={(e) =>
                setSettings({ ...settings, base_event_price: Number(e.target.value) })
              }
            />
          </Field>
          <Field label={t('admin.settingsForm.pricePerMile')}>
            <AdminInput
              type="number"
              step="0.01"
              value={settings.price_per_mile}
              onChange={(e) =>
                setSettings({ ...settings, price_per_mile: Number(e.target.value) })
              }
            />
          </Field>
          <Field label={t('admin.settingsForm.defaultDeposit')}>
            <AdminSelect
              value={settings.default_deposit_percent}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  default_deposit_percent: Number(e.target.value) as 25 | 50 | 100,
                })
              }
            >
              <option value={25}>25%</option>
              <option value={50}>50%</option>
              <option value={100}>100%</option>
            </AdminSelect>
          </Field>
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-center gap-2 text-emerald-400">
          <Bell className="h-5 w-5" />
          <h3 className="font-semibold text-white">{t('admin.settingsForm.notifications')}</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t('admin.settingsForm.notificationEmail')}>
            <AdminInput
              type="email"
              value={settings.notification_email}
              onChange={(e) =>
                setSettings({ ...settings, notification_email: e.target.value })
              }
            />
          </Field>
          <Field label={t('admin.settingsForm.timezone')}>
            <AdminInput
              value={settings.timezone}
              onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
            />
          </Field>
          <Field label={t('admin.settingsForm.telegramChatId')}>
            <AdminInput
              value={settings.telegram_chat_id ?? ''}
              onChange={(e) =>
                setSettings({ ...settings, telegram_chat_id: e.target.value || null })
              }
            />
          </Field>
        </div>
      </div>

      {message && (
        <p
          className={`rounded-lg px-4 py-2 text-sm ${
            isError
              ? 'border border-red-500/20 bg-red-500/5 text-red-400'
              : 'border border-emerald-500/20 bg-emerald-500/5 text-emerald-400'
          }`}
        >
          {message}
        </p>
      )}
      <Button type="submit" loading={saving}>
        {saving ? t('admin.settingsForm.saving') : t('admin.settingsForm.save')}
      </Button>
    </form>
  );
}

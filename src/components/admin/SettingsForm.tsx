'use client';

import { useEffect, useState } from 'react';
import type { TenantSettings } from '@/types/database';

export function SettingsForm() {
  const [settings, setSettings] = useState<TenantSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

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
    setMessage(json.error ? json.error.message : 'Settings saved successfully');
  }

  if (loading || !settings) {
    return <div className="skeleton h-64 rounded-xl" />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-zinc-400">Base Event Price ($)</label>
          <input
            type="number"
            step="0.01"
            value={settings.base_event_price}
            onChange={(e) =>
              setSettings({ ...settings, base_event_price: Number(e.target.value) })
            }
            className="w-full rounded-lg border border-admin-border bg-admin-bg px-4 py-2 text-white"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-400">Price Per Mile ($)</label>
          <input
            type="number"
            step="0.01"
            value={settings.price_per_mile}
            onChange={(e) =>
              setSettings({ ...settings, price_per_mile: Number(e.target.value) })
            }
            className="w-full rounded-lg border border-admin-border bg-admin-bg px-4 py-2 text-white"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-400">Default Deposit (%)</label>
          <select
            value={settings.default_deposit_percent}
            onChange={(e) =>
              setSettings({
                ...settings,
                default_deposit_percent: Number(e.target.value) as 25 | 50 | 100,
              })
            }
            className="w-full rounded-lg border border-admin-border bg-admin-bg px-4 py-2 text-white"
          >
            <option value={25}>25%</option>
            <option value={50}>50%</option>
            <option value={100}>100%</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-400">Notification Email</label>
          <input
            type="email"
            value={settings.notification_email}
            onChange={(e) =>
              setSettings({ ...settings, notification_email: e.target.value })
            }
            className="w-full rounded-lg border border-admin-border bg-admin-bg px-4 py-2 text-white"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-400">Timezone</label>
          <input
            value={settings.timezone}
            onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
            className="w-full rounded-lg border border-admin-border bg-admin-bg px-4 py-2 text-white"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-400">Telegram Chat ID</label>
          <input
            value={settings.telegram_chat_id ?? ''}
            onChange={(e) =>
              setSettings({ ...settings, telegram_chat_id: e.target.value || null })
            }
            className="w-full rounded-lg border border-admin-border bg-admin-bg px-4 py-2 text-white"
          />
        </div>
      </div>
      {message && (
        <p className={`text-sm ${message.includes('success') ? 'text-emerald-400' : 'text-red-400'}`}>
          {message}
        </p>
      )}
      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-emerald-500 px-6 py-2 font-medium text-white hover:bg-emerald-600 disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </form>
  );
}

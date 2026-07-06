import { SettingsForm } from '@/components/admin/SettingsForm';

export default function AdminSettingsPage() {
  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-white">Settings</h2>
      <div className="rounded-xl border border-admin-border bg-admin-surface p-6">
        <SettingsForm />
      </div>
    </div>
  );
}

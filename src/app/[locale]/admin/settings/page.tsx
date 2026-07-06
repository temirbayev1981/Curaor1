export default function AdminSettingsPage() {
  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-white">Settings</h2>
      <div className="rounded-xl border border-admin-border bg-admin-surface p-6">
        <p className="text-zinc-400">
          Tenant configuration is managed via the configuration hierarchy:
          System defaults → Tenant settings → Admin overrides → Runtime overrides.
        </p>
        <dl className="mt-6 space-y-4">
          <div>
            <dt className="text-sm text-zinc-500">Base Event Price</dt>
            <dd className="text-white">$1,500.00</dd>
          </div>
          <div>
            <dt className="text-sm text-zinc-500">Price Per Mile</dt>
            <dd className="text-white">$2.50</dd>
          </div>
          <div>
            <dt className="text-sm text-zinc-500">Default Deposit</dt>
            <dd className="text-white">25%</dd>
          </div>
          <div>
            <dt className="text-sm text-zinc-500">Timezone</dt>
            <dd className="text-white">America/New_York</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

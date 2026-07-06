import { MediaLibrary } from '@/components/admin/MediaLibrary';

const DEFAULT_TENANT_ID = 'a0000000-0000-4000-8000-000000000001';

export default function AdminMediaPage() {
  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-white">Media Library</h2>
      <MediaLibrary tenantId={DEFAULT_TENANT_ID} />
    </div>
  );
}

import { AuditLogViewer } from '@/components/admin/AuditLogViewer';

export default function AdminAuditPage() {
  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-white">Audit Log</h2>
      <AuditLogViewer />
    </div>
  );
}

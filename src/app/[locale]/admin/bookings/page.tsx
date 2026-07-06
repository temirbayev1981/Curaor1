import { AdminBookingsTable } from '@/components/admin/AdminBookingsTable';

export default function AdminBookingsPage() {
  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-white">Bookings</h2>
      <AdminBookingsTable />
    </div>
  );
}

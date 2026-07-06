import '@/domain/events/register-consumers';
import { bookingService } from '@/domain/booking/booking.service';

const DEFAULT_TENANT_ID = 'a0000000-0000-4000-8000-000000000001';

export default async function AdminBookingsPage() {
  let bookings: Awaited<ReturnType<typeof bookingService.getByTenant>> = [];

  try {
    bookings = await bookingService.getByTenant(DEFAULT_TENANT_ID);
  } catch {
    // DB not connected
  }

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-white">Bookings</h2>
      <div className="overflow-hidden rounded-xl border border-admin-border">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-admin-border bg-admin-bg">
            <tr>
              <th className="px-4 py-3 text-zinc-400">Event</th>
              <th className="px-4 py-3 text-zinc-400">Date</th>
              <th className="px-4 py-3 text-zinc-400">City</th>
              <th className="px-4 py-3 text-zinc-400">Guests</th>
              <th className="px-4 py-3 text-zinc-400">Total</th>
              <th className="px-4 py-3 text-zinc-400">Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                  No bookings yet
                </td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking.id} className="border-b border-admin-border">
                  <td className="px-4 py-3 text-white capitalize">{booking.event_type}</td>
                  <td className="px-4 py-3 text-zinc-300">
                    {new Date(booking.booking_start).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-zinc-300">{booking.venue_city}</td>
                  <td className="px-4 py-3 text-zinc-300">{booking.guest_count}</td>
                  <td className="px-4 py-3 text-zinc-300">${booking.subtotal}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400 capitalize">
                      {booking.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

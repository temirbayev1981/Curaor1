import { createAdminClient } from '@/lib/supabase/admin';
import type { Booking, Customer, Payment } from '@/types/database';

export interface InvoiceData {
  invoiceNumber: string;
  issuedAt: string;
  dueAt: string;
  booking: Booking;
  customer: Customer;
  payments: Payment[];
  tenantName: string;
}

export class InvoiceService {
  async generate(tenantId: string, bookingId: string): Promise<InvoiceData> {
    const supabase = createAdminClient();

    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*, customers(*)')
      .eq('id', bookingId)
      .eq('tenant_id', tenantId)
      .single();

    if (error || !booking) throw new Error('Booking not found');

    const { data: tenant } = await supabase
      .from('tenants')
      .select('name')
      .eq('id', tenantId)
      .single();

    const { data: payments } = await supabase
      .from('payments')
      .select('*')
      .eq('booking_id', bookingId)
      .eq('tenant_id', tenantId)
      .order('created_at');

    const typedBooking = booking as Booking & { customers: Customer };
    const invoiceNumber = `INV-${bookingId.slice(0, 8).toUpperCase()}`;

    return {
      invoiceNumber,
      issuedAt: new Date().toISOString(),
      dueAt: typedBooking.booking_start,
      booking: typedBooking,
      customer: typedBooking.customers,
      payments: (payments ?? []) as Payment[],
      tenantName: (tenant as { name: string } | null)?.name ?? 'The Emerald Pour',
    };
  }

  renderHtml(invoice: InvoiceData): string {
    const { booking, customer, payments, invoiceNumber, issuedAt, tenantName } = invoice;
    const paidTotal = payments
      .filter((p) => p.status === 'succeeded')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const paymentRows = payments
      .map(
        (p) => `
      <tr>
        <td>${p.payment_type}</td>
        <td>$${Number(p.amount).toFixed(2)}</td>
        <td>${p.status}</td>
        <td>${new Date(p.created_at).toLocaleDateString()}</td>
      </tr>`
      )
      .join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Invoice ${invoiceNumber}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 40px auto; color: #111; }
    h1 { color: #059669; }
    table { width: 100%; border-collapse: collapse; margin: 24px 0; }
    th, td { border: 1px solid #e5e7eb; padding: 10px; text-align: left; }
    th { background: #f0fdf4; }
    .totals { text-align: right; font-size: 18px; }
    .header { display: flex; justify-content: space-between; margin-bottom: 32px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>${tenantName}</h1>
      <p>Mobile Irish Pub Catering</p>
    </div>
    <div style="text-align:right">
      <strong>Invoice ${invoiceNumber}</strong><br/>
      Issued: ${new Date(issuedAt).toLocaleDateString()}<br/>
      Event: ${new Date(booking.booking_start).toLocaleDateString()}
    </div>
  </div>
  <p><strong>Bill To:</strong> ${customer.full_name}<br/>${customer.email}</p>
  <p><strong>Event:</strong> ${booking.event_type} — ${booking.venue_city}, ${booking.venue_state}<br/>
  <strong>Guests:</strong> ${booking.guest_count}</p>
  <table>
    <thead><tr><th>Description</th><th>Amount</th></tr></thead>
    <tbody>
      <tr><td>Event Service</td><td>$${(Number(booking.subtotal) - Number(booking.delivery_cost)).toFixed(2)}</td></tr>
      <tr><td>Delivery (${booking.delivery_distance_miles ?? 0} mi)</td><td>$${Number(booking.delivery_cost).toFixed(2)}</td></tr>
      <tr><td><strong>Subtotal</strong></td><td><strong>$${Number(booking.subtotal).toFixed(2)}</strong></td></tr>
      <tr><td>Deposit (${booking.deposit_percent}%)</td><td>$${Number(booking.deposit_amount).toFixed(2)}</td></tr>
      <tr><td>Balance Due</td><td>$${Number(booking.balance_due).toFixed(2)}</td></tr>
    </tbody>
  </table>
  ${payments.length > 0 ? `<h3>Payment History</h3><table><thead><tr><th>Type</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead><tbody>${paymentRows}</tbody></table>` : ''}
  <p class="totals">Total Paid: <strong>$${paidTotal.toFixed(2)}</strong></p>
</body>
</html>`;
  }
}

export const invoiceService = new InvoiceService();

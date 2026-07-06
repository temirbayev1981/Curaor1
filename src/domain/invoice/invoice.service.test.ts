import { describe, it, expect } from 'vitest';
import { InvoiceService } from '@/domain/invoice/invoice.service';
import type { Booking, Customer, Payment } from '@/types/database';

const mockBooking: Booking = {
  id: 'b0000000-0000-4000-8000-000000000001',
  tenant_id: 'a0000000-0000-4000-8000-000000000001',
  customer_id: 'c0000000-0000-4000-8000-000000000001',
  booking_start: '2026-08-15T18:00:00Z',
  booking_end: '2026-08-15T23:00:00Z',
  status: 'deposit_paid',
  event_type: 'wedding',
  guest_count: 100,
  venue_address: '123 Main St',
  venue_city: 'Charlotte',
  venue_state: 'NC',
  venue_zip: '28202',
  delivery_distance_miles: 10,
  delivery_cost: 25,
  subtotal: 1525,
  deposit_percent: 25,
  deposit_amount: 381.25,
  balance_due: 1143.75,
  notes: null,
  google_calendar_event_id: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

const mockCustomer: Customer = {
  id: 'c0000000-0000-4000-8000-000000000001',
  tenant_id: 'a0000000-0000-4000-8000-000000000001',
  user_id: null,
  email: 'test@example.com',
  full_name: 'John Doe',
  phone: '+17045550199',
  metadata: {},
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

describe('InvoiceService', () => {
  const service = new InvoiceService();

  it('renders HTML invoice with booking details', () => {
    const invoice = {
      invoiceNumber: 'INV-B0000000',
      issuedAt: '2026-01-15T00:00:00Z',
      dueAt: mockBooking.booking_start,
      booking: mockBooking,
      customer: mockCustomer,
      payments: [] as Payment[],
      tenantName: 'The Emerald Pour',
    };

    const html = service.renderHtml(invoice);

    expect(html).toContain('INV-B0000000');
    expect(html).toContain('John Doe');
    expect(html).toContain('Charlotte');
    expect(html).toContain('$1525.00');
    expect(html).toContain('wedding');
  });

  it('includes payment history in rendered HTML', () => {
    const payments: Payment[] = [
      {
        id: 'p1',
        tenant_id: mockBooking.tenant_id,
        booking_id: mockBooking.id,
        stripe_payment_intent_id: null,
        stripe_checkout_session_id: null,
        amount: 381.25,
        payment_type: 'deposit',
        status: 'succeeded',
        metadata: {},
        created_at: '2026-01-02T00:00:00Z',
        updated_at: '2026-01-02T00:00:00Z',
      },
    ];

    const html = service.renderHtml({
      invoiceNumber: 'INV-TEST',
      issuedAt: '2026-01-15T00:00:00Z',
      dueAt: mockBooking.booking_start,
      booking: mockBooking,
      customer: mockCustomer,
      payments,
      tenantName: 'The Emerald Pour',
    });

    expect(html).toContain('Payment History');
    expect(html).toContain('deposit');
    expect(html).toContain('$381.25');
  });
});

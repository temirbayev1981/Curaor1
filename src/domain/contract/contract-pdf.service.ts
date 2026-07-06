import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { Booking, Customer } from '@/types/database';

export async function generateContractPdf(
  booking: Booking,
  customer: Customer
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const eventDate = new Date(booking.booking_start).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const lines = [
    { text: 'The Emerald Pour — Event Service Agreement', font: bold, size: 18, y: 740 },
    { text: `Client: ${customer.full_name}`, font, size: 12, y: 700 },
    { text: `Email: ${customer.email}`, font, size: 12, y: 680 },
    { text: `Event: ${booking.event_type}`, font, size: 12, y: 650 },
    { text: `Date: ${eventDate}`, font, size: 12, y: 630 },
    { text: `Venue: ${booking.venue_address}, ${booking.venue_city}, ${booking.venue_state}`, font, size: 12, y: 610 },
    { text: `Guests: ${booking.guest_count}`, font, size: 12, y: 590 },
    { text: `Total: $${Number(booking.subtotal).toFixed(2)}`, font, size: 12, y: 570 },
    { text: `Deposit (${booking.deposit_percent}%): $${Number(booking.deposit_amount).toFixed(2)}`, font, size: 12, y: 550 },
    { text: `Balance due before event: $${Number(booking.balance_due).toFixed(2)}`, font, size: 12, y: 530 },
    { text: 'Terms:', font: bold, size: 12, y: 490 },
    { text: '1. Deposit is non-refundable within 30 days of the event.', font, size: 10, y: 470 },
    { text: '2. Client is responsible for venue permits where required.', font, size: 10, y: 455 },
    { text: '3. The Emerald Pour carries liability insurance for licensed service.', font, size: 10, y: 440 },
    { text: '4. Weather-related rescheduling is complimentary.', font, size: 10, y: 425 },
    { text: 'By signing electronically, the client agrees to these terms.', font, size: 10, y: 390 },
  ];

  for (const line of lines) {
    page.drawText(line.text, {
      x: 50,
      y: line.y,
      size: line.size,
      font: line.font,
      color: rgb(0.1, 0.1, 0.1),
    });
  }

  return doc.save();
}

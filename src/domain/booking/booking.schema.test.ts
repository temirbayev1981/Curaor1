import { describe, it, expect } from 'vitest';
import {
  createBookingSchema,
  transitionBookingSchema,
  updateBookingDatesSchema,
} from './booking.schema';

const validBooking = {
  tenantId: 'a0000000-0000-4000-8000-000000000001',
  customerId: 'a1000000-0000-4000-8000-000000000001',
  bookingStart: '2026-09-15T18:00:00.000Z',
  bookingEnd: '2026-09-15T23:00:00.000Z',
  eventType: 'wedding',
  guestCount: 80,
  venueAddress: '100 Main St',
  venueCity: 'Charlotte',
  venueState: 'NC',
};

describe('createBookingSchema', () => {
  it('accepts valid booking input', () => {
    expect(createBookingSchema.safeParse(validBooking).success).toBe(true);
  });

  it('accepts optional deposit percent', () => {
    expect(
      createBookingSchema.safeParse({ ...validBooking, depositPercent: 50 }).success
    ).toBe(true);
  });

  it('rejects invalid deposit percent', () => {
    expect(
      createBookingSchema.safeParse({ ...validBooking, depositPercent: 30 }).success
    ).toBe(false);
  });
});

describe('transitionBookingSchema', () => {
  it('accepts allowed statuses', () => {
    expect(transitionBookingSchema.safeParse({ status: 'confirmed' }).success).toBe(true);
  });
});

describe('updateBookingDatesSchema', () => {
  it('requires iso datetimes', () => {
    expect(
      updateBookingDatesSchema.safeParse({
        bookingStart: '2026-09-15T18:00:00.000Z',
        bookingEnd: '2026-09-15T23:00:00.000Z',
      }).success
    ).toBe(true);
  });
});

import { z } from 'zod';
import { PACKAGE_TIER_IDS } from '@/lib/booking/packages';

export const createBookingSchema = z.object({
  tenantId: z.string().uuid(),
  customerId: z.string().uuid(),
  bookingStart: z.string().datetime(),
  bookingEnd: z.string().datetime(),
  eventType: z.string().min(1).max(100),
  guestCount: z.number().int().positive().max(500),
  venueAddress: z.string().min(1).max(500),
  venueCity: z.string().min(1).max(100),
  venueState: z.string().length(2).default('NC'),
  venueZip: z.string().max(10).optional(),
  deliveryDistanceMiles: z.number().nonnegative().optional(),
  depositPercent: z.union([z.literal(25), z.literal(50), z.literal(100)]).optional(),
  packageTier: z.enum(PACKAGE_TIER_IDS as [string, ...string[]]).optional(),
  notes: z.string().max(2000).optional(),
});

export const updateBookingDatesSchema = z.object({
  bookingStart: z.string().datetime(),
  bookingEnd: z.string().datetime(),
});

export const transitionBookingSchema = z.object({
  status: z.enum(['deposit_paid', 'confirmed', 'completed', 'cancelled']),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingDatesInput = z.infer<typeof updateBookingDatesSchema>;
export type TransitionBookingInput = z.infer<typeof transitionBookingSchema>;

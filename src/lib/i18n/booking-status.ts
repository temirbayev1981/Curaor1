import type { BookingStatus } from '@/types/database';

export const BOOKING_STATUS_KEYS: Record<BookingStatus, string> = {
  pending: 'status.pending',
  deposit_paid: 'status.deposit_paid',
  confirmed: 'status.confirmed',
  completed: 'status.completed',
  cancelled: 'status.cancelled',
};

import type { BookingStatus } from '@/types/database';

const VALID_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending: ['deposit_paid', 'cancelled'],
  deposit_paid: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

export class BookingStateMachineError extends Error {
  constructor(from: BookingStatus, to: BookingStatus) {
    super(`Invalid booking transition: ${from} -> ${to}`);
    this.name = 'BookingStateMachineError';
  }
}

export function canTransition(
  from: BookingStatus,
  to: BookingStatus
): boolean {
  return VALID_TRANSITIONS[from].includes(to);
}

export function assertTransition(
  from: BookingStatus,
  to: BookingStatus
): void {
  if (!canTransition(from, to)) {
    throw new BookingStateMachineError(from, to);
  }
}

export function getNextStatuses(current: BookingStatus): BookingStatus[] {
  return VALID_TRANSITIONS[current];
}

import { describe, it, expect } from 'vitest';
import {
  canTransition,
  assertTransition,
  BookingStateMachineError,
} from '@/domain/booking/booking.state-machine';

describe('BookingStateMachine', () => {
  it('allows valid transitions', () => {
    expect(canTransition('pending', 'deposit_paid')).toBe(true);
    expect(canTransition('deposit_paid', 'confirmed')).toBe(true);
    expect(canTransition('confirmed', 'completed')).toBe(true);
    expect(canTransition('pending', 'cancelled')).toBe(true);
  });

  it('rejects invalid transitions', () => {
    expect(canTransition('pending', 'completed')).toBe(false);
    expect(canTransition('completed', 'pending')).toBe(false);
    expect(canTransition('cancelled', 'confirmed')).toBe(false);
  });

  it('throws on invalid transition via assertTransition', () => {
    expect(() => assertTransition('pending', 'completed')).toThrow(
      BookingStateMachineError
    );
  });

  it('does not throw on valid transition', () => {
    expect(() => assertTransition('pending', 'deposit_paid')).not.toThrow();
  });
});

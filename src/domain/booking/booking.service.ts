import { createAdminClient } from '@/lib/supabase/admin';
import {
  calculateBookingTotals,
  calculateDeliveryCost,
  getDepositPercent,
  resolveConfig,
} from '@/lib/config/hierarchy';
import {
  calculatePackageBasePrice,
  isPackageTierId,
  type PackageTierId,
} from '@/lib/booking/packages';
import { eventBus } from '@/domain/events/event-bus';
import { EVENT_TYPES } from '@/domain/events/event.types';
import { inventoryService } from '@/domain/inventory/inventory.service';
import { assertTransition } from './booking.state-machine';
import type { CreateBookingInput, UpdateBookingDatesInput } from './booking.schema';
import type { Booking, BookingStatus, Tenant } from '@/types/database';

export class BookingService {
  async create(input: CreateBookingInput): Promise<Booking> {
    const supabase = createAdminClient();

    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', input.tenantId)
      .single();

    if (tenantError || !tenant) {
      throw new Error('Tenant not found');
    }

    const typedTenant = tenant as Tenant;
    const config = resolveConfig({
      tenantSettings: typedTenant.settings,
      adminOverrides: typedTenant.admin_overrides as Record<string, unknown>,
    });

    const depositPercent = getDepositPercent(config, input.depositPercent);
    const deliveryCost = input.deliveryDistanceMiles
      ? calculateDeliveryCost(input.deliveryDistanceMiles, config.price_per_mile)
      : 0;

    const packageTier: PackageTierId =
      input.packageTier && isPackageTierId(input.packageTier)
        ? input.packageTier
        : 'shamrock';
    const packageBasePrice = calculatePackageBasePrice(
      config.base_event_price,
      packageTier,
      input.guestCount
    );

    const { subtotal, depositAmount, balanceDue } = calculateBookingTotals(
      packageBasePrice,
      deliveryCost,
      depositPercent
    );

    const { data: booking, error } = await supabase
      .from('bookings')
      .insert({
        tenant_id: input.tenantId,
        customer_id: input.customerId,
        booking_start: input.bookingStart,
        booking_end: input.bookingEnd,
        event_type: input.eventType,
        guest_count: input.guestCount,
        venue_address: input.venueAddress,
        venue_city: input.venueCity,
        venue_state: input.venueState,
        venue_zip: input.venueZip ?? null,
        delivery_distance_miles: input.deliveryDistanceMiles ?? null,
        delivery_cost: deliveryCost,
        subtotal,
        deposit_percent: depositPercent,
        deposit_amount: depositAmount,
        balance_due: balanceDue,
        notes: input.notes ?? `package:${packageTier}`,
        status: 'pending',
      })
      .select()
      .single();

    if (error || !booking) {
      if (error?.code === '23P01') {
        throw new Error('Time slot is already booked');
      }
      throw new Error(`Failed to create booking: ${error?.message}`);
    }

    await eventBus.publish({
      tenantId: input.tenantId,
      eventType: EVENT_TYPES.BOOKING_CREATED,
      aggregateId: booking.id,
      aggregateType: 'booking',
      payload: { bookingId: booking.id, customerId: input.customerId },
      idempotencyKey: `booking.created:${booking.id}`,
    });

    return booking as Booking;
  }

  async transition(
    tenantId: string,
    bookingId: string,
    newStatus: BookingStatus
  ): Promise<Booking> {
    const supabase = createAdminClient();

    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .eq('tenant_id', tenantId)
      .single();

    if (fetchError || !booking) {
      throw new Error('Booking not found');
    }

    const typedBooking = booking as Booking;
    assertTransition(typedBooking.status, newStatus);

    const { data: updated, error } = await supabase
      .from('bookings')
      .update({ status: newStatus })
      .eq('id', bookingId)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    if (error || !updated) {
      throw new Error(`Failed to update booking: ${error?.message}`);
    }

    await eventBus.publish({
      tenantId,
      eventType: EVENT_TYPES.BOOKING_STATUS_CHANGED,
      aggregateId: bookingId,
      aggregateType: 'booking',
      payload: { bookingId, from: typedBooking.status, to: newStatus },
      idempotencyKey: `booking.status:${bookingId}:${newStatus}`,
    });

    if (newStatus === 'completed') {
      await inventoryService.consumeForEvent(tenantId, typedBooking.guest_count);
    }

    return updated as Booking;
  }

  async getById(tenantId: string, bookingId: string): Promise<Booking> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .eq('tenant_id', tenantId)
      .single();

    if (error || !data) throw new Error('Booking not found');
    return data as Booking;
  }

  async updateNotes(
    tenantId: string,
    bookingId: string,
    notes: string
  ): Promise<Booking> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('bookings')
      .update({ notes })
      .eq('id', bookingId)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    if (error || !data) throw new Error(error?.message ?? 'Failed to update notes');
    return data as Booking;
  }

  async updateDates(
    tenantId: string,
    bookingId: string,
    input: UpdateBookingDatesInput
  ): Promise<Booking> {
    const supabase = createAdminClient();

    const { data: updated, error } = await supabase
      .from('bookings')
      .update({
        booking_start: input.bookingStart,
        booking_end: input.bookingEnd,
      })
      .eq('id', bookingId)
      .eq('tenant_id', tenantId)
      .in('status', ['pending', 'deposit_paid'])
      .select()
      .single();

    if (error) {
      if (error.code === '23P01') {
        throw new Error('Time slot is already booked');
      }
      throw new Error(`Failed to update dates: ${error.message}`);
    }

    if (!updated) {
      throw new Error('Booking not found or cannot be modified');
    }

    return updated as Booking;
  }

  async getByTenant(tenantId: string): Promise<Booking[]> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('booking_start', { ascending: true });

    if (error) throw new Error(error.message);
    return (data ?? []) as Booking[];
  }

  async getByCustomer(tenantId: string, customerId: string): Promise<Booking[]> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('customer_id', customerId)
      .order('booking_start', { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []) as Booking[];
  }
}

export const bookingService = new BookingService();

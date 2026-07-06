import { createAdminClient } from '@/lib/supabase/admin';
import type { StaffMember, StaffShift } from '@/types/database';
import { calculateShiftHours, calculateShiftPay } from './staff.utils';
import type {
  createStaffMemberSchema,
  createStaffShiftSchema,
  updateStaffMemberSchema,
} from './staff.schema';
import type { z } from 'zod';

export interface ShiftWithMember extends StaffShift {
  member: StaffMember;
  hours: number;
  pay: number;
}

export interface StaffPeriodSummary {
  totalHours: number;
  totalPay: number;
  shiftCount: number;
}

export class StaffService {
  async listMembers(tenantId: string): Promise<StaffMember[]> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('staff_members')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('full_name');

    if (error) throw new Error(error.message);
    return (data ?? []) as StaffMember[];
  }

  async createMember(
    tenantId: string,
    input: z.infer<typeof createStaffMemberSchema>
  ): Promise<StaffMember> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('staff_members')
      .insert({
        tenant_id: tenantId,
        full_name: input.fullName,
        role: input.role,
        hourly_rate: input.hourlyRate,
      })
      .select()
      .single();

    if (error || !data) throw new Error(error?.message ?? 'Failed to create staff member');
    return data as StaffMember;
  }

  async updateMember(
    tenantId: string,
    memberId: string,
    input: z.infer<typeof updateStaffMemberSchema>
  ): Promise<StaffMember> {
    const supabase = createAdminClient();
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (input.fullName !== undefined) patch.full_name = input.fullName;
    if (input.role !== undefined) patch.role = input.role;
    if (input.hourlyRate !== undefined) patch.hourly_rate = input.hourlyRate;
    if (input.isActive !== undefined) patch.is_active = input.isActive;

    const { data, error } = await supabase
      .from('staff_members')
      .update(patch)
      .eq('id', memberId)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    if (error || !data) throw new Error(error?.message ?? 'Failed to update staff member');
    return data as StaffMember;
  }

  async listShifts(
    tenantId: string,
    options?: { from?: string; to?: string; bookingId?: string }
  ): Promise<ShiftWithMember[]> {
    const supabase = createAdminClient();
    let query = supabase
      .from('staff_shifts')
      .select('*, staff_members(*)')
      .eq('tenant_id', tenantId)
      .order('shift_start', { ascending: true });

    if (options?.from) query = query.gte('shift_start', options.from);
    if (options?.to) query = query.lte('shift_start', options.to);
    if (options?.bookingId) query = query.eq('booking_id', options.bookingId);

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    return (data ?? []).map((row) => {
      const shift = row as StaffShift & { staff_members: StaffMember };
      const member = shift.staff_members;
      const hours = calculateShiftHours(shift.shift_start, shift.shift_end);
      return {
        ...shift,
        member,
        hours,
        pay: calculateShiftPay(hours, Number(member.hourly_rate)),
      };
    });
  }

  async createShift(
    tenantId: string,
    input: z.infer<typeof createStaffShiftSchema>
  ): Promise<StaffShift> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('staff_shifts')
      .insert({
        tenant_id: tenantId,
        staff_member_id: input.staffMemberId,
        booking_id: input.bookingId ?? null,
        shift_start: input.shiftStart,
        shift_end: input.shiftEnd,
        notes: input.notes ?? null,
      })
      .select()
      .single();

    if (error || !data) throw new Error(error?.message ?? 'Failed to create shift');
    return data as StaffShift;
  }

  async deleteShift(tenantId: string, shiftId: string): Promise<void> {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from('staff_shifts')
      .delete()
      .eq('id', shiftId)
      .eq('tenant_id', tenantId);

    if (error) throw new Error(error.message);
  }

  summarizeShifts(shifts: ShiftWithMember[]): StaffPeriodSummary {
    return shifts.reduce(
      (acc, shift) => ({
        totalHours: acc.totalHours + shift.hours,
        totalPay: acc.totalPay + shift.pay,
        shiftCount: acc.shiftCount + 1,
      }),
      { totalHours: 0, totalPay: 0, shiftCount: 0 }
    );
  }
}

export const staffService = new StaffService();

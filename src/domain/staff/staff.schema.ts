import { z } from 'zod';

export const createStaffMemberSchema = z.object({
  fullName: z.string().min(1).max(120),
  role: z.string().min(1).max(60).default('bartender'),
  hourlyRate: z.number().min(0).max(9999),
});

export const updateStaffMemberSchema = createStaffMemberSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const createStaffShiftSchema = z.object({
  staffMemberId: z.string().uuid(),
  bookingId: z.string().uuid().nullable().optional(),
  shiftStart: z.string().datetime(),
  shiftEnd: z.string().datetime(),
  notes: z.string().max(500).optional(),
});

export const updateStaffShiftSchema = createStaffShiftSchema.partial();

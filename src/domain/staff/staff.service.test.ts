import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFrom = vi.fn();

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ from: mockFrom }),
}));

describe('StaffService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists staff members', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [
              {
                id: 's1',
                tenant_id: 't1',
                full_name: 'Pat',
                role: 'bartender',
                hourly_rate: 20,
                is_active: true,
                created_at: '',
                updated_at: '',
              },
            ],
            error: null,
          }),
        }),
      }),
    });

    const { staffService } = await import('@/domain/staff/staff.service');
    const members = await staffService.listMembers('t1');
    expect(members).toHaveLength(1);
    expect(members[0]?.full_name).toBe('Pat');
  });

  it('creates staff member', async () => {
    mockFrom.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 's2',
              tenant_id: 't1',
              full_name: 'Mo',
              role: 'bartender',
              hourly_rate: 22,
              is_active: true,
              created_at: '',
              updated_at: '',
            },
            error: null,
          }),
        }),
      }),
    });

    const { staffService } = await import('@/domain/staff/staff.service');
    const member = await staffService.createMember('t1', {
      fullName: 'Mo',
      role: 'bartender',
      hourlyRate: 22,
    });
    expect(member.full_name).toBe('Mo');
  });

  it('summarizes shift hours and pay', async () => {
    const { staffService } = await import('@/domain/staff/staff.service');
    const summary = staffService.summarizeShifts([
      {
        id: 'sh1',
        tenant_id: 't1',
        staff_member_id: 's1',
        booking_id: null,
        shift_start: '2026-07-01T18:00:00Z',
        shift_end: '2026-07-01T22:00:00Z',
        notes: null,
        created_at: '',
        updated_at: '',
        member: {
          id: 's1',
          tenant_id: 't1',
          full_name: 'Pat',
          role: 'bartender',
          hourly_rate: 20,
          is_active: true,
          created_at: '',
          updated_at: '',
        },
        hours: 4,
        pay: 80,
      },
    ]);
    expect(summary).toEqual({ totalHours: 4, totalPay: 80, shiftCount: 1 });
  });
});

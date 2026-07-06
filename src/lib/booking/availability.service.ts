import { createAdminClient } from '@/lib/supabase/admin';

export type DayAvailabilityStatus = 'open' | 'limited' | 'full';

export interface DayAvailability {
  date: string;
  status: DayAvailabilityStatus;
  bookingCount: number;
}

const MAX_BOOKINGS_PER_DAY = 2;

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export async function getMonthAvailability(
  tenantId: string,
  month: string
): Promise<DayAvailability[]> {
  const [yearStr, monthStr] = month.split('-');
  const year = Number(yearStr);
  const monthNum = Number(monthStr);

  if (!year || !monthNum || monthNum < 1 || monthNum > 12) {
    throw new Error('Invalid month format. Use YYYY-MM');
  }

  const start = `${month}-01T00:00:00.000Z`;
  const lastDay = daysInMonth(year, monthNum);
  const end = `${month}-${String(lastDay).padStart(2, '0')}T23:59:59.999Z`;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('bookings')
    .select('booking_start')
    .eq('tenant_id', tenantId)
    .neq('status', 'cancelled')
    .gte('booking_start', start)
    .lte('booking_start', end);

  if (error) throw new Error(error.message);

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    const date = (row.booking_start as string).slice(0, 10);
    counts.set(date, (counts.get(date) ?? 0) + 1);
  }

  const result: DayAvailability[] = [];
  for (let day = 1; day <= lastDay; day++) {
    const date = `${month}-${String(day).padStart(2, '0')}`;
    const bookingCount = counts.get(date) ?? 0;
    const status: DayAvailabilityStatus =
      bookingCount >= MAX_BOOKINGS_PER_DAY
        ? 'full'
        : bookingCount === 1
          ? 'limited'
          : 'open';
    result.push({ date, status, bookingCount });
  }

  return result;
}

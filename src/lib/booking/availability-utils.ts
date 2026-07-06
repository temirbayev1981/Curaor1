export type DayAvailabilityStatus = 'open' | 'limited' | 'full';

export interface DayAvailability {
  date: string;
  status: DayAvailabilityStatus;
  bookingCount: number;
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function buildDefaultMonthDays(month: string): DayAvailability[] {
  const [yearStr, monthStr] = month.split('-');
  const year = Number(yearStr);
  const monthNum = Number(monthStr);

  if (!year || !monthNum || monthNum < 1 || monthNum > 12) {
    throw new Error('Invalid month format. Use YYYY-MM');
  }

  const lastDay = daysInMonth(year, monthNum);
  const result: DayAvailability[] = [];

  for (let day = 1; day <= lastDay; day++) {
    const date = `${month}-${String(day).padStart(2, '0')}`;
    result.push({ date, status: 'open', bookingCount: 0 });
  }

  return result;
}

export function isDatabaseUnavailableError(message: string): boolean {
  return (
    message.includes('schema cache') ||
    message.includes('Could not find the table') ||
    message.includes('relation') ||
    message.includes('does not exist')
  );
}

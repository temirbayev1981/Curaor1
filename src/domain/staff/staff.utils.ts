export function calculateShiftHours(shiftStart: string, shiftEnd: string): number {
  const start = new Date(shiftStart).getTime();
  const end = new Date(shiftEnd).getTime();
  if (end <= start) return 0;
  return Math.round(((end - start) / 3_600_000) * 100) / 100;
}

export function calculateShiftPay(hours: number, hourlyRate: number): number {
  return Math.round(hours * hourlyRate * 100) / 100;
}

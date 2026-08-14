export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function fromISODate(iso: string): Date {
  return new Date(`${iso}T00:00:00`);
}

export function todayISODate(): string {
  return toISODate(new Date());
}

export function addDays(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

export function daysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

export function startWeekday(date: Date): number {
  return startOfMonth(date).getDay();
}

export function formatMonthLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function formatRelativeDate(iso: string): string {
  const todayIso = todayISODate();
  if (iso === todayIso) return 'Today';

  const yesterdayIso = toISODate(addDays(new Date(), -1));
  if (iso === yesterdayIso) return 'Yesterday';

  return fromISODate(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function isWithinLastDays(iso: string, days: number): boolean {
  const cutoff = toISODate(addDays(new Date(), -(days - 1)));
  return iso >= cutoff;
}

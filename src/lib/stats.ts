import { addDays, toISODate, todayISODate } from './date';
import type { ConsistencyPoint, StatsRangeDays, WeeklyProgress } from '../types/models';

interface DatedEntry {
  date: string;
}

/**
 * Consecutive days with >=1 logged entry, counted backward from today.
 * Today is skipped if it has no entry yet (mid-day grace) rather than
 * breaking the streak — the streak only breaks once a full day is missed.
 *
 * Entries only need a `date` — callers merge trainings + matches into one
 * array before calling, since both count toward the same streak.
 */
export function calculateStreak(entries: DatedEntry[], todayIso: string = todayISODate()): number {
  const dates = new Set(entries.map((e) => e.date));
  if (dates.size === 0) return 0;

  let cursor = todayIso;
  if (!dates.has(cursor)) {
    cursor = toISODate(addDays(new Date(`${cursor}T00:00:00`), -1));
    if (!dates.has(cursor)) return 0;
  }

  let streak = 0;
  while (dates.has(cursor)) {
    streak += 1;
    cursor = toISODate(addDays(new Date(`${cursor}T00:00:00`), -1));
  }
  return streak;
}

/**
 * Zero-filled daily session counts for the last `rangeDays` days (inclusive
 * of today), oldest first — ready for direct chart consumption.
 */
export function buildConsistencySeries(
  entries: DatedEntry[],
  rangeDays: StatsRangeDays,
  todayIso: string = todayISODate()
): ConsistencyPoint[] {
  const countsByDate = new Map<string, number>();
  for (const entry of entries) {
    countsByDate.set(entry.date, (countsByDate.get(entry.date) ?? 0) + 1);
  }

  const today = new Date(`${todayIso}T00:00:00`);
  const points: ConsistencyPoint[] = [];
  for (let offset = rangeDays - 1; offset >= 0; offset -= 1) {
    const date = toISODate(addDays(today, -offset));
    points.push({ date, sessionCount: countsByDate.get(date) ?? 0 });
  }
  return points;
}

/**
 * Start (Monday) of the calendar week containing `date`, explicit rather
 * than relying on locale-dependent week-start assumptions.
 */
export function startOfWeek(date: Date): Date {
  const day = date.getDay(); // 0 = Sunday, 1 = Monday, ...
  const daysSinceMonday = (day + 6) % 7;
  return addDays(date, -daysSinceMonday);
}

export function calculateWeeklyProgress(
  entries: DatedEntry[],
  targetSessions: number,
  todayIso: string = todayISODate()
): WeeklyProgress {
  const weekStart = toISODate(startOfWeek(new Date(`${todayIso}T00:00:00`)));
  const weekEnd = toISODate(addDays(startOfWeek(new Date(`${todayIso}T00:00:00`)), 6));

  const current = entries.filter((e) => e.date >= weekStart && e.date <= weekEnd).length;
  const target = Math.max(targetSessions, 0);
  const percent = target === 0 ? 0 : Math.min(current / target, 1);

  return { current, target, percent };
}

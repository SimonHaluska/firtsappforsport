import { useMemo } from 'react';
import { addDays, toISODate } from '../lib/date';
import type { GoalProximityPoint, Sport } from '../types/models';
import { useMatchData } from './useMatchData';
import { useTrainingData } from './useTrainingData';

/**
 * `goal_proximity` history for one sport, oldest first — ready to feed a
 * trend chart or the AI mentor context builder (see lib/goalProximityContext).
 */
export function useGoalProximityTrend(sport: Sport, rangeInDays: number): GoalProximityPoint[] {
  const { entries: trainings } = useTrainingData();
  const { entries: matches } = useMatchData();

  return useMemo(() => {
    const cutoff = toISODate(addDays(new Date(), -(rangeInDays - 1)));
    return [...trainings, ...matches]
      .filter((e) => e.sport === sport && e.date >= cutoff)
      .map((e) => ({ date: e.date, value: e.goalProximity }))
      .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  }, [trainings, matches, sport, rangeInDays]);
}

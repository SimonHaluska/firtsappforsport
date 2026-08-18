import { fetchTrainings } from '../api/training';
import type { GoalProximityPoint, Sport, TrainingEntry } from '../types/models';

export type GoalProximityTrendDirection = 'increasing' | 'decreasing' | 'stable';

export interface GoalProximityContext {
  recent: GoalProximityPoint[];
  trend: GoalProximityTrendDirection;
  intensityCorrelation: number | null;
  energyAfterCorrelation: number | null;
  summary: string;
}

/** Diff of the oldest vs. newest point in the window — simple by design. */
export function calculateGoalProximityTrend(points: GoalProximityPoint[]): GoalProximityTrendDirection {
  if (points.length < 2) return 'stable';
  const diff = points[points.length - 1].value - points[0].value;
  if (diff > 0) return 'increasing';
  if (diff < 0) return 'decreasing';
  return 'stable';
}

function pearsonCorrelation(xs: number[], ys: number[]): number | null {
  const n = xs.length;
  if (n < 3) return null; // too few points for a meaningful correlation

  const meanX = xs.reduce((sum, x) => sum + x, 0) / n;
  const meanY = ys.reduce((sum, y) => sum + y, 0) / n;

  let covariance = 0;
  let varianceX = 0;
  let varianceY = 0;
  for (let i = 0; i < n; i += 1) {
    const dx = xs[i] - meanX;
    const dy = ys[i] - meanY;
    covariance += dx * dy;
    varianceX += dx * dx;
    varianceY += dy * dy;
  }

  if (varianceX === 0 || varianceY === 0) return null;
  return covariance / Math.sqrt(varianceX * varianceY);
}

function correlateGoalProximityWith(
  trainings: TrainingEntry[],
  field: 'intensity' | 'energyAfter'
): number | null {
  const pairs = trainings
    .map((t) => ({ x: t.goalProximity as number, y: t[field] }))
    .filter((p): p is { x: number; y: number } => typeof p.y === 'number');
  if (pairs.length < 3) return null;
  return pearsonCorrelation(
    pairs.map((p) => p.x),
    pairs.map((p) => p.y)
  );
}

function describeCorrelation(label: string, correlation: number | null): string | null {
  if (correlation === null) return null;
  if (Math.abs(correlation) < 0.3) return null; // too weak to be worth mentioning
  const direction = correlation > 0 ? 'higher' : 'lower';
  return `Low goal_proximity days tend to come with ${direction} ${label} (r=${correlation.toFixed(2)}).`;
}

function buildSummary(
  recent: GoalProximityPoint[],
  trend: GoalProximityTrendDirection,
  intensityCorrelation: number | null,
  energyAfterCorrelation: number | null
): string {
  if (recent.length === 0) return 'No goal_proximity data logged yet for this sport.';

  const recentList = recent.map((p) => `${p.date}: ${p.value}%`).join(', ');
  const lines = [
    `Recent goal_proximity: ${recentList}.`,
    `Trend: ${trend}.`,
    describeCorrelation('training intensity', intensityCorrelation),
    describeCorrelation('post-training energy', energyAfterCorrelation),
  ].filter((line): line is string => line !== null);

  return lines.join(' ');
}

/**
 * Structured goal_proximity context for one player/sport — recent values,
 * trend direction, and correlation with intensity/energyAfter.
 *
 * TODO: once the AI mentor chat feature is built (Anthropic API integration
 * in src/screens/main/ChatScreen.tsx), call this and inject `summary` into
 * the mentor's system prompt alongside the rest of the player's context.
 */
export async function buildGoalProximityContext(userId: string, sport: Sport): Promise<GoalProximityContext> {
  const trainings = (await fetchTrainings(userId)).filter((t) => t.sport === sport);

  // fetchTrainings returns newest-first; take the 5 most recent, then
  // reverse to oldest-first for trend/correlation and display.
  const recent = trainings
    .slice(0, 5)
    .map((t) => ({ date: t.date, value: t.goalProximity }))
    .reverse();

  const trend = calculateGoalProximityTrend(recent);
  const intensityCorrelation = correlateGoalProximityWith(trainings, 'intensity');
  const energyAfterCorrelation = correlateGoalProximityWith(trainings, 'energyAfter');
  const summary = buildSummary(recent, trend, intensityCorrelation, energyAfterCorrelation);

  return { recent, trend, intensityCorrelation, energyAfterCorrelation, summary };
}

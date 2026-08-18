import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';
import type { GoalProximity, MatchEntry } from '../types/models';

type MatchRow = Database['public']['Tables']['matches']['Row'];

function mapRow(row: MatchRow): MatchEntry {
  const base = {
    id: row.id,
    date: row.date,
    type: 'match' as const,
    opponent: row.opponent,
    result: row.result,
    goalProximity: row.goal_proximity as GoalProximity,
    goals: row.goals ?? undefined,
    assists: row.assists ?? undefined,
    shots: row.shots ?? undefined,
    position: row.position ?? undefined,
    notes: row.notes ?? undefined,
  };

  if (row.sport === 'football') {
    return {
      ...base,
      sport: 'football',
      minutesPlayed: row.minutes_played ?? 0,
      yellowCards: row.yellow_cards ?? undefined,
      redCards: row.red_cards ?? undefined,
    };
  }
  return {
    ...base,
    sport: 'hockey',
    iceTime: row.ice_time ?? 0,
    penaltyMinutes: row.penalty_minutes ?? undefined,
    plusMinus: row.plus_minus ?? undefined,
  };
}

export async function fetchMatches(userId: string): Promise<MatchEntry[]> {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export async function fetchMatchesByDateRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<MatchEntry[]> {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export type MatchInput = MatchEntry extends infer E
  ? E extends { id: string; type: 'match' }
    ? Omit<E, 'id' | 'type'>
    : never
  : never;

// Partial<Union> collapses to only the keys common across all union members,
// silently dropping sport-specific fields (minutesPlayed, iceTime, ...).
// This distributes Partial over each member instead, so those fields stay
// updatable.
type DistributivePartial<T> = T extends unknown ? Partial<T> : never;
export type MatchUpdateInput = DistributivePartial<MatchInput>;

export async function addMatch(params: MatchInput & { userId: string }): Promise<MatchEntry> {
  const { data, error } = await supabase
    .from('matches')
    .insert({
      user_id: params.userId,
      date: params.date,
      sport: params.sport,
      opponent: params.opponent.trim(),
      result: params.result.trim(),
      minutes_played: params.sport === 'football' ? params.minutesPlayed : null,
      ice_time: params.sport === 'hockey' ? params.iceTime : null,
      goal_proximity: params.goalProximity,
      goals: params.goals ?? null,
      assists: params.assists ?? null,
      shots: params.shots ?? null,
      position: params.position?.trim() ? params.position.trim() : null,
      yellow_cards: params.sport === 'football' ? (params.yellowCards ?? null) : null,
      red_cards: params.sport === 'football' ? (params.redCards ?? null) : null,
      penalty_minutes: params.sport === 'hockey' ? (params.penaltyMinutes ?? null) : null,
      plus_minus: params.sport === 'hockey' ? (params.plusMinus ?? null) : null,
      notes: params.notes?.trim() ? params.notes.trim() : null,
    })
    .select()
    .single();
  if (error) throw error;
  return mapRow(data);
}

export async function updateMatch(id: string, params: MatchUpdateInput): Promise<MatchEntry> {
  const { data, error } = await supabase
    .from('matches')
    .update({
      ...(params.date !== undefined ? { date: params.date } : {}),
      ...(params.sport !== undefined ? { sport: params.sport } : {}),
      ...(params.opponent !== undefined ? { opponent: params.opponent.trim() } : {}),
      ...(params.result !== undefined ? { result: params.result.trim() } : {}),
      ...('minutesPlayed' in params ? { minutes_played: params.minutesPlayed ?? null } : {}),
      ...('iceTime' in params ? { ice_time: params.iceTime ?? null } : {}),
      ...(params.goalProximity !== undefined ? { goal_proximity: params.goalProximity } : {}),
      ...('goals' in params ? { goals: params.goals ?? null } : {}),
      ...('assists' in params ? { assists: params.assists ?? null } : {}),
      ...('shots' in params ? { shots: params.shots ?? null } : {}),
      ...('position' in params
        ? { position: params.position?.trim() ? params.position.trim() : null }
        : {}),
      ...('yellowCards' in params ? { yellow_cards: params.yellowCards ?? null } : {}),
      ...('redCards' in params ? { red_cards: params.redCards ?? null } : {}),
      ...('penaltyMinutes' in params ? { penalty_minutes: params.penaltyMinutes ?? null } : {}),
      ...('plusMinus' in params ? { plus_minus: params.plusMinus ?? null } : {}),
      ...(params.notes !== undefined ? { notes: params.notes.trim() ? params.notes.trim() : null } : {}),
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return mapRow(data);
}

export async function deleteMatch(id: string): Promise<void> {
  const { error } = await supabase.from('matches').delete().eq('id', id);
  if (error) throw error;
}

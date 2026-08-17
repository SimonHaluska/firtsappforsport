import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';
import type { MatchEntry } from '../types/models';

type MatchRow = Database['public']['Tables']['matches']['Row'];

function mapRow(row: MatchRow): MatchEntry {
  return {
    id: row.id,
    date: row.date,
    type: 'match',
    opponent: row.opponent ?? undefined,
    competition: row.competition ?? undefined,
    result: row.result ?? undefined,
    isHome: row.is_home ?? undefined,
    minutesPlayed: row.minutes_played ?? undefined,
    notes: row.notes ?? undefined,
    metrics: row.metrics ?? undefined,
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

export async function addMatch(params: {
  userId: string;
  date: string;
  opponent?: string;
  competition?: string;
  result?: 'win' | 'loss' | 'draw';
  isHome?: boolean;
  minutesPlayed?: number;
  notes?: string;
  metrics?: Record<string, number>;
}): Promise<MatchEntry> {
  const { data, error } = await supabase
    .from('matches')
    .insert({
      user_id: params.userId,
      date: params.date,
      opponent: params.opponent?.trim() ? params.opponent.trim() : null,
      competition: params.competition?.trim() ? params.competition.trim() : null,
      result: params.result ?? null,
      is_home: params.isHome ?? null,
      minutes_played: params.minutesPlayed ?? null,
      notes: params.notes?.trim() ? params.notes.trim() : null,
      metrics: params.metrics && Object.keys(params.metrics).length > 0 ? params.metrics : null,
    })
    .select()
    .single();
  if (error) throw error;
  return mapRow(data);
}

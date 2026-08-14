import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';
import type { LogEntryType, PerformanceLogEntry } from '../types/models';

type WorkoutRow = Database['public']['Tables']['workouts']['Row'];

function mapRow(row: WorkoutRow): PerformanceLogEntry {
  return {
    id: row.id,
    date: row.date,
    type: row.type,
    durationMinutes: row.duration_minutes,
    intensity: row.intensity,
    notes: row.notes ?? undefined,
    metrics: row.metrics ?? undefined,
  };
}

export async function fetchLogEntries(userId: string): Promise<PerformanceLogEntry[]> {
  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export async function addLogEntry(params: {
  userId: string;
  date: string;
  type: LogEntryType;
  durationMinutes: number;
  intensity: 1 | 2 | 3 | 4 | 5;
  notes?: string;
}): Promise<PerformanceLogEntry> {
  const { data, error } = await supabase
    .from('workouts')
    .insert({
      user_id: params.userId,
      date: params.date,
      type: params.type,
      duration_minutes: params.durationMinutes,
      intensity: params.intensity,
      notes: params.notes?.trim() ? params.notes.trim() : null,
    })
    .select()
    .single();
  if (error) throw error;
  return mapRow(data);
}

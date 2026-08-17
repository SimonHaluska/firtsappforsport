import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';
import type { TrainingEntry } from '../types/models';

type TrainingRow = Database['public']['Tables']['trainings']['Row'];

function mapRow(row: TrainingRow): TrainingEntry {
  return {
    id: row.id,
    date: row.date,
    type: 'training',
    durationMinutes: row.duration_minutes,
    intensity: row.intensity,
    mood: row.mood,
    notes: row.notes ?? undefined,
    metrics: row.metrics ?? undefined,
  };
}

export async function fetchTrainings(userId: string): Promise<TrainingEntry[]> {
  const { data, error } = await supabase
    .from('trainings')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export async function addTraining(params: {
  userId: string;
  date: string;
  durationMinutes: number;
  intensity: 1 | 2 | 3 | 4 | 5;
  mood: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  metrics?: Record<string, number>;
}): Promise<TrainingEntry> {
  const { data, error } = await supabase
    .from('trainings')
    .insert({
      user_id: params.userId,
      date: params.date,
      duration_minutes: params.durationMinutes,
      intensity: params.intensity,
      mood: params.mood,
      notes: params.notes?.trim() ? params.notes.trim() : null,
      metrics: params.metrics && Object.keys(params.metrics).length > 0 ? params.metrics : null,
    })
    .select()
    .single();
  if (error) throw error;
  return mapRow(data);
}

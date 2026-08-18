import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';
import type {
  GoalProximity,
  Sport,
  TrainingEntry,
  TrainingTypeFootball,
  TrainingTypeHockey,
} from '../types/models';

type TrainingRow = Database['public']['Tables']['trainings']['Row'];

function mapRow(row: TrainingRow): TrainingEntry {
  const base = {
    id: row.id,
    date: row.date,
    type: 'training' as const,
    durationMinutes: row.duration_minutes,
    intensity: row.intensity,
    goalProximity: row.goal_proximity as GoalProximity,
    energyBefore: row.energy_before ?? undefined,
    energyAfter: row.energy_after ?? undefined,
    notes: row.notes ?? undefined,
  };

  if (row.sport === 'football') {
    return { ...base, sport: 'football', trainingType: row.training_type as TrainingTypeFootball };
  }
  return { ...base, sport: 'hockey', trainingType: row.training_type as TrainingTypeHockey };
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

export async function fetchTrainingsByDateRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<TrainingEntry[]> {
  const { data, error } = await supabase
    .from('trainings')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export interface TrainingInput {
  date: string;
  sport: Sport;
  trainingType: TrainingTypeFootball | TrainingTypeHockey;
  durationMinutes: number;
  intensity: number;
  goalProximity: GoalProximity;
  energyBefore?: number;
  energyAfter?: number;
  notes?: string;
}

export async function addTraining(params: TrainingInput & { userId: string }): Promise<TrainingEntry> {
  const { data, error } = await supabase
    .from('trainings')
    .insert({
      user_id: params.userId,
      date: params.date,
      sport: params.sport,
      training_type: params.trainingType,
      duration_minutes: params.durationMinutes,
      intensity: params.intensity,
      goal_proximity: params.goalProximity,
      energy_before: params.energyBefore ?? null,
      energy_after: params.energyAfter ?? null,
      notes: params.notes?.trim() ? params.notes.trim() : null,
    })
    .select()
    .single();
  if (error) throw error;
  return mapRow(data);
}

export async function updateTraining(id: string, params: Partial<TrainingInput>): Promise<TrainingEntry> {
  const { data, error } = await supabase
    .from('trainings')
    .update({
      ...(params.date !== undefined ? { date: params.date } : {}),
      ...(params.sport !== undefined ? { sport: params.sport } : {}),
      ...(params.trainingType !== undefined ? { training_type: params.trainingType } : {}),
      ...(params.durationMinutes !== undefined ? { duration_minutes: params.durationMinutes } : {}),
      ...(params.intensity !== undefined ? { intensity: params.intensity } : {}),
      ...(params.goalProximity !== undefined ? { goal_proximity: params.goalProximity } : {}),
      ...(params.energyBefore !== undefined ? { energy_before: params.energyBefore } : {}),
      ...(params.energyAfter !== undefined ? { energy_after: params.energyAfter } : {}),
      ...(params.notes !== undefined ? { notes: params.notes.trim() ? params.notes.trim() : null } : {}),
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return mapRow(data);
}

export async function deleteTraining(id: string): Promise<void> {
  const { error } = await supabase.from('trainings').delete().eq('id', id);
  if (error) throw error;
}

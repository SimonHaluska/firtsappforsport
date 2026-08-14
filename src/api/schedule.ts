import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';
import type { ScheduleEntry, ScheduleEntryType } from '../types/models';

type ScheduleRow = Database['public']['Tables']['schedule']['Row'];

function mapRow(row: ScheduleRow): ScheduleEntry {
  return {
    id: row.id,
    date: row.date,
    type: row.type,
    title: row.title,
    notes: row.notes ?? undefined,
  };
}

export async function fetchSchedule(userId: string): Promise<ScheduleEntry[]> {
  const { data, error } = await supabase
    .from('schedule')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export async function setScheduleDay(params: {
  userId: string;
  date: string;
  type: ScheduleEntryType;
  title: string;
}): Promise<ScheduleEntry> {
  const { data, error } = await supabase
    .from('schedule')
    .upsert(
      {
        user_id: params.userId,
        date: params.date,
        type: params.type,
        title: params.title,
      },
      { onConflict: 'user_id,date' }
    )
    .select()
    .single();
  if (error) throw error;
  return mapRow(data);
}

export async function clearScheduleDay(id: string): Promise<void> {
  const { error } = await supabase.from('schedule').delete().eq('id', id);
  if (error) throw error;
}

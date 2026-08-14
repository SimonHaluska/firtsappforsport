import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';
import type { PlayerProfile } from '../types/models';

type UserRow = Database['public']['Tables']['users']['Row'];

function mapRow(row: UserRow): PlayerProfile {
  return {
    id: row.id,
    name: row.name,
    age: row.age,
    sport: row.sport,
    goal: row.goal,
    mentorName: row.mentor_name,
    onboardingComplete: row.onboarding_complete,
  };
}

export async function fetchProfile(userId: string): Promise<PlayerProfile | null> {
  const { data, error } = await supabase.from('users').select('*').eq('id', userId).maybeSingle();
  if (error) throw error;
  return data ? mapRow(data) : null;
}

export async function upsertProfile(params: {
  id: string;
  name: string;
  age: number;
  sport: PlayerProfile['sport'];
  goal: PlayerProfile['goal'];
  mentorName: string;
}): Promise<PlayerProfile> {
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id: params.id,
      name: params.name,
      age: params.age,
      sport: params.sport,
      goal: params.goal,
      mentor_name: params.mentorName,
      onboarding_complete: true,
    })
    .select()
    .single();
  if (error) throw error;
  return mapRow(data);
}

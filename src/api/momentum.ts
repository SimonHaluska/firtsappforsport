import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';
import type { UserMomentum } from '../types/models';

type MomentumRow = Database['public']['Tables']['user_momentum']['Row'];

function mapRow(row: MomentumRow): UserMomentum {
  return {
    currentStreakWeeks: row.current_streak_weeks,
    longestStreakWeeks: row.longest_streak_weeks,
    momentumStatus: row.momentum_status,
    currentWeekSessionCount: row.current_week_session_count,
    currentWeekIsActive: row.current_week_is_active,
    lastCalculatedAt: row.last_calculated_at,
  };
}

// No create/update here — user_momentum is only ever written by the
// recalculate_user_momentum DB trigger (see supabase/migrations/0007).
export async function fetchMomentum(userId: string): Promise<UserMomentum | null> {
  const { data, error } = await supabase
    .from('user_momentum')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data ? mapRow(data) : null;
}

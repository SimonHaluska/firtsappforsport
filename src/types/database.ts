// Hand-written to match supabase/schema.sql. Once the project is linked to a
// real Supabase project, regenerate with:
//   npx supabase gen types typescript --linked > src/types/database.ts
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          age: number;
          sport: 'football' | 'hockey';
          goal:
            | 'improve_speed'
            | 'build_strength'
            | 'improve_technique'
            | 'increase_endurance'
            | 'prepare_for_season'
            | 'recover_from_injury';
          mentor_name: string;
          onboarding_complete: boolean;
          weekly_target_sessions: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          age: number;
          sport: 'football' | 'hockey';
          goal:
            | 'improve_speed'
            | 'build_strength'
            | 'improve_technique'
            | 'increase_endurance'
            | 'prepare_for_season'
            | 'recover_from_injury';
          mentor_name: string;
          onboarding_complete?: boolean;
          weekly_target_sessions?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
        Relationships: [];
      };
      schedule: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          type: 'training' | 'match' | 'recovery' | 'rest';
          title: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          type: 'training' | 'match' | 'recovery' | 'rest';
          title: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['schedule']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'schedule_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      trainings: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          sport: 'football' | 'hockey';
          training_type: string;
          duration_minutes: number;
          intensity: number;
          goal_proximity: 0 | 25 | 50 | 75 | 100;
          energy_before: number | null;
          energy_after: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          sport: 'football' | 'hockey';
          training_type: string;
          duration_minutes: number;
          intensity: number;
          goal_proximity: 0 | 25 | 50 | 75 | 100;
          energy_before?: number | null;
          energy_after?: number | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['trainings']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'trainings_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      matches: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          sport: 'football' | 'hockey';
          opponent: string;
          result: string;
          minutes_played: number | null;
          ice_time: number | null;
          goal_proximity: 0 | 25 | 50 | 75 | 100;
          goals: number | null;
          assists: number | null;
          shots: number | null;
          position: string | null;
          yellow_cards: number | null;
          red_cards: number | null;
          penalty_minutes: number | null;
          plus_minus: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          sport: 'football' | 'hockey';
          opponent: string;
          result: string;
          minutes_played?: number | null;
          ice_time?: number | null;
          goal_proximity: 0 | 25 | 50 | 75 | 100;
          goals?: number | null;
          assists?: number | null;
          shots?: number | null;
          position?: string | null;
          yellow_cards?: number | null;
          red_cards?: number | null;
          penalty_minutes?: number | null;
          plus_minus?: number | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['matches']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'matches_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      user_momentum: {
        Row: {
          user_id: string;
          current_streak_weeks: number;
          longest_streak_weeks: number;
          momentum_status: 'rising' | 'stable' | 'declining' | null;
          current_week_session_count: number;
          current_week_is_active: boolean;
          last_calculated_at: string;
        };
        Insert: {
          user_id: string;
          current_streak_weeks?: number;
          longest_streak_weeks?: number;
          momentum_status?: 'rising' | 'stable' | 'declining' | null;
          current_week_session_count?: number;
          current_week_is_active?: boolean;
          last_calculated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['user_momentum']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'user_momentum_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      chat_messages: {
        Row: {
          id: string;
          user_id: string;
          role: 'user' | 'mentor';
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: 'user' | 'mentor';
          content: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['chat_messages']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'chat_messages_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}

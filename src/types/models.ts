export type Sport = 'football' | 'hockey';

export type Goal =
  | 'improve_speed'
  | 'build_strength'
  | 'improve_technique'
  | 'increase_endurance'
  | 'prepare_for_season'
  | 'recover_from_injury';

export interface PlayerProfile {
  id: string;
  name: string;
  age: number;
  sport: Sport;
  goal: Goal;
  mentorName: string;
  onboardingComplete: boolean;
  weeklyTargetSessions: number;
}

export type ScheduleEntryType = 'training' | 'match' | 'recovery' | 'rest';

export interface ScheduleEntry {
  id: string;
  date: string; // ISO date, YYYY-MM-DD
  type: ScheduleEntryType;
  title: string;
  notes?: string;
}

export interface TrainingEntry {
  id: string;
  date: string; // ISO date, YYYY-MM-DD
  type: 'training';
  durationMinutes: number;
  intensity: 1 | 2 | 3 | 4 | 5;
  mood: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  metrics?: Record<string, number>;
}

export interface MatchEntry {
  id: string;
  date: string; // ISO date, YYYY-MM-DD
  type: 'match';
  opponent?: string;
  competition?: string;
  result?: 'win' | 'loss' | 'draw';
  isHome?: boolean;
  minutesPlayed?: number;
  notes?: string;
  metrics?: Record<string, number>;
}

export type ActivityEntry = TrainingEntry | MatchEntry;

export type StatsRangeDays = 7 | 30;

export interface ConsistencyPoint {
  date: string; // ISO date, YYYY-MM-DD
  sessionCount: number;
}

export interface WeeklyProgress {
  current: number;
  target: number;
  percent: number; // 0-1, clamped
}

export type ChatRole = 'user' | 'mentor';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
}

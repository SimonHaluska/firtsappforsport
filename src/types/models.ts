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

export type TrainingTypeFootball =
  | 'technika'
  | 'strelba'
  | 'kondicia'
  | 'sila'
  | 'taktika'
  | 'regeneracia'
  | 'individualny_trening'
  | 'timovy_trening';

export type TrainingTypeHockey =
  | 'korculovanie'
  | 'strelba'
  | 'technika'
  | 'sila'
  | 'kondicia'
  | 'regeneracia'
  | 'individualny_trening'
  | 'timovy_trening';

// 5 discrete steps by design — never a continuous slider. See GoalProximitySelector.
export type GoalProximity = 0 | 25 | 50 | 75 | 100;

export interface GoalProximityPoint {
  date: string; // ISO date, YYYY-MM-DD
  value: GoalProximity;
}

interface TrainingEntryBase {
  id: string;
  date: string; // ISO date, YYYY-MM-DD
  type: 'training';
  durationMinutes: number;
  intensity: number; // 1-10
  goalProximity: GoalProximity;
  energyBefore?: number; // 1-10
  energyAfter?: number; // 1-10
  notes?: string;
}

export interface FootballTrainingEntry extends TrainingEntryBase {
  sport: 'football';
  trainingType: TrainingTypeFootball;
}

export interface HockeyTrainingEntry extends TrainingEntryBase {
  sport: 'hockey';
  trainingType: TrainingTypeHockey;
}

export type TrainingEntry = FootballTrainingEntry | HockeyTrainingEntry;

interface MatchEntryBase {
  id: string;
  date: string; // ISO date, YYYY-MM-DD
  type: 'match';
  opponent: string;
  result: string; // e.g. "2:1"
  goalProximity: GoalProximity;
  goals?: number;
  assists?: number;
  shots?: number;
  position?: string;
  notes?: string;
}

export interface FootballMatchEntry extends MatchEntryBase {
  sport: 'football';
  minutesPlayed: number;
  yellowCards?: number;
  redCards?: number;
}

export interface HockeyMatchEntry extends MatchEntryBase {
  sport: 'hockey';
  iceTime: number; // minutes
  penaltyMinutes?: number;
  plusMinus?: number;
}

export type MatchEntry = FootballMatchEntry | HockeyMatchEntry;

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

export type MomentumStatus = 'rising' | 'stable' | 'declining';

export interface UserMomentum {
  currentStreakWeeks: number;
  longestStreakWeeks: number;
  momentumStatus: MomentumStatus | null; // null = not enough history yet
  currentWeekSessionCount: number;
  currentWeekIsActive: boolean;
  lastCalculatedAt: string;
}

export type ChatRole = 'user' | 'mentor';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
}

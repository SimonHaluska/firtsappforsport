import { scheduleColors } from '../theme';
import type { ScheduleEntryType } from '../types/models';

export const SCHEDULE_TYPE_LABEL: Record<ScheduleEntryType, string> = {
  training: 'Training Day',
  match: 'Match Day',
  recovery: 'Recovery Day',
  rest: 'Rest Day',
};

// Schedule accent colors are the same in both themes (see theme/tokens.js).
export const SCHEDULE_TYPE_COLOR: Record<ScheduleEntryType, string> = {
  training: scheduleColors.training,
  match: scheduleColors.match,
  recovery: scheduleColors.recovery,
  rest: scheduleColors.rest,
};

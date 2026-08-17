import type { Sport } from '../types/models';

export interface MetricField {
  key: string;
  label: string;
}

export const TRAINING_METRIC_TEMPLATES: Record<Sport, MetricField[]> = {
  football: [
    { key: 'shots_on_target', label: 'Shots on Target' },
    { key: 'sprints', label: 'Sprints' },
  ],
  hockey: [
    { key: 'shots_on_goal', label: 'Shots on Goal' },
    { key: 'faceoffs_won', label: 'Faceoffs Won' },
  ],
};

export const MATCH_METRIC_TEMPLATES: Record<Sport, MetricField[]> = {
  football: [
    { key: 'goals', label: 'Goals' },
    { key: 'assists', label: 'Assists' },
  ],
  hockey: [
    { key: 'goals', label: 'Goals' },
    { key: 'assists', label: 'Assists' },
    { key: 'saves', label: 'Saves' },
  ],
};

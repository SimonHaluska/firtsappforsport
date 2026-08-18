import type { Sport, TrainingTypeFootball, TrainingTypeHockey } from '../types/models';

interface TrainingTypeOption<T extends string> {
  value: T;
  label: string;
}

export const FOOTBALL_TRAINING_TYPE_OPTIONS: TrainingTypeOption<TrainingTypeFootball>[] = [
  { value: 'technika', label: 'Technika' },
  { value: 'strelba', label: 'Strelba' },
  { value: 'kondicia', label: 'Kondícia' },
  { value: 'sila', label: 'Sila' },
  { value: 'taktika', label: 'Taktika' },
  { value: 'regeneracia', label: 'Regenerácia' },
  { value: 'individualny_trening', label: 'Individuálny tréning' },
  { value: 'timovy_trening', label: 'Tímový tréning' },
];

export const HOCKEY_TRAINING_TYPE_OPTIONS: TrainingTypeOption<TrainingTypeHockey>[] = [
  { value: 'korculovanie', label: 'Korčuľovanie' },
  { value: 'strelba', label: 'Strelba' },
  { value: 'technika', label: 'Technika' },
  { value: 'sila', label: 'Sila' },
  { value: 'kondicia', label: 'Kondícia' },
  { value: 'regeneracia', label: 'Regenerácia' },
  { value: 'individualny_trening', label: 'Individuálny tréning' },
  { value: 'timovy_trening', label: 'Tímový tréning' },
];

export const TRAINING_TYPE_OPTIONS: Record<
  Sport,
  TrainingTypeOption<TrainingTypeFootball>[] | TrainingTypeOption<TrainingTypeHockey>[]
> = {
  football: FOOTBALL_TRAINING_TYPE_OPTIONS,
  hockey: HOCKEY_TRAINING_TYPE_OPTIONS,
};

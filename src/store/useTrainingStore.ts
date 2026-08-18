import { create } from 'zustand';
import type { TrainingEntry } from '../types/models';

interface TrainingState {
  entries: TrainingEntry[];
  isLoading: boolean;
  setEntries: (entries: TrainingEntry[]) => void;
  upsertEntry: (entry: TrainingEntry) => void;
  removeEntry: (id: string) => void;
  setLoading: (value: boolean) => void;
}

export const useTrainingStore = create<TrainingState>((set) => ({
  entries: [],
  isLoading: false,
  setEntries: (entries) => set({ entries }),
  upsertEntry: (entry) =>
    set((state) => {
      const exists = state.entries.some((e) => e.id === entry.id);
      return {
        entries: exists ? state.entries.map((e) => (e.id === entry.id ? entry : e)) : [entry, ...state.entries],
      };
    }),
  removeEntry: (id) =>
    set((state) => ({ entries: state.entries.filter((e) => e.id !== id) })),
  setLoading: (isLoading) => set({ isLoading }),
}));

import { create } from 'zustand';
import type { ScheduleEntry } from '../types/models';

interface ScheduleState {
  entries: ScheduleEntry[];
  isLoading: boolean;
  setEntries: (entries: ScheduleEntry[]) => void;
  upsertEntry: (entry: ScheduleEntry) => void;
  removeEntry: (id: string) => void;
  setLoading: (value: boolean) => void;
}

export const useScheduleStore = create<ScheduleState>((set) => ({
  entries: [],
  isLoading: false,
  setEntries: (entries) => set({ entries }),
  upsertEntry: (entry) =>
    set((state) => {
      const exists = state.entries.some((e) => e.id === entry.id);
      return {
        entries: exists
          ? state.entries.map((e) => (e.id === entry.id ? entry : e))
          : [...state.entries, entry],
      };
    }),
  removeEntry: (id) =>
    set((state) => ({ entries: state.entries.filter((e) => e.id !== id) })),
  setLoading: (isLoading) => set({ isLoading }),
}));

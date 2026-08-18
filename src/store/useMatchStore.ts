import { create } from 'zustand';
import type { MatchEntry } from '../types/models';

interface MatchState {
  entries: MatchEntry[];
  isLoading: boolean;
  setEntries: (entries: MatchEntry[]) => void;
  upsertEntry: (entry: MatchEntry) => void;
  removeEntry: (id: string) => void;
  setLoading: (value: boolean) => void;
}

export const useMatchStore = create<MatchState>((set) => ({
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

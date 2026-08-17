import { create } from 'zustand';
import type { MatchEntry } from '../types/models';

interface MatchState {
  entries: MatchEntry[];
  isLoading: boolean;
  setEntries: (entries: MatchEntry[]) => void;
  addEntry: (entry: MatchEntry) => void;
  removeEntry: (id: string) => void;
  setLoading: (value: boolean) => void;
}

export const useMatchStore = create<MatchState>((set) => ({
  entries: [],
  isLoading: false,
  setEntries: (entries) => set({ entries }),
  addEntry: (entry) => set((state) => ({ entries: [entry, ...state.entries] })),
  removeEntry: (id) =>
    set((state) => ({ entries: state.entries.filter((e) => e.id !== id) })),
  setLoading: (isLoading) => set({ isLoading }),
}));

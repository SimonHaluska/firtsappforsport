import { create } from 'zustand';
import type { PerformanceLogEntry } from '../types/models';

interface LogState {
  entries: PerformanceLogEntry[];
  isLoading: boolean;
  setEntries: (entries: PerformanceLogEntry[]) => void;
  addEntry: (entry: PerformanceLogEntry) => void;
  removeEntry: (id: string) => void;
  setLoading: (value: boolean) => void;
}

export const useLogStore = create<LogState>((set) => ({
  entries: [],
  isLoading: false,
  setEntries: (entries) => set({ entries }),
  addEntry: (entry) => set((state) => ({ entries: [entry, ...state.entries] })),
  removeEntry: (id) =>
    set((state) => ({ entries: state.entries.filter((e) => e.id !== id) })),
  setLoading: (isLoading) => set({ isLoading }),
}));

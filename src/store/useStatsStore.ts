import { create } from 'zustand';
import type { StatsRangeDays } from '../types/models';

interface StatsState {
  rangeDays: StatsRangeDays;
  setRangeDays: (value: StatsRangeDays) => void;
}

export const useStatsStore = create<StatsState>((set) => ({
  rangeDays: 7,
  setRangeDays: (rangeDays) => set({ rangeDays }),
}));

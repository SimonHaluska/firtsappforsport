import { create } from 'zustand';
import type { UserMomentum } from '../types/models';

interface MomentumState {
  momentum: UserMomentum | null;
  isLoading: boolean;
  setMomentum: (momentum: UserMomentum | null) => void;
  setLoading: (value: boolean) => void;
}

export const useMomentumStore = create<MomentumState>((set) => ({
  momentum: null,
  isLoading: false,
  setMomentum: (momentum) => set({ momentum }),
  setLoading: (isLoading) => set({ isLoading }),
}));

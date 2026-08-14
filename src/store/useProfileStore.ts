import { create } from 'zustand';
import type { PlayerProfile } from '../types/models';

type ProfileDraft = Partial<Omit<PlayerProfile, 'id' | 'onboardingComplete'>>;

interface ProfileState {
  profile: PlayerProfile | null;
  draft: ProfileDraft;
  updateDraft: (patch: ProfileDraft) => void;
  resetDraft: () => void;
  setProfile: (profile: PlayerProfile | null) => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  draft: {},
  updateDraft: (patch) => set((state) => ({ draft: { ...state.draft, ...patch } })),
  resetDraft: () => set({ draft: {} }),
  setProfile: (profile) => set({ profile }),
}));

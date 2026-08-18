import { useCallback, useEffect, useState } from 'react';
import { fetchMomentum } from '../api/momentum';
import { useMomentumStore } from '../store';
import { useUserId } from './useUserId';

/**
 * Standalone refetch (no React state), for callers outside a component tree
 * — e.g. useTrainingData/useMatchData call this right after a successful
 * write so the momentum card doesn't show stale data. Safe to call without
 * a delay: recalculate_user_momentum runs as an AFTER trigger in the same
 * transaction as the training/match insert, so by the time that insert's
 * response comes back, user_momentum is already up to date.
 *
 * TODO: for momentum changes made on another device (not this session's
 * writes), a Supabase Realtime subscription on user_momentum would be the
 * cleaner fix — the app doesn't use Realtime anywhere yet, so that's a
 * separate, larger addition left for later.
 */
export async function refetchMomentum(userId: string): Promise<void> {
  const { setMomentum, setLoading } = useMomentumStore.getState();
  setLoading(true);
  try {
    setMomentum(await fetchMomentum(userId));
  } finally {
    setLoading(false);
  }
}

export function useMomentumData() {
  const userId = useUserId();
  const momentum = useMomentumStore((s) => s.momentum);
  const isLoading = useMomentumStore((s) => s.isLoading);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!userId) return;
    setError(null);
    try {
      await refetchMomentum(userId);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load momentum');
    }
  }, [userId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { momentum, isLoading, error, refetch };
}

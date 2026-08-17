import { useCallback, useEffect, useState } from 'react';
import { fetchMatches } from '../api/match';
import { useMatchStore } from '../store';
import { useUserId } from './useUserId';

export function useMatchData() {
  const userId = useUserId();
  const entries = useMatchStore((s) => s.entries);
  const isLoading = useMatchStore((s) => s.isLoading);
  const setEntries = useMatchStore((s) => s.setEntries);
  const setLoading = useMatchStore((s) => s.setLoading);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      setEntries(await fetchMatches(userId));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load matches');
    } finally {
      setLoading(false);
    }
  }, [userId, setEntries, setLoading]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { entries, isLoading, error, refetch };
}

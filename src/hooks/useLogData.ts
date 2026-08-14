import { useCallback, useEffect, useState } from 'react';
import { fetchLogEntries } from '../api/log';
import { useLogStore } from '../store';
import { useUserId } from './useUserId';

export function useLogData() {
  const userId = useUserId();
  const entries = useLogStore((s) => s.entries);
  const isLoading = useLogStore((s) => s.isLoading);
  const setEntries = useLogStore((s) => s.setEntries);
  const setLoading = useLogStore((s) => s.setLoading);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      setEntries(await fetchLogEntries(userId));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load log entries');
    } finally {
      setLoading(false);
    }
  }, [userId, setEntries, setLoading]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { entries, isLoading, error, refetch };
}

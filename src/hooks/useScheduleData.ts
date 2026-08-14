import { useCallback, useEffect, useState } from 'react';
import { fetchSchedule } from '../api/schedule';
import { useScheduleStore } from '../store';
import { useUserId } from './useUserId';

export function useScheduleData() {
  const userId = useUserId();
  const entries = useScheduleStore((s) => s.entries);
  const isLoading = useScheduleStore((s) => s.isLoading);
  const setEntries = useScheduleStore((s) => s.setEntries);
  const setLoading = useScheduleStore((s) => s.setLoading);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      setEntries(await fetchSchedule(userId));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load schedule');
    } finally {
      setLoading(false);
    }
  }, [userId, setEntries, setLoading]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { entries, isLoading, error, refetch };
}

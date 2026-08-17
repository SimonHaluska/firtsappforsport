import { useCallback, useEffect, useState } from 'react';
import { fetchTrainings } from '../api/training';
import { useTrainingStore } from '../store';
import { useUserId } from './useUserId';

export function useTrainingData() {
  const userId = useUserId();
  const entries = useTrainingStore((s) => s.entries);
  const isLoading = useTrainingStore((s) => s.isLoading);
  const setEntries = useTrainingStore((s) => s.setEntries);
  const setLoading = useTrainingStore((s) => s.setLoading);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      setEntries(await fetchTrainings(userId));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load trainings');
    } finally {
      setLoading(false);
    }
  }, [userId, setEntries, setLoading]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { entries, isLoading, error, refetch };
}

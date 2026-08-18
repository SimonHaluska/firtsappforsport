import { useCallback, useEffect, useState } from 'react';
import { addTraining, deleteTraining, fetchTrainings, updateTraining } from '../api/training';
import type { TrainingInput } from '../api/training';
import { useTrainingStore } from '../store';
import type { TrainingEntry } from '../types/models';
import { useUserId } from './useUserId';

export function useTrainingData() {
  const userId = useUserId();
  const entries = useTrainingStore((s) => s.entries);
  const isLoading = useTrainingStore((s) => s.isLoading);
  const setEntries = useTrainingStore((s) => s.setEntries);
  const upsertEntry = useTrainingStore((s) => s.upsertEntry);
  const removeEntryFromStore = useTrainingStore((s) => s.removeEntry);
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

  const create = useCallback(
    async (params: TrainingInput): Promise<TrainingEntry> => {
      if (!userId) throw new Error('Not authenticated');
      const entry = await addTraining({ ...params, userId });
      upsertEntry(entry);
      return entry;
    },
    [userId, upsertEntry]
  );

  const update = useCallback(
    async (id: string, params: Partial<TrainingInput>): Promise<TrainingEntry> => {
      const entry = await updateTraining(id, params);
      upsertEntry(entry);
      return entry;
    },
    [upsertEntry]
  );

  const remove = useCallback(
    async (id: string) => {
      const previous = entries;
      removeEntryFromStore(id);
      try {
        await deleteTraining(id);
      } catch (e) {
        setEntries(previous);
        throw e;
      }
    },
    [entries, removeEntryFromStore, setEntries]
  );

  return { entries, isLoading, error, refetch, create, update, remove };
}

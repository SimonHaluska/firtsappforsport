import { useCallback, useEffect, useState } from 'react';
import { addTraining, deleteTraining, fetchTrainings, updateTraining } from '../api/training';
import type { TrainingInput } from '../api/training';
import { useTrainingStore } from '../store';
import type { TrainingEntry } from '../types/models';
import { refetchMomentum } from './useMomentumData';
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
      // recalculate_user_momentum runs in the same DB transaction as the
      // insert above, so the aggregate is already fresh — just re-pull it.
      // Best-effort: a failed momentum refresh shouldn't fail the save.
      refetchMomentum(userId).catch(() => {});
      return entry;
    },
    [userId, upsertEntry]
  );

  const update = useCallback(
    async (id: string, params: Partial<TrainingInput>): Promise<TrainingEntry> => {
      const entry = await updateTraining(id, params);
      upsertEntry(entry);
      if (userId) refetchMomentum(userId).catch(() => {});
      return entry;
    },
    [userId, upsertEntry]
  );

  const remove = useCallback(
    async (id: string) => {
      const previous = entries;
      removeEntryFromStore(id);
      try {
        await deleteTraining(id);
        if (userId) refetchMomentum(userId).catch(() => {});
      } catch (e) {
        setEntries(previous);
        throw e;
      }
    },
    [userId, entries, removeEntryFromStore, setEntries]
  );

  return { entries, isLoading, error, refetch, create, update, remove };
}

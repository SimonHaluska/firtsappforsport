import { useCallback, useEffect, useState } from 'react';
import { addMatch, deleteMatch, fetchMatches, updateMatch } from '../api/match';
import type { MatchInput, MatchUpdateInput } from '../api/match';
import { useMatchStore } from '../store';
import type { MatchEntry } from '../types/models';
import { refetchMomentum } from './useMomentumData';
import { useUserId } from './useUserId';

export function useMatchData() {
  const userId = useUserId();
  const entries = useMatchStore((s) => s.entries);
  const isLoading = useMatchStore((s) => s.isLoading);
  const setEntries = useMatchStore((s) => s.setEntries);
  const upsertEntry = useMatchStore((s) => s.upsertEntry);
  const removeEntryFromStore = useMatchStore((s) => s.removeEntry);
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

  const create = useCallback(
    async (params: MatchInput): Promise<MatchEntry> => {
      if (!userId) throw new Error('Not authenticated');
      const entry = await addMatch({ ...params, userId });
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
    async (id: string, params: MatchUpdateInput): Promise<MatchEntry> => {
      const entry = await updateMatch(id, params);
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
        await deleteMatch(id);
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

import { useMemo, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { MatchForm } from '../../components/MatchForm';
import { Screen } from '../../components/Screen';
import { SegmentedControl } from '../../components/SegmentedControl';
import type { SegmentedControlOption } from '../../components/SegmentedControl';
import { TrainingForm } from '../../components/TrainingForm';
import { useMatchData } from '../../hooks/useMatchData';
import { useTrainingData } from '../../hooks/useTrainingData';
import { useUserId } from '../../hooks/useUserId';
import { formatRelativeDate } from '../../lib/date';
import { useMatchStore, useProfileStore, useTrainingStore } from '../../store';
import type { ActivityEntry } from '../../types/models';

type OpenForm = 'training' | 'match';

const LOG_FORM_OPTIONS: SegmentedControlOption<OpenForm>[] = [
  { value: 'training', label: 'Log Training' },
  { value: 'match', label: 'Log Match' },
];

export default function LogScreen() {
  const userId = useUserId();
  const sport = useProfileStore((s) => s.profile?.sport);
  const { entries: trainings, isLoading: isLoadingTrainings } = useTrainingData();
  const { entries: matches, isLoading: isLoadingMatches } = useMatchData();
  const upsertTrainingEntry = useTrainingStore((s) => s.upsertEntry);
  const upsertMatchEntry = useMatchStore((s) => s.upsertEntry);

  const [openForm, setOpenForm] = useState<OpenForm>('training');

  const isLoading = isLoadingTrainings || isLoadingMatches;
  const entries: ActivityEntry[] = useMemo(
    () => [...trainings, ...matches].sort((a, b) => (a.date < b.date ? 1 : -1)),
    [trainings, matches]
  );

  return (
    <Screen className="pt-lg">
      <Text className="text-2xl font-extrabold text-text-primary">Performance Log</Text>

      <SegmentedControl className="mt-md" options={LOG_FORM_OPTIONS} value={openForm} onChange={setOpenForm} />

      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListHeaderComponent={
          <>
            {openForm === 'training' && userId && sport && (
              <TrainingForm
                userId={userId}
                sport={sport}
                onSaved={(entry) => {
                  upsertTrainingEntry(entry);
                }}
              />
            )}
            {openForm === 'match' && userId && sport && (
              <MatchForm
                userId={userId}
                sport={sport}
                onSaved={(entry) => {
                  upsertMatchEntry(entry);
                }}
              />
            )}
          </>
        }
        renderItem={({ item }) => <ActivityListItem entry={item} />}
        ListEmptyComponent={
          !isLoading ? (
            <Text className="mt-xl text-center text-sm text-text-secondary">
              No sessions logged yet. Fill in the form above to add your first one.
            </Text>
          ) : null
        }
      />
    </Screen>
  );
}

function ActivityListItem({ entry }: { entry: ActivityEntry }) {
  if (entry.type === 'training') {
    return (
      <View className="mt-sm rounded-lg border border-border bg-background-surface px-md py-md">
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-bold text-text-primary">Training</Text>
          <Text className="text-sm text-text-secondary">{formatRelativeDate(entry.date)}</Text>
        </View>
        <Text className="mt-xs text-sm text-text-secondary">
          {entry.durationMinutes} min · Intensity {entry.intensity}/10 · Goal {entry.goalProximity}%
        </Text>
        {entry.notes ? (
          <Text className="mt-xs text-sm text-text-secondary" numberOfLines={2}>
            {entry.notes}
          </Text>
        ) : null}
      </View>
    );
  }

  return (
    <View className="mt-sm rounded-lg border border-border bg-background-surface px-md py-md">
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-bold text-text-primary">Match vs {entry.opponent}</Text>
        <Text className="text-sm text-text-secondary">{formatRelativeDate(entry.date)}</Text>
      </View>
      <Text className="mt-xs text-sm text-text-secondary">
        {[
          entry.result,
          entry.sport === 'football' ? `${entry.minutesPlayed} min` : `${entry.iceTime} min ice time`,
          `Goal ${entry.goalProximity}%`,
        ]
          .filter(Boolean)
          .join(' · ')}
      </Text>
      {entry.notes ? (
        <Text className="mt-xs text-sm text-text-secondary" numberOfLines={2}>
          {entry.notes}
        </Text>
      ) : null}
    </View>
  );
}

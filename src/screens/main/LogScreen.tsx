import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { MatchForm } from '../../components/MatchForm';
import { Screen } from '../../components/Screen';
import { TrainingForm } from '../../components/TrainingForm';
import { useMatchData } from '../../hooks/useMatchData';
import { useTrainingData } from '../../hooks/useTrainingData';
import { useUserId } from '../../hooks/useUserId';
import { formatRelativeDate } from '../../lib/date';
import { useMatchStore, useProfileStore, useTrainingStore } from '../../store';
import { useTheme } from '../../theme';
import type { ActivityEntry } from '../../types/models';

type OpenForm = 'training' | 'match' | null;

export default function LogScreen() {
  const { colors } = useTheme();
  const userId = useUserId();
  const sport = useProfileStore((s) => s.profile?.sport);
  const { entries: trainings, isLoading: isLoadingTrainings } = useTrainingData();
  const { entries: matches, isLoading: isLoadingMatches } = useMatchData();
  const upsertTrainingEntry = useTrainingStore((s) => s.upsertEntry);
  const upsertMatchEntry = useMatchStore((s) => s.upsertEntry);

  const [openForm, setOpenForm] = useState<OpenForm>(null);

  const isLoading = isLoadingTrainings || isLoadingMatches;
  const entries: ActivityEntry[] = useMemo(
    () => [...trainings, ...matches].sort((a, b) => (a.date < b.date ? 1 : -1)),
    [trainings, matches]
  );

  return (
    <Screen className="pt-lg">
      <Text className="text-3xl font-extrabold text-text-primary">Performance Log</Text>

      <View className="mt-md flex-row gap-sm">
        <Pressable
          onPress={() => setOpenForm((v) => (v === 'training' ? null : 'training'))}
          className={`flex-1 flex-row items-center justify-center gap-xs rounded-md border py-sm ${
            openForm === 'training' ? 'border-brand-primary bg-background-elevated' : 'border-border bg-background-surface'
          }`}
        >
          <Ionicons name={openForm === 'training' ? 'close' : 'add'} size={18} color={colors.brand.primary} />
          <Text className="text-base font-bold text-brand-primary">Log Training</Text>
        </Pressable>
        <Pressable
          onPress={() => setOpenForm((v) => (v === 'match' ? null : 'match'))}
          className={`flex-1 flex-row items-center justify-center gap-xs rounded-md border py-sm ${
            openForm === 'match' ? 'border-brand-primary bg-background-elevated' : 'border-border bg-background-surface'
          }`}
        >
          <Ionicons name={openForm === 'match' ? 'close' : 'add'} size={18} color={colors.brand.primary} />
          <Text className="text-base font-bold text-brand-primary">Log Match</Text>
        </Pressable>
      </View>

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
                  setOpenForm(null);
                }}
              />
            )}
            {openForm === 'match' && userId && sport && (
              <MatchForm
                userId={userId}
                sport={sport}
                onSaved={(entry) => {
                  upsertMatchEntry(entry);
                  setOpenForm(null);
                }}
              />
            )}
          </>
        }
        renderItem={({ item }) => <ActivityListItem entry={item} />}
        ListEmptyComponent={
          !isLoading ? (
            <Text className="mt-xl text-center text-sm text-text-secondary">
              No sessions logged yet. Tap Log Training or Log Match to add your first one.
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

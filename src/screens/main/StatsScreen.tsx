import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { updateWeeklyTarget } from '../../api/profile';
import { Screen } from '../../components/Screen';
import { useLogData } from '../../hooks/useLogData';
import { useUserId } from '../../hooks/useUserId';
import { fromISODate } from '../../lib/date';
import { buildConsistencySeries, calculateStreak, calculateWeeklyProgress } from '../../lib/stats';
import { useProfileStore, useStatsStore } from '../../store';
import { useTheme } from '../../theme';
import type { StatsRangeDays } from '../../types/models';

const RANGE_OPTIONS: StatsRangeDays[] = [7, 30];
const MIN_WEEKLY_TARGET = 1;
const MAX_WEEKLY_TARGET = 21;

export default function StatsScreen() {
  const { colors } = useTheme();
  const userId = useUserId();
  const { entries, isLoading } = useLogData();
  const profile = useProfileStore((s) => s.profile);
  const setProfile = useProfileStore((s) => s.setProfile);
  const rangeDays = useStatsStore((s) => s.rangeDays);
  const setRangeDays = useStatsStore((s) => s.setRangeDays);

  const [isSavingTarget, setIsSavingTarget] = useState(false);

  const streak = useMemo(() => calculateStreak(entries), [entries]);
  const series = useMemo(() => buildConsistencySeries(entries, rangeDays), [entries, rangeDays]);
  const weeklyProgress = useMemo(
    () => calculateWeeklyProgress(entries, profile?.weeklyTargetSessions ?? 4),
    [entries, profile?.weeklyTargetSessions]
  );

  const maxSessionsInDay = series.reduce((max, point) => Math.max(max, point.sessionCount), 0);
  const barWidth = rangeDays === 7 ? 26 : 12;
  const barSpacing = rangeDays === 7 ? 20 : 10;

  const chartData = series.map((point, index) => {
    const date = fromISODate(point.date);
    const showLabel = rangeDays === 7 || index % 5 === 0 || index === series.length - 1;
    return {
      value: point.sessionCount,
      label: showLabel
        ? date.toLocaleDateString('en-US', rangeDays === 7 ? { weekday: 'short' } : { day: 'numeric', month: 'short' })
        : '',
      frontColor: point.sessionCount > 0 ? colors.brand.primary : colors.background.elevated,
    };
  });

  const adjustWeeklyTarget = async (delta: number) => {
    if (!userId || !profile || isSavingTarget) return;
    const next = Math.min(MAX_WEEKLY_TARGET, Math.max(MIN_WEEKLY_TARGET, profile.weeklyTargetSessions + delta));
    if (next === profile.weeklyTargetSessions) return;

    const previous = profile;
    setProfile({ ...profile, weeklyTargetSessions: next });
    setIsSavingTarget(true);
    try {
      await updateWeeklyTarget({ userId, weeklyTargetSessions: next });
    } catch (e) {
      setProfile(previous);
      Alert.alert('Could not update goal', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setIsSavingTarget(false);
    }
  };

  return (
    <Screen scrollable className="pt-lg">
      <Text className="text-3xl font-extrabold text-text-primary">Stats</Text>
      <Text className="mt-sm text-base text-text-secondary">Your training consistency at a glance.</Text>

      <View className="mt-xl flex-row rounded-md border border-border bg-background-surface p-xs">
        {RANGE_OPTIONS.map((option) => (
          <Pressable
            key={option}
            onPress={() => setRangeDays(option)}
            className={`flex-1 items-center rounded-sm py-sm ${rangeDays === option ? 'bg-brand-primary' : ''}`}
          >
            <Text className={`text-sm font-bold ${rangeDays === option ? 'text-text-inverse' : 'text-text-secondary'}`}>
              {option} days
            </Text>
          </Pressable>
        ))}
      </View>

      <View className="mt-md flex-row gap-sm">
        <View className="flex-1 rounded-lg border border-border bg-background-surface px-md py-md">
          <View className="flex-row items-center gap-xs">
            <Ionicons name="flame" size={18} color={colors.status.warning} />
            <Text className="text-sm font-semibold text-text-secondary">STREAK</Text>
          </View>
          <Text className="mt-xs text-3xl font-extrabold text-text-primary">{streak}</Text>
          <Text className="text-sm text-text-secondary">{streak === 1 ? 'day' : 'days'} in a row</Text>
        </View>

        <View className="flex-1 rounded-lg border border-border bg-background-surface px-md py-md">
          <Text className="text-sm font-semibold text-text-secondary">THIS WEEK</Text>
          <Text className="mt-xs text-3xl font-extrabold text-text-primary">
            {weeklyProgress.current}
            <Text className="text-lg font-bold text-text-secondary"> / {weeklyProgress.target}</Text>
          </Text>
          <Text className="text-sm text-text-secondary">sessions</Text>
        </View>
      </View>

      <View className="mt-md rounded-lg border border-border bg-background-surface px-md py-md">
        <View className="flex-row items-center justify-between">
          <Text className="text-sm font-semibold text-text-secondary">WEEKLY GOAL</Text>
          <View className="flex-row items-center gap-sm">
            <Pressable
              onPress={() => adjustWeeklyTarget(-1)}
              disabled={isSavingTarget || !profile}
              className="h-8 w-8 items-center justify-center rounded-full bg-background-elevated active:opacity-70"
            >
              <Ionicons name="remove" size={16} color={colors.text.primary} />
            </Pressable>
            <Pressable
              onPress={() => adjustWeeklyTarget(1)}
              disabled={isSavingTarget || !profile}
              className="h-8 w-8 items-center justify-center rounded-full bg-background-elevated active:opacity-70"
            >
              <Ionicons name="add" size={16} color={colors.text.primary} />
            </Pressable>
          </View>
        </View>
        <View className="mt-sm h-3 overflow-hidden rounded-full bg-background-elevated">
          <View
            className="h-3 rounded-full bg-brand-primary"
            style={{ width: `${Math.round(weeklyProgress.percent * 100)}%` }}
          />
        </View>
        <Text className="mt-xs text-sm text-text-secondary">
          {weeklyProgress.current} of {weeklyProgress.target} sessions logged this week
        </Text>
      </View>

      <View className="mt-md mb-lg rounded-lg border border-border bg-background-surface px-md py-md">
        <Text className="text-sm font-semibold text-text-secondary">CONSISTENCY</Text>
        {isLoading ? (
          <Text className="mt-md text-sm text-text-secondary">Loading…</Text>
        ) : entries.length === 0 ? (
          <Text className="mt-md text-sm text-text-secondary">
            No sessions logged yet — head to Log after your next workout.
          </Text>
        ) : (
          <View className="mt-sm">
            <BarChart
              data={chartData}
              barWidth={barWidth}
              spacing={barSpacing}
              initialSpacing={12}
              endSpacing={12}
              maxValue={Math.max(3, maxSessionsInDay)}
              noOfSections={3}
              roundedTop
              hideRules
              yAxisThickness={0}
              xAxisThickness={1}
              xAxisColor={colors.border.DEFAULT}
              xAxisLabelTextStyle={{ color: colors.text.muted, fontSize: 10 }}
              height={140}
              isAnimated
              scrollToEnd
            />
          </View>
        )}
      </View>
    </Screen>
  );
}

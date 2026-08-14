import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { clearScheduleDay, setScheduleDay } from '../../api/schedule';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { useScheduleData } from '../../hooks/useScheduleData';
import { useUserId } from '../../hooks/useUserId';
import {
  addMonths,
  daysInMonth,
  formatMonthLabel,
  startWeekday,
  toISODate,
  todayISODate,
} from '../../lib/date';
import { SCHEDULE_TYPE_COLOR, SCHEDULE_TYPE_LABEL } from '../../lib/scheduleTypes';
import { useScheduleStore } from '../../store';
import { useTheme } from '../../theme';
import type { ScheduleEntry } from '../../types/models';

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function ScheduleScreen() {
  const { colors } = useTheme();
  const userId = useUserId();
  const { entries } = useScheduleData();
  const upsertEntry = useScheduleStore((s) => s.upsertEntry);
  const removeEntry = useScheduleStore((s) => s.removeEntry);

  const [monthCursor, setMonthCursor] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(todayISODate());
  const [isSaving, setIsSaving] = useState(false);

  const entryByDate = useMemo(() => {
    const map = new Map<string, ScheduleEntry>();
    for (const entry of entries) map.set(entry.date, entry);
    return map;
  }, [entries]);

  const leadingBlanks = startWeekday(monthCursor);
  const totalDays = daysInMonth(monthCursor);
  const selectedEntry = entryByDate.get(selectedDate);

  const handleMark = async (type: 'training' | 'rest') => {
    if (!userId) return;
    setIsSaving(true);
    try {
      const entry = await setScheduleDay({
        userId,
        date: selectedDate,
        type,
        title: SCHEDULE_TYPE_LABEL[type],
      });
      upsertEntry(entry);
    } catch (e) {
      Alert.alert('Could not update schedule', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = async () => {
    if (!selectedEntry) return;
    setIsSaving(true);
    try {
      await clearScheduleDay(selectedEntry.id);
      removeEntry(selectedEntry.id);
    } catch (e) {
      Alert.alert('Could not update schedule', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Screen className="pt-lg">
      <Text className="text-3xl font-extrabold text-text-primary">Schedule</Text>

      <View className="mt-lg flex-row items-center justify-between">
        <Pressable
          onPress={() => setMonthCursor((m) => addMonths(m, -1))}
          className="h-11 w-11 items-center justify-center rounded-md border border-border bg-background-surface active:opacity-70"
        >
          <Ionicons name="chevron-back" size={20} color={colors.text.primary} />
        </Pressable>
        <Text className="text-lg font-bold text-text-primary">{formatMonthLabel(monthCursor)}</Text>
        <Pressable
          onPress={() => setMonthCursor((m) => addMonths(m, 1))}
          className="h-11 w-11 items-center justify-center rounded-md border border-border bg-background-surface active:opacity-70"
        >
          <Ionicons name="chevron-forward" size={20} color={colors.text.primary} />
        </Pressable>
      </View>

      <View className="mt-md flex-row">
        {WEEKDAY_LABELS.map((label, i) => (
          <View key={i} className="w-[14.28%] items-center py-xs">
            <Text className="text-xs font-semibold text-text-muted">{label}</Text>
          </View>
        ))}
      </View>

      <View className="flex-row flex-wrap">
        {Array.from({ length: leadingBlanks }).map((_, i) => (
          <View key={`blank-${i}`} className="w-[14.28%] aspect-square" />
        ))}
        {Array.from({ length: totalDays }).map((_, i) => {
          const day = i + 1;
          const date = toISODate(new Date(monthCursor.getFullYear(), monthCursor.getMonth(), day));
          const entry = entryByDate.get(date);
          const isSelected = date === selectedDate;
          const isToday = date === todayISODate();

          return (
            <View key={date} className="w-[14.28%] aspect-square items-center justify-center p-xs">
              <Pressable
                onPress={() => setSelectedDate(date)}
                className={`h-full w-full items-center justify-center rounded-md border ${
                  isSelected
                    ? 'border-brand-primary bg-background-elevated'
                    : isToday
                      ? 'border-text-muted bg-background-surface'
                      : 'border-transparent bg-background-surface'
                }`}
              >
                <Text className="text-sm font-semibold text-text-primary">{day}</Text>
                {entry && (
                  <View
                    className="mt-xs h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: SCHEDULE_TYPE_COLOR[entry.type] }}
                  />
                )}
              </Pressable>
            </View>
          );
        })}
      </View>

      <View className="mt-lg rounded-lg border border-border bg-background-surface px-md py-md">
        <Text className="text-sm font-semibold text-text-secondary">
          {selectedDate === todayISODate() ? 'TODAY' : selectedDate}
        </Text>
        <Text className="mt-xs text-lg font-bold text-text-primary">
          {selectedEntry ? SCHEDULE_TYPE_LABEL[selectedEntry.type] : 'No plan set'}
        </Text>

        <View className="mt-md flex-row gap-sm">
          <View className="flex-1">
            <Button label="Training Day" onPress={() => handleMark('training')} isLoading={isSaving} />
          </View>
          <View className="flex-1">
            <Button
              label="Rest Day"
              variant="secondary"
              onPress={() => handleMark('rest')}
              isLoading={isSaving}
            />
          </View>
        </View>

        {selectedEntry && (
          <Pressable
            onPress={handleClear}
            className="mt-sm flex-row items-center justify-center gap-xs py-xs active:opacity-60"
          >
            <Ionicons name="trash-outline" size={16} color={colors.status.danger} />
            <Text className="text-sm font-semibold text-status-danger">Clear this day</Text>
          </Pressable>
        )}
      </View>
    </Screen>
  );
}

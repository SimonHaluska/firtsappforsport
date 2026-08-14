import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, FlatList, Pressable, Text, View } from 'react-native';
import { addLogEntry } from '../../api/log';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { SelectableCard } from '../../components/SelectableCard';
import { TextField } from '../../components/TextField';
import { useLogData } from '../../hooks/useLogData';
import { useUserId } from '../../hooks/useUserId';
import { addDays, formatRelativeDate, toISODate } from '../../lib/date';
import { useLogStore } from '../../store';
import { useTheme } from '../../theme';
import type { LogEntryType, PerformanceLogEntry } from '../../types/models';

const TYPE_OPTIONS: { value: LogEntryType; label: string }[] = [
  { value: 'training', label: 'Training' },
  { value: 'match', label: 'Match' },
];

const INTENSITY_OPTIONS: { value: 1 | 2 | 3 | 4 | 5; label: string }[] = [
  { value: 1, label: 'Very Easy' },
  { value: 2, label: 'Easy' },
  { value: 3, label: 'Moderate' },
  { value: 4, label: 'Hard' },
  { value: 5, label: 'Very Hard' },
];

export default function LogScreen() {
  const { colors } = useTheme();
  const userId = useUserId();
  const { entries, isLoading } = useLogData();
  const addEntry = useLogStore((s) => s.addEntry);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [type, setType] = useState<LogEntryType>('training');
  const [date, setDate] = useState(() => new Date());
  const [duration, setDuration] = useState('');
  const [intensity, setIntensity] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = !!userId && !!duration && Number(duration) > 0;

  const resetForm = () => {
    setType('training');
    setDate(new Date());
    setDuration('');
    setIntensity(3);
    setNotes('');
  };

  const handleSubmit = async () => {
    if (!userId || !canSubmit) return;
    setIsSubmitting(true);
    try {
      const entry = await addLogEntry({
        userId,
        date: toISODate(date),
        type,
        durationMinutes: Number(duration),
        intensity,
        notes,
      });
      addEntry(entry);
      resetForm();
      setIsFormOpen(false);
    } catch (e) {
      Alert.alert('Could not save entry', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen className="pt-lg">
      <View className="flex-row items-center justify-between">
        <Text className="text-3xl font-extrabold text-text-primary">Performance Log</Text>
        <Pressable
          onPress={() => setIsFormOpen((v) => !v)}
          className="h-11 w-11 items-center justify-center rounded-full bg-background-elevated active:opacity-70"
        >
          <Ionicons name={isFormOpen ? 'close' : 'add'} size={24} color={colors.brand.primary} />
        </Pressable>
      </View>

      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListHeaderComponent={
          isFormOpen ? (
            <View className="mt-lg rounded-lg border border-border bg-background-surface px-md py-md">
              <Text className="text-sm font-semibold text-text-secondary">TYPE</Text>
              <View className="mt-xs flex-row gap-sm">
                {TYPE_OPTIONS.map((option) => (
                  <View key={option.value} className="flex-1">
                    <SelectableCard
                      label={option.label}
                      selected={type === option.value}
                      onPress={() => setType(option.value)}
                    />
                  </View>
                ))}
              </View>

              <Text className="mt-md text-sm font-semibold text-text-secondary">DATE</Text>
              <View className="mt-xs flex-row items-center gap-sm">
                <Pressable
                  onPress={() => setDate((d) => addDays(d, -1))}
                  className="h-11 w-11 items-center justify-center rounded-md border border-border bg-background-elevated active:opacity-70"
                >
                  <Ionicons name="chevron-back" size={20} color={colors.text.primary} />
                </Pressable>
                <Text className="flex-1 text-center text-base font-bold text-text-primary">
                  {formatRelativeDate(toISODate(date))}
                </Text>
                <Pressable
                  onPress={() => setDate((d) => addDays(d, 1))}
                  className="h-11 w-11 items-center justify-center rounded-md border border-border bg-background-elevated active:opacity-70"
                >
                  <Ionicons name="chevron-forward" size={20} color={colors.text.primary} />
                </Pressable>
              </View>

              <Text className="mt-md text-sm font-semibold text-text-secondary">DURATION (MINUTES)</Text>
              <TextField
                className="mt-xs"
                value={duration}
                onChangeText={(text) => setDuration(text.replace(/[^0-9]/g, ''))}
                placeholder="60"
                keyboardType="number-pad"
              />

              <Text className="mt-md text-sm font-semibold text-text-secondary">HOW DID IT FEEL?</Text>
              <View className="mt-xs flex-row gap-xs">
                {INTENSITY_OPTIONS.map((option) => (
                  <Pressable
                    key={option.value}
                    onPress={() => setIntensity(option.value)}
                    className={`h-10 flex-1 items-center justify-center rounded-md border ${
                      intensity === option.value
                        ? 'border-brand-primary bg-background-elevated'
                        : 'border-border bg-background-surface'
                    }`}
                  >
                    <Text
                      className={`text-base font-bold ${
                        intensity === option.value ? 'text-brand-primary' : 'text-text-primary'
                      }`}
                    >
                      {option.value}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <Text className="mt-xs text-center text-sm text-text-secondary">
                {INTENSITY_OPTIONS.find((o) => o.value === intensity)?.label}
              </Text>

              <Text className="mt-md text-sm font-semibold text-text-secondary">NOTES</Text>
              <TextField
                className="mt-xs"
                value={notes}
                onChangeText={setNotes}
                placeholder="How did the session go?"
                multiline
                numberOfLines={3}
                style={{ minHeight: 80, textAlignVertical: 'top' }}
              />

              <Button
                className="mt-md"
                label="Save Entry"
                onPress={handleSubmit}
                disabled={!canSubmit}
                isLoading={isSubmitting}
              />
            </View>
          ) : null
        }
        renderItem={({ item }) => <LogListItem entry={item} />}
        ListEmptyComponent={
          !isLoading ? (
            <Text className="mt-xl text-center text-sm text-text-secondary">
              No sessions logged yet. Tap + Add to log your first one.
            </Text>
          ) : null
        }
      />
    </Screen>
  );
}

function LogListItem({ entry }: { entry: PerformanceLogEntry }) {
  return (
    <View className="mt-sm rounded-lg border border-border bg-background-surface px-md py-md">
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-bold text-text-primary">
          {entry.type === 'match' ? 'Match' : 'Training'}
        </Text>
        <Text className="text-sm text-text-secondary">{formatRelativeDate(entry.date)}</Text>
      </View>
      <Text className="mt-xs text-sm text-text-secondary">
        {entry.durationMinutes} min · Felt {entry.intensity}/5
      </Text>
      {entry.notes ? (
        <Text className="mt-xs text-sm text-text-secondary" numberOfLines={2}>
          {entry.notes}
        </Text>
      ) : null}
    </View>
  );
}

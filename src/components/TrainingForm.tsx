import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { addTraining } from '../api/training';
import { addDays, formatRelativeDate, toISODate } from '../lib/date';
import { TRAINING_METRIC_TEMPLATES } from '../lib/sportMetricTemplates';
import { useTheme } from '../theme';
import type { Sport, TrainingEntry } from '../types/models';
import { Button } from './Button';
import { TextField } from './TextField';

const INTENSITY_OPTIONS: { value: 1 | 2 | 3 | 4 | 5; label: string }[] = [
  { value: 1, label: 'Very Easy' },
  { value: 2, label: 'Easy' },
  { value: 3, label: 'Moderate' },
  { value: 4, label: 'Hard' },
  { value: 5, label: 'Very Hard' },
];

const MOOD_OPTIONS: { value: 1 | 2 | 3 | 4 | 5; emoji: string }[] = [
  { value: 1, emoji: '😞' },
  { value: 2, emoji: '🙁' },
  { value: 3, emoji: '😐' },
  { value: 4, emoji: '🙂' },
  { value: 5, emoji: '😄' },
];

interface TrainingFormProps {
  userId: string;
  sport: Sport;
  onSaved: (entry: TrainingEntry) => void;
}

export function TrainingForm({ userId, sport, onSaved }: TrainingFormProps) {
  const { colors } = useTheme();
  const [date, setDate] = useState(() => new Date());
  const [duration, setDuration] = useState('');
  const [intensity, setIntensity] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [metrics, setMetrics] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = !!duration && Number(duration) > 0;
  const metricFields = TRAINING_METRIC_TEMPLATES[sport];

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    try {
      const numericMetrics: Record<string, number> = {};
      for (const field of metricFields) {
        const raw = metrics[field.key];
        if (raw) numericMetrics[field.key] = Number(raw);
      }
      const entry = await addTraining({
        userId,
        date: toISODate(date),
        durationMinutes: Number(duration),
        intensity,
        mood,
        notes,
        metrics: numericMetrics,
      });
      onSaved(entry);
    } catch (e) {
      Alert.alert('Could not save entry', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="mt-lg rounded-lg border border-border bg-background-surface px-md py-md">
      <Text className="text-sm font-semibold text-text-secondary">DATE</Text>
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

      <Text className="mt-md text-sm font-semibold text-text-secondary">MOOD</Text>
      <View className="mt-xs flex-row gap-xs">
        {MOOD_OPTIONS.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => setMood(option.value)}
            className={`h-11 flex-1 items-center justify-center rounded-md border ${
              mood === option.value ? 'border-brand-primary bg-background-elevated' : 'border-border bg-background-surface'
            }`}
          >
            <Text className="text-lg">{option.emoji}</Text>
          </Pressable>
        ))}
      </View>

      {metricFields.map((field) => (
        <View key={field.key}>
          <Text className="mt-md text-sm font-semibold text-text-secondary">{field.label.toUpperCase()}</Text>
          <TextField
            className="mt-xs"
            value={metrics[field.key] ?? ''}
            onChangeText={(text) => setMetrics((m) => ({ ...m, [field.key]: text.replace(/[^0-9]/g, '') }))}
            placeholder="0"
            keyboardType="number-pad"
          />
        </View>
      ))}

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

      <Button className="mt-md" label="Save Training" onPress={handleSubmit} disabled={!canSubmit} isLoading={isSubmitting} />
    </View>
  );
}

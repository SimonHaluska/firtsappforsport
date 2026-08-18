import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { addTraining } from '../api/training';
import { addDays, formatRelativeDate, toISODate } from '../lib/date';
import { TRAINING_TYPE_OPTIONS } from '../lib/trainingTypes';
import { useTheme } from '../theme';
import type { GoalProximity, Sport, TrainingEntry, TrainingTypeFootball, TrainingTypeHockey } from '../types/models';
import { Button } from './Button';
import { GoalProximitySelector } from './GoalProximitySelector';
import { NumericScaleField } from './NumericScaleField';
import { TextField } from './TextField';

interface TrainingFormProps {
  userId: string;
  sport: Sport;
  onSaved: (entry: TrainingEntry) => void;
}

export function TrainingForm({ userId, sport, onSaved }: TrainingFormProps) {
  const { colors } = useTheme();
  const [date, setDate] = useState(() => new Date());
  const [trainingType, setTrainingType] = useState<TrainingTypeFootball | TrainingTypeHockey | undefined>(
    undefined
  );
  const [duration, setDuration] = useState('');
  const [intensity, setIntensity] = useState<number | undefined>(undefined);
  const [energyBefore, setEnergyBefore] = useState<number | undefined>(undefined);
  const [energyAfter, setEnergyAfter] = useState<number | undefined>(undefined);
  const [goalProximity, setGoalProximity] = useState<GoalProximity | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const typeOptions = TRAINING_TYPE_OPTIONS[sport];

  const canSubmit =
    !!duration &&
    Number(duration) > 0 &&
    !!trainingType &&
    intensity !== undefined &&
    goalProximity !== undefined;

  const handleSubmit = async () => {
    if (!canSubmit || !trainingType || intensity === undefined || goalProximity === undefined) return;
    setIsSubmitting(true);
    try {
      const entry = await addTraining({
        userId,
        date: toISODate(date),
        sport,
        trainingType,
        durationMinutes: Number(duration),
        intensity,
        goalProximity,
        energyBefore,
        energyAfter,
        notes,
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

      <Text className="mt-md text-sm font-semibold text-text-secondary">TRAINING TYPE</Text>
      <View className="mt-xs flex-row flex-wrap gap-xs">
        {typeOptions.map((option) => {
          const selected = trainingType === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => setTrainingType(option.value)}
              className={`rounded-md border px-sm py-sm ${
                selected ? 'border-brand-primary bg-background-elevated' : 'border-border bg-background-surface'
              }`}
            >
              <Text className={`text-sm font-bold ${selected ? 'text-brand-primary' : 'text-text-primary'}`}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text className="mt-md text-sm font-semibold text-text-secondary">DURATION (MINUTES)</Text>
      <TextField
        className="mt-xs"
        value={duration}
        onChangeText={(text) => setDuration(text.replace(/[^0-9]/g, ''))}
        placeholder="60"
        keyboardType="number-pad"
      />

      <Text className="mt-md text-sm font-semibold text-text-secondary">INTENSITY (1-10)</Text>
      <NumericScaleField value={intensity} onChange={setIntensity} />

      <Text className="mt-md text-sm font-semibold text-text-secondary">ENERGY BEFORE (OPTIONAL)</Text>
      <NumericScaleField value={energyBefore} onChange={setEnergyBefore} />

      <Text className="mt-md text-sm font-semibold text-text-secondary">ENERGY AFTER (OPTIONAL)</Text>
      <NumericScaleField value={energyAfter} onChange={setEnergyAfter} />

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

      <GoalProximitySelector value={goalProximity} onChange={setGoalProximity} />

      <Button className="mt-md" label="Save Training" onPress={handleSubmit} disabled={!canSubmit} isLoading={isSubmitting} />
    </View>
  );
}

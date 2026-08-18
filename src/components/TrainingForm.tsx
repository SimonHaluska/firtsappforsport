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

const SECTION_LABEL_CLASSNAME = 'text-xs font-semibold tracking-wide text-text-muted';

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
      <Text className={SECTION_LABEL_CLASSNAME}>DATE</Text>
      <View className="mt-xs flex-row items-center gap-sm">
        <Pressable
          onPress={() => setDate((d) => addDays(d, -1))}
          className="h-11 w-11 items-center justify-center rounded-md bg-background-elevated active:opacity-70"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.06,
            shadowRadius: 3,
            elevation: 1,
          }}
        >
          <Ionicons name="chevron-back" size={20} color={colors.text.primary} />
        </Pressable>
        <Text className="flex-1 text-center text-lg font-bold text-text-primary">
          {formatRelativeDate(toISODate(date))}
        </Text>
        <Pressable
          onPress={() => setDate((d) => addDays(d, 1))}
          className="h-11 w-11 items-center justify-center rounded-md bg-background-elevated active:opacity-70"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.06,
            shadowRadius: 3,
            elevation: 1,
          }}
        >
          <Ionicons name="chevron-forward" size={20} color={colors.text.primary} />
        </Pressable>
      </View>

      <Text className={`mt-xl ${SECTION_LABEL_CLASSNAME}`}>TRAINING TYPE</Text>
      <View className="mt-xs flex-row flex-wrap gap-xs">
        {typeOptions.map((option) => {
          const selected = trainingType === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => setTrainingType(option.value)}
              style={{
                width: '48%',
                borderWidth: 1,
                borderColor: selected ? colors.brand.primary : colors.border.DEFAULT,
                backgroundColor: selected ? 'rgba(129,140,248,0.16)' : colors.background.surface,
              }}
              className="items-center rounded-md px-sm py-sm"
            >
              <Text
                className="text-sm font-bold"
                style={{ color: selected ? colors.brand.primaryText : colors.text.secondary }}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text className={`mt-xl ${SECTION_LABEL_CLASSNAME}`}>DURATION (MINUTES)</Text>
      <TextField
        className="mt-xs"
        value={duration}
        onChangeText={(text) => setDuration(text.replace(/[^0-9]/g, ''))}
        placeholder="60"
        keyboardType="number-pad"
      />

      <NumericScaleField label="Intensity (1-10)" value={intensity} onChange={setIntensity} />
      <NumericScaleField label="Energy before (optional)" value={energyBefore} onChange={setEnergyBefore} />
      <NumericScaleField label="Energy after (optional)" value={energyAfter} onChange={setEnergyAfter} />

      <Text className={`mt-xl ${SECTION_LABEL_CLASSNAME}`}>NOTES</Text>
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

      <Button className="mt-xl" label="Save Training" onPress={handleSubmit} disabled={!canSubmit} isLoading={isSubmitting} />
    </View>
  );
}

import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { addMatch } from '../api/match';
import { addDays, formatRelativeDate, toISODate } from '../lib/date';
import { MATCH_METRIC_TEMPLATES } from '../lib/sportMetricTemplates';
import { useTheme } from '../theme';
import type { MatchEntry, Sport } from '../types/models';
import { Button } from './Button';
import { TextField } from './TextField';

const RESULT_OPTIONS: { value: 'win' | 'loss' | 'draw'; label: string }[] = [
  { value: 'win', label: 'Win' },
  { value: 'loss', label: 'Loss' },
  { value: 'draw', label: 'Draw' },
];

interface MatchFormProps {
  userId: string;
  sport: Sport;
  onSaved: (entry: MatchEntry) => void;
}

export function MatchForm({ userId, sport, onSaved }: MatchFormProps) {
  const { colors } = useTheme();
  const [date, setDate] = useState(() => new Date());
  const [opponent, setOpponent] = useState('');
  const [competition, setCompetition] = useState('');
  const [result, setResult] = useState<'win' | 'loss' | 'draw' | undefined>(undefined);
  const [isHome, setIsHome] = useState<boolean | undefined>(undefined);
  const [minutesPlayed, setMinutesPlayed] = useState('');
  const [metrics, setMetrics] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const metricFields = MATCH_METRIC_TEMPLATES[sport];

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const numericMetrics: Record<string, number> = {};
      for (const field of metricFields) {
        const raw = metrics[field.key];
        if (raw) numericMetrics[field.key] = Number(raw);
      }
      const entry = await addMatch({
        userId,
        date: toISODate(date),
        opponent,
        competition,
        result,
        isHome,
        minutesPlayed: minutesPlayed ? Number(minutesPlayed) : undefined,
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

      <Text className="mt-md text-sm font-semibold text-text-secondary">OPPONENT</Text>
      <TextField className="mt-xs" value={opponent} onChangeText={setOpponent} placeholder="Opponent name" />

      <Text className="mt-md text-sm font-semibold text-text-secondary">COMPETITION</Text>
      <TextField className="mt-xs" value={competition} onChangeText={setCompetition} placeholder="League, cup, friendly…" />

      <Text className="mt-md text-sm font-semibold text-text-secondary">RESULT</Text>
      <View className="mt-xs flex-row gap-xs">
        {RESULT_OPTIONS.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => setResult((r) => (r === option.value ? undefined : option.value))}
            className={`h-10 flex-1 items-center justify-center rounded-md border ${
              result === option.value ? 'border-brand-primary bg-background-elevated' : 'border-border bg-background-surface'
            }`}
          >
            <Text
              className={`text-base font-bold ${
                result === option.value ? 'text-brand-primary' : 'text-text-primary'
              }`}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text className="mt-md text-sm font-semibold text-text-secondary">HOME / AWAY</Text>
      <View className="mt-xs flex-row gap-xs">
        <Pressable
          onPress={() => setIsHome((v) => (v === true ? undefined : true))}
          className={`h-10 flex-1 items-center justify-center rounded-md border ${
            isHome === true ? 'border-brand-primary bg-background-elevated' : 'border-border bg-background-surface'
          }`}
        >
          <Text className={`text-base font-bold ${isHome === true ? 'text-brand-primary' : 'text-text-primary'}`}>
            Home
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setIsHome((v) => (v === false ? undefined : false))}
          className={`h-10 flex-1 items-center justify-center rounded-md border ${
            isHome === false ? 'border-brand-primary bg-background-elevated' : 'border-border bg-background-surface'
          }`}
        >
          <Text className={`text-base font-bold ${isHome === false ? 'text-brand-primary' : 'text-text-primary'}`}>
            Away
          </Text>
        </Pressable>
      </View>

      <Text className="mt-md text-sm font-semibold text-text-secondary">MINUTES PLAYED</Text>
      <TextField
        className="mt-xs"
        value={minutesPlayed}
        onChangeText={(text) => setMinutesPlayed(text.replace(/[^0-9]/g, ''))}
        placeholder="90"
        keyboardType="number-pad"
      />

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
        placeholder="How did the match go?"
        multiline
        numberOfLines={3}
        style={{ minHeight: 80, textAlignVertical: 'top' }}
      />

      <Button className="mt-md" label="Save Match" onPress={handleSubmit} isLoading={isSubmitting} />
    </View>
  );
}

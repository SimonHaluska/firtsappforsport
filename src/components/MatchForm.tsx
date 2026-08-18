import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { addMatch } from '../api/match';
import type { MatchInput } from '../api/match';
import { addDays, formatRelativeDate, toISODate } from '../lib/date';
import { useTheme } from '../theme';
import type { GoalProximity, MatchEntry, Sport } from '../types/models';
import { Button } from './Button';
import { FormSection } from './FormSection';
import { GoalProximitySelector } from './GoalProximitySelector';
import { TextField } from './TextField';

function SectionLabel({ children, className = '' }: { children: string; className?: string }) {
  return (
    <Text className={`text-xs font-bold text-text-muted ${className}`} style={{ letterSpacing: 0.8 }}>
      {children}
    </Text>
  );
}

interface MatchFormProps {
  userId: string;
  sport: Sport;
  onSaved: (entry: MatchEntry) => void;
}

export function MatchForm({ userId, sport, onSaved }: MatchFormProps) {
  const { colors } = useTheme();
  const [date, setDate] = useState(() => new Date());
  const [opponent, setOpponent] = useState('');
  const [result, setResult] = useState('');
  const [playingTime, setPlayingTime] = useState(''); // minutesPlayed (football) or iceTime (hockey)
  const [goals, setGoals] = useState('');
  const [assists, setAssists] = useState('');
  const [shots, setShots] = useState('');
  const [position, setPosition] = useState('');
  const [yellowCards, setYellowCards] = useState('');
  const [redCards, setRedCards] = useState('');
  const [penaltyMinutes, setPenaltyMinutes] = useState('');
  const [plusMinus, setPlusMinus] = useState('');
  const [goalProximity, setGoalProximity] = useState<GoalProximity | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit =
    !!opponent.trim() && !!result.trim() && !!playingTime && Number(playingTime) >= 0 && goalProximity !== undefined;

  const toOptionalNumber = (text: string) => (text ? Number(text) : undefined);

  const handleSubmit = async () => {
    if (!canSubmit || goalProximity === undefined) return;
    setIsSubmitting(true);
    try {
      const common = {
        date: toISODate(date),
        opponent,
        result,
        goalProximity,
        goals: toOptionalNumber(goals),
        assists: toOptionalNumber(assists),
        shots: toOptionalNumber(shots),
        position: position.trim() ? position : undefined,
        notes,
      };

      const input: MatchInput =
        sport === 'football'
          ? {
              ...common,
              sport: 'football',
              minutesPlayed: Number(playingTime),
              yellowCards: toOptionalNumber(yellowCards),
              redCards: toOptionalNumber(redCards),
            }
          : {
              ...common,
              sport: 'hockey',
              iceTime: Number(playingTime),
              penaltyMinutes: toOptionalNumber(penaltyMinutes),
              plusMinus: toOptionalNumber(plusMinus),
            };

      const entry = await addMatch({ ...input, userId });
      onSaved(entry);
    } catch (e) {
      Alert.alert('Could not save entry', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="mt-lg rounded-lg border border-border bg-background-surface px-md py-md">
      <FormSection>
        <SectionLabel>DATE</SectionLabel>
        <View className="mt-xs flex-row items-center gap-sm">
          <Pressable
            onPress={() => setDate((d) => addDays(d, -1))}
            className="h-11 w-11 items-center justify-center rounded-md bg-background-surface active:opacity-70"
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
            className="h-11 w-11 items-center justify-center rounded-md bg-background-surface active:opacity-70"
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

        <SectionLabel className="mt-sm">OPPONENT</SectionLabel>
        <TextField className="mt-xs" value={opponent} onChangeText={setOpponent} placeholder="Opponent name" />

        <SectionLabel className="mt-sm">RESULT</SectionLabel>
        <TextField className="mt-xs" value={result} onChangeText={setResult} placeholder="2:1" />

        <SectionLabel className="mt-sm">{sport === 'football' ? 'MINUTES PLAYED' : 'ICE TIME (MINUTES)'}</SectionLabel>
        <TextField
          className="mt-xs"
          value={playingTime}
          onChangeText={(text) => setPlayingTime(text.replace(/[^0-9]/g, ''))}
          placeholder={sport === 'football' ? '90' : '18'}
          keyboardType="number-pad"
        />
      </FormSection>

      <FormSection className="mt-md">
        <SectionLabel>GOALS</SectionLabel>
        <TextField
          className="mt-xs"
          value={goals}
          onChangeText={(text) => setGoals(text.replace(/[^0-9]/g, ''))}
          placeholder="0"
          keyboardType="number-pad"
        />

        <SectionLabel className="mt-sm">ASSISTS</SectionLabel>
        <TextField
          className="mt-xs"
          value={assists}
          onChangeText={(text) => setAssists(text.replace(/[^0-9]/g, ''))}
          placeholder="0"
          keyboardType="number-pad"
        />

        <SectionLabel className="mt-sm">SHOTS</SectionLabel>
        <TextField
          className="mt-xs"
          value={shots}
          onChangeText={(text) => setShots(text.replace(/[^0-9]/g, ''))}
          placeholder="0"
          keyboardType="number-pad"
        />

        <SectionLabel className="mt-sm">POSITION</SectionLabel>
        <TextField className="mt-xs" value={position} onChangeText={setPosition} placeholder="e.g. Midfielder" />
      </FormSection>

      <FormSection className="mt-md">
        {sport === 'football' ? (
          <>
            <SectionLabel>YELLOW CARDS</SectionLabel>
            <TextField
              className="mt-xs"
              value={yellowCards}
              onChangeText={(text) => setYellowCards(text.replace(/[^0-9]/g, ''))}
              placeholder="0"
              keyboardType="number-pad"
            />

            <SectionLabel className="mt-sm">RED CARDS</SectionLabel>
            <TextField
              className="mt-xs"
              value={redCards}
              onChangeText={(text) => setRedCards(text.replace(/[^0-9]/g, ''))}
              placeholder="0"
              keyboardType="number-pad"
            />
          </>
        ) : (
          <>
            <SectionLabel>PENALTY MINUTES</SectionLabel>
            <TextField
              className="mt-xs"
              value={penaltyMinutes}
              onChangeText={(text) => setPenaltyMinutes(text.replace(/[^0-9]/g, ''))}
              placeholder="0"
              keyboardType="number-pad"
            />

            <SectionLabel className="mt-sm">PLUS / MINUS</SectionLabel>
            <TextField
              className="mt-xs"
              value={plusMinus}
              onChangeText={(text) => setPlusMinus(text.replace(/[^-0-9]/g, ''))}
              placeholder="0"
              keyboardType="numbers-and-punctuation"
            />
          </>
        )}
      </FormSection>

      <FormSection className="mt-md">
        <SectionLabel>NOTES</SectionLabel>
        <TextField
          className="mt-xs"
          value={notes}
          onChangeText={setNotes}
          placeholder="How did the match go?"
          multiline
          numberOfLines={3}
          style={{ minHeight: 80, textAlignVertical: 'top' }}
        />
      </FormSection>

      <GoalProximitySelector value={goalProximity} onChange={setGoalProximity} />

      <Button
        className="mt-xl"
        label="Save Match"
        onPress={handleSubmit}
        disabled={!canSubmit}
        isLoading={isSubmitting}
      />
    </View>
  );
}

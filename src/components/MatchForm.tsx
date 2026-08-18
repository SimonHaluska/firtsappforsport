import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { addMatch } from '../api/match';
import type { MatchInput } from '../api/match';
import { addDays, formatRelativeDate, toISODate } from '../lib/date';
import { useTheme } from '../theme';
import type { GoalProximity, MatchEntry, Sport } from '../types/models';
import { Button } from './Button';
import { GoalProximitySelector } from './GoalProximitySelector';
import { TextField } from './TextField';

const SECTION_LABEL_CLASSNAME = 'text-xs font-semibold tracking-wide text-text-muted';
const CARD_CLASSNAME = 'mt-xl rounded-lg border border-border bg-background-elevated px-md py-md';

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

      <View className={CARD_CLASSNAME}>
        <Text className={SECTION_LABEL_CLASSNAME}>MATCH INFO</Text>

        <Text className={`mt-md ${SECTION_LABEL_CLASSNAME}`}>OPPONENT</Text>
        <TextField className="mt-xs" value={opponent} onChangeText={setOpponent} placeholder="Opponent name" />

        <Text className={`mt-md ${SECTION_LABEL_CLASSNAME}`}>RESULT</Text>
        <TextField className="mt-xs" value={result} onChangeText={setResult} placeholder="2:1" />

        <Text className={`mt-md ${SECTION_LABEL_CLASSNAME}`}>
          {sport === 'football' ? 'MINUTES PLAYED' : 'ICE TIME (MINUTES)'}
        </Text>
        <TextField
          className="mt-xs"
          value={playingTime}
          onChangeText={(text) => setPlayingTime(text.replace(/[^0-9]/g, ''))}
          placeholder={sport === 'football' ? '90' : '18'}
          keyboardType="number-pad"
        />
      </View>

      <View className={CARD_CLASSNAME}>
        <Text className={SECTION_LABEL_CLASSNAME}>PERFORMANCE</Text>

        <Text className={`mt-md ${SECTION_LABEL_CLASSNAME}`}>GOALS</Text>
        <TextField
          className="mt-xs"
          value={goals}
          onChangeText={(text) => setGoals(text.replace(/[^0-9]/g, ''))}
          placeholder="0"
          keyboardType="number-pad"
        />

        <Text className={`mt-md ${SECTION_LABEL_CLASSNAME}`}>ASSISTS</Text>
        <TextField
          className="mt-xs"
          value={assists}
          onChangeText={(text) => setAssists(text.replace(/[^0-9]/g, ''))}
          placeholder="0"
          keyboardType="number-pad"
        />

        <Text className={`mt-md ${SECTION_LABEL_CLASSNAME}`}>SHOTS</Text>
        <TextField
          className="mt-xs"
          value={shots}
          onChangeText={(text) => setShots(text.replace(/[^0-9]/g, ''))}
          placeholder="0"
          keyboardType="number-pad"
        />

        <Text className={`mt-md ${SECTION_LABEL_CLASSNAME}`}>POSITION</Text>
        <TextField className="mt-xs" value={position} onChangeText={setPosition} placeholder="e.g. Midfielder" />

        {sport === 'football' ? (
          <>
            <Text className={`mt-md ${SECTION_LABEL_CLASSNAME}`}>YELLOW CARDS</Text>
            <TextField
              className="mt-xs"
              value={yellowCards}
              onChangeText={(text) => setYellowCards(text.replace(/[^0-9]/g, ''))}
              placeholder="0"
              keyboardType="number-pad"
            />

            <Text className={`mt-md ${SECTION_LABEL_CLASSNAME}`}>RED CARDS</Text>
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
            <Text className={`mt-md ${SECTION_LABEL_CLASSNAME}`}>PENALTY MINUTES</Text>
            <TextField
              className="mt-xs"
              value={penaltyMinutes}
              onChangeText={(text) => setPenaltyMinutes(text.replace(/[^0-9]/g, ''))}
              placeholder="0"
              keyboardType="number-pad"
            />

            <Text className={`mt-md ${SECTION_LABEL_CLASSNAME}`}>PLUS / MINUS</Text>
            <TextField
              className="mt-xs"
              value={plusMinus}
              onChangeText={(text) => setPlusMinus(text.replace(/[^-0-9]/g, ''))}
              placeholder="0"
              keyboardType="numbers-and-punctuation"
            />
          </>
        )}
      </View>

      <Text className={`mt-xl ${SECTION_LABEL_CLASSNAME}`}>NOTES</Text>
      <TextField
        className="mt-xs"
        value={notes}
        onChangeText={setNotes}
        placeholder="How did the match go?"
        multiline
        numberOfLines={3}
        style={{ minHeight: 80, textAlignVertical: 'top' }}
      />

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

import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { upsertProfile } from '../../api/profile';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { SelectableCard } from '../../components/SelectableCard';
import { TextField } from '../../components/TextField';
import { useAuthStore, useProfileStore } from '../../store';
import { useTheme } from '../../theme';
import type { Goal, Sport } from '../../types/models';

const STEPS = ['name', 'age', 'sport', 'goal', 'mentorName'] as const;
type Step = (typeof STEPS)[number];

const SPORT_OPTIONS: { value: Sport; label: string }[] = [
  { value: 'football', label: 'Football' },
  { value: 'hockey', label: 'Hockey' },
];

const GOAL_OPTIONS: { value: Goal; label: string; description: string }[] = [
  { value: 'improve_speed', label: 'Improve Speed', description: 'Get faster on the field or ice.' },
  { value: 'build_strength', label: 'Build Strength', description: 'Get stronger for contact and power.' },
  { value: 'improve_technique', label: 'Improve Technique', description: 'Sharpen your fundamentals.' },
  { value: 'increase_endurance', label: 'Increase Endurance', description: 'Last longer at full intensity.' },
  { value: 'prepare_for_season', label: 'Prepare for Season', description: 'Get ready for what is coming.' },
  { value: 'recover_from_injury', label: 'Recover from Injury', description: 'Come back stronger, safely.' },
];

export default function OnboardingScreen() {
  const { colors } = useTheme();
  const draft = useProfileStore((s) => s.draft);
  const updateDraft = useProfileStore((s) => s.updateDraft);
  const setProfile = useProfileStore((s) => s.setProfile);
  const userId = useAuthStore((s) => s.session?.user.id);

  const [stepIndex, setStepIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const step: Step = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;

  const canContinue = (() => {
    switch (step) {
      case 'name':
        return !!draft.name?.trim();
      case 'age':
        return !!draft.age && draft.age >= 6 && draft.age <= 100;
      case 'sport':
        return !!draft.sport;
      case 'goal':
        return !!draft.goal;
      case 'mentorName':
        return !!draft.mentorName?.trim();
    }
  })();

  const handleBack = () => setStepIndex((i) => Math.max(0, i - 1));

  const handleContinue = async () => {
    if (!isLastStep) {
      setStepIndex((i) => i + 1);
      return;
    }
    if (!userId) return;

    setIsSubmitting(true);
    try {
      const profile = await upsertProfile({
        id: userId,
        name: draft.name!.trim(),
        age: draft.age!,
        sport: draft.sport!,
        goal: draft.goal!,
        mentorName: draft.mentorName!.trim(),
      });
      setProfile(profile);
    } catch (e) {
      Alert.alert('Could not save your profile', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen scrollable>
      <View className="flex-1 pt-lg">
        <View className="flex-row items-center gap-sm">
          {stepIndex > 0 ? (
            <Pressable
              onPress={handleBack}
              className="h-11 w-11 items-center justify-center rounded-full bg-background-elevated active:opacity-70"
            >
              <Ionicons name="chevron-back" size={22} color={colors.text.primary} />
            </Pressable>
          ) : null}
          <View className="flex-1 flex-row gap-xs">
            {STEPS.map((s, i) => (
              <View
                key={s}
                className={`h-1 flex-1 rounded-full ${i <= stepIndex ? 'bg-brand-primary' : 'bg-background-elevated'}`}
              />
            ))}
          </View>
        </View>

        <View className="mt-xl flex-1">
          {step === 'name' && (
            <>
              <Text className="text-2xl font-extrabold text-text-primary">What&apos;s your name?</Text>
              <TextField
                className="mt-lg"
                value={draft.name ?? ''}
                onChangeText={(name) => updateDraft({ name })}
                placeholder="Your name"
                autoFocus
              />
            </>
          )}

          {step === 'age' && (
            <>
              <Text className="text-2xl font-extrabold text-text-primary">How old are you?</Text>
              <TextField
                className="mt-lg"
                value={draft.age ? String(draft.age) : ''}
                onChangeText={(text) =>
                  updateDraft({ age: text ? Number(text.replace(/[^0-9]/g, '')) : undefined })
                }
                placeholder="Age"
                keyboardType="number-pad"
              />
            </>
          )}

          {step === 'sport' && (
            <>
              <Text className="text-2xl font-extrabold text-text-primary">What do you play?</Text>
              <View className="mt-lg">
                {SPORT_OPTIONS.map((option) => (
                  <SelectableCard
                    key={option.value}
                    label={option.label}
                    selected={draft.sport === option.value}
                    onPress={() => updateDraft({ sport: option.value })}
                  />
                ))}
              </View>
            </>
          )}

          {step === 'goal' && (
            <>
              <Text className="text-2xl font-extrabold text-text-primary">What&apos;s your goal?</Text>
              <View className="mt-lg">
                {GOAL_OPTIONS.map((option) => (
                  <SelectableCard
                    key={option.value}
                    label={option.label}
                    description={option.description}
                    selected={draft.goal === option.value}
                    onPress={() => updateDraft({ goal: option.value })}
                  />
                ))}
              </View>
            </>
          )}

          {step === 'mentorName' && (
            <>
              <Text className="text-2xl font-extrabold text-text-primary">Name your AI mentor</Text>
              <Text className="mt-xs text-sm text-text-secondary">
                This is who will train with you every day.
              </Text>
              <TextField
                className="mt-lg"
                value={draft.mentorName ?? ''}
                onChangeText={(mentorName) => updateDraft({ mentorName })}
                placeholder="Mentor name"
                autoFocus
              />
            </>
          )}
        </View>

        <View className="mb-md">
          <Button
            label={isLastStep ? 'Finish' : 'Continue'}
            onPress={handleContinue}
            disabled={!canContinue}
            isLoading={isSubmitting}
          />
        </View>
      </View>
    </Screen>
  );
}

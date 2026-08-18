import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../theme';
import type { GoalProximity } from '../types/models';

const GOAL_PROXIMITY_OPTIONS: GoalProximity[] = [0, 25, 50, 75, 100];

interface GoalProximitySelectorProps {
  value: GoalProximity | undefined;
  onChange: (value: GoalProximity) => void;
}

/**
 * Always 5 discrete steps, never a continuous slider — the "how close do
 * you feel to your goal today" metric is meant to be a quick, low-friction
 * tap, not a fine-grained scale. Required on both training and match forms.
 */
export function GoalProximitySelector({ value, onChange }: GoalProximitySelectorProps) {
  const { colors } = useTheme();

  return (
    <View
      className="mt-xl rounded-lg border-2 px-md py-md"
      style={{ borderColor: colors.brand.secondaryText, backgroundColor: colors.background.elevated }}
    >
      <Text className="text-base font-extrabold" style={{ color: colors.brand.secondaryText }}>
        Ako blízko si dnes svojmu cieľu?
      </Text>
      <Text className="mt-xs text-sm text-text-secondary">Vyber jednu z možností.</Text>

      <View className="mt-md flex-row gap-xs">
        {GOAL_PROXIMITY_OPTIONS.map((option) => {
          const selected = value === option;
          return (
            <Pressable
              key={option}
              onPress={() => onChange(option)}
              className="h-14 flex-1 items-center justify-center rounded-md border-2"
              style={{
                borderColor: selected ? colors.brand.secondaryDark : colors.border.DEFAULT,
                backgroundColor: selected ? colors.brand.secondaryDark : colors.background.surface,
              }}
            >
              <Text
                className="text-base font-extrabold"
                style={{ color: selected ? colors.text.inverse : colors.text.primary }}
              >
                {option}%
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

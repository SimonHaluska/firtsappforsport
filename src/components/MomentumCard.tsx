import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, View } from 'react-native';
import { useTheme } from '../theme';
import type { MomentumStatus, UserMomentum } from '../types/models';

interface MomentumCardProps {
  momentum: UserMomentum | null;
}

const STATUS_ICON: Record<MomentumStatus, keyof typeof Ionicons.glyphMap> = {
  rising: 'trending-up',
  stable: 'remove',
  declining: 'trending-down',
};

const STATUS_LABEL: Record<MomentumStatus, string> = {
  rising: 'Momentum is rising',
  stable: 'Momentum is steady',
  declining: 'Momentum is easing off',
};

/**
 * Weekly streak/momentum summary — the "declining" state deliberately never
 * uses status.danger (red). A dip in activity isn't a failure the app
 * should scold the player for, so declining reads as muted/quiet, not
 * alarming, and momentumStatus is only ever shown once there's enough
 * history to actually compare against (see recalculate_user_momentum).
 */
export function MomentumCard({ momentum }: MomentumCardProps) {
  const { colors, gradients, spacing } = useTheme();

  if (!momentum) {
    return (
      <View className="mt-xl rounded-lg border border-border-subtle bg-background-elevated px-md py-md">
        <Text className="text-base font-bold text-text-primary">Start your first week</Text>
        <Text className="mt-xs text-sm text-text-secondary">
          Log a training or match to begin tracking your weekly streak.
        </Text>
      </View>
    );
  }

  const { currentStreakWeeks, longestStreakWeeks, momentumStatus } = momentum;

  const heroColor =
    momentumStatus === 'rising'
      ? colors.brand.secondaryText
      : momentumStatus === 'declining'
        ? colors.text.muted
        : colors.text.secondary;

  const borderColor = momentumStatus === 'rising' ? colors.brand.secondaryText : colors.border.subtle;

  const streakLine =
    currentStreakWeeks === 0
      ? 'Log this week to start your streak'
      : `${currentStreakWeeks} week${currentStreakWeeks === 1 ? '' : 's'} in a row`;

  return (
    <View className="mt-xl overflow-hidden rounded-lg border" style={{ borderColor }}>
      <LinearGradient
        colors={[`${gradients.primary[0]}1A`, `${gradients.primary[1]}1A`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.md }}
      >
        <View className="flex-row items-end gap-sm">
          <Text className="text-display font-black" style={{ color: heroColor }}>
            {currentStreakWeeks}
          </Text>
          {momentumStatus && (
            <Ionicons name={STATUS_ICON[momentumStatus]} size={22} color={heroColor} style={{ marginBottom: 8 }} />
          )}
        </View>

        <Text className="mt-xs text-sm font-semibold text-text-primary">{streakLine}</Text>

        {momentumStatus && (
          <Text className="mt-xs text-sm text-text-secondary">{STATUS_LABEL[momentumStatus]}</Text>
        )}

        {longestStreakWeeks > 0 && (
          <Text className="mt-sm text-xs text-text-muted">
            Longest streak: {longestStreakWeeks} week{longestStreakWeeks === 1 ? '' : 's'}
          </Text>
        )}
      </LinearGradient>
    </View>
  );
}

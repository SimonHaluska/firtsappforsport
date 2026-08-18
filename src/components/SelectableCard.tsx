import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../theme';

interface SelectableCardProps {
  label: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
}

export function SelectableCard({ label, description, selected, onPress }: SelectableCardProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      className={`mb-sm flex-row items-center rounded-lg border px-md py-md active:opacity-80 ${
        selected ? 'border-brand-primary bg-background-elevated' : 'border-border bg-background-surface'
      }`}
    >
      <View className="flex-1">
        <Text
          className={`text-base font-bold ${selected ? '' : 'text-text-secondary'}`}
          style={selected ? { color: colors.brand.primaryText } : undefined}
        >
          {label}
        </Text>
        {description ? <Text className="mt-xs text-sm text-text-secondary">{description}</Text> : null}
      </View>
      <Ionicons
        name={selected ? 'checkmark-circle' : 'ellipse-outline'}
        size={22}
        color={selected ? colors.brand.primaryText : colors.text.muted}
      />
    </Pressable>
  );
}

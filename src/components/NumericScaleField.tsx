import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../theme';

const SCALE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

interface NumericScaleFieldProps {
  label: string;
  value: number | undefined;
  onChange: (value: number) => void;
  className?: string;
}

/**
 * 1-10 chip scale, split into two rows of 5 so each chip stays tap-sized.
 * No card chrome of its own — it's meant to live inside a FormSection
 * alongside other related fields (e.g. intensity + energy before/after).
 */
export function NumericScaleField({ label, value, onChange, className = '' }: NumericScaleFieldProps) {
  const { colors } = useTheme();

  return (
    <View className={className}>
      <Text className="text-xs font-bold text-text-muted" style={{ letterSpacing: 0.8 }}>
        {label.toUpperCase()}
      </Text>
      <View className="mt-sm gap-xs">
        {[SCALE.slice(0, 5), SCALE.slice(5, 10)].map((row, rowIndex) => (
          <View key={rowIndex} className="flex-row gap-xs">
            {row.map((option) => {
              const selected = value === option;
              return (
                <Pressable
                  key={option}
                  onPress={() => onChange(option)}
                  className="h-10 flex-1 items-center justify-center rounded-md border"
                  style={{
                    borderColor: selected ? colors.brand.primary : colors.border.DEFAULT,
                    backgroundColor: selected ? colors.background.DEFAULT : colors.background.surface,
                  }}
                >
                  <Text
                    className="text-base font-bold"
                    style={{ color: selected ? colors.brand.primaryText : colors.text.primary }}
                  >
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

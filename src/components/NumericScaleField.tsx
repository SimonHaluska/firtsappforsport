import { Pressable, Text, View } from 'react-native';

const SCALE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

interface NumericScaleFieldProps {
  value: number | undefined;
  onChange: (value: number) => void;
}

/** 1-10 chip scale, split into two rows of 5 so each chip stays tap-sized. */
export function NumericScaleField({ value, onChange }: NumericScaleFieldProps) {
  return (
    <View className="mt-xs gap-xs">
      {[SCALE.slice(0, 5), SCALE.slice(5, 10)].map((row, rowIndex) => (
        <View key={rowIndex} className="flex-row gap-xs">
          {row.map((option) => {
            const selected = value === option;
            return (
              <Pressable
                key={option}
                onPress={() => onChange(option)}
                className={`h-10 flex-1 items-center justify-center rounded-md border ${
                  selected ? 'border-brand-primary bg-background-elevated' : 'border-border bg-background-surface'
                }`}
              >
                <Text className={`text-base font-bold ${selected ? 'text-brand-primary' : 'text-text-primary'}`}>
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

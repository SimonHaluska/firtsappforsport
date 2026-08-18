import { Pressable, Text, View } from 'react-native';

export interface SegmentedControlOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

/** One pill-shaped switcher — not a row of independent buttons. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className = '',
}: SegmentedControlProps<T>) {
  return (
    <View className={`flex-row rounded-lg bg-background-elevated p-xs ${className}`}>
      {options.map((option) => {
        const active = value === option.value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            className={`flex-1 items-center rounded-md py-sm ${active ? 'bg-background' : ''}`}
            style={
              active
                ? {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.08,
                    shadowRadius: 4,
                    elevation: 1,
                  }
                : undefined
            }
          >
            <Text className={`text-base font-bold ${active ? 'text-text-primary' : 'text-text-secondary'}`}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

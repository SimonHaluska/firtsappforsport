import { Ionicons } from '@expo/vector-icons';
import { useRef } from 'react';
import { ActivityIndicator, Animated, Pressable, Text } from 'react-native';
import type { GestureResponderEvent, PressableProps } from 'react-native';
import { useTheme } from '../theme';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary';

interface ButtonProps extends Omit<PressableProps, 'children'> {
  label: string;
  isLoading?: boolean;
  variant?: ButtonVariant;
  icon?: keyof typeof Ionicons.glyphMap;
}

const CONTAINER_CLASSNAME: Record<ButtonVariant, string> = {
  primary: 'bg-brand-primary',
  secondary: 'border border-border bg-background-elevated',
  tertiary: 'bg-transparent',
};

const LABEL_CLASSNAME: Record<ButtonVariant, string> = {
  primary: 'text-text-inverse',
  secondary: 'text-text-primary',
  tertiary: 'text-brand-primary',
};

export function Button({
  label,
  isLoading = false,
  variant = 'primary',
  disabled = false,
  className = '',
  icon,
  onPressIn,
  onPressOut,
  ...pressableProps
}: ButtonProps) {
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const isDisabled = disabled || isLoading;

  const animateTo = (toValue: number) => {
    Animated.spring(scale, {
      toValue,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();
  };

  const handlePressIn = (e: GestureResponderEvent) => {
    animateTo(0.96);
    onPressIn?.(e);
  };

  const handlePressOut = (e: GestureResponderEvent) => {
    animateTo(1);
    onPressOut?.(e);
  };

  const iconColor = variant === 'primary' ? colors.text.inverse : colors.brand.primary;

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        disabled={isDisabled}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        className={`flex-row items-center justify-center gap-xs rounded-md py-md ${CONTAINER_CLASSNAME[variant]} ${
          variant === 'tertiary' ? 'py-sm' : ''
        } ${isDisabled ? 'opacity-40' : ''} ${className}`}
        style={
          variant === 'primary' && !isDisabled
            ? {
                shadowColor: colors.brand.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
                elevation: 4,
              }
            : undefined
        }
        {...pressableProps}
      >
        {isLoading ? (
          <ActivityIndicator color={iconColor} />
        ) : (
          <>
            {icon ? <Ionicons name={icon} size={18} color={iconColor} /> : null}
            <Text className={`text-base font-bold ${LABEL_CLASSNAME[variant]}`}>{label}</Text>
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}

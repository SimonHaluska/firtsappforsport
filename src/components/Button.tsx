import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRef } from 'react';
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text } from 'react-native';
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
  primary: '',
  secondary: 'border border-border bg-background-elevated',
  tertiary: 'bg-transparent',
};

const LABEL_CLASSNAME: Record<ButtonVariant, string> = {
  primary: 'text-text-inverse',
  secondary: 'text-text-primary',
  tertiary: '',
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
  const { colors, gradients } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const isDisabled = disabled || isLoading;
  const isPrimary = variant === 'primary';

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

  const iconColor = isPrimary ? colors.text.inverse : colors.brand.primaryText;

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        disabled={isDisabled}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        className={`flex-row items-center justify-center gap-xs overflow-hidden rounded-md py-md ${
          CONTAINER_CLASSNAME[variant]
        } ${isPrimary ? 'min-h-[52px]' : ''} ${variant === 'tertiary' ? 'py-sm' : ''} ${
          isDisabled ? 'opacity-40' : ''
        } ${className}`}
        style={
          isPrimary && !isDisabled
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
        {isPrimary && (
          <LinearGradient
            colors={gradients.primary as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFillObject}
          />
        )}
        {isLoading ? (
          <ActivityIndicator color={iconColor} />
        ) : (
          <>
            {icon ? <Ionicons name={icon} size={18} color={iconColor} /> : null}
            <Text
              className={`text-base font-bold ${LABEL_CLASSNAME[variant]}`}
              style={variant === 'tertiary' ? { color: colors.brand.primaryText } : undefined}
            >
              {label}
            </Text>
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}

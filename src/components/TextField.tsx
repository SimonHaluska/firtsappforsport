import { useId, useState } from 'react';
import { InputAccessoryView, Keyboard, Platform, Pressable, Text, TextInput, View } from 'react-native';
import type { KeyboardTypeOptions, TextInputProps } from 'react-native';
import { useTheme } from '../theme';

type FocusHandler = NonNullable<TextInputProps['onFocus']>;

const NUMERIC_KEYBOARD_TYPES: KeyboardTypeOptions[] = ['number-pad', 'numeric', 'decimal-pad', 'phone-pad'];

export function TextField({ className = '', keyboardType, onFocus, onBlur, style, ...props }: TextInputProps) {
  const { colors } = useTheme();
  const accessoryId = useId();
  const [isFocused, setIsFocused] = useState(false);
  const needsDoneBar = Platform.OS === 'ios' && !!keyboardType && NUMERIC_KEYBOARD_TYPES.includes(keyboardType);

  const handleFocus: FocusHandler = (e) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur: FocusHandler = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  return (
    <>
      <TextInput
        placeholderTextColor={colors.text.muted}
        keyboardType={keyboardType}
        inputAccessoryViewID={needsDoneBar ? accessoryId : undefined}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={`rounded-md border bg-background-elevated px-md py-md text-base font-medium text-text-primary ${
          isFocused ? 'border-brand-primary' : 'border-border'
        } ${className}`}
        style={[
          isFocused
            ? {
                shadowColor: colors.brand.primary,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.15,
                shadowRadius: 6,
                elevation: 2,
              }
            : undefined,
          style,
        ]}
        {...props}
      />
      {needsDoneBar && (
        <InputAccessoryView nativeID={accessoryId}>
          <View className="flex-row justify-end border-t border-border bg-background-surface px-md py-sm">
            <Pressable onPress={() => Keyboard.dismiss()}>
              <Text className="text-base font-bold" style={{ color: colors.brand.primaryText }}>
                Done
              </Text>
            </Pressable>
          </View>
        </InputAccessoryView>
      )}
    </>
  );
}

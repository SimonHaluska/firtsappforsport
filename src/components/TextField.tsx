import { useId } from 'react';
import { InputAccessoryView, Keyboard, Platform, Pressable, Text, TextInput, View } from 'react-native';
import type { KeyboardTypeOptions, TextInputProps } from 'react-native';
import { useTheme } from '../theme';

const NUMERIC_KEYBOARD_TYPES: KeyboardTypeOptions[] = ['number-pad', 'numeric', 'decimal-pad', 'phone-pad'];

export function TextField({ className = '', keyboardType, ...props }: TextInputProps) {
  const { colors } = useTheme();
  const accessoryId = useId();
  const needsDoneBar = Platform.OS === 'ios' && !!keyboardType && NUMERIC_KEYBOARD_TYPES.includes(keyboardType);

  return (
    <>
      <TextInput
        placeholderTextColor={colors.text.muted}
        keyboardType={keyboardType}
        inputAccessoryViewID={needsDoneBar ? accessoryId : undefined}
        className={`rounded-md border border-border bg-background-surface px-md py-md text-base text-text-primary ${className}`}
        {...props}
      />
      {needsDoneBar && (
        <InputAccessoryView nativeID={accessoryId}>
          <View className="flex-row justify-end border-t border-border bg-background-surface px-md py-sm">
            <Pressable onPress={() => Keyboard.dismiss()}>
              <Text className="text-base font-bold text-brand-primary">Done</Text>
            </Pressable>
          </View>
        </InputAccessoryView>
      )}
    </>
  );
}

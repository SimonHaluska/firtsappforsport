import type { PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenProps extends PropsWithChildren {
  className?: string;
  /** Makes content scrollable so it stays reachable when the keyboard is open. */
  scrollable?: boolean;
}

export function Screen({ children, className = '', scrollable = false }: ScreenProps) {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {scrollable ? (
          <ScrollView
            className={`flex-1 px-lg ${className}`}
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        ) : (
          <View className={`flex-1 px-lg ${className}`}>{children}</View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

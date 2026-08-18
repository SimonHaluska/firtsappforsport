import type { PropsWithChildren } from 'react';
import { View } from 'react-native';

interface FormSectionProps extends PropsWithChildren {
  className?: string;
}

/** Visual grouping for a cluster of related form fields — gives the form
 * "card in card" rhythm instead of one continuous block. */
export function FormSection({ children, className = '' }: FormSectionProps) {
  return (
    <View className={`rounded-lg border border-border-subtle bg-background-elevated px-md py-md ${className}`}>
      {children}
    </View>
  );
}

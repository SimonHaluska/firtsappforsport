import { useState } from 'react';
import { Alert, Image, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { TextField } from '../../components/TextField';
import { supabase } from '../../lib/supabase';

const logo = require('../../../assets/logo.png');

export default function AuthScreen() {
  const [mode, setMode] = useState<'sign_in' | 'sign_up'>('sign_in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    console.log('[AuthScreen] handleSubmit fired, mode:', mode);
    setIsSubmitting(true);
    try {
      const { data, error } =
        mode === 'sign_in'
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({ email, password });

      console.log('[AuthScreen] response data:', data);
      console.log('[AuthScreen] response error:', error);

      if (error) {
        Alert.alert('Something went wrong', error.message);
        return;
      }

      if (mode === 'sign_up' && !data.session) {
        Alert.alert(
          'Check your email',
          'We sent you a confirmation link. Confirm your email, then sign in.'
        );
      }
    } catch (e) {
      console.log('[AuthScreen] signUp/signIn threw:', e);
      Alert.alert('Something went wrong', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen scrollable>
      <View className="flex-1 justify-center">
        <Image source={logo} className="h-16 w-16 rounded-lg" resizeMode="contain" />
        <Text className="mt-md text-4xl font-black text-text-primary">Monument Vision</Text>
        <Text className="mt-sm text-base text-text-secondary">
          {mode === 'sign_in' ? 'Sign in to continue.' : 'Create your account.'}
        </Text>

        <TextField
          className="mt-xl"
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextField
          className="mt-sm"
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
        />

        <Button
          className="mt-lg"
          label={mode === 'sign_in' ? 'Sign In' : 'Sign Up'}
          onPress={handleSubmit}
          isLoading={isSubmitting}
          disabled={!email || !password}
        />

        <Button
          className="mt-xs"
          variant="tertiary"
          label={mode === 'sign_in' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          onPress={() => setMode((m) => (m === 'sign_in' ? 'sign_up' : 'sign_in'))}
        />
      </View>
    </Screen>
  );
}

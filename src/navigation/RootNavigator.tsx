import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { fetchProfile } from '../api/profile';
import { supabase } from '../lib/supabase';
import AuthScreen from '../screens/auth/AuthScreen';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import { useAuthStore, useProfileStore } from '../store';
import { useTheme } from '../theme';
import { MainTabNavigator } from './MainTabNavigator';
import { getNavigationTheme } from './theme';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { mode, colors } = useTheme();
  const session = useAuthStore((s) => s.session);
  const isInitializing = useAuthStore((s) => s.isInitializing);
  const setSession = useAuthStore((s) => s.setSession);
  const setInitializing = useAuthStore((s) => s.setInitializing);
  const profile = useProfileStore((s) => s.profile);
  const setProfile = useProfileStore((s) => s.setProfile);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setInitializing(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, [setSession, setInitializing]);

  useEffect(() => {
    const userId = session?.user.id;
    if (!userId) {
      setProfile(null);
      return;
    }

    fetchProfile(userId).then((profile) => {
      if (profile) setProfile(profile);
    });
  }, [session?.user.id, setProfile]);

  if (isInitializing) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={colors.brand.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={getNavigationTheme(mode)}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!session ? (
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : !profile?.onboardingComplete ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : (
          <Stack.Screen name="Main" component={MainTabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

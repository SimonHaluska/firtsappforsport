import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ChatScreen from '../screens/main/ChatScreen';
import HomeScreen from '../screens/main/HomeScreen';
import LogScreen from '../screens/main/LogScreen';
import ScheduleScreen from '../screens/main/ScheduleScreen';
import { useTheme } from '../theme';
import type { MainTabParamList } from './types';

const TAB_ICONS: Record<keyof MainTabParamList, { filled: keyof typeof Ionicons.glyphMap; outline: keyof typeof Ionicons.glyphMap }> = {
  Home: { filled: 'home', outline: 'home-outline' },
  Log: { filled: 'clipboard', outline: 'clipboard-outline' },
  Schedule: { filled: 'calendar', outline: 'calendar-outline' },
  Chat: { filled: 'chatbubble-ellipses', outline: 'chatbubble-ellipses-outline' },
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabNavigator() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.brand.primary,
        tabBarInactiveTintColor: colors.text.muted,
        tabBarStyle: {
          backgroundColor: colors.background.surface,
          borderTopColor: colors.border.DEFAULT,
        },
        tabBarLabelStyle: { fontWeight: '600', fontSize: 11 },
        tabBarIcon: ({ color, focused, size }) => {
          const icons = TAB_ICONS[route.name as keyof MainTabParamList];
          return <Ionicons name={focused ? icons.filled : icons.outline} size={size ?? 24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Log" component={LogScreen} />
      <Tab.Screen name="Schedule" component={ScheduleScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
    </Tab.Navigator>
  );
}

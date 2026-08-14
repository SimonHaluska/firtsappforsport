import { Text } from 'react-native';
import { Screen } from '../../components/Screen';
import { useProfileStore } from '../../store';

export default function ChatScreen() {
  const mentorName = useProfileStore((s) => s.profile?.mentorName);

  return (
    <Screen className="pt-lg">
      <Text className="text-3xl font-extrabold text-text-primary">{mentorName ?? 'Your Mentor'}</Text>
      <Text className="mt-sm text-base text-text-secondary">Chat with your AI mentor will show up here.</Text>
    </Screen>
  );
}

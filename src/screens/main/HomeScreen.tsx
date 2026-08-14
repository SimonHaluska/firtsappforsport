import { Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { useLogData } from '../../hooks/useLogData';
import { useScheduleData } from '../../hooks/useScheduleData';
import { formatRelativeDate, isWithinLastDays, todayISODate } from '../../lib/date';
import { SCHEDULE_TYPE_COLOR, SCHEDULE_TYPE_LABEL } from '../../lib/scheduleTypes';
import { useProfileStore } from '../../store';

export default function HomeScreen() {
  const profile = useProfileStore((s) => s.profile);
  const { entries: scheduleEntries } = useScheduleData();
  const { entries: logEntries } = useLogData();

  const todayEntry = scheduleEntries.find((e) => e.date === todayISODate());
  const lastEntry = logEntries[0];
  const sessionsThisWeek = logEntries.filter((e) => isWithinLastDays(e.date, 7)).length;

  return (
    <Screen className="pt-lg">
      <Text className="text-3xl font-extrabold text-text-primary">
        Welcome back{profile?.name ? `, ${profile.name}` : ''}
      </Text>
      <Text className="mt-sm text-base text-text-secondary">
        {profile?.mentorName ? `${profile.mentorName} is ready when you are.` : 'Your mentor is ready when you are.'}
      </Text>

      <View className="mt-xl rounded-lg border border-border bg-background-surface px-md py-md">
        <Text className="text-sm font-semibold text-text-secondary">TODAY</Text>
        <View className="mt-xs flex-row items-center gap-sm">
          <View
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: todayEntry ? SCHEDULE_TYPE_COLOR[todayEntry.type] : SCHEDULE_TYPE_COLOR.rest }}
          />
          <Text className="text-lg font-bold text-text-primary">
            {todayEntry ? SCHEDULE_TYPE_LABEL[todayEntry.type] : 'No plan set yet'}
          </Text>
        </View>
        {!todayEntry && (
          <Text className="mt-xs text-sm text-text-secondary">Head to Schedule to plan today.</Text>
        )}
      </View>

      <View className="mt-md rounded-lg border border-border bg-background-surface px-md py-md">
        <Text className="text-sm font-semibold text-text-secondary">RECENT ACTIVITY</Text>
        {lastEntry ? (
          <>
            <Text className="mt-xs text-lg font-bold text-text-primary">
              {lastEntry.type === 'match' ? 'Match' : 'Training'} · {formatRelativeDate(lastEntry.date)}
            </Text>
            <Text className="mt-xs text-sm text-text-secondary">
              {lastEntry.durationMinutes} min · Felt {lastEntry.intensity}/5
            </Text>
            <Text className="mt-sm text-sm text-text-secondary">
              {sessionsThisWeek} session{sessionsThisWeek === 1 ? '' : 's'} logged this week
            </Text>
          </>
        ) : (
          <Text className="mt-xs text-sm text-text-secondary">
            No sessions logged yet — head to Log after your next workout.
          </Text>
        )}
      </View>
    </Screen>
  );
}

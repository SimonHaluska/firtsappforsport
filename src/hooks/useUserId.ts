import { useAuthStore } from '../store';

export function useUserId(): string | undefined {
  return useAuthStore((s) => s.session?.user.id);
}

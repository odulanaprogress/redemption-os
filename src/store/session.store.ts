import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SessionState {
  activeSessionId: string | null;
  activeSessionName: string | null;
  setSession: (id: string, name: string) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      // By default, if no session is set, we might use a default one or null.
      // For backward compatibility and demo, we'll start with a default "DEFAULT_SESSION".
      activeSessionId: 'DEFAULT_SESSION',
      activeSessionName: 'Main Event Session',
      setSession: (id, name) => set({ activeSessionId: id, activeSessionName: name }),
      clearSession: () => set({ activeSessionId: null, activeSessionName: null }),
    }),
    {
      name: 'redemption-session-storage',
    }
  )
);

import {
  useState,
  useEffect,
  useCallback,
} from 'react';
import type { ReactNode } from 'react';
import {
  getAllMoodEntries,
  getTodayDateKey,
  saveMoodEntry as persistMoodEntry,
} from '../utils/moodStorage';
import type { MoodEntry, MoodKey } from '../utils/moodStorage';
import { MoodContext } from './moodContextDef';

export function MoodProvider({ children }: { children: ReactNode }) {
  const [todayKey, setTodayKey] = useState<string>(() => getTodayDateKey());
  const [entries, setEntries] = useState<Record<string, MoodEntry>>(() =>
    getAllMoodEntries(),
  );

  const todayEntry = entries[todayKey] || null;

  const refreshMoods = useCallback(() => {
    const currentToday = getTodayDateKey();
    const freshEntries = getAllMoodEntries();
    setTodayKey(currentToday);
    setEntries(freshEntries);
  }, []);

  const saveEntry = useCallback(
    (input: {
      date?: string;
      mood: MoodKey;
      note?: string;
      customRecordedAt?: string;
      customUpdatedAt?: string;
    }) => {
      const saved = persistMoodEntry(input);
      // Immediately refresh entries to guarantee consistency across all active views
      const freshEntries = getAllMoodEntries();
      const currentToday = getTodayDateKey();
      setTodayKey(currentToday);
      setEntries(freshEntries);
      return saved;
    },
    [],
  );

  const getEntry = useCallback(
    (dateKey: string) => {
      return entries[dateKey] || null;
    },
    [entries],
  );

  useEffect(() => {
    // 1. Refresh whenever the window regains focus or app comes to foreground
    const handleFocus = () => {
      refreshMoods();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshMoods();
      }
    };

    // 2. Sync on cross-tab storage changes
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'twoway_mood_entries' || event.key === null) {
        refreshMoods();
      }
    };

    // 3. Sync on in-app custom event
    const handleMoodSync = () => {
      refreshMoods();
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('storage', handleStorage);
    window.addEventListener('twoway-mood-updated', handleMoodSync);

    // 4. Detect midnight date rollover while the app remains open
    const intervalId = setInterval(() => {
      const currentToday = getTodayDateKey();
      if (currentToday !== todayKey) {
        // Date changed! Reset todayKey and refresh state
        refreshMoods();
      }
    }, 10000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('twoway-mood-updated', handleMoodSync);
      clearInterval(intervalId);
    };
  }, [refreshMoods, todayKey]);

  return (
    <MoodContext.Provider
      value={{
        entries,
        todayKey,
        todayEntry,
        getEntry,
        saveEntry,
        refreshMoods,
      }}
    >
      {children}
    </MoodContext.Provider>
  );
}

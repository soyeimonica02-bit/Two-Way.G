import { createContext } from 'react';
import type { MoodEntry, MoodKey } from '../utils/moodStorage';

export interface MoodContextValue {
  entries: Record<string, MoodEntry>;
  todayKey: string;
  todayEntry: MoodEntry | null;
  getEntry: (dateKey: string) => MoodEntry | null;
  saveEntry: (input: {
    date?: string;
    mood: MoodKey;
    note?: string;
    customRecordedAt?: string;
    customUpdatedAt?: string;
  }) => MoodEntry;
  refreshMoods: () => void;
}

export const MoodContext = createContext<MoodContextValue | null>(null);

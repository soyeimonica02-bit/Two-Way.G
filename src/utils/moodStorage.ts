export type MoodKey = 'good' | 'okay' | 'low' | 'frustrated' | 'anxious';

export interface MoodEntry {
  id: string; // Stable entry ID
  date: string; // 'YYYY-MM-DD' in user's local calendar
  mood: MoodKey;
  emoji: string;
  note: string;
  recordedAt?: string; // Exact recorded timestamp in ISO 8601 format
  updatedAt?: string; // Last-updated timestamp in ISO 8601 format if edited
}

export const MOOD_DEFINITIONS: Record<
  MoodKey,
  { emoji: string; label: string }
> = {
  good: { emoji: '🙂', label: 'Good' },
  okay: { emoji: '😐', label: 'Okay' },
  low: { emoji: '😔', label: 'Low' },
  frustrated: { emoji: '😤', label: 'Frustrated' },
  anxious: { emoji: '😟', label: 'Anxious' },
};

const STORAGE_KEY = 'twoway_mood_entries';

/**
 * Format year, month (0-indexed), and day into canonical YYYY-MM-DD.
 */
export function formatDateKey(
  year: number,
  monthIndex: number,
  day: number,
): string {
  const m = String(monthIndex + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

/**
 * Returns the local calendar date key (YYYY-MM-DD) for a given Date object (defaults to now).
 */
export function getLocalDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns today's date key in YYYY-MM-DD according to the user's local calendar.
 */
export function getTodayDateKey(): string {
  return getLocalDateKey(new Date());
}

/**
 * Notify all listeners across the window that mood data was updated.
 */
export function notifyMoodUpdated(entry?: MoodEntry): void {
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(
        new CustomEvent('twoway-mood-updated', { detail: entry }),
      );
    } catch {
      // Ignore in non-browser environments
    }
  }
}

/**
 * Format an ISO 8601 timestamp into a readable local time, e.g. "Recorded at 8:42 AM".
 * Never fabricates a time: returns null if isoString is missing or invalid.
 */
export function formatRecordedTime(isoString?: string): string | null {
  if (!isoString) return null;
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return null;
    const timeStr = d.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });
    return `Recorded at ${timeStr}`;
  } catch {
    return null;
  }
}

/**
 * Format an ISO 8601 timestamp into a readable local time, e.g. "Updated at 9:15 AM".
 * Never fabricates a time: returns null if isoString is missing or invalid.
 */
export function formatUpdatedTime(isoString?: string): string | null {
  if (!isoString) return null;
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return null;
    const timeStr = d.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });
    return `Updated at ${timeStr}`;
  } catch {
    return null;
  }
}

/**
 * Retrieve all saved mood entries from canonical storage, migrating legacy keys if necessary.
 * Preserves all historical records without fabricating missing timestamps.
 */
export function getAllMoodEntries(): Record<string, MoodEntry> {
  const entries: Record<string, MoodEntry> = {};

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        Object.keys(parsed).forEach((key) => {
          const item = parsed[key];
          if (item && typeof item === 'object' && item.mood && MOOD_DEFINITIONS[item.mood as MoodKey]) {
            const dateKey = item.date || key;
            const mood = item.mood as MoodKey;
            const def = MOOD_DEFINITIONS[mood];

            entries[dateKey] = {
              id: item.id || `mood-${dateKey}`,
              date: dateKey,
              mood,
              emoji: item.emoji || def.emoji,
              note: (item.note || '').trim(),
              ...(item.recordedAt ? { recordedAt: item.recordedAt } : {}),
              ...(item.updatedAt ? { updatedAt: item.updatedAt } : {}),
            };
          }
        });
      }
    }
  } catch (error) {
    console.error('Error reading mood entries:', error);
  }

  // Backfill from legacy individual date keys (twoway_mood_YYYY_M_D) if not in central store
  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const storageKey = localStorage.key(i);
      if (storageKey && storageKey.startsWith('twoway_mood_')) {
        const parts = storageKey.replace('twoway_mood_', '').split('_');
        if (parts.length === 3) {
          const y = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10); // 0-indexed month
          const d = parseInt(parts[2], 10);

          if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
            const dateKey = formatDateKey(y, m, d);
            if (!entries[dateKey]) {
              const legacyMood = localStorage.getItem(storageKey) as MoodKey | null;
              const legacyNote = localStorage.getItem(`twoway_note_${y}_${m}_${d}`) || '';

              if (legacyMood && MOOD_DEFINITIONS[legacyMood]) {
                entries[dateKey] = {
                  id: `mood-${dateKey}`,
                  date: dateKey,
                  mood: legacyMood,
                  emoji: MOOD_DEFINITIONS[legacyMood].emoji,
                  note: legacyNote.trim(),
                  // Note: do NOT fabricate a recordedAt timestamp for legacy entries without one
                };
              }
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error migrating legacy date keys:', error);
  }

  // Remove stale un-dated legacy key so it never poisons today or future dates
  try {
    if (localStorage.getItem('twoway_today_mood')) {
      localStorage.removeItem('twoway_today_mood');
    }
  } catch {
    // Ignore
  }

  return entries;
}

/**
 * Get entry for a specific YYYY-MM-DD date. Returns null if none recorded.
 */
export function getMoodEntry(dateKey: string): MoodEntry | null {
  const all = getAllMoodEntries();
  return all[dateKey] || null;
}

/**
 * Get entry specifically for today's local date. Returns null if no entry exists for today.
 * Never returns historical or yesterday's mood as today's mood.
 */
export function getTodayMoodEntry(): MoodEntry | null {
  const todayKey = getTodayDateKey();
  return getMoodEntry(todayKey);
}

/**
 * Saves a daily mood entry for the given date (defaults to today's local date).
 * - Enforces one entry per calendar date.
 * - If updating an existing entry: preserves original recordedAt, updates updatedAt.
 * - If creating a new entry: sets recordedAt to current ISO timestamp.
 * - Keeps legacy keys synchronized for backward compatibility.
 * - Dispatches update event across components.
 */
export function saveMoodEntry(entry: {
  date?: string;
  mood: MoodKey;
  note?: string;
  customRecordedAt?: string;
  customUpdatedAt?: string;
}): MoodEntry {
  const all = getAllMoodEntries();
  const dateKey = entry.date || getTodayDateKey();
  const existing = all[dateKey];
  const nowIso = new Date().toISOString();

  const id = existing?.id || `mood-${dateKey}-${Date.now()}`;
  const def = MOOD_DEFINITIONS[entry.mood] || { emoji: '🙂', label: 'Good' };
  const cleanNote = (entry.note !== undefined ? entry.note : (existing?.note || '')).trim();

  // If existing: preserve original recorded timestamp if present
  // If brand new entry: record now
  const recordedAt = existing
    ? (existing.recordedAt || entry.customRecordedAt)
    : (entry.customRecordedAt || nowIso);

  const updatedAt = existing
    ? (entry.customUpdatedAt || nowIso)
    : entry.customUpdatedAt;

  const newEntry: MoodEntry = {
    id,
    date: dateKey,
    mood: entry.mood,
    emoji: def.emoji,
    note: cleanNote,
    ...(recordedAt ? { recordedAt } : {}),
    ...(updatedAt ? { updatedAt } : {}),
  };

  all[dateKey] = newEntry;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch (error) {
    console.error('Error saving mood entries:', error);
  }

  // Keep legacy individual keys in sync for backward compatibility
  try {
    const parts = dateKey.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      localStorage.setItem(`twoway_mood_${y}_${m}_${d}`, entry.mood);
      localStorage.setItem(`twoway_note_${y}_${m}_${d}`, cleanNote);
    }
  } catch {
    // Ignore
  }

  notifyMoodUpdated(newEntry);

  return newEntry;
}

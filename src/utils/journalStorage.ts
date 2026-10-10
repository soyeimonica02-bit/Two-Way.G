export interface JournalEntry {
  id: string; // Unique stable ID (e.g. journal_1728556700000_abc123)
  title?: string; // Optional title
  body: string; // Main text content
  createdAt: string; // Original creation timestamp in ISO 8601
  updatedAt: string; // Last updated timestamp in ISO 8601
}

export interface JournalLockState {
  enabled: boolean;
  passcode: string; // Prototype passcode stored locally
}

export const STORAGE_KEY_JOURNAL_ENTRIES = 'twoway_haven_journal_entries';
export const LEGACY_STORAGE_KEY_JOURNAL = 'twoway_haven_journal_entry';
export const STORAGE_KEY_JOURNAL_LOCK = 'twoway_haven_journal_lock_config';
export const SESSION_KEY_JOURNAL_UNLOCKED = 'twoway_haven_journal_session_unlocked';

/**
 * Format ISO 8601 string to a friendly readable date & time in the user's local timezone.
 */
export function formatJournalDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Recently';

    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  } catch {
    return 'Recently';
  }
}

/**
 * Get short preview of body text.
 */
export function getJournalPreview(body: string, maxLength: number = 110): string {
  const trimmed = body.trim().replace(/\s+/g, ' ');
  if (!trimmed) return 'No content';
  if (trimmed.length <= maxLength) return trimmed;
  return trimmed.slice(0, maxLength) + '…';
}

/**
 * Load entries with safe migration from old single-draft format.
 * Never silently overwrites or deletes existing content.
 */
export function loadJournalEntries(): JournalEntry[] {
  if (typeof window === 'undefined') return [];

  let entries: JournalEntry[] = [];
  const raw = localStorage.getItem(STORAGE_KEY_JOURNAL_ENTRIES);

  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        entries = parsed.filter(
          (item) => item && typeof item.id === 'string' && typeof item.body === 'string'
        );
      }
    } catch (e) {
      console.warn('Failed to parse journal entries collection:', e);
    }
  }

  // Safe migration for legacy single-draft entry if it exists and hasn't been migrated
  try {
    const legacyDraft = localStorage.getItem(LEGACY_STORAGE_KEY_JOURNAL);
    if (legacyDraft && legacyDraft.trim().length > 0) {
      // Check if this text is already present in an entry
      const alreadyPresent = entries.some(
        (e) => e.body.trim() === legacyDraft.trim()
      );
      if (!alreadyPresent) {
        const nowIso = new Date().toISOString();
        const migratedEntry: JournalEntry = {
          id: `journal_migrated_${Date.now()}`,
          title: 'Imported Journal Entry',
          body: legacyDraft.trim(),
          createdAt: nowIso,
          updatedAt: nowIso,
        };
        // Prepend so it is retained safely
        entries = [migratedEntry, ...entries];
        localStorage.setItem(STORAGE_KEY_JOURNAL_ENTRIES, JSON.stringify(entries));
      }
    }
  } catch (e) {
    console.warn('Migration of legacy journal entry encountered an issue:', e);
  }

  // Sort newest first by createdAt / updatedAt
  return entries.sort((a, b) => {
    const timeA = new Date(a.updatedAt || a.createdAt).getTime();
    const timeB = new Date(b.updatedAt || b.createdAt).getTime();
    return timeB - timeA;
  });
}

/**
 * Save entries array to localStorage.
 */
export function saveAllJournalEntries(entries: JournalEntry[]): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(STORAGE_KEY_JOURNAL_ENTRIES, JSON.stringify(entries));
    // Also dispatch an event so other listeners (like privacy tab) can be aware if needed
    window.dispatchEvent(new CustomEvent('twoway-journal-updated'));
    return true;
  } catch (err) {
    console.error('Failed to save journal entries:', err);
    return false;
  }
}

/**
 * Save or update a single entry.
 * If entry exists, preserves original createdAt, updates updatedAt.
 * If new, creates new entry with stable id and timestamps.
 */
export function saveJournalEntry(entryData: {
  id?: string;
  title?: string;
  body: string;
}): { success: boolean; entry?: JournalEntry; error?: string } {
  try {
    const existing = loadJournalEntries();
    const nowIso = new Date().toISOString();

    if (entryData.id) {
      // Updating existing entry
      const index = existing.findIndex((e) => e.id === entryData.id);
      if (index >= 0) {
        const current = existing[index];
        const updatedEntry: JournalEntry = {
          ...current,
          title: entryData.title?.trim() || undefined,
          body: entryData.body.trim(),
          updatedAt: nowIso,
          // preserves current.createdAt
        };
        existing[index] = updatedEntry;
        const saved = saveAllJournalEntries(existing);
        if (saved) return { success: true, entry: updatedEntry };
        return { success: false, error: 'Could not write to local storage.' };
      }
    }

    // Creating new entry
    const newId = `journal_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const newEntry: JournalEntry = {
      id: newId,
      title: entryData.title?.trim() || undefined,
      body: entryData.body.trim(),
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    const updatedList = [newEntry, ...existing];
    const saved = saveAllJournalEntries(updatedList);
    if (saved) return { success: true, entry: newEntry };
    return { success: false, error: 'Could not write to local storage.' };
  } catch (err) {
    console.error('Error saving journal entry:', err);
    return {
      success: false,
      error: 'An unexpected storage error occurred while saving.',
    };
  }
}

/**
 * Delete a journal entry by ID.
 */
export function deleteJournalEntry(id: string): boolean {
  try {
    const existing = loadJournalEntries();
    const filtered = existing.filter((e) => e.id !== id);
    return saveAllJournalEntries(filtered);
  } catch (err) {
    console.error('Failed to delete journal entry:', err);
    return false;
  }
}

/**
 * Get lock configuration.
 */
export function getJournalLockConfig(): JournalLockState {
  if (typeof window === 'undefined') return { enabled: false, passcode: '' };

  // Check dedicated journal lock config
  const raw = localStorage.getItem(STORAGE_KEY_JOURNAL_LOCK);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.enabled === 'boolean') {
        return {
          enabled: parsed.enabled,
          passcode: parsed.passcode || '',
        };
      }
    } catch {
      // Fallback
    }
  }

  // Fallback to Haven passcode if set in SettingsHaven
  const havenPasscode = localStorage.getItem('twoway_haven_passcode');
  if (havenPasscode && havenPasscode.trim().length > 0) {
    return {
      enabled: true,
      passcode: havenPasscode.trim(),
    };
  }

  return { enabled: false, passcode: '' };
}

/**
 * Save lock configuration.
 */
export function saveJournalLockConfig(config: JournalLockState): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(STORAGE_KEY_JOURNAL_LOCK, JSON.stringify(config));
    // Also sync with haven passcode for compatibility
    if (config.enabled && config.passcode) {
      localStorage.setItem('twoway_haven_passcode', config.passcode);
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if the journal is unlocked in current browser session.
 */
export function isJournalSessionUnlocked(): boolean {
  if (typeof window === 'undefined') return false;
  const config = getJournalLockConfig();
  if (!config.enabled) return true; // not locked

  try {
    return sessionStorage.getItem(SESSION_KEY_JOURNAL_UNLOCKED) === 'true';
  } catch {
    return false;
  }
}

/**
 * Unlock journal for current session.
 */
export function setJournalSessionUnlocked(unlocked: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    if (unlocked) {
      sessionStorage.setItem(SESSION_KEY_JOURNAL_UNLOCKED, 'true');
    } else {
      sessionStorage.removeItem(SESSION_KEY_JOURNAL_UNLOCKED);
    }
  } catch {
    // Ignore
  }
}

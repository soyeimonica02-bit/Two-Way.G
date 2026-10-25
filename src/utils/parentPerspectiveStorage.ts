export interface ParentReflectionNote {
  id: string;
  title: string;
  content: string;
  tag: 'Breakthrough' | 'Tough Moment' | 'Boundary' | 'Personal Growth' | 'Observation';
  createdAt: string;
  updatedAt: string;
}

export interface ParentLearningGoal {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

export const STORAGE_KEY_PARENT_REFLECTIONS = 'twoway_parent_reflections';
export const STORAGE_KEY_SAVED_GUIDES = 'twoway_parent_saved_guides';
export const STORAGE_KEY_COMPLETED_ACTIVITIES = 'twoway_parent_completed_activities';
export const STORAGE_KEY_LEARNING_GOALS = 'twoway_parent_learning_goals';
export const STORAGE_KEY_DAILY_DISMISSED = 'twoway_parent_daily_dismissed';

export function generateId(prefix = 'pr'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

// -------------------------------------------------------------
// PARENT REFLECTION NOTES (PRIVATE TO PARENT ONLY)
// -------------------------------------------------------------

export function loadParentReflections(): ParentReflectionNote[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PARENT_REFLECTIONS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
  } catch (error) {
    console.error('Failed to load parent reflections:', error);
    return [];
  }
}

export function saveParentReflection(note: {
  id?: string;
  title: string;
  content: string;
  tag: ParentReflectionNote['tag'];
}): ParentReflectionNote {
  const existing = loadParentReflections();
  const now = new Date().toISOString();

  if (note.id) {
    const idx = existing.findIndex((n) => n.id === note.id);
    if (idx !== -1) {
      const updated: ParentReflectionNote = {
        ...existing[idx],
        title: note.title.trim() || 'Untitled Reflection',
        content: note.content.trim(),
        tag: note.tag,
        updatedAt: now,
      };
      existing[idx] = updated;
      localStorage.setItem(STORAGE_KEY_PARENT_REFLECTIONS, JSON.stringify(existing));
      return updated;
    }
  }

  const newNote: ParentReflectionNote = {
    id: generateId('note'),
    title: note.title.trim() || 'Untitled Reflection',
    content: note.content.trim(),
    tag: note.tag,
    createdAt: now,
    updatedAt: now,
  };

  const updatedList = [newNote, ...existing];
  localStorage.setItem(STORAGE_KEY_PARENT_REFLECTIONS, JSON.stringify(updatedList));
  return newNote;
}

export function deleteParentReflection(id: string): void {
  try {
    const existing = loadParentReflections();
    const filtered = existing.filter((n) => n.id !== id);
    localStorage.setItem(STORAGE_KEY_PARENT_REFLECTIONS, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete parent reflection:', error);
  }
}

// -------------------------------------------------------------
// SAVED GUIDES
// -------------------------------------------------------------

export function loadSavedGuideIds(): string[] {
  try {
    const raw = localStorage.getItem('twoway_saved_guides') || localStorage.getItem(STORAGE_KEY_SAVED_GUIDES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleSavedGuide(guideId: string): boolean {
  try {
    const current = loadSavedGuideIds();
    const exists = current.includes(guideId);
    const updated = exists ? current.filter((id) => id !== guideId) : [...current, guideId];
    localStorage.setItem('twoway_saved_guides', JSON.stringify(updated));
    localStorage.setItem(STORAGE_KEY_SAVED_GUIDES, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('twoway-saved-guides-updated'));
    }
    return !exists;
  } catch {
    return false;
  }
}

// -------------------------------------------------------------
// COMPLETED ACTIVITIES
// -------------------------------------------------------------

export function loadCompletedActivityIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_COMPLETED_ACTIVITIES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleCompletedActivity(activityId: string): boolean {
  try {
    const current = loadCompletedActivityIds();
    const exists = current.includes(activityId);
    const updated = exists ? current.filter((id) => id !== activityId) : [...current, activityId];
    localStorage.setItem(STORAGE_KEY_COMPLETED_ACTIVITIES, JSON.stringify(updated));
    return !exists;
  } catch {
    return false;
  }
}

// -------------------------------------------------------------
// PERSONAL LEARNING GOALS
// -------------------------------------------------------------

const DEFAULT_GOALS: ParentLearningGoal[] = [
  {
    id: 'goal_1',
    text: 'Listen for 5 full minutes without offering unsolicited fixes or advice',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'goal_2',
    text: 'Validate one tough emotion before responding to teen frustration',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'goal_3',
    text: 'Schedule a 15-minute low-pressure connection activity this week',
    completed: false,
    createdAt: new Date().toISOString(),
  },
];

export function loadParentLearningGoals(): ParentLearningGoal[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LEARNING_GOALS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_LEARNING_GOALS, JSON.stringify(DEFAULT_GOALS));
      return DEFAULT_GOALS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_GOALS;
  }
}

export function toggleParentLearningGoal(goalId: string): void {
  try {
    const goals = loadParentLearningGoals();
    const updated = goals.map((g) => (g.id === goalId ? { ...g, completed: !g.completed } : g));
    localStorage.setItem(STORAGE_KEY_LEARNING_GOALS, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to toggle learning goal:', error);
  }
}

export function addParentLearningGoal(text: string): ParentLearningGoal {
  const goals = loadParentLearningGoals();
  const newGoal: ParentLearningGoal = {
    id: generateId('goal'),
    text: text.trim(),
    completed: false,
    createdAt: new Date().toISOString(),
  };
  const updated = [...goals, newGoal];
  localStorage.setItem(STORAGE_KEY_LEARNING_GOALS, JSON.stringify(updated));
  return newGoal;
}

export function deleteParentLearningGoal(goalId: string): void {
  try {
    const goals = loadParentLearningGoals();
    const updated = goals.filter((g) => g.id !== goalId);
    localStorage.setItem(STORAGE_KEY_LEARNING_GOALS, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to delete learning goal:', error);
  }
}

// -------------------------------------------------------------
// DAILY REFLECTION DISMISS STATE
// -------------------------------------------------------------

export function isDailyReflectionDismissed(): boolean {
  try {
    const dateStr = localStorage.getItem(STORAGE_KEY_DAILY_DISMISSED);
    if (!dateStr) return false;
    const today = new Date().toISOString().slice(0, 10);
    return dateStr === today;
  } catch {
    return false;
  }
}

export function dismissDailyReflection(): void {
  try {
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem(STORAGE_KEY_DAILY_DISMISSED, today);
  } catch (error) {
    console.error('Failed to dismiss daily reflection:', error);
  }
}

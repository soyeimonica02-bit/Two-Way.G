import { useContext } from 'react';
import { MoodContext, type MoodContextValue } from './moodContextDef';

export function useMood(): MoodContextValue {
  const context = useContext(MoodContext);
  if (!context) {
    throw new Error('useMood must be used within a MoodProvider');
  }
  return context;
}

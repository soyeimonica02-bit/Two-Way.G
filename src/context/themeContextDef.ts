import { createContext } from 'react';
import type { PaletteTheme, ParentAccentTheme } from '../utils/themePalettes';

export interface ThemeContextType {
  // Teen visual theme (palettes + independent dark mode)
  selectedPaletteId: string | null;
  selectedPalette: PaletteTheme | null;
  setPalette: (paletteId: string | null) => void;
  allPalettes: PaletteTheme[];
  teenThemeMode: 'light' | 'dark';
  setTeenThemeMode: (mode: 'light' | 'dark') => void;

  // Parent visual theme (black & white foundation + 6 accents + independent dark mode)
  parentAccentId: string;
  parentAccent: ParentAccentTheme;
  setParentAccentId: (id: string) => void;
  parentThemeMode: 'light' | 'dark';
  setParentThemeMode: (mode: 'light' | 'dark') => void;
  allParentAccents: ParentAccentTheme[];
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

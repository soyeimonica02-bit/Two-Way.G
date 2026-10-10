import { createContext } from 'react';
import type { PaletteTheme } from '../utils/themePalettes';

export interface ThemeContextType {
  selectedPaletteId: string | null;
  selectedPalette: PaletteTheme | null;
  setPalette: (paletteId: string | null) => void;
  allPalettes: PaletteTheme[];
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

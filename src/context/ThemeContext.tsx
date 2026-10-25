import {
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import {
  PALETTES,
  PARENT_ACCENTS,
  getSelectedPaletteId,
  setSelectedPalette,
  getPaletteById,
  getParentAccentId,
  setParentAccentId as persistParentAccentId,
  getParentAccentById,
  getParentThemeMode,
  setParentThemeMode as persistParentThemeMode,
  getTeenThemeMode,
  setTeenThemeMode as persistTeenThemeMode,
  initTheme,
} from '../utils/themePalettes';
import { ThemeContext } from './themeContextDef';

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Teen visual theme state
  const [paletteId, setPaletteIdState] = useState<string | null>(() => {
    return getSelectedPaletteId();
  });
  const [teenMode, setTeenModeState] = useState<'light' | 'dark'>(() => {
    return getTeenThemeMode();
  });

  // Parent visual theme state
  const [parentAccentId, setParentAccentIdState] = useState<string>(() => {
    return getParentAccentId();
  });
  const [parentMode, setParentModeState] = useState<'light' | 'dark'>(() => {
    return getParentThemeMode();
  });

  // Initial apply
  useEffect(() => {
    initTheme();
  }, []);

  const setPalette = (id: string | null) => {
    setPaletteIdState(id);
    setSelectedPalette(id);
  };

  const setTeenThemeMode = (mode: 'light' | 'dark') => {
    setTeenModeState(mode);
    persistTeenThemeMode(mode);
  };

  const setParentAccentId = (id: string) => {
    setParentAccentIdState(id);
    persistParentAccentId(id);
  };

  const setParentThemeMode = (mode: 'light' | 'dark') => {
    setParentModeState(mode);
    persistParentThemeMode(mode);
  };

  // Cross-tab / storage listener
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'twoway_selected_palette') {
        setPaletteIdState(getSelectedPaletteId());
      } else if (e.key === 'twoway_teen_theme_mode') {
        setTeenModeState(getTeenThemeMode());
      } else if (e.key === 'twoway_parent_accent_palette') {
        setParentAccentIdState(getParentAccentId());
      } else if (e.key === 'twoway_parent_theme_mode') {
        setParentModeState(getParentThemeMode());
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const selectedPalette = getPaletteById(paletteId);
  const parentAccent = getParentAccentById(parentAccentId);

  return (
    <ThemeContext.Provider
      value={{
        selectedPaletteId: paletteId,
        selectedPalette,
        setPalette,
        allPalettes: PALETTES,
        teenThemeMode: teenMode,
        setTeenThemeMode,
        parentAccentId,
        parentAccent,
        setParentAccentId,
        parentThemeMode: parentMode,
        setParentThemeMode,
        allParentAccents: PARENT_ACCENTS,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

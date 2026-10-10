import {
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import {
  PALETTES,
  getSelectedPaletteId,
  setSelectedPalette,
  getPaletteById,
} from '../utils/themePalettes';
import { ThemeContext } from './themeContextDef';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [paletteId, setPaletteIdState] = useState<string | null>(() => {
    return getSelectedPaletteId();
  });

  const setPalette = (id: string | null) => {
    setPaletteIdState(id);
    setSelectedPalette(id);
  };

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'twoway_selected_palette') {
        const newId = getSelectedPaletteId();
        setPaletteIdState(newId);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const selectedPalette = getPaletteById(paletteId);

  return (
    <ThemeContext.Provider
      value={{
        selectedPaletteId: paletteId,
        selectedPalette,
        setPalette,
        allPalettes: PALETTES,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

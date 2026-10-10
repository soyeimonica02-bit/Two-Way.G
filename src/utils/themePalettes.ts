export interface PaletteVariables {
  primary: string;
  primaryHover: string;
  primaryText: string;
  primarySoft: string;
  primaryMuted: string;
  secondary: string;
  accent: string;
  highlight: string;
  background: string;
  surface: string;
  surfaceRaised: string;
  surfaceSoft: string;
  surfaceContainer: string;
  border: string;
  borderStrong: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  ink: string;
  shadow: string;
  focus: string;
  accentBadgeBg: string;
  accentBadgeText: string;
}

export interface PaletteTheme {
  id: string;
  name: string;
  swatches: string[];
  variables: PaletteVariables;
}

export const STORAGE_KEY_PALETTE = 'twoway_selected_palette';

export const DEFAULT_THEME_VARIABLES: PaletteVariables = {
  primary: '#5B4EE4',
  primaryHover: '#493BCF',
  primaryText: '#FFFFFF',
  primarySoft: '#EBE7FE',
  primaryMuted: '#D5CEFC',
  secondary: '#7A6EF2',
  accent: '#FFB238',
  highlight: '#FFE4A0',
  background: '#F3F1E7',
  surface: '#FAF9F2',
  surfaceRaised: '#EBE7FE',
  surfaceSoft: '#E8E4D5',
  surfaceContainer: '#FAF9F2',
  border: '#282436',
  borderStrong: '#282436',
  text: '#1A1628',
  textSecondary: '#5A566E',
  textMuted: '#68647D',
  ink: '#1A1628',
  shadow: 'rgba(40, 36, 54, 0.2)',
  focus: '#5B4EE4',
  accentBadgeBg: '#EBE7FE',
  accentBadgeText: '#1A1628',
};

export const PALETTES: PaletteTheme[] = [
  // PALETTE 01: #BDCFFF, #B8C0FF, #C8B6FE, #E7C5FF, #FED5FF (Lavender / Blue / Pink)
  {
    id: 'palette-01',
    name: 'PALETTE 01',
    swatches: ['#BDCFFF', '#B8C0FF', '#C8B6FE', '#E7C5FF', '#FED5FF'],
    variables: {
      primary: '#6D46D4',
      primaryHover: '#5B34C3',
      primaryText: '#FFFFFF',
      primarySoft: '#E7C5FF',
      primaryMuted: '#C8B6FE',
      secondary: '#B8C0FF',
      accent: '#E7C5FF',
      highlight: '#FED5FF',
      background: '#F6EDFC',
      surface: '#FED5FF',
      surfaceRaised: '#E7C5FF',
      surfaceSoft: '#C8B6FE',
      surfaceContainer: '#FED5FF',
      border: '#3D2275',
      borderStrong: '#3D2275',
      text: '#241249',
      textSecondary: '#543D7E',
      textMuted: '#685094',
      ink: '#241249',
      shadow: 'rgba(61, 34, 117, 0.22)',
      focus: '#6D46D4',
      accentBadgeBg: '#E7C5FF',
      accentBadgeText: '#241249',
    },
  },

  // PALETTE 02: #E8C0FC, #ABDEFA, #D0F4E0, #FCF5BF, #FF99CB (Violet / Sky / Mint / Lemon / Pink)
  {
    id: 'palette-02',
    name: 'PALETTE 02',
    swatches: ['#E8C0FC', '#ABDEFA', '#D0F4E0', '#FCF5BF', '#FF99CB'],
    variables: {
      primary: '#D62E7A',
      primaryHover: '#BE1C66',
      primaryText: '#FFFFFF',
      primarySoft: '#FF99CB',
      primaryMuted: '#E8C0FC',
      secondary: '#ABDEFA',
      accent: '#E8C0FC',
      highlight: '#FCF5BF',
      background: '#EBF8F0',
      surface: '#FCF5BF',
      surfaceRaised: '#E8C0FC',
      surfaceSoft: '#D0F4E0',
      surfaceContainer: '#FCF5BF',
      border: '#35184B',
      borderStrong: '#35184B',
      text: '#220D33',
      textSecondary: '#523B64',
      textMuted: '#664E78',
      ink: '#220D33',
      shadow: 'rgba(53, 24, 75, 0.22)',
      focus: '#D62E7A',
      accentBadgeBg: '#FF99CB',
      accentBadgeText: '#220D33',
    },
  },

  // PALETTE 03: #49225B, #6E3432, #456ABD, #E7DBEF, #F5EBFA (Eggplant / Wine / Slate Blue / Heather / Lavender)
  {
    id: 'palette-03',
    name: 'PALETTE 03',
    swatches: ['#49225B', '#6E3432', '#456ABD', '#E7DBEF', '#F5EBFA'],
    variables: {
      primary: '#49225B',
      primaryHover: '#381648',
      primaryText: '#FFFFFF',
      primarySoft: '#E7DBEF',
      primaryMuted: '#E7DBEF',
      secondary: '#456ABD',
      accent: '#6E3432',
      highlight: '#E7DBEF',
      background: '#F5EBFA',
      surface: '#E7DBEF',
      surfaceRaised: '#D9C2E6',
      surfaceSoft: '#CFB5DD',
      surfaceContainer: '#E7DBEF',
      border: '#49225B',
      borderStrong: '#49225B',
      text: '#250F31',
      textSecondary: '#50335C',
      textMuted: '#664772',
      ink: '#250F31',
      shadow: 'rgba(73, 34, 91, 0.24)',
      focus: '#456ABD',
      accentBadgeBg: '#E7DBEF',
      accentBadgeText: '#49225B',
    },
  },

  // PALETTE 04: #0D1EAC, #C48CB3, #E5C907, #8346CE, #264156 (Cobalt / Mauve / Yellow / Violet / Petrol)
  {
    id: 'palette-04',
    name: 'PALETTE 04',
    swatches: ['#0D1EAC', '#C48CB3', '#E5C907', '#8346CE', '#264156'],
    variables: {
      primary: '#0D1EAC',
      primaryHover: '#091682',
      primaryText: '#FFFFFF',
      primarySoft: '#C48CB3',
      primaryMuted: '#8346CE',
      secondary: '#8346CE',
      accent: '#E5C907',
      highlight: '#E5C907',
      background: '#EEF1FB',
      surface: '#E2DAEB',
      surfaceRaised: '#E5C907',
      surfaceSoft: '#C48CB3',
      surfaceContainer: '#E2DAEB',
      border: '#0D1EAC',
      borderStrong: '#0D1EAC',
      text: '#08104E',
      textSecondary: '#2C386C',
      textMuted: '#424E82',
      ink: '#08104E',
      shadow: 'rgba(13, 30, 172, 0.24)',
      focus: '#8346CE',
      accentBadgeBg: '#E5C907',
      accentBadgeText: '#08104E',
    },
  },

  // PALETTE 05: #021024, #052659, #5483B3, #7DA0CA, #C1EBFF (Navy / Marine / Ocean / Sky / Icy Cyan)
  {
    id: 'palette-05',
    name: 'PALETTE 05',
    swatches: ['#021024', '#052659', '#5483B3', '#7DA0CA', '#C1EBFF'],
    variables: {
      primary: '#052659',
      primaryHover: '#021636',
      primaryText: '#FFFFFF',
      primarySoft: '#C1EBFF',
      primaryMuted: '#7DA0CA',
      secondary: '#5483B3',
      accent: '#7DA0CA',
      highlight: '#C1EBFF',
      background: '#DDF2FC',
      surface: '#C1EBFF',
      surfaceRaised: '#7DA0CA',
      surfaceSoft: '#A6D5EC',
      surfaceContainer: '#C1EBFF',
      border: '#021024',
      borderStrong: '#021024',
      text: '#021024',
      textSecondary: '#1C3654',
      textMuted: '#304E6E',
      ink: '#021024',
      shadow: 'rgba(5, 38, 89, 0.24)',
      focus: '#5483B3',
      accentBadgeBg: '#C1EBFF',
      accentBadgeText: '#021024',
    },
  },

  // PALETTE 06: #03045E, #0077B6, #00B4D8, #00E0EF, #CAF0FA (Royal Navy / Cyan / Turquoise / Neon Cyan / Aqua)
  {
    id: 'palette-06',
    name: 'PALETTE 06',
    swatches: ['#03045E', '#0077B6', '#00B4D8', '#00E0EF', '#CAF0FA'],
    variables: {
      primary: '#0077B6',
      primaryHover: '#005C8F',
      primaryText: '#FFFFFF',
      primarySoft: '#CAF0FA',
      primaryMuted: '#00B4D8',
      secondary: '#00B4D8',
      accent: '#00E0EF',
      highlight: '#CAF0FA',
      background: '#D6F4FA',
      surface: '#CAF0FA',
      surfaceRaised: '#00E0EF',
      surfaceSoft: '#A4E8F7',
      surfaceContainer: '#CAF0FA',
      border: '#03045E',
      borderStrong: '#03045E',
      text: '#03045E',
      textSecondary: '#0F4368',
      textMuted: '#20577E',
      ink: '#03045E',
      shadow: 'rgba(3, 4, 94, 0.22)',
      focus: '#00B4D8',
      accentBadgeBg: '#CAF0FA',
      accentBadgeText: '#03045E',
    },
  },

  // PALETTE 07: #3E2522, #8CBE63, #D3A376, #FFF2DF (Espresso / Olive Sage / Terracotta / Oat Cream - Exactly 4 colors)
  {
    id: 'palette-07',
    name: 'PALETTE 07',
    swatches: ['#3E2522', '#8CBE63', '#D3A376', '#FFF2DF'],
    variables: {
      primary: '#3E2522',
      primaryHover: '#2B1816',
      primaryText: '#FFF2DF',
      primarySoft: '#FFF2DF',
      primaryMuted: '#D3A376',
      secondary: '#8CBE63',
      accent: '#D3A376',
      highlight: '#FFF2DF',
      background: '#FAF0E1',
      surface: '#FFF2DF',
      surfaceRaised: '#D3A376',
      surfaceSoft: '#8CBE63',
      surfaceContainer: '#FFF2DF',
      border: '#3E2522',
      borderStrong: '#3E2522',
      text: '#3E2522',
      textSecondary: '#5C3D38',
      textMuted: '#72524C',
      ink: '#3E2522',
      shadow: 'rgba(62, 37, 34, 0.22)',
      focus: '#8CBE63',
      accentBadgeBg: '#FFF2DF',
      accentBadgeText: '#3E2522',
    },
  },

  // PALETTE 08: #0F2A1D, #375524, #6BD071, #AEC3B0, #E3EEC4 (Forest / Moss / Grass / Sage / Matcha)
  {
    id: 'palette-08',
    name: 'PALETTE 08',
    swatches: ['#0F2A1D', '#375524', '#6BD071', '#AEC3B0', '#E3EEC4'],
    variables: {
      primary: '#0F2A1D',
      primaryHover: '#081C12',
      primaryText: '#FFFFFF',
      primarySoft: '#E3EEC4',
      primaryMuted: '#AEC3B0',
      secondary: '#375524',
      accent: '#6BD071',
      highlight: '#E3EEC4',
      background: '#E9F3E3',
      surface: '#E3EEC4',
      surfaceRaised: '#6BD071',
      surfaceSoft: '#AEC3B0',
      surfaceContainer: '#E3EEC4',
      border: '#0F2A1D',
      borderStrong: '#0F2A1D',
      text: '#0F2A1D',
      textSecondary: '#244433',
      textMuted: '#3A5A48',
      ink: '#0F2A1D',
      shadow: 'rgba(15, 42, 29, 0.24)',
      focus: '#6BD071',
      accentBadgeBg: '#E3EEC4',
      accentBadgeText: '#0F2A1D',
    },
  },
];

const LEGACY_ID_MAP: Record<string, string> = {
  'girls-1': 'palette-01',
  'girls-2': 'palette-02',
  'girls-3': 'palette-03',
  'girls-4': 'palette-04',
  'boys-1': 'palette-05',
  'boys-2': 'palette-06',
  'boys-3': 'palette-07',
  'boys-4': 'palette-08',
  '1': 'palette-01',
  '01': 'palette-01',
  'palette-1': 'palette-01',
  'palette1': 'palette-01',
  'palette 01': 'palette-01',
  'palette 1': 'palette-01',
  '2': 'palette-02',
  '02': 'palette-02',
  'palette-2': 'palette-02',
  'palette2': 'palette-02',
  'palette 02': 'palette-02',
  'palette 2': 'palette-02',
  '3': 'palette-03',
  '03': 'palette-03',
  'palette-3': 'palette-03',
  'palette3': 'palette-03',
  'palette 03': 'palette-03',
  'palette 3': 'palette-03',
  '4': 'palette-04',
  '04': 'palette-04',
  'palette-4': 'palette-04',
  'palette4': 'palette-04',
  'palette 04': 'palette-04',
  'palette 4': 'palette-04',
  '5': 'palette-05',
  '05': 'palette-05',
  'palette-5': 'palette-05',
  'palette5': 'palette-05',
  'palette 05': 'palette-05',
  'palette 5': 'palette-05',
  '6': 'palette-06',
  '06': 'palette-06',
  'palette-6': 'palette-06',
  'palette6': 'palette-06',
  'palette 06': 'palette-06',
  'palette 6': 'palette-06',
  '7': 'palette-07',
  '07': 'palette-07',
  'palette-7': 'palette-07',
  'palette7': 'palette-07',
  'palette 07': 'palette-07',
  'palette 7': 'palette-07',
  '8': 'palette-08',
  '08': 'palette-08',
  'palette-8': 'palette-08',
  'palette8': 'palette-08',
  'palette 08': 'palette-08',
  'palette 8': 'palette-08',
};

export function getAllPalettes(): PaletteTheme[] {
  return PALETTES;
}

export function getPaletteById(id: string | null): PaletteTheme | null {
  if (!id) return null;
  const cleanId = id.toLowerCase().trim();
  const canonicalId = LEGACY_ID_MAP[cleanId] || id;
  return PALETTES.find((p) => p.id === canonicalId || p.id === id || p.name.toLowerCase() === cleanId) || null;
}

export function getSelectedPaletteId(): string | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_PALETTE);
    if (!stored) return null;
    const cleanStored = stored.toLowerCase().trim();
    return LEGACY_ID_MAP[cleanStored] || stored;
  } catch (error) {
    console.error('Error reading palette from localStorage:', error);
    return null;
  }
}

export function applyTheme(paletteId: string | null): void {
  const root = document.documentElement;
  const palette = getPaletteById(paletteId);
  const v = palette ? palette.variables : DEFAULT_THEME_VARIABLES;

  if (palette) {
    root.setAttribute('data-palette', palette.id);
  } else {
    root.removeAttribute('data-palette');
  }

  // Set centralized theme custom properties
  root.style.setProperty('--tw-background', v.background);
  root.style.setProperty('--tw-surface', v.surface);
  root.style.setProperty('--tw-surface-raised', v.surfaceRaised);
  root.style.setProperty('--tw-surface-soft', v.surfaceSoft);
  root.style.setProperty('--tw-surface-container', v.surfaceContainer);
  root.style.setProperty('--tw-primary', v.primary);
  root.style.setProperty('--tw-primary-hover', v.primaryHover);
  root.style.setProperty('--tw-primary-text', v.primaryText);
  root.style.setProperty('--tw-primary-soft', v.primarySoft);
  root.style.setProperty('--tw-primary-muted', v.primaryMuted);
  root.style.setProperty('--tw-secondary', v.secondary);
  root.style.setProperty('--tw-accent', v.accent);
  root.style.setProperty('--tw-highlight', v.highlight);
  root.style.setProperty('--tw-accent-secondary', v.secondary);
  root.style.setProperty('--tw-accent-highlight', v.highlight);
  root.style.setProperty('--tw-border', v.border);
  root.style.setProperty('--tw-border-strong', v.borderStrong);
  root.style.setProperty('--tw-text', v.text);
  root.style.setProperty('--tw-text-secondary', v.textSecondary);
  root.style.setProperty('--tw-text-muted', v.textMuted);
  root.style.setProperty('--tw-ink', v.ink);
  root.style.setProperty('--tw-shadow', v.shadow);
  root.style.setProperty('--tw-focus', v.focus);
  root.style.setProperty('--tw-badge-bg', v.accentBadgeBg);
  root.style.setProperty('--tw-badge-text', v.accentBadgeText);

  // Directly map teen-specific variables
  root.style.setProperty('--teen-accent', v.primary);
  root.style.setProperty('--teen-white', v.background);
  root.style.setProperty('--teen-surface', v.surface);
  root.style.setProperty('--teen-surface-raised', v.surfaceRaised);
  root.style.setProperty('--teen-black', v.text);
  root.style.setProperty('--teen-muted', v.textSecondary);
  root.style.setProperty('--teen-gray', v.border);
}

export function setSelectedPalette(paletteId: string | null): void {
  if (!paletteId) {
    try {
      localStorage.removeItem(STORAGE_KEY_PALETTE);
    } catch (error) {
      console.error('Error removing palette from localStorage:', error);
    }
    applyTheme(null);
    return;
  }

  const canonicalId = LEGACY_ID_MAP[paletteId] || paletteId;
  try {
    localStorage.setItem(STORAGE_KEY_PALETTE, canonicalId);
  } catch (error) {
    console.error('Error saving palette to localStorage:', error);
  }
  applyTheme(canonicalId);
}

export function initTheme(): void {
  const current = getSelectedPaletteId();
  if (current) {
    applyTheme(current);
  } else {
    applyTheme(null);
  }
}

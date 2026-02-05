import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type { ColorPalette } from '../types/palette';
import { predefinedPalettes } from '../types/palette';

export type ThemeMode = 'light' | 'dark';

// Get initial values from user data in localStorage
const getInitialThemeMode = (): ThemeMode => {
  if (typeof window === 'undefined') return 'light';

  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user.theme === 'dark' || user.theme === 'light') {
        return user.theme;
      }
    } catch {
      // ignore
    }
  }

  const savedMode = localStorage.getItem('themeMode');
  return (savedMode === 'dark' || savedMode === 'light') ? savedMode : 'light';
};

const getInitialPalette = (): ColorPalette => {
  if (typeof window === 'undefined') return predefinedPalettes[0];

  let paletteId: string | undefined;

  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user.paletteId) {
        paletteId = user.paletteId;
      }
    } catch {
      // ignore
    }
  }

  if (!paletteId) {
    paletteId = localStorage.getItem('selectedPaletteId') || undefined;
  }

  if (paletteId) {
    const predefined = predefinedPalettes.find(p => p.id === paletteId);
    if (predefined) return predefined;

    const savedCustom = localStorage.getItem('customPalettes');
    if (savedCustom) {
      const custom = JSON.parse(savedCustom) as ColorPalette[];
      const found = custom.find(p => p.id === paletteId);
      if (found) return found;
    }
  }

  return predefinedPalettes[0];
};

// Theme mode atom with localStorage persistence
export const themeModeAtom = atomWithStorage<ThemeMode>('themeMode', getInitialThemeMode());

// Palette atom (not using atomWithStorage because we store just the ID)
export const paletteAtom = atom<ColorPalette>(getInitialPalette());

// Selected palette ID for persistence
export const selectedPaletteIdAtom = atomWithStorage<string>('selectedPaletteId', getInitialPalette().id);

// Custom palettes atom with localStorage persistence
export const customPalettesAtom = atomWithStorage<ColorPalette[]>('customPalettes', []);

// Derived atom: all available palettes (predefined + custom)
export const allPalettesAtom = atom<ColorPalette[]>(
  (get) => [...predefinedPalettes, ...get(customPalettesAtom)]
);

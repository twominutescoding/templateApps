import { atom } from 'jotai';
import type { ColorPalette } from '../types/palette';
import { predefinedPalettes } from '../types/palette';

export type ThemeMode = 'light' | 'dark';

// Get initial values from localStorage
const getInitialThemeMode = (): ThemeMode => {
  if (typeof window === 'undefined') return 'light';
  const savedMode = localStorage.getItem('themeMode');
  return (savedMode === 'dark' || savedMode === 'light') ? savedMode : 'light';
};

const getInitialPalette = (): ColorPalette => {
  if (typeof window === 'undefined') return predefinedPalettes[0];

  const paletteId = localStorage.getItem('selectedPaletteId');
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

const getInitialCustomPalettes = (): ColorPalette[] => {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem('customPalettes');
  return saved ? JSON.parse(saved) : [];
};

// Base atoms
export const themeModeAtom = atom<ThemeMode>(getInitialThemeMode());
export const paletteAtom = atom<ColorPalette>(getInitialPalette());
export const customPalettesAtom = atom<ColorPalette[]>(getInitialCustomPalettes());

// Derived atom: all available palettes
export const allPalettesAtom = atom<ColorPalette[]>(
  (get) => [...predefinedPalettes, ...get(customPalettesAtom)]
);

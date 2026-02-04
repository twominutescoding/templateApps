import { useAtom, useAtomValue } from 'jotai';
import { useCallback, useMemo, useEffect } from 'react';
import { createTheme } from '@mui/material/styles';
import {
  themeModeAtom,
  paletteAtom,
  customPalettesAtom,
  allPalettesAtom,
} from '../atoms';
import type { ColorPalette } from '../types/palette';
import { predefinedPalettes } from '../types/palette';
import { getDesignTokens, getHeaderGradient } from '../theme/theme';

/**
 * Theme hook using Jotai atoms
 */
export const useThemeContext = () => {
  const [mode, setMode] = useAtom(themeModeAtom);
  const [palette, setPaletteState] = useAtom(paletteAtom);
  const [customPalettes, setCustomPalettes] = useAtom(customPalettesAtom);
  const allPalettes = useAtomValue(allPalettesAtom);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem('selectedPaletteId', palette.id);
  }, [palette]);

  useEffect(() => {
    localStorage.setItem('customPalettes', JSON.stringify(customPalettes));
  }, [customPalettes]);

  const toggleTheme = useCallback(() => {
    setMode(prev => prev === 'light' ? 'dark' : 'light');
  }, [setMode]);

  const setPalette = useCallback((newPalette: ColorPalette) => {
    setPaletteState(newPalette);
  }, [setPaletteState]);

  const addCustomPalette = useCallback((newPalette: ColorPalette) => {
    setCustomPalettes(prev => [...prev, newPalette]);
  }, [setCustomPalettes]);

  const removeCustomPalette = useCallback((paletteId: string) => {
    setCustomPalettes(prev => prev.filter(p => p.id !== paletteId));
    if (palette.id === paletteId) {
      setPaletteState(predefinedPalettes[0]);
    }
  }, [setCustomPalettes, palette.id, setPaletteState]);

  // Memoized theme and gradient
  const theme = useMemo(() => createTheme(getDesignTokens(mode, palette)), [mode, palette]);
  const headerGradient = useMemo(() => getHeaderGradient(mode, palette), [mode, palette]);

  return {
    mode,
    toggleTheme,
    palette,
    setPalette,
    customPalettes,
    addCustomPalette,
    removeCustomPalette,
    headerGradient,
    theme,
    allPalettes,
  };
};

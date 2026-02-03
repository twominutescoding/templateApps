import { useAtom, useAtomValue } from 'jotai';
import { useCallback, useMemo } from 'react';
import { createTheme } from '@mui/material/styles';
import {
  themeModeAtom,
  paletteAtom,
  selectedPaletteIdAtom,
  customPalettesAtom,
  allPalettesAtom,
} from '../atoms';
import type { ColorPalette } from '../types/palette';
import { predefinedPalettes } from '../types/palette';
import { getDesignTokens, getHeaderGradient } from '../theme/theme';
import { authAPI } from '../services/api';

/**
 * Theme hook using Jotai atoms
 * Replaces the old ThemeContext
 */
export const useThemeContext = () => {
  const [mode, setMode] = useAtom(themeModeAtom);
  const [palette, setPaletteState] = useAtom(paletteAtom);
  const [, setSelectedPaletteId] = useAtom(selectedPaletteIdAtom);
  const [customPalettes, setCustomPalettes] = useAtom(customPalettesAtom);
  const allPalettes = useAtomValue(allPalettesAtom);

  const toggleTheme = useCallback(async () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);

    // Save to backend if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await authAPI.updateThemePreferences(newMode, palette.id);

        // Update user data in localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          user.theme = newMode;
          localStorage.setItem('user', JSON.stringify(user));
        }
      } catch (error) {
        console.error('Failed to save theme preferences to backend:', error);
      }
    }
  }, [mode, setMode, palette.id]);

  const setPalette = useCallback(async (newPalette: ColorPalette) => {
    setPaletteState(newPalette);
    setSelectedPaletteId(newPalette.id);

    // Save to backend if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await authAPI.updateThemePreferences(mode, newPalette.id);

        // Update user data in localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          user.paletteId = newPalette.id;
          localStorage.setItem('user', JSON.stringify(user));
        }
      } catch (error) {
        console.error('Failed to save theme preferences to backend:', error);
      }
    }
  }, [mode, setPaletteState, setSelectedPaletteId]);

  const addCustomPalette = useCallback((newPalette: ColorPalette) => {
    setCustomPalettes(prev => [...prev, newPalette]);
  }, [setCustomPalettes]);

  const removeCustomPalette = useCallback((paletteId: string) => {
    setCustomPalettes(prev => prev.filter(p => p.id !== paletteId));
    // If the removed palette was selected, switch to default
    if (palette.id === paletteId) {
      setPaletteState(predefinedPalettes[0]);
      setSelectedPaletteId(predefinedPalettes[0].id);
    }
  }, [setCustomPalettes, palette.id, setPaletteState, setSelectedPaletteId]);

  const loadThemeFromUser = useCallback(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);

        if (user.theme === 'dark' || user.theme === 'light') {
          setMode(user.theme);
        }

        if (user.paletteId) {
          const predefined = predefinedPalettes.find(p => p.id === user.paletteId);
          if (predefined) {
            setPaletteState(predefined);
            setSelectedPaletteId(predefined.id);
            return;
          }

          const custom = customPalettes.find(p => p.id === user.paletteId);
          if (custom) {
            setPaletteState(custom);
            setSelectedPaletteId(custom.id);
          }
        }
      } catch (e) {
        console.error('Failed to load theme from user data:', e);
      }
    }
  }, [setMode, setPaletteState, setSelectedPaletteId, customPalettes]);

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
    loadThemeFromUser,
    theme, // Export the MUI theme for the provider
    allPalettes,
  };
};

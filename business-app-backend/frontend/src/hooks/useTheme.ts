import { useAtom, useAtomValue } from 'jotai';
import { useCallback, useMemo } from 'react';
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
import { authAPI } from '../services/api';

/**
 * Theme hook using Jotai atoms
 * Syncs theme preferences with auth-service backend
 */
export const useThemeContext = () => {
  const [mode, setMode] = useAtom(themeModeAtom);
  const [palette, setPaletteState] = useAtom(paletteAtom);
  const [customPalettes, setCustomPalettes] = useAtom(customPalettesAtom);
  const allPalettes = useAtomValue(allPalettesAtom);

  const toggleTheme = useCallback(async () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('themeMode', newMode);

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
    localStorage.setItem('selectedPaletteId', newPalette.id);

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
  }, [mode, setPaletteState]);

  const addCustomPalette = useCallback((newPalette: ColorPalette) => {
    setCustomPalettes(prev => [...prev, newPalette]);
  }, [setCustomPalettes]);

  const removeCustomPalette = useCallback((paletteId: string) => {
    setCustomPalettes(prev => prev.filter(p => p.id !== paletteId));
    if (palette.id === paletteId) {
      setPaletteState(predefinedPalettes[0]);
    }
  }, [setCustomPalettes, palette.id, setPaletteState]);

  // Load theme from user data (called after login)
  const loadThemeFromUser = useCallback(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);

        if (user.theme === 'dark' || user.theme === 'light') {
          setMode(user.theme);
          localStorage.setItem('themeMode', user.theme);
        }

        if (user.paletteId) {
          const predefined = predefinedPalettes.find(p => p.id === user.paletteId);
          if (predefined) {
            setPaletteState(predefined);
            localStorage.setItem('selectedPaletteId', predefined.id);
            return;
          }

          const custom = customPalettes.find(p => p.id === user.paletteId);
          if (custom) {
            setPaletteState(custom);
            localStorage.setItem('selectedPaletteId', custom.id);
          }
        }
      } catch (e) {
        console.error('Failed to load theme from user data:', e);
      }
    }
  }, [setMode, setPaletteState, customPalettes]);

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
    theme,
    allPalettes,
  };
};

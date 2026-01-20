import { createContext, useContext, useState, useMemo, useEffect } from 'react';
import type { ReactNode } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { getDesignTokens, getHeaderGradient } from './theme';
import type { ColorPalette } from '../types/palette';
import { predefinedPalettes } from '../types/palette';
import { authAPI, type LoginResponse } from '../services/api';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => Promise<void>;
  palette: ColorPalette;
  setPalette: (palette: ColorPalette) => Promise<void>;
  customPalettes: ColorPalette[];
  addCustomPalette: (palette: ColorPalette) => void;
  removeCustomPalette: (paletteId: string) => void;
  headerGradient: string;
  loadThemeFromUser: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  toggleTheme: async () => {},
  palette: predefinedPalettes[0],
  setPalette: async () => {},
  customPalettes: [],
  addCustomPalette: () => {},
  removeCustomPalette: () => {},
  headerGradient: '',
  loadThemeFromUser: () => {},
});

export const useThemeContext = () => useContext(ThemeContext);

interface ThemeContextProviderProps {
  children: ReactNode;
}

export const ThemeContextProvider = ({ children }: ThemeContextProviderProps) => {
  // Get initial theme mode from user data or localStorage or default to light
  const [mode, setMode] = useState<ThemeMode>(() => {
    // First, try to get from logged-in user data
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr) as LoginResponse;
        if (user.theme && (user.theme === 'dark' || user.theme === 'light')) {
          return user.theme;
        }
      } catch (e) {
        console.error('Failed to parse user data:', e);
      }
    }

    // Fall back to localStorage themeMode
    const savedMode = localStorage.getItem('themeMode');
    return (savedMode === 'dark' || savedMode === 'light') ? savedMode : 'light';
  });

  // Get initial palette from user data or localStorage or default to first predefined palette
  const [palette, setPaletteState] = useState<ColorPalette>(() => {
    let paletteId: string | undefined;

    // First, try to get from logged-in user data
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr) as LoginResponse;
        if (user.paletteId) {
          paletteId = user.paletteId;
        }
      } catch (e) {
        console.error('Failed to parse user data:', e);
      }
    }

    // Fall back to localStorage selectedPaletteId
    if (!paletteId) {
      paletteId = localStorage.getItem('selectedPaletteId') || undefined;
    }

    const savedCustomPalettes = localStorage.getItem('customPalettes');

    if (paletteId) {
      // Check in predefined palettes
      const predefined = predefinedPalettes.find(p => p.id === paletteId);
      if (predefined) return predefined;

      // Check in custom palettes
      if (savedCustomPalettes) {
        const custom = JSON.parse(savedCustomPalettes) as ColorPalette[];
        const customPalette = custom.find(p => p.id === paletteId);
        if (customPalette) return customPalette;
      }
    }

    return predefinedPalettes[0];
  });

  // Get custom palettes from localStorage
  const [customPalettes, setCustomPalettes] = useState<ColorPalette[]>(() => {
    const saved = localStorage.getItem('customPalettes');
    return saved ? JSON.parse(saved) : [];
  });

  // Save theme mode to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  // Save palette selection to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('selectedPaletteId', palette.id);
  }, [palette]);

  // Save custom palettes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('customPalettes', JSON.stringify(customPalettes));
  }, [customPalettes]);

  const toggleTheme = async () => {
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
          const user = JSON.parse(userStr) as LoginResponse;
          user.theme = newMode;
          localStorage.setItem('user', JSON.stringify(user));
        }
      } catch (error) {
        console.error('Failed to save theme preferences to backend:', error);
        // Continue anyway - localStorage will persist the change
      }
    }
  };

  const setPalette = async (newPalette: ColorPalette) => {
    setPaletteState(newPalette);

    // Save to backend if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await authAPI.updateThemePreferences(mode, newPalette.id);

        // Update user data in localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr) as LoginResponse;
          user.paletteId = newPalette.id;
          localStorage.setItem('user', JSON.stringify(user));
        }
      } catch (error) {
        console.error('Failed to save theme preferences to backend:', error);
        // Continue anyway - localStorage will persist the change
      }
    }
  };

  const addCustomPalette = (newPalette: ColorPalette) => {
    setCustomPalettes(prev => [...prev, newPalette]);
  };

  const removeCustomPalette = (paletteId: string) => {
    setCustomPalettes(prev => prev.filter(p => p.id !== paletteId));
    // If the removed palette was selected, switch to default
    if (palette.id === paletteId) {
      setPaletteState(predefinedPalettes[0]);
    }
  };

  const loadThemeFromUser = () => {
    // Load theme from user data in localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr) as LoginResponse;

        // Update theme mode if present
        if (user.theme && (user.theme === 'dark' || user.theme === 'light')) {
          setMode(user.theme);
        }

        // Update palette if present
        if (user.paletteId) {
          const savedCustomPalettes = localStorage.getItem('customPalettes');

          // Check in predefined palettes
          const predefined = predefinedPalettes.find(p => p.id === user.paletteId);
          if (predefined) {
            setPaletteState(predefined);
            return;
          }

          // Check in custom palettes
          if (savedCustomPalettes) {
            const custom = JSON.parse(savedCustomPalettes) as ColorPalette[];
            const customPalette = custom.find(p => p.id === user.paletteId);
            if (customPalette) {
              setPaletteState(customPalette);
              return;
            }
          }
        }
      } catch (e) {
        console.error('Failed to load theme from user data:', e);
      }
    }
  };

  const theme = useMemo(() => createTheme(getDesignTokens(mode, palette)), [mode, palette]);
  const headerGradient = useMemo(() => getHeaderGradient(mode, palette), [mode, palette]);

  return (
    <ThemeContext.Provider value={{
      mode,
      toggleTheme,
      palette,
      setPalette,
      customPalettes,
      addCustomPalette,
      removeCustomPalette,
      headerGradient,
      loadThemeFromUser
    }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

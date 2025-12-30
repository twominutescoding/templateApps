import { createContext, useContext, useState, useMemo, useEffect } from 'react';
import type { ReactNode } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { getDesignTokens, getHeaderGradient } from './theme';
import type { ColorPalette } from '../types/palette';
import { predefinedPalettes } from '../types/palette';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
  palette: ColorPalette;
  setPalette: (palette: ColorPalette) => void;
  customPalettes: ColorPalette[];
  addCustomPalette: (palette: ColorPalette) => void;
  removeCustomPalette: (paletteId: string) => void;
  headerGradient: string;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  toggleTheme: () => {},
  palette: predefinedPalettes[0],
  setPalette: () => {},
  customPalettes: [],
  addCustomPalette: () => {},
  removeCustomPalette: () => {},
  headerGradient: '',
});

export const useThemeContext = () => useContext(ThemeContext);

interface ThemeContextProviderProps {
  children: ReactNode;
}

export const ThemeContextProvider = ({ children }: ThemeContextProviderProps) => {
  // Get initial theme mode from localStorage or default to light
  const [mode, setMode] = useState<ThemeMode>(() => {
    const savedMode = localStorage.getItem('themeMode');
    return (savedMode === 'dark' || savedMode === 'light') ? savedMode : 'light';
  });

  // Get initial palette from localStorage or default to first predefined palette
  const [palette, setPaletteState] = useState<ColorPalette>(() => {
    const savedPaletteId = localStorage.getItem('selectedPaletteId');
    const savedCustomPalettes = localStorage.getItem('customPalettes');

    if (savedPaletteId) {
      // Check in predefined palettes
      const predefined = predefinedPalettes.find(p => p.id === savedPaletteId);
      if (predefined) return predefined;

      // Check in custom palettes
      if (savedCustomPalettes) {
        const custom = JSON.parse(savedCustomPalettes) as ColorPalette[];
        const customPalette = custom.find(p => p.id === savedPaletteId);
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

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const setPalette = (newPalette: ColorPalette) => {
    setPaletteState(newPalette);
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
      headerGradient
    }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

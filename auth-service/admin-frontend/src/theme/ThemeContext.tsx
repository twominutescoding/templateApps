import type { ReactNode } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useThemeContext as useThemeHook } from '../hooks/useTheme';

// Re-export the hook for backward compatibility
export { useThemeContext } from '../hooks/useTheme';
export type { ThemeMode } from '../atoms/themeAtoms';

interface ThemeContextProviderProps {
  children: ReactNode;
}

/**
 * Theme provider component that wraps MUI ThemeProvider
 * Uses Jotai atoms internally via useThemeContext hook
 */
export const ThemeContextProvider = ({ children }: ThemeContextProviderProps) => {
  const { theme } = useThemeHook();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

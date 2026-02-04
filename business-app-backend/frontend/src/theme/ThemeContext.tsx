import type { ReactNode } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useThemeContext as useThemeHook } from '../hooks';

// Re-export hook from hooks folder for backward compatibility
export { useThemeContext } from '../hooks';
export type { ThemeMode } from '../atoms/themeAtoms';

interface ThemeContextProviderProps {
  children: ReactNode;
}

/**
 * Theme provider component that wraps children with MUI ThemeProvider
 * Uses Jotai atoms for state management via useThemeContext hook
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

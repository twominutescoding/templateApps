export interface ColorPalette {
  id: string;
  name: string;
  light: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
  };
  dark: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
  };
}

export const predefinedPalettes: ColorPalette[] = [
  {
    id: 'default',
    name: 'Default Purple',
    light: {
      primary: '#667eea',
      secondary: '#764ba2',
      accent: '#f093fb',
      background: '#f5f5f5',
      surface: '#ffffff',
      text: '#000000',
    },
    dark: {
      primary: '#0f2027',
      secondary: '#203a43',
      accent: '#2c5364',
      background: '#121212',
      surface: '#1e1e1e',
      text: '#ffffff',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean Blue',
    light: {
      primary: '#2193b0',
      secondary: '#6dd5ed',
      accent: '#00d2ff',
      background: '#f0f8ff',
      surface: '#ffffff',
      text: '#000000',
    },
    dark: {
      primary: '#134e5e',
      secondary: '#1a5f7a',
      accent: '#2c7da0',
      background: '#0a1929',
      surface: '#1a2332',
      text: '#ffffff',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset Orange',
    light: {
      primary: '#ff6b6b',
      secondary: '#ee5a6f',
      accent: '#feca57',
      background: '#fff5f5',
      surface: '#ffffff',
      text: '#000000',
    },
    dark: {
      primary: '#c0392b',
      secondary: '#e74c3c',
      accent: '#f39c12',
      background: '#1a0f0f',
      surface: '#2d1818',
      text: '#ffffff',
    },
  },
  {
    id: 'forest',
    name: 'Forest Green',
    light: {
      primary: '#11998e',
      secondary: '#38ef7d',
      accent: '#7bed9f',
      background: '#f0fff4',
      surface: '#ffffff',
      text: '#000000',
    },
    dark: {
      primary: '#134e4a',
      secondary: '#0f766e',
      accent: '#14b8a6',
      background: '#0f1e1a',
      surface: '#1a2e27',
      text: '#ffffff',
    },
  },
  {
    id: 'lavender',
    name: 'Lavender Dream',
    light: {
      primary: '#a8edea',
      secondary: '#fed6e3',
      accent: '#d4a5a5',
      background: '#faf5ff',
      surface: '#ffffff',
      text: '#000000',
    },
    dark: {
      primary: '#5b4b8a',
      secondary: '#7c5295',
      accent: '#9c6ea6',
      background: '#1a1429',
      surface: '#2a2139',
      text: '#ffffff',
    },
  },
  {
    id: 'midnight',
    name: 'Midnight Navy',
    light: {
      primary: '#4b6cb7',
      secondary: '#182848',
      accent: '#5e72e4',
      background: '#f0f4f8',
      surface: '#ffffff',
      text: '#000000',
    },
    dark: {
      primary: '#1a1f3a',
      secondary: '#2d3561',
      accent: '#4a5899',
      background: '#0d1117',
      surface: '#161b22',
      text: '#ffffff',
    },
  },
];

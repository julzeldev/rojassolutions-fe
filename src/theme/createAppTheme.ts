import { createTheme } from '@mui/material/styles';
import type { PaletteMode } from '@mui/material';

export function createAppTheme(mode: PaletteMode) {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: isDark
        ? { main: '#a855f7', light: '#c084fc', dark: '#7c3aed', contrastText: '#0d0d0d' }
        : { main: '#1e3a8a', light: '#3b82f6', dark: '#1e40af', contrastText: '#ffffff' },
      secondary: isDark
        ? { main: '#c084fc', contrastText: '#0d0d0d' }
        : { main: '#0ea5e9', contrastText: '#032133' },
      background: isDark
        ? { default: '#0a0a0c', paper: '#151517' }
        : { default: '#f4f6fb', paper: '#ffffff' },
      text: isDark
        ? { primary: '#f5f5f5', secondary: '#d1d1d6' }
        : { primary: '#0f172a', secondary: '#1f2937' },
      error: { main: '#f44336' },
      warning: { main: '#ff9800' },
      success: { main: '#4caf50' },
      info: { main: isDark ? '#8b5cf6' : '#0284c7' },
    },
    shape: { borderRadius: 10 },
    typography: {
      fontFamily:
        '\"Roboto\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif',
      h1: { fontWeight: 600 },
      h2: { fontWeight: 600 },
      h3: { fontWeight: 600 },
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          colorInherit: {
            backgroundImage: 'none',
            backgroundColor: isDark ? '#151517' : '#ffffff',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  });
}

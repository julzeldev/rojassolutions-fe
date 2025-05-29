import { createTheme } from '@mui/material/styles';
import type { Theme as MuiTheme } from '@mui/material/styles';
import { lightPalette, darkPalette } from './palette';

export const getMuiTheme = (mode: 'light' | 'dark') => {
  const palette = mode === 'light' ? lightPalette : darkPalette;
  return createTheme({
    palette: {
      mode,
      primary: { main: palette.primary },
      secondary: { main: palette.secondary },
      background: {
        default: palette.background,
        paper: palette.surface,
      },
      text: {
        primary: palette.textPrimary,
        secondary: palette.textSecondary,
      },
      error: { main: palette.error },
      success: { main: palette.success },
      warning: { main: palette.warning },
    },
    typography: {
      fontFamily: 'Inter, Montserrat, Roboto, Arial, sans-serif',
    },
  });
};

export type MuiThemeType = MuiTheme;

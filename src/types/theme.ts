import type { ThemePalette } from '../theme/palette';

export type ThemeMode = 'light' | 'dark';

export interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  palette: ThemePalette;
  toggleMode: () => void;
}

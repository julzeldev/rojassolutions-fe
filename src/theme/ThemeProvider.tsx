import React, { createContext, useEffect, useMemo, useState } from 'react';
import { lightPalette, darkPalette } from './palette';
import type { ThemeMode, ThemeContextValue } from '../types/theme';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const getInitialMode = (): ThemeMode => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem('theme-mode');
      if (stored === 'light' || stored === 'dark') return stored;
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    }
    return 'light';
  };

  const [mode, setModeState] = useState<ThemeMode>(getInitialMode);

  useEffect(() => {
    window.localStorage.setItem('theme-mode', mode);
    document.body.dataset.theme = mode;
  }, [mode]);

  const setMode = (newMode: ThemeMode) => setModeState(newMode);
  const toggleMode = () => setModeState((m) => (m === 'light' ? 'dark' : 'light'));

  const palette = useMemo(() => (mode === 'light' ? lightPalette : darkPalette), [mode]);

  const value = useMemo(() => ({ mode, setMode, palette, toggleMode }), [mode, palette]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export { ThemeContext };

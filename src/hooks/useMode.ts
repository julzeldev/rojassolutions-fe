import { useState, useEffect, useCallback } from 'react';

export function useMode(defaultMode: 'light' | 'dark' = 'light') {
  const getInitialMode = () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem('theme-mode');
      if (stored === 'light' || stored === 'dark') return stored;
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    }
    return defaultMode;
  };

  const [mode, setMode] = useState<'light' | 'dark'>(getInitialMode);

  useEffect(() => {
    window.localStorage.setItem('theme-mode', mode);
  }, [mode]);

  const toggleMode = useCallback(() => {
    setMode(m => (m === 'light' ? 'dark' : 'light'));
  }, []);

  return { mode, setMode, toggleMode };
}

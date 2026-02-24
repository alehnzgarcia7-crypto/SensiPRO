'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

import { getTheme, type ThemeConfig } from './theme-config';

interface ThemeContextValue {
  theme: ThemeConfig;
  setTheme: (key: string) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const COOKIE_NAME = 'ares-theme';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 dias

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeConfig>(getTheme('default'));

  // Cargar tema persistido desde cookie
  useEffect(() => {
    try {
      const saved = document.cookie
        .split('; ')
        .find((c) => c.startsWith(`${COOKIE_NAME}=`))
        ?.split('=')[1];
      if (saved) setThemeState(getTheme(saved));
    } catch {
      // Cookie no accesible — usar default
    }
  }, []);

  // Aplicar CSS variables al root
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', theme.colors.primary);
    root.style.setProperty('--theme-secondary', theme.colors.secondary);
    root.style.setProperty('--theme-accent', theme.colors.accent);
    root.style.setProperty('--theme-glow', theme.colors.glow);
    root.style.setProperty('--theme-gradient', theme.colors.gradient);
  }, [theme]);

  const setTheme = useCallback((key: string) => {
    const newTheme = getTheme(key);
    setThemeState(newTheme);
    // Persistir en cookie (30 dias)
    document.cookie = `${COOKIE_NAME}=${key};path=/;max-age=${COOKIE_MAX_AGE}`;
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

export type Theme = 'light' | 'dark' | 'black';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: (nextTheme?: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'promorang-theme';

function getInitialTheme(): Theme {
  // Check localStorage first
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'black') {
    return stored;
  }

  // Auto-detect from system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'light';
}

function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  
  // Remove all theme classes
  root.classList.remove('light', 'dark', 'black');
  root.removeAttribute('data-theme');
  
  // Apply new theme
  root.classList.add(theme);
  root.setAttribute('data-theme', theme);
  
  // Store preference
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Only auto-switch if user hasn't set a preference
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (!stored) {
        setThemeState(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = (nextTheme?: Theme) => {
    if (nextTheme) {
      setTheme(nextTheme);
    } else {
      // Cycle through themes: light -> dark -> black -> light
      const themeOrder: Theme[] = ['light', 'dark', 'black'];
      const currentIndex = themeOrder.indexOf(theme);
      const nextIndex = (currentIndex + 1) % themeOrder.length;
      setTheme(themeOrder[nextIndex]);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

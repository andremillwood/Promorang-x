import { useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

/**
 * Hook for unauthenticated pages (root, auth) to enforce light mode by default
 * while still respecting explicit user toggles and system preferences
 */
export function useUnauthenticatedTheme() {
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    // Check if user has explicitly set a theme preference
    const storedTheme = localStorage.getItem('promorang-theme');
    
    // If no stored preference, check system preference
    if (!storedTheme) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        setTheme('dark');
      } else {
        setTheme('light');
      }
    }
    // If there is a stored preference, respect it (user has explicitly chosen)
  }, [setTheme]);

  return { theme, setTheme };
}

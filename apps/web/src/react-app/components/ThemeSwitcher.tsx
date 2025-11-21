import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import type { Theme } from '../context/ThemeContext';

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  const themes: Array<{ value: Theme; label: string; icon: typeof Sun }> = [
    { value: 'light', label: 'Light Mode', icon: Sun },
    { value: 'dark', label: 'Dark Grey Mode', icon: Moon },
    { value: 'black', label: 'Pure Black (OLED)', icon: Monitor },
  ];

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-pr-text-1 dark:text-gray-300">
        Theme
      </label>
      <div className="grid grid-cols-1 gap-2">
        {themes.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all
              ${
                theme === value
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-pr-surface-3 dark:border-gray-700 hover:border-pr-surface-3 dark:hover:border-gray-600'
              }
            `}
          >
            <Icon className={`w-5 h-5 ${theme === value ? 'text-primary-600' : 'text-pr-text-2'}`} />
            <span className={`text-sm font-medium ${theme === value ? 'text-primary-700 dark:text-primary-400' : 'text-pr-text-1 dark:text-gray-300'}`}>
              {label}
            </span>
            {theme === value && (
              <div className="ml-auto w-2 h-2 rounded-full bg-primary-500" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import type { Theme } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function ThemeSettings() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const themes: Array<{ value: Theme; label: string; description: string; icon: typeof Sun }> = [
    { 
      value: 'light', 
      label: 'Light Mode', 
      description: 'Clean and bright interface',
      icon: Sun 
    },
    { 
      value: 'dark', 
      label: 'Dark Grey Mode', 
      description: 'Comfortable grey tones for reduced eye strain',
      icon: Moon 
    },
    { 
      value: 'black', 
      label: 'Pure Black (OLED)', 
      description: 'True black for OLED displays and maximum battery savings',
      icon: Monitor 
    },
  ];

  const handleThemeChange = async (newTheme: Theme) => {
    setTheme(newTheme);
    
    // Save to Supabase user_metadata
    if (user?.id) {
      setSaving(true);
      try {
        const { error } = await supabase.auth.updateUser({
          data: { theme: newTheme }
        });
        
        if (!error) {
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        }
      } catch (err) {
        console.error('Failed to save theme preference:', err);
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-pr-text-1 mb-2">Theme Preferences</h2>
        <p className="text-pr-text-2">Choose your preferred color scheme</p>
      </div>

      <div className="space-y-3">
        {themes.map(({ value, label, description, icon: Icon }) => (
          <button
            key={value}
            onClick={() => handleThemeChange(value)}
            disabled={saving}
            className={`
              w-full flex items-start gap-4 p-4 rounded-xl border-2 transition-all
              ${
                theme === value
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
                  : 'border-pr-surface-3 hover:border-pr-surface-3 hover:bg-pr-surface-2'
              }
              ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className={`
              p-3 rounded-lg flex-shrink-0
              ${theme === value ? 'bg-primary-500 text-white' : 'bg-pr-surface-2 text-pr-text-2'}
            `}>
              <Icon className="w-6 h-6" />
            </div>
            
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2 mb-1">
                <span className={`font-semibold ${theme === value ? 'text-primary-700 dark:text-primary-400' : 'text-pr-text-1'}`}>
                  {label}
                </span>
                {theme === value && (
                  <Check className="w-5 h-5 text-primary-600 flex-shrink-0" />
                )}
              </div>
              <p className="text-sm text-pr-text-2">{description}</p>
            </div>
          </button>
        ))}
      </div>

      {saved && (
        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <Check className="w-5 h-5 text-green-600" />
          <span className="text-sm font-medium text-green-700 dark:text-green-400">
            Theme preference saved successfully
          </span>
        </div>
      )}

      <div className="pt-4 border-t border-pr-surface-3">
        <p className="text-sm text-pr-text-2">
          Your theme preference is automatically synced across all your devices.
        </p>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Eye, Lock, Globe, Save } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabaseClient';

interface PrivacyPreferences {
  publicProfile: boolean;
  followersOnly: boolean;
  privateMode: boolean;
  showPoints: boolean;
  showKeys: boolean;
  showGems: boolean;
  showShares: boolean;
  showPredictions: boolean;
}

export default function PrivacySettings() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<PrivacyPreferences>({
    publicProfile: true,
    followersOnly: false,
    privateMode: false,
    showPoints: true,
    showKeys: true,
    showGems: true,
    showShares: true,
    showPredictions: true,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, [user]);

  const loadPreferences = async () => {
    if (!user?.id) return;

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      const savedPrefs = authUser?.user_metadata?.privacy as Partial<PrivacyPreferences>;
      
      if (savedPrefs) {
        setPreferences(prev => ({ ...prev, ...savedPrefs }));
      }
    } catch (err) {
      console.error('Failed to load privacy preferences:', err);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { privacy: preferences }
      });

      if (!error) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err) {
      console.error('Failed to save privacy preferences:', err);
    } finally {
      setSaving(false);
    }
  };

  const togglePreference = (key: keyof PrivacyPreferences) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-pr-text-1 mb-2">Privacy & Visibility</h2>
        <p className="text-pr-text-2">Control who can see your profile and activity</p>
      </div>

      {/* Profile Visibility */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-pr-text-1 flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Profile Visibility
        </h3>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-4 bg-pr-surface-2 rounded-lg cursor-pointer hover:bg-pr-surface-3 transition-colors">
            <div className="flex-1">
              <div className="font-medium text-pr-text-1">Public Profile</div>
              <div className="text-sm text-pr-text-2">Anyone can view your profile and activity</div>
            </div>
            <input
              type="checkbox"
              checked={preferences.publicProfile}
              onChange={() => togglePreference('publicProfile')}
              className="w-5 h-5 rounded border-pr-surface-3 text-primary-600 focus:ring-primary-500"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-pr-surface-2 rounded-lg cursor-pointer hover:bg-pr-surface-3 transition-colors">
            <div className="flex-1">
              <div className="font-medium text-pr-text-1">Followers Only</div>
              <div className="text-sm text-pr-text-2">Only your followers can see your content</div>
            </div>
            <input
              type="checkbox"
              checked={preferences.followersOnly}
              onChange={() => togglePreference('followersOnly')}
              className="w-5 h-5 rounded border-pr-surface-3 text-primary-600 focus:ring-primary-500"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-pr-surface-2 rounded-lg cursor-pointer hover:bg-pr-surface-3 transition-colors">
            <div className="flex-1">
              <div className="font-medium text-pr-text-1 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Private Mode
              </div>
              <div className="text-sm text-pr-text-2">Fully hidden except on required interactions</div>
            </div>
            <input
              type="checkbox"
              checked={preferences.privateMode}
              onChange={() => togglePreference('privateMode')}
              className="w-5 h-5 rounded border-pr-surface-3 text-primary-600 focus:ring-primary-500"
            />
          </label>
        </div>
      </div>

      {/* Activity Display */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-pr-text-1 flex items-center gap-2">
          <Eye className="w-5 h-5" />
          Activity Display
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { key: 'showPoints' as const, label: 'Show Points Balance', icon: '💎' },
            { key: 'showKeys' as const, label: 'Show Keys Balance', icon: '🔑' },
            { key: 'showGems' as const, label: 'Show Gems Balance', icon: '💠' },
            { key: 'showShares' as const, label: 'Show Shares Owned', icon: '📊' },
            { key: 'showPredictions' as const, label: 'Show Predictions', icon: '🎯' },
          ].map(({ key, label, icon }) => (
            <label
              key={key}
              className="flex items-center justify-between p-3 bg-pr-surface-2 rounded-lg cursor-pointer hover:bg-pr-surface-3 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{icon}</span>
                <span className="text-sm font-medium text-pr-text-1">{label}</span>
              </div>
              <input
                type="checkbox"
                checked={preferences[key]}
                onChange={() => togglePreference(key)}
                className="w-4 h-4 rounded border-pr-surface-3 text-primary-600 focus:ring-primary-500"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-4 pt-4 border-t border-pr-surface-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Saving...' : 'Save Privacy Settings'}
        </button>

        {saved && (
          <span className="text-sm font-medium text-green-600 dark:text-green-400">
            ✓ Saved successfully
          </span>
        )}
      </div>
    </div>
  );
}

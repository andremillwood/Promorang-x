import { useState, useEffect } from 'react';
import { Heart, Video, Image, FileText, ShoppingBag, TrendingUp, Save, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabaseClient';

interface ContentPreferences {
  categories: string[];
  formats: string[];
  blockedCreators: string[];
  blockedBrands: string[];
  opportunities: string[];
}

const CATEGORIES = [
  { id: 'beauty', label: 'Beauty & Cosmetics', icon: '💄' },
  { id: 'fitness', label: 'Fitness & Wellness', icon: '💪' },
  { id: 'tech', label: 'Technology', icon: '💻' },
  { id: 'finance', label: 'Finance & Investing', icon: '💰' },
  { id: 'automotive', label: 'Automotive', icon: '🚗' },
  { id: 'fashion', label: 'Fashion & Style', icon: '👗' },
  { id: 'local', label: 'Local Businesses', icon: '🏪' },
  { id: 'food', label: 'Food & Dining', icon: '🍔' },
  { id: 'travel', label: 'Travel & Tourism', icon: '✈️' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎬' },
];

const FORMATS = [
  { id: 'reels', label: 'Reels / Short Videos', icon: Video },
  { id: 'static', label: 'Static Posts / Images', icon: Image },
  { id: 'longform', label: 'Long-form Content', icon: FileText },
];

const OPPORTUNITIES = [
  { id: 'content_shares', label: 'Content Shares', icon: '📱' },
  { id: 'predictions', label: 'Predictions & Forecasts', icon: '🎯' },
  { id: 'tasks', label: 'Tasks & Challenges', icon: '✅' },
  { id: 'ecommerce', label: 'E-commerce Drops', icon: '🛍️' },
  { id: 'investments', label: 'Investment Opportunities', icon: '📈' },
];

export default function ContentPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<ContentPreferences>({
    categories: [],
    formats: ['reels', 'static', 'longform'],
    blockedCreators: [],
    blockedBrands: [],
    opportunities: ['content_shares', 'predictions', 'tasks', 'ecommerce'],
  });
  const [newBlockedItem, setNewBlockedItem] = useState('');
  const [blockType, setBlockType] = useState<'creator' | 'brand'>('creator');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, [user]);

  const loadPreferences = async () => {
    if (!user?.id) return;

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      const savedPrefs = authUser?.user_metadata?.contentPreferences as Partial<ContentPreferences>;
      
      if (savedPrefs) {
        setPreferences(prev => ({ ...prev, ...savedPrefs }));
      }
    } catch (err) {
      console.error('Failed to load content preferences:', err);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { contentPreferences: preferences }
      });

      if (!error) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err) {
      console.error('Failed to save content preferences:', err);
    } finally {
      setSaving(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setPreferences(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(c => c !== categoryId)
        : [...prev.categories, categoryId]
    }));
  };

  const toggleFormat = (formatId: string) => {
    setPreferences(prev => ({
      ...prev,
      formats: prev.formats.includes(formatId)
        ? prev.formats.filter(f => f !== formatId)
        : [...prev.formats, formatId]
    }));
  };

  const toggleOpportunity = (oppId: string) => {
    setPreferences(prev => ({
      ...prev,
      opportunities: prev.opportunities.includes(oppId)
        ? prev.opportunities.filter(o => o !== oppId)
        : [...prev.opportunities, oppId]
    }));
  };

  const addBlockedItem = () => {
    if (!newBlockedItem.trim()) return;

    const key = blockType === 'creator' ? 'blockedCreators' : 'blockedBrands';
    setPreferences(prev => ({
      ...prev,
      [key]: [...prev[key], newBlockedItem.trim()]
    }));
    setNewBlockedItem('');
  };

  const removeBlockedItem = (item: string, type: 'creator' | 'brand') => {
    const key = type === 'creator' ? 'blockedCreators' : 'blockedBrands';
    setPreferences(prev => ({
      ...prev,
      [key]: prev[key].filter(i => i !== item)
    }));
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-pr-text-1 mb-2">Content Preferences</h2>
        <p className="text-pr-text-2">Customize your content feed and opportunities</p>
      </div>

      {/* Categories */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-pr-text-1 flex items-center gap-2">
          <Heart className="w-5 h-5" />
          Preferred Categories
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {CATEGORIES.map(({ id, label, icon }) => (
            <label
              key={id}
              className={`
                flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all border-2
                ${preferences.categories.includes(id)
                  ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500'
                  : 'bg-pr-surface-2 border-pr-surface-3 hover:border-pr-surface-3'
                }
              `}
            >
              <input
                type="checkbox"
                checked={preferences.categories.includes(id)}
                onChange={() => toggleCategory(id)}
                className="sr-only"
              />
              <span className="text-xl">{icon}</span>
              <span className="text-sm font-medium text-pr-text-1">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Formats */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-pr-text-1">Content Formats</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {FORMATS.map(({ id, label, icon: Icon }) => (
            <label
              key={id}
              className={`
                flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-all border-2
                ${preferences.formats.includes(id)
                  ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500'
                  : 'bg-pr-surface-2 border-pr-surface-3 hover:border-pr-surface-3'
                }
              `}
            >
              <input
                type="checkbox"
                checked={preferences.formats.includes(id)}
                onChange={() => toggleFormat(id)}
                className="sr-only"
              />
              <Icon className="w-5 h-5 text-pr-text-1" />
              <span className="text-sm font-medium text-pr-text-1">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Opportunities */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-pr-text-1 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Preferred Opportunities
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {OPPORTUNITIES.map(({ id, label, icon }) => (
            <label
              key={id}
              className={`
                flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all border-2
                ${preferences.opportunities.includes(id)
                  ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500'
                  : 'bg-pr-surface-2 border-pr-surface-3 hover:border-pr-surface-3'
                }
              `}
            >
              <input
                type="checkbox"
                checked={preferences.opportunities.includes(id)}
                onChange={() => toggleOpportunity(id)}
                className="sr-only"
              />
              <span className="text-xl">{icon}</span>
              <span className="text-sm font-medium text-pr-text-1">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Block List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-pr-text-1 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5" />
          Block List
        </h3>

        <div className="flex gap-2">
          <select
            value={blockType}
            onChange={(e) => setBlockType(e.target.value as 'creator' | 'brand')}
            className="px-3 py-2 bg-pr-surface-2 border border-pr-surface-3 rounded-lg text-pr-text-1"
          >
            <option value="creator">Creator</option>
            <option value="brand">Brand</option>
          </select>
          <input
            type="text"
            value={newBlockedItem}
            onChange={(e) => setNewBlockedItem(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addBlockedItem()}
            placeholder={`Enter ${blockType} name...`}
            className="flex-1 px-3 py-2 bg-pr-surface-2 border border-pr-surface-3 rounded-lg text-pr-text-1 placeholder-pr-text-2"
          />
          <button
            onClick={addBlockedItem}
            className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors"
          >
            Add
          </button>
        </div>

        {(preferences.blockedCreators.length > 0 || preferences.blockedBrands.length > 0) && (
          <div className="space-y-2">
            {preferences.blockedCreators.map(creator => (
              <div key={creator} className="flex items-center justify-between p-2 bg-pr-surface-2 rounded-lg">
                <span className="text-sm text-pr-text-1">
                  <span className="font-medium">Creator:</span> {creator}
                </span>
                <button
                  onClick={() => removeBlockedItem(creator, 'creator')}
                  className="p-1 hover:bg-pr-surface-3 rounded transition-colors"
                >
                  <X className="w-4 h-4 text-pr-text-2" />
                </button>
              </div>
            ))}
            {preferences.blockedBrands.map(brand => (
              <div key={brand} className="flex items-center justify-between p-2 bg-pr-surface-2 rounded-lg">
                <span className="text-sm text-pr-text-1">
                  <span className="font-medium">Brand:</span> {brand}
                </span>
                <button
                  onClick={() => removeBlockedItem(brand, 'brand')}
                  className="p-1 hover:bg-pr-surface-3 rounded transition-colors"
                >
                  <X className="w-4 h-4 text-pr-text-2" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-4 pt-4 border-t border-pr-surface-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Saving...' : 'Save Preferences'}
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

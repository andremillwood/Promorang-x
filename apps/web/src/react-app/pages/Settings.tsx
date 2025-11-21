import { useState } from 'react';
import { Settings as SettingsIcon, Palette, Shield, Heart, Users } from 'lucide-react';
import ThemeSettings from '../components/settings/ThemeSettings';
import PrivacySettings from '../components/settings/PrivacySettings';
import ContentPreferences from '../components/settings/ContentPreferences';
import RoleSettings from '../components/settings/RoleSettings';

type SettingsTab = 'theme' | 'privacy' | 'content' | 'roles';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('theme');

  const tabs = [
    { id: 'theme' as const, label: 'Theme', icon: Palette },
    { id: 'privacy' as const, label: 'Privacy & Visibility', icon: Shield },
    { id: 'content' as const, label: 'Content Preferences', icon: Heart },
    { id: 'roles' as const, label: 'User Roles', icon: Users },
  ];

  return (
    <div className="max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-4 md:px-6 xl:px-8 2xl:px-12 py-6 pb-mobile-nav lg:pb-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <SettingsIcon className="w-8 h-8 text-primary-600" />
          <h1 className="text-3xl font-bold text-pr-text-1">Settings</h1>
        </div>
        <p className="text-pr-text-2">Manage your account preferences and settings</p>
      </div>

      {/* Settings Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* Left: Tabs */}
        <nav className="space-y-1">
          <div className="bg-pr-surface-1 rounded-xl border border-pr-surface-3 p-2 lg:sticky lg:top-6">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                  ${
                    activeTab === id
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'text-pr-text-2 hover:bg-pr-surface-2 hover:text-pr-text-1'
                  }
                `}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium text-sm">{label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Right: Dynamic Content */}
        <div className="bg-pr-surface-1 rounded-xl border border-pr-surface-3 p-6 lg:p-8">
          {activeTab === 'theme' && <ThemeSettings />}
          {activeTab === 'privacy' && <PrivacySettings />}
          {activeTab === 'content' && <ContentPreferences />}
          {activeTab === 'roles' && <RoleSettings />}
        </div>
      </div>
    </div>
  );
}

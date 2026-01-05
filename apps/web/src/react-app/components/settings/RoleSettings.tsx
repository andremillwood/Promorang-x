import { useState, useEffect } from 'react';
import { Users, Palette, Megaphone, ShoppingCart, TrendingUp, Save, Info } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabaseClient';

export type UserRole = 'creator' | 'merchant' | 'advertiser' | 'investor';

interface RoleInfo {
  id: UserRole;
  label: string;
  description: string;
  icon: typeof Users;
  features: string[];
  color: string;
}

const ROLES: RoleInfo[] = [
  {
    id: 'creator',
    label: 'Creator',
    description: 'Share content, build audience, earn from drops',
    icon: Palette,
    features: [
      'Create and share content',
      'Participate in drops',
      'Earn gems and rewards',
      'Build follower base',
    ],
    color: 'purple',
  },
  {
    id: 'merchant',
    label: 'Merchant',
    description: 'Sell products, manage inventory, run promotions',
    icon: ShoppingCart,
    features: [
      'List products for sale',
      'Manage inventory',
      'Process orders',
      'Run promotional campaigns',
    ],
    color: 'blue',
  },
  {
    id: 'advertiser',
    label: 'Advertiser',
    description: 'Run campaigns, reach audiences, track performance',
    icon: Megaphone,
    features: [
      'Create marketing campaigns',
      'Target specific audiences',
      'Track campaign analytics',
      'Manage ad budgets',
    ],
    color: 'orange',
  },
  {
    id: 'investor',
    label: 'Investor',
    description: 'Invest in creators, track portfolios, earn returns',
    icon: TrendingUp,
    features: [
      'Invest in creator shares',
      'Track portfolio performance',
      'Earn from creator success',
      'Access investment analytics',
    ],
    color: 'green',
  },
];

export default function RoleSettings() {
  const { user } = useAuth();
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>(['creator']);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadRoles();
  }, [user]);

  const loadRoles = async () => {
    if (!user?.id) return;

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      const savedRoles = authUser?.user_metadata?.roles as UserRole[];
      
      if (savedRoles && Array.isArray(savedRoles) && savedRoles.length > 0) {
        setSelectedRoles(savedRoles);
      }
    } catch (err) {
      console.error('Failed to load roles:', err);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { roles: selectedRoles }
      });

      if (!error) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err) {
      console.error('Failed to save roles:', err);
    } finally {
      setSaving(false);
    }
  };

  const toggleRole = (roleId: UserRole) => {
    setSelectedRoles(prev => {
      if (prev.includes(roleId)) {
        // Don't allow removing the last role
        if (prev.length === 1) return prev;
        return prev.filter(r => r !== roleId);
      }
      return [...prev, roleId];
    });
  };

  const getColorClasses = (color: string, isSelected: boolean) => {
    const colors = {
      purple: isSelected 
        ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500 text-purple-700 dark:text-purple-400'
        : 'bg-pr-surface-2 border-pr-surface-3 hover:border-purple-300',
      blue: isSelected
        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-400'
        : 'bg-pr-surface-2 border-pr-surface-3 hover:border-blue-300',
      orange: isSelected
        ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500 text-orange-700 dark:text-orange-400'
        : 'bg-pr-surface-2 border-pr-surface-3 hover:border-orange-300',
      green: isSelected
        ? 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-400'
        : 'bg-pr-surface-2 border-pr-surface-3 hover:border-green-300',
    };
    return colors[color as keyof typeof colors] || colors.purple;
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-pr-text-1 mb-2">User Roles</h2>
        <p className="text-pr-text-2">Select one or more roles to customize your experience</p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-300">
            <p className="font-medium mb-1">Multiple Roles</p>
            <p>You can select multiple roles simultaneously. Your dashboard and features will adapt based on your selected roles.</p>
          </div>
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ROLES.map((role) => {
          const isSelected = selectedRoles.includes(role.id);
          const Icon = role.icon;

          return (
            <button
              key={role.id}
              onClick={() => toggleRole(role.id)}
              className={`
                text-left p-6 rounded-xl border-2 transition-all
                ${getColorClasses(role.color, isSelected)}
              `}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`
                  p-3 rounded-lg flex-shrink-0
                  ${isSelected 
                    ? `bg-${role.color}-500 text-white` 
                    : 'bg-pr-surface-3 text-pr-text-2'
                  }
                `}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-pr-text-1 mb-1">
                    {role.label}
                  </h3>
                  <p className="text-sm text-pr-text-2">
                    {role.description}
                  </p>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-pr-text-2 uppercase tracking-wide">
                  Key Features
                </p>
                <ul className="space-y-1">
                  {role.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-pr-text-2">
                      <span className="text-primary-500 mt-0.5">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Roles Summary */}
      {selectedRoles.length > 0 && (
        <div className="bg-pr-surface-2 rounded-lg p-4">
          <p className="text-sm font-medium text-pr-text-1 mb-2">
            Active Roles ({selectedRoles.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedRoles.map(roleId => {
              const role = ROLES.find(r => r.id === roleId);
              if (!role) return null;
              return (
                <span
                  key={roleId}
                  className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full text-sm font-medium"
                >
                  {role.label}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex items-center gap-4 pt-4 border-t border-pr-surface-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Saving...' : 'Save Role Settings'}
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

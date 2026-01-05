import { useState, useEffect } from 'react';
import { X, Crown, Zap, Star, Shield, Award, Check } from 'lucide-react';
import type { UserType } from '../../shared/types';
import ModalBase from '@/react-app/components/ModalBase';

interface GoldItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  gold_cost: number;
  effect_data: any;
  duration?: string;
  owned?: boolean;
}

interface GoldShopModalProps {
  user: UserType | null;
  isOpen: boolean;
  onClose: () => void;
  onPurchase: () => void;
}

export default function GoldShopModal({ user, isOpen, onClose, onPurchase }: GoldShopModalProps) {
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('upgrades');
  const [userPurchases, setUserPurchases] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen && user) {
      fetchUserPurchases();
    }
  }, [isOpen, user]);

  const fetchUserPurchases = async () => {
    try {
      const response = await fetch('/api/users/gold-purchases', {
        credentials: 'include'
      });
      if (response.ok) {
        const purchases = await response.json();
        setUserPurchases(purchases);
      }
    } catch (error) {
      console.error('Failed to fetch gold purchases:', error);
    }
  };

  const handlePurchase = async (item: GoldItem) => {
    if (!user || user.gold_collected < item.gold_cost) return;

    setLoading(true);
    try {
      const response = await fetch('/api/users/gold-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          item_type: item.category,
          item_name: item.name,
          gold_cost: item.gold_cost,
          effect_data: JSON.stringify(item.effect_data)
        })
      });

      if (response.ok) {
        onPurchase();
        fetchUserPurchases();
        showPurchaseNotification(item.name);
      } else {
        const error = await response.json();
        alert(error.error || 'Purchase failed');
      }
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Purchase failed');
    } finally {
      setLoading(false);
    }
  };

  const showPurchaseNotification = (itemName: string) => {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-4 rounded-xl shadow-lg z-50 animate-pulse';
    notification.innerHTML = `
      <div class="flex items-center space-x-3">
        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <div>
          <div class="font-bold">Purchase Successful!</div>
          <div class="text-sm">${itemName} activated</div>
        </div>
      </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 3000);
  };

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      'crown': Crown,
      'zap': Zap,
      'star': Star,
      'shield': Shield,
      'award': Award,
    };
    const IconComponent = iconMap[iconName] || Star;
    return <IconComponent className="w-6 h-6" />;
  };

  const goldShopItems: GoldItem[] = [
    // Tier Upgrades
    {
      id: 'premium_upgrade',
      name: 'Premium Tier Upgrade',
      description: 'Upgrade to Premium tier with 1.5x points multiplier and exclusive perks',
      icon: 'crown',
      category: 'upgrades',
      gold_cost: 500,
      effect_data: { tier: 'premium' }
    },
    {
      id: 'super_upgrade',
      name: 'Super Tier Upgrade',
      description: 'Upgrade to Super tier with 2x points multiplier and maximum benefits',
      icon: 'crown',
      category: 'upgrades',
      gold_cost: 1000,
      effect_data: { tier: 'super' }
    },
    
    // Multipliers
    {
      id: 'key_multiplier_24h',
      name: '24h Key Multiplier',
      description: 'Double key earnings from all actions for 24 hours',
      icon: 'zap',
      category: 'multipliers',
      gold_cost: 200,
      duration: '24 hours',
      effect_data: { multiplier: 2, duration_hours: 24, type: 'key_earnings' }
    },
    {
      id: 'xp_boost_7d',
      name: '7-Day XP Boost',
      description: 'Triple XP gains from all activities for 7 days',
      icon: 'star',
      category: 'multipliers',
      gold_cost: 300,
      duration: '7 days',
      effect_data: { multiplier: 3, duration_hours: 168, type: 'xp_earnings' }
    },
    
    // Profile Features
    {
      id: 'golden_badge',
      name: 'Golden Badge',
      description: 'Display a prestigious golden badge on your profile',
      icon: 'award',
      category: 'profile',
      gold_cost: 150,
      effect_data: { badge_type: 'golden', permanent: true }
    },
    {
      id: 'profile_boost',
      name: 'Profile Boost',
      description: 'Enhanced visibility in leaderboards and search for 30 days',
      icon: 'shield',
      category: 'profile',
      gold_cost: 250,
      duration: '30 days',
      effect_data: { boost_type: 'visibility', duration_hours: 720 }
    }
  ];

  const categories = [
    { id: 'upgrades', name: 'Tier Upgrades', icon: Crown },
    { id: 'multipliers', name: 'Boosts', icon: Zap },
    { id: 'profile', name: 'Profile', icon: Award }
  ];

  const filteredItems = goldShopItems.filter(item => item.category === activeCategory);

  const isItemOwned = (item: GoldItem) => {
    return userPurchases.some(purchase => 
      purchase.item_name === item.name && 
      (!purchase.expires_at || new Date(purchase.expires_at) > new Date())
    );
  };

  const canAfford = (item: GoldItem) => {
    return user && user.gold_collected >= item.gold_cost;
  };

  if (!isOpen) return null;

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="4xl"
      showCloseButton={false}
    >
      <div className="flex max-h-[85vh] flex-col overflow-hidden rounded-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500 to-amber-500 px-6 pt-6 pb-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Crown className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Gold Shop</h2>
                <p className="text-yellow-100">Spend your gold on exclusive upgrades and boosts</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-white transition-colors hover:text-yellow-200"
              aria-label="Close gold shop modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Gold Balance */}
          <div className="mt-4 rounded-xl bg-pr-surface-2 p-4">
            <div className="flex items-center justify-between">
              <span className="text-yellow-100">Your Gold Balance</span>
              <span className="text-2xl font-bold">{user?.gold_collected || 0}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-pr-surface-card">
          {/* Category Tabs */}
          <div className="border-b border-pr-surface-3 px-6">
            <div className="flex space-x-8 py-4">
              {categories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      activeCategory === category.id
                        ? 'bg-pr-surface-2 border border-yellow-500/60 text-pr-text-1'
                        : 'text-pr-text-2 hover:text-pr-text-1'
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span>{category.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Items Grid */}
          <div className="max-h-[32rem] overflow-y-auto px-6 pb-6 pt-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {filteredItems.map((item) => {
                const owned = isItemOwned(item);
                const affordable = canAfford(item);
                
                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl border p-6 transition-all duration-200 ${
                      owned
                        ? 'border-green-500/60 bg-pr-surface-2'
                        : affordable
                        ? 'border-pr-surface-3 bg-pr-surface-card hover:shadow-md'
                        : 'border-pr-surface-3 bg-pr-surface-2'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                        owned
                          ? 'bg-pr-surface-2 text-green-400 border border-green-500/60'
                          : 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white'
                      }`}>
                        {owned ? <Check className="h-6 w-6" /> : getIconComponent(item.icon)}
                      </div>

                      <div className="flex-1">
                        <div className="mb-2 flex items-center justify-between">
                          <h3 className="font-semibold text-pr-text-1">{item.name}</h3>
                          {item.duration && (
                            <span className="rounded-full bg-pr-surface-2 border border-blue-500/60 px-2 py-1 text-xs text-blue-300">
                              {item.duration}
                            </span>
                          )}
                        </div>
                        
                        <p className="mb-4 text-sm text-pr-text-2">{item.description}</p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Crown className="h-4 w-4 text-yellow-400" />
                            <span className="font-semibold text-yellow-300">{item.gold_cost} Gold</span>
                          </div>

                          <button
                            onClick={() => handlePurchase(item)}
                            disabled={loading || owned || !affordable}
                            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                              owned
                                ? 'cursor-not-allowed bg-pr-surface-2 border border-green-500/60 text-green-400'
                                : affordable
                                ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white hover:from-yellow-600 hover:to-amber-600'
                                : 'cursor-not-allowed bg-pr-surface-3 text-pr-text-2'
                            }`}
                          >
                            {loading ? 'Processing...' : owned ? 'Owned' : affordable ? 'Purchase' : 'Not Enough Gold'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </ModalBase>
  );
}

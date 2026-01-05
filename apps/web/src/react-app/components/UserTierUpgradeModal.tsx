import { useState, useEffect } from 'react';
import { X, Star, Crown, Zap, Coins, Gem, ArrowRight, CheckCircle } from 'lucide-react';
import type { UserType } from '../../shared/types';
import ModalBase from '@/react-app/components/ModalBase';

const DEFAULT_UPGRADE_COSTS: Record<string, Record<string, { points: number; gems: number }>> = {
  free: {
    premium: { points: 7500, gems: 200 },
    super: { points: 15000, gems: 450 }
  },
  premium: {
    super: { points: 9000, gems: 275 }
  },
  super: {}
};

interface UserTierUpgradeModalProps {
  user: UserType | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UserTierUpgradeModal({ user, isOpen, onClose, onSuccess }: UserTierUpgradeModalProps) {
  const [upgradeCosts, setUpgradeCosts] = useState(DEFAULT_UPGRADE_COSTS);
  const [selectedTier, setSelectedTier] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'points' | 'gems'>('points');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingCosts, setIsLoadingCosts] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchUpgradeCosts();
    }
  }, [isOpen]);

  const normalizeCosts = (rawCosts: Record<string, Record<string, { points: number; gems: number }>>) => {
    const merged = { ...DEFAULT_UPGRADE_COSTS, ...(rawCosts || {}) };
    return Object.fromEntries(
      Object.entries(merged).map(([tier, upgrades]) => [
        tier.toLowerCase(),
        Object.fromEntries(
          Object.entries(upgrades).map(([targetTier, costs]) => [targetTier.toLowerCase(), costs])
        )
      ])
    );
  };

  const fetchUpgradeCosts = async () => {
    try {
      setIsLoadingCosts(true);
      const authToken = localStorage.getItem('authToken');
      const response = await fetch('/api/users/upgrade-costs', {
        credentials: 'include',
        headers: authToken
          ? {
              Authorization: `Bearer ${authToken}`
            }
          : undefined
      });
      if (!response.ok) {
        throw new Error(`Failed to load upgrade costs: ${response.status}`);
      }

      const data = await response.json();
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        setUpgradeCosts(normalizeCosts(data));
      } else {
        setUpgradeCosts(normalizeCosts(DEFAULT_UPGRADE_COSTS));
      }
    } catch (error) {
      console.error('Failed to fetch upgrade costs:', error);
      setUpgradeCosts(normalizeCosts(DEFAULT_UPGRADE_COSTS));
    }
    setIsLoadingCosts(false);
  };

  if (!isOpen || !user) return null;

  const normalizedTier = (user.user_tier || 'free').toLowerCase();
  const availableUpgrades = upgradeCosts[normalizedTier] || {};
  const hasAvailableUpgrades = Object.keys(availableUpgrades).length > 0;

  const getTierInfo = (tier: string) => {
    switch (tier) {
      case 'super':
        return {
          name: 'Super User',
          icon: Crown,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          benefits: [
            '2.0x point multiplier for all actions',
            '1 proof drop required for Master Key',
            '1,000 monthly Instagram points',
            'Priority support',
            'Exclusive events access',
            'Advanced analytics'
          ]
        };
      case 'premium':
        return {
          name: 'Premium User',
          icon: Star,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          benefits: [
            '1.5x point multiplier for all actions',
            '2 proof drops required for Master Key',
            '750 monthly Instagram points',
            'Priority support',
            'Advanced analytics'
          ]
        };
      default:
        return {
          name: 'Free User',
          icon: Zap,
          color: 'text-pr-text-2',
          bgColor: 'bg-pr-surface-2',
          borderColor: 'border-pr-surface-3',
          benefits: [
            '1.0x point multiplier',
            '5 proof drops required for Master Key',
            '500 monthly Instagram points',
            'Standard support'
          ]
        };
    }
  };

  const handleUpgrade = async () => {
    if (!selectedTier) return;

    setLoading(true);
    setError(null);

    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch('/api/users/upgrade-tier', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
        },
        credentials: 'include',
        body: JSON.stringify({
          target_tier: selectedTier,
          payment_method: paymentMethod
        })
      });

      if (response.ok) {
        onSuccess();
        onClose();
        setSelectedTier('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Upgrade failed');
      }
    } catch (error) {
      console.error('Upgrade failed:', error);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const canAfford = (tier: string, method: 'points' | 'gems') => {
    const cost = availableUpgrades[tier]?.[method];
    if (!cost) return false;
    
    const balance = method === 'points' ? user.points_balance : user.gems_balance;
    return balance >= cost;
  };

  const currentTierInfo = getTierInfo(normalizedTier);

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      showCloseButton={false}
    >
      <div className="flex max-h-[85vh] flex-col overflow-hidden">
        <div className="border-b border-pr-surface-3 px-6 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-orange-600" />
              <h2 className="text-xl font-bold text-pr-text-1">Upgrade Your Tier</h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:text-pr-text-2"
              aria-label="Close user tier upgrade modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4">

        {/* Current Tier */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-pr-text-1 mb-3">Current Tier</h3>
          <div className={`border-2 ${currentTierInfo.borderColor} ${currentTierInfo.bgColor} rounded-lg p-4`}>
            <div className="flex items-center space-x-3">
              <currentTierInfo.icon className={`w-8 h-8 ${currentTierInfo.color}`} />
              <div>
                <h4 className={`text-lg font-semibold ${currentTierInfo.color}`}>
                  {currentTierInfo.name}
                </h4>
                <p className="text-sm text-pr-text-2">Your current membership level</p>
              </div>
            </div>
          </div>
        </div>

        {/* Available Upgrades */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-pr-text-1">Available Upgrades</h3>
          
          {!hasAvailableUpgrades && !isLoadingCosts && (
            <div className="border border-dashed border-pr-surface-3 rounded-lg p-6 text-center text-sm text-pr-text-2">
              No higher tiers available right now. Check back later for new membership levels.
            </div>
          )}

          {isLoadingCosts && (
            <div className="border border-pr-surface-3 rounded-lg p-6 text-center text-sm text-pr-text-2">
              Loading upgrade options...
            </div>
          )}

          {Object.keys(availableUpgrades).map((tier) => {
            const normalizedTarget = tier.toLowerCase();
            const tierInfo = getTierInfo(normalizedTarget);
            const cost = availableUpgrades[tier];
            
            return (
              <div
                key={tier}
                className={`border-2 rounded-lg p-6 cursor-pointer transition-all duration-200 ${
                  selectedTier === normalizedTarget
                    ? `${tierInfo.borderColor} ${tierInfo.bgColor}`
                    : 'border-pr-surface-3 hover:border-pr-surface-3'
                }`}
                onClick={() => setSelectedTier(normalizedTarget)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <tierInfo.icon className={`w-8 h-8 ${tierInfo.color}`} />
                      <div>
                        <h4 className={`text-lg font-semibold ${selectedTier === normalizedTarget ? tierInfo.color : 'text-pr-text-1'}`}>
                          {tierInfo.name}
                        </h4>
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-1">
                            <Coins className="w-4 h-4 text-blue-600" />
                            <span>{cost.points.toLocaleString()} points</span>
                          </div>
                          <span className="text-gray-400">or</span>
                          <div className="flex items-center space-x-1">
                            <Gem className="w-4 h-4 text-purple-600" />
                            <span>{cost.gems} gems</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {tierInfo.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span className="text-sm text-pr-text-1">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {selectedTier === normalizedTarget && (
                    <div className="ml-4">
                      <ArrowRight className={`w-6 h-6 ${tierInfo.color}`} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Payment Method Selection */}
        {selectedTier && (
          <div className="mt-6 p-4 bg-pr-surface-2 rounded-lg">
            <h4 className="font-medium text-pr-text-1 mb-3">Choose Payment Method</h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPaymentMethod('points')}
                disabled={!canAfford(selectedTier, 'points')}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  paymentMethod === 'points'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-pr-surface-3 hover:border-pr-surface-3'
                } ${!canAfford(selectedTier, 'points') ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Coins className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Points</span>
                </div>
                <p className="text-lg font-bold text-blue-600">
                  {availableUpgrades[selectedTier]?.points.toLocaleString()}
                </p>
                <p className="text-xs text-pr-text-2">
                  Balance: {user.points_balance.toLocaleString()}
                </p>
                {!canAfford(selectedTier, 'points') && (
                  <p className="text-xs text-red-600 mt-1">Insufficient balance</p>
                )}
              </button>

              <button
                onClick={() => setPaymentMethod('gems')}
                disabled={!canAfford(selectedTier, 'gems')}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  paymentMethod === 'gems'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-pr-surface-3 hover:border-pr-surface-3'
                } ${!canAfford(selectedTier, 'gems') ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Gem className="w-5 h-5 text-purple-600" />
                  <span className="font-medium">Gems</span>
                </div>
                <p className="text-lg font-bold text-purple-600">
                  {availableUpgrades[selectedTier]?.gems}
                </p>
                <p className="text-xs text-pr-text-2">
                  Balance: {user.gems_balance}
                </p>
                {!canAfford(selectedTier, 'gems') && (
                  <p className="text-xs text-red-600 mt-1">Insufficient balance</p>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-pr-surface-3 rounded-lg text-pr-text-1 font-medium hover:bg-pr-surface-2 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpgrade}
            disabled={!selectedTier || !canAfford(selectedTier, paymentMethod) || loading}
            className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
          >
            {loading ? 'Upgrading...' : `Upgrade to ${selectedTier ? getTierInfo(selectedTier).name : ''}`}
          </button>
        </div>
        </div>
      </div>
    </ModalBase>
  );
}

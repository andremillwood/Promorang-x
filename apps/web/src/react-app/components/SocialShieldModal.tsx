import { useState } from 'react';
import { X, Shield, CheckCircle, AlertCircle, Users, Eye } from 'lucide-react';
import type { UserType } from '../../shared/types';
import ModalBase from '@/react-app/components/ModalBase';

interface SocialShieldPolicy {
  id: string;
  name: string;
  description: string;
  monthlyPremium: number;
  maxCoverage: number;
  deductible: number;
  minFollowers: number;
  coverage: {
    platformBan: boolean;
    algorithmChange: boolean;
    contentStrike: boolean;
    monetizationLoss: boolean;
    followerLoss: boolean;
  };
  platforms: string[];
}

interface SocialShieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType | null;
  onSuccess: () => void;
  policies: SocialShieldPolicy[];
}

export default function SocialShieldModal({ isOpen, onClose, user, onSuccess, policies }: SocialShieldModalProps) {
  const [selectedPolicy, setSelectedPolicy] = useState<string>('pro');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'select' | 'confirm' | 'payment'>('select');

  if (!isOpen) return null;

  const availablePolicies = Array.isArray(policies) ? policies : [];
  const selectedPolicyData = availablePolicies.find(p => p.id === selectedPolicy) || availablePolicies[0] || null;
  const userMeetsRequirements = selectedPolicyData
    ? (user?.follower_count || 0) >= (selectedPolicyData.minFollowers || 0)
    : false;
  const userCanAfford = selectedPolicyData
    ? (user?.gems_balance || 0) >= (selectedPolicyData.monthlyPremium || 0)
    : false;

  const handleSubscribe = async () => {
    if (!selectedPolicyData || !userMeetsRequirements || !userCanAfford) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/growth/shield/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          policy_id: selectedPolicy
        }),
      });

      if (response.ok) {
        onSuccess();
        onClose();
        setStep('select');
      } else {
        const error = await response.json();
        setError(error.error || 'Failed to subscribe to shield');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getCoverageIcon = (covered: boolean) => {
    return covered ? (
      <CheckCircle className="w-4 h-4 text-green-600" />
    ) : (
      <X className="w-4 h-4 text-gray-400" />
    );
  };

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="4xl"
      showCloseButton={false}
    >
      <div className="flex max-h-[85vh] flex-col overflow-hidden rounded-2xl bg-pr-surface-card">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 pt-6 pb-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pr-surface-2">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Social Shield Protection</h2>
                <p className="text-orange-100">Protect your social media earnings</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-white/80 transition-colors hover:text-white"
              aria-label="Close social shield modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {step === 'select' && (
            <div className="space-y-6">
              {/* Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-800">Why You Need Social Shield</h4>
                    <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                      <li>• Algorithm changes can reduce reach by up to 80%</li>
                      <li>• Account bans eliminate income overnight</li>
                      <li>• Content strikes impact monetization for weeks</li>
                      <li>• Platform issues can cause significant follower loss</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Policy Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {availablePolicies.length === 0 && (
                  <div className="col-span-full bg-pr-surface-2 border border-dashed border-pr-surface-3 rounded-lg p-6 text-center text-sm text-pr-text-2">
                    No policies available right now. Check back soon!
                  </div>
                )}
                {availablePolicies.map((policy) => {
                  const isSelected = selectedPolicy === policy.id;
                  const meetsRequirements = (user?.follower_count || 0) >= policy.minFollowers;
                  
                  return (
                    <div
                      key={policy.id}
                      className={`border-2 rounded-xl overflow-hidden cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-orange-500 ring-2 ring-orange-100' 
                          : meetsRequirements 
                            ? 'border-pr-surface-3 hover:border-orange-300' 
                            : 'border-pr-surface-3 opacity-60'
                      }`}
                      onClick={() => meetsRequirements && setSelectedPolicy(policy.id)}
                    >
                      {policy.id === 'pro' && (
                        <div className="bg-orange-500 text-white text-center py-2 text-sm font-medium">
                          Most Popular
                        </div>
                      )}
                      
                      <div className="p-4">
                        <div className="text-center mb-4">
                          <h3 className="text-lg font-bold text-pr-text-1">{policy.name}</h3>
                          <p className="text-sm text-pr-text-2 mb-2">{policy.description}</p>
                          <div className="text-2xl font-bold text-pr-text-1">
                            {policy.monthlyPremium} Gems
                            <span className="text-sm font-normal text-pr-text-2">/month</span>
                          </div>
                          <div className="text-sm text-pr-text-2">
                            Up to ${policy.maxCoverage.toLocaleString()} coverage
                          </div>
                        </div>

                        <div className="space-y-3 mb-4">
                          <div>
                            <h4 className="font-semibold text-pr-text-1 mb-2">Coverage:</h4>
                            <ul className="space-y-1">
                              {Object.entries(policy.coverage).map(([key, covered]) => (
                                <li key={key} className="flex items-center space-x-2">
                                  {getCoverageIcon(covered as boolean)}
                                  <span className={`text-xs ${covered ? 'text-pr-text-1' : 'text-gray-400'}`}>
                                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="font-semibold text-pr-text-1 mb-2">Platforms:</h4>
                            <div className="flex flex-wrap gap-1">
                              {policy.platforms.map((platform) => (
                                <span key={platform} className="px-2 py-1 bg-pr-surface-2 text-pr-text-1 rounded text-xs">
                                  {platform}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="text-xs text-pr-text-2 pt-2 border-t border-pr-border">
                            <div>Deductible: {policy.deductible} gems</div>
                            <div className="flex items-center space-x-1">
                              <Users className="w-3 h-3" />
                              <span>Min followers: {policy.minFollowers.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        {!meetsRequirements && (
                          <div className="bg-red-50 border border-red-200 rounded p-2">
                            <p className="text-xs text-red-700">
                              Requires {policy.minFollowers.toLocaleString()} followers
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* User Status */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Your Status</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-blue-700">
                      Followers: {(user?.follower_count || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4 text-blue-600" />
                    <span className="text-blue-700">
                      Gem Balance: {user?.gems_balance || 0}
                    </span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-pr-surface-3 text-pr-text-1 rounded-lg hover:bg-pr-surface-2 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setStep('confirm')}
                  disabled={!userMeetsRequirements || !userCanAfford}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue with {selectedPolicyData?.name}
                </button>
              </div>
            </div>
          )}

          {step === 'confirm' && selectedPolicyData && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-pr-text-1 mb-4">Confirm Your Subscription</h3>
                
                <div className="bg-pr-surface-2 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-pr-text-1">{selectedPolicyData.name}</span>
                    <span className="font-bold text-pr-text-1">{selectedPolicyData.monthlyPremium} Gems/month</span>
                  </div>
                  <div className="text-sm text-pr-text-2">
                    Maximum coverage: ${selectedPolicyData.maxCoverage.toLocaleString()}
                  </div>
                  <div className="text-sm text-pr-text-2">
                    Deductible: {selectedPolicyData.deductible} gems per claim
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-pr-text-1">Terms & Conditions</h4>
                  <div className="text-sm text-pr-text-2 space-y-2">
                    <p>• Your subscription will auto-renew monthly</p>
                    <p>• Claims must be filed within 7 days of incident</p>
                    <p>• Coverage begins 24 hours after subscription activation</p>
                    <p>• You can cancel anytime without penalty</p>
                    <p>• Payouts are processed within 5-10 business days</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setStep('select')}
                  className="flex-1 px-6 py-3 border border-pr-surface-3 text-pr-text-1 rounded-lg hover:bg-pr-surface-2 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSubscribe}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
                >
                  {loading ? 'Subscribing...' : `Subscribe for ${selectedPolicyData.monthlyPremium} Gems`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ModalBase>
  );
}

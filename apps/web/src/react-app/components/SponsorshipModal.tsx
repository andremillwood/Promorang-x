import { useState } from 'react';
import { X, Clock, Zap, Star, Crown, Flame } from 'lucide-react';
import ModalBase from '@/react-app/components/ModalBase';

interface SponsorshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSponsor: (gemAmount: number, boostMultiplier: number, durationHours: number) => void;
  contentTitle: string;
  userGems: number;
}

export default function SponsorshipModal({ 
  isOpen, 
  onClose, 
  onSponsor, 
  contentTitle, 
  userGems 
}: SponsorshipModalProps) {
  const [selectedPackage, setSelectedPackage] = useState<any>(null);

  if (!isOpen) return null;

  const sponsorshipPackages = [
    { 
      id: 'quick',
      name: "Quick Boost", 
      gems: 25, 
      multiplier: 1.5, 
      duration: 1, 
      description: "1.5x visibility for 1 hour",
      icon: <Zap className="w-5 h-5" />,
      color: "from-blue-500 to-cyan-500"
    },
    { 
      id: 'popular',
      name: "Popular Boost", 
      gems: 50, 
      multiplier: 2.0, 
      duration: 6, 
      description: "2x visibility for 6 hours",
      icon: <Star className="w-5 h-5" />,
      color: "from-purple-500 to-pink-500"
    },
    { 
      id: 'daily',
      name: "Daily Featured", 
      gems: 100, 
      multiplier: 3.0, 
      duration: 24, 
      description: "3x visibility for 24 hours",
      icon: <Crown className="w-5 h-5" />,
      color: "from-orange-500 to-red-500"
    },
    { 
      id: 'premium',
      name: "Premium Spotlight", 
      gems: 200, 
      multiplier: 4.0, 
      duration: 72, 
      description: "4x visibility for 3 days",
      icon: <Flame className="w-5 h-5" />,
      color: "from-red-500 to-pink-500"
    },
    { 
      id: 'viral',
      name: "Viral Campaign", 
      gems: 500, 
      multiplier: 6.0, 
      duration: 168, 
      description: "6x visibility for 1 week",
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>,
      color: "from-yellow-500 to-orange-500"
    }
  ];

  const formatDuration = (hours: number) => {
    if (hours < 24) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    } else if (hours < 168) {
      const days = Math.floor(hours / 24);
      return `${days} day${days !== 1 ? 's' : ''}`;
    } else {
      const weeks = Math.floor(hours / 168);
      return `${weeks} week${weeks !== 1 ? 's' : ''}`;
    }
  };

  const handleSponsor = () => {
    if (!selectedPackage) return;
    onSponsor(selectedPackage.gems, selectedPackage.multiplier, selectedPackage.duration);
  };

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      showCloseButton={false}
    >
      <div className="flex max-h-[85vh] flex-col overflow-hidden rounded-2xl bg-pr-surface-card">
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-pr-text-1">Sponsor Content</h2>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:text-pr-text-2"
              aria-label="Close sponsorship modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6">
          <div>
            <h3 className="mb-2 font-semibold text-pr-text-1">{contentTitle}</h3>
            <p className="text-sm text-pr-text-2 leading-relaxed">
              Sponsoring content boosts its visibility in user feeds and gives it priority placement.
              Multiple sponsors can boost the same content, increasing its reach exponentially.
              Your brand will be credited as a sponsor to all users who see this content.
            </p>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-pr-text-1">Your Gem Balance</span>
              <span className="text-lg font-semibold text-purple-600">{userGems} gems</span>
            </div>
            <div className="h-3 w-full rounded-full bg-pr-surface-3">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                style={{ width: `${Math.min(100, (userGems / 500) * 100)}%` }}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-pr-text-1">Choose Your Sponsorship Package</h4>
            <div className="grid gap-4">
              {sponsorshipPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 ${
                    selectedPackage?.id === pkg.id
                      ? 'border-purple-500 bg-purple-50 shadow-lg scale-[1.02]'
                      : 'border-pr-surface-3 hover:border-pr-surface-3 hover:shadow-md'
                  } ${pkg.gems > userGems ? 'cursor-not-allowed opacity-50' : ''}`}
                  onClick={() => {
                    if (pkg.gems <= userGems) {
                      setSelectedPackage(pkg);
                    }
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className={`rounded-xl bg-gradient-to-r ${pkg.color} p-3 text-white`}>
                        {pkg.icon}
                      </div>
                      <div className="flex-1">
                        <div className="mb-1 flex items-center space-x-2">
                          <h5 className="font-semibold text-pr-text-1">{pkg.name}</h5>
                          {pkg.id === 'popular' && (
                            <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700">
                              Most Popular
                            </span>
                          )}
                          {pkg.id === 'viral' && (
                            <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">
                              Best Value
                            </span>
                          )}
                        </div>
                        <p className="mb-2 text-sm text-pr-text-2">{pkg.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-pr-text-2">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>Duration: {formatDuration(pkg.duration)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Zap className="h-3 w-3" />
                            <span>{pkg.multiplier}x visibility boost</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-600">{pkg.gems}</p>
                      <p className="text-xs text-pr-text-2">gems</p>
                      {pkg.gems > userGems && (
                        <p className="mt-1 text-xs text-red-500">Insufficient gems</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedPackage && (
            <div className="rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 p-4">
              <h5 className="mb-2 font-semibold text-purple-900">Sponsorship Preview</h5>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-purple-700">Package:</span>
                  <span className="ml-2 font-medium text-purple-900">{selectedPackage.name}</span>
                </div>
                <div>
                  <span className="text-purple-700">Duration:</span>
                  <span className="ml-2 font-medium text-purple-900">{formatDuration(selectedPackage.duration)}</span>
                </div>
                <div>
                  <span className="text-purple-700">Visibility Boost:</span>
                  <span className="ml-2 font-medium text-purple-900">{selectedPackage.multiplier}x</span>
                </div>
                <div>
                  <span className="text-purple-700">Cost:</span>
                  <span className="ml-2 font-medium text-purple-900">{selectedPackage.gems} gems</span>
                </div>
              </div>
              <div className="mt-3 border-t border-purple-200 pt-3 text-xs text-purple-700">
                Your brand name will be displayed as a sponsor on this content.
                Multiple sponsors can boost the same content for increased visibility.
              </div>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleSponsor}
              disabled={!selectedPackage || selectedPackage?.gems > userGems}
              className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 font-semibold text-white shadow-lg transition-all duration-200 hover:from-purple-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {selectedPackage ? `Sponsor for ${selectedPackage.gems} gems` : 'Select a sponsorship package'}
            </button>
            <button
              onClick={onClose}
              className="w-full rounded-xl border border-pr-surface-3 px-6 py-3 font-medium text-pr-text-1 transition-all duration-200 hover:border-gray-400"
            >
              Cancel
            </button>
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h5 className="mb-2 font-medium text-blue-900">💡 Sponsorship Benefits</h5>
            <ul className="space-y-1 text-sm text-blue-700">
              <li>• Your brand appears on sponsored content</li>
              <li>• Content gets priority placement in feeds</li>
              <li>• Multiple sponsors increase total visibility boost</li>
              <li>• Reach engaged users interested in the content topic</li>
              <li>• Analytics provided on sponsorship performance</li>
            </ul>
          </div>
        </div>
      </div>
    </ModalBase>
  );
}

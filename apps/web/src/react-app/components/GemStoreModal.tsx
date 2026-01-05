import { useState } from 'react';
import { X, Diamond, CreditCard, Shield, Star, Zap } from 'lucide-react';
import type { UserType } from '../../shared/types';
import ModalBase from '@/react-app/components/ModalBase';

interface GemStoreModalProps {
  user: UserType | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface GemPackage {
  id: string;
  gems: number;
  price: number;
  bonus: number;
  popular?: boolean;
  savings?: string;
}

const gemPackages: GemPackage[] = [
  {
    id: 'starter',
    gems: 10,
    price: 11.00,
    bonus: 0
  },
  {
    id: 'basic',
    gems: 25,
    price: 27.50,
    bonus: 0
  },
  {
    id: 'popular',
    gems: 47,
    price: 55.00,
    bonus: 3,
    popular: true,
    savings: 'Best Value'
  },
  {
    id: 'premium',
    gems: 88,
    price: 110.00,
    bonus: 12,
    savings: '12% Bonus'
  },
  {
    id: 'ultimate',
    gems: 210,
    price: 275.00,
    bonus: 40,
    savings: '16% Bonus'
  }
];

export default function GemStoreModal({ user, isOpen, onClose }: GemStoreModalProps) {
  const [selectedPackage, setSelectedPackage] = useState<string>('popular');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) {
    return null;
  }

  const handlePurchase = async () => {
    const packageData = gemPackages.find(p => p.id === selectedPackage);
    if (!packageData) return;

    setLoading(true);
    setError(null);

    try {
      // Create Stripe checkout session
      const response = await fetch('/api/payments/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          package_id: selectedPackage,
          gems: packageData.gems + packageData.bonus,
          price: packageData.price
        })
      });

      if (response.ok) {
        const { checkout_url } = await response.json();
        // Redirect to Stripe checkout
        window.location.href = checkout_url;
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create payment session');
      }
    } catch (error) {
      console.error('Payment failed:', error);
      setError('Payment processing failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedPackageData = gemPackages.find(p => p.id === selectedPackage);

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="4xl"
      showCloseButton={false}
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-pr-surface-3 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Diamond className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-pr-text-1">Gem Store</h2>
              <p className="text-sm text-pr-text-2">Purchase gems to participate in drops and forecasts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:text-pr-text-2"
            aria-label="Close gem store modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!user && (
          <div className="space-y-4 text-center">
            <h3 className="text-lg font-semibold text-pr-text-1">Loading user data...</h3>
            <p className="text-pr-text-2">Please wait while we load your account information.</p>
            <p className="text-xs text-pr-text-2">If this persists, try refreshing the page.</p>
            <button
              onClick={() => window.location.reload()}
              className="mx-auto w-fit rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
            >
              Reload Page
            </button>
          </div>
        )}

        {user && (
          <div className="space-y-6">
            {/* Current Balance */}
            <div className="rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Diamond className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="text-lg font-semibold text-purple-900">Current Balance</p>
                    <p className="text-sm text-purple-600">Your gem wallet</p>
                  </div>
                </div>
                <p className="text-3xl font-bold text-purple-900">{user.gems_balance}</p>
              </div>
            </div>

            {/* Gem Packages */}
            <div>
              <h3 className="mb-4 text-lg font-semibold text-pr-text-1">Choose Your Package</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {gemPackages.map((pkg) => (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg.id)}
                    className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 ${
                      selectedPackage === pkg.id
                        ? 'border-purple-500 bg-purple-50 shadow-lg scale-105'
                        : 'border-pr-surface-3 hover:border-pr-surface-3 hover:shadow-md'
                    }`}
                  >
                    {pkg.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                          <Star className="w-3 h-3" />
                          <span>Most Popular</span>
                        </span>
                      </div>
                    )}
                    
                    {pkg.savings && !pkg.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                          {pkg.savings}
                        </span>
                      </div>
                    )}

                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Diamond className="w-8 h-8 text-white" />
                      </div>
                      
                      <h4 className="text-lg font-semibold text-pr-text-1 capitalize mb-2">{pkg.id}</h4>
                      
                      <div className="mb-4">
                        <p className="text-3xl font-bold text-pr-text-1">${pkg.price}</p>
                        <div className="flex items-center justify-center space-x-2 mt-1">
                          <span className="text-lg font-semibold text-purple-600">{pkg.gems} gems</span>
                          {pkg.bonus > 0 && (
                            <>
                              <span className="text-gray-400">+</span>
                              <span className="text-lg font-semibold text-green-600">{pkg.bonus} bonus</span>
                            </>
                          )}
                        </div>
                        <p className="text-sm text-pr-text-2 mt-1">
                          Total: {pkg.gems + pkg.bonus} gems
                        </p>
                      </div>

                      <div className="space-y-2 text-sm text-pr-text-2">
                        <div className="flex items-center justify-center space-x-2">
                          <Zap className="w-4 h-4 text-orange-500" />
                          <span>Participate in drops</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                          <CreditCard className="w-4 h-4 text-blue-500" />
                          <span>Place predictions</span>
                        </div>
                        {pkg.bonus > 0 && (
                          <div className="flex items-center justify-center space-x-2">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span>{Math.round((pkg.bonus / pkg.gems) * 100)}% bonus gems</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Security */}
            <div className="rounded-lg bg-pr-surface-2 p-4">
              <div className="mb-3 flex items-center space-x-3">
                <Shield className="h-5 w-5 text-green-600" />
                <h4 className="font-medium text-pr-text-1">Secure Payment</h4>
              </div>
              <div className="grid grid-cols-1 gap-4 text-sm text-pr-text-2 md:grid-cols-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>256-bit SSL encryption</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>PCI DSS compliant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Powered by Stripe</span>
                </div>
              </div>
            </div>

            {/* Purchase Summary */}
            {selectedPackageData && (
              <div className="rounded-lg border border-pr-surface-3 bg-pr-surface-card p-4">
                <h4 className="mb-3 font-medium text-pr-text-1">Purchase Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-pr-text-2">Package:</span>
                    <span className="font-medium capitalize">{selectedPackageData.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-pr-text-2">Base Gems:</span>
                    <span className="font-medium">{selectedPackageData.gems}</span>
                  </div>
                  {selectedPackageData.bonus > 0 && (
                    <div className="flex justify-between">
                      <span className="text-pr-text-2">Bonus Gems:</span>
                      <span className="font-medium text-green-600">+{selectedPackageData.bonus}</span>
                    </div>
                  )}
                  <div className="border-t pt-2">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total Gems:</span>
                      <span className="text-purple-600">{selectedPackageData.gems + selectedPackageData.bonus}</span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total Price:</span>
                      <span>${selectedPackageData.price}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 rounded-lg border border-pr-surface-3 px-6 py-3 font-medium text-pr-text-1 transition-colors hover:bg-pr-surface-2 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePurchase}
                disabled={loading || !selectedPackageData}
                className="flex-[1.5] rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 font-medium text-white transition-all duration-200 hover:from-purple-600 hover:to-pink-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    <span>Purchase ${selectedPackageData?.price} - {selectedPackageData ? selectedPackageData.gems + selectedPackageData.bonus : 0} Gems</span>
                  </>
                )}
              </button>
            </div>

            {/* Terms */}
            <p className="mt-4 text-center text-xs text-pr-text-2">
              By purchasing gems, you agree to our Terms of Service. Gems are virtual currency and have no real-world value. 
              All sales are final and non-refundable.
            </p>
          </div>
        )}
      </div>
    </ModalBase>
  );
}

import { useState } from 'react';
import { X, Users, Gift, Check } from 'lucide-react';
import type { UserType } from '../../shared/types';
import ModalBase from '@/react-app/components/ModalBase';

interface ReferralModalProps {
  user: UserType | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReferralModal({ user, isOpen, onClose, onSuccess }: ReferralModalProps) {
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !user) return null;

  const handleSubmitCode = async () => {
    if (!referralCode.trim()) {
      setError('Please enter a referral code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/users/process-referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ referral_code: referralCode.toUpperCase() })
      });

      if (response.ok) {
        const result = await response.json();
        onSuccess();
        onClose();
        showSuccessNotification(result.referred_reward);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to process referral');
      }
    } catch (error) {
      console.error('Referral processing failed:', error);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = async () => {
    const referralLink = `https://promorang.com?ref=${user.referral_code}`;
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const showSuccessNotification = (points: number) => {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-xl shadow-lg z-50 animate-pulse';
    notification.innerHTML = `
      <div class="flex items-center space-x-3">
        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <div>
          <div class="font-bold">Referral Success!</div>
          <div class="text-sm">You earned ${points} points!</div>
        </div>
      </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 4000);
  };

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      showCloseButton={false}
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-pr-surface-3 pb-4">
          <div className="flex items-center space-x-3">
            <Users className="h-6 w-6 text-purple-600" />
            <div>
              <h2 className="text-xl font-bold text-pr-text-1">Referral Program</h2>
              <p className="text-sm text-pr-text-2">Invite friends and earn together</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:text-pr-text-2"
            aria-label="Close referral modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-6">
            <h3 className="mb-4 text-lg font-semibold text-purple-900">Your Referral Code</h3>
            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:space-x-3">
                <code className="flex-1 rounded-xl border bg-pr-surface-card px-4 py-3 text-center font-mono text-lg">
                  {user.referral_code}
                </code>
                <button
                  onClick={copyReferralLink}
                  className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-3 font-medium text-white transition-colors hover:from-purple-600 hover:to-pink-600"
                >
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
              <p className="text-sm text-purple-700">
                Share your referral code to earn bonus rewards when friends join Promorang.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-pr-surface-3 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Gift className="h-5 w-5 text-pink-600" />
                  <div>
                    <h4 className="font-semibold text-pr-text-1">Earn Together</h4>
                    <p className="text-sm text-pr-text-2">Both you and your friend earn rewards</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-purple-600">+500 points</span>
              </div>
            </div>

            <div className="rounded-2xl border border-pr-surface-3 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-blue-600" />
                  <div>
                    <h4 className="font-semibold text-pr-text-1">Track Progress</h4>
                    <p className="text-sm text-pr-text-2">See the status of your referrals</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-blue-600">Real-time</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-pr-surface-3 p-6">
            <h3 className="mb-4 text-lg font-semibold text-pr-text-1">Have a referral code?</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-pr-text-1">
                  Enter your friend's code
                </label>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    placeholder="PROMO-1234"
                    className="flex-1 rounded-xl border border-pr-surface-3 px-4 py-3 uppercase focus:border-transparent focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={handleSubmitCode}
                    disabled={loading}
                    className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 font-medium text-white transition-colors hover:from-purple-600 hover:to-pink-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : 'Apply Code'}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                  {error}
                </div>
              )}

              <p className="text-sm text-pr-text-2">
                When you enter a friend's referral code, you'll both earn bonus rewards once they complete their first challenge.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-purple-300 border-dashed bg-pr-surface-2 p-6">
            <h3 className="mb-4 text-lg font-semibold text-purple-900">Referral Tips</h3>
            <ul className="space-y-3 text-sm text-purple-700">
              <li>• Share your code with creators who love growing their audience</li>
              <li>• You'll earn bonus points when they complete their first drop</li>
              <li>• There's no limit to how many friends you can refer</li>
            </ul>
          </div>

          {user.referred_by && (
            <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
              <div className="flex items-center space-x-3">
                <Check className="h-6 w-6 text-green-600" />
                <div>
                  <h4 className="font-medium text-green-900">Referral Applied</h4>
                  <p className="text-sm text-green-700">You joined using code: {user.referred_by}</p>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50 p-6">
            <h4 className="mb-3 font-medium text-yellow-900">Earning Potential</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-700">500</div>
                <div className="text-sm text-yellow-600">Points per referral</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-700">∞</div>
                <div className="text-sm text-yellow-600">No limit on referrals</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModalBase>
  );
}

import { useState } from 'react';
import { X, Instagram, CheckCircle, Copy, Check, TrendingUp } from 'lucide-react';
import type { UserType } from '../../shared/types';
import { Routes as RoutePaths } from '../utils/url';
import ModalBase from '@/react-app/components/ModalBase';

interface InstagramVerificationModalProps {
  user: UserType | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function InstagramVerificationModal({ user, isOpen, onClose, onSuccess }: InstagramVerificationModalProps) {
  const [step, setStep] = useState(1);
  const [instagramUsername, setInstagramUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const profileSlug =
    user.username ||
    (user.email ? user.email.split('@')[0] : undefined) ||
    'me';

  const handleRegisterInstagram = async () => {
    if (!instagramUsername.trim()) {
      setError('Please enter your Instagram username');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/users/register-instagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ instagram_username: instagramUsername })
      });

      if (response.ok) {
        setStep(2);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Instagram registration failed:', error);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimPoints = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/users/claim-instagram-points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({})
      });

      if (response.ok) {
        await response.json();
        onSuccess();
        onClose();
        setStep(1);
        setInstagramUsername('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to claim points');
      }
    } catch (error) {
      console.error('Point claiming failed:', error);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTierPoints = (tier: string) => {
    switch (tier) {
      case 'super': return 1000;
      case 'premium': return 750;
      case 'free':
      default: return 500;
    }
  };

  const tierPoints = getTierPoints(user.user_tier);

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      showCloseButton={false}
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-pr-surface-3 pb-4">
          <div className="flex items-center space-x-2">
            <Instagram className="h-6 w-6 text-pink-600" />
            <h2 className="text-xl font-bold text-pr-text-1">Instagram Verification</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:text-pr-text-2"
            aria-label="Close instagram verification modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-600">
                <Instagram className="h-8 w-8 text-white" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-pr-text-1">Connect Your Instagram</h3>
              <p className="text-sm text-pr-text-2">
                Verify your Instagram account to earn {tierPoints} PromoPoints monthly
              </p>
            </div>

            <div className="rounded-lg border border-pink-200 bg-gradient-to-r from-pink-50 to-purple-50 p-4">
              <h4 className="mb-2 font-medium text-pink-900">Monthly Benefits</h4>
              <div className="space-y-2 text-sm text-pink-700">
                <div className="flex items-center justify-between">
                  <span>Your Tier:</span>
                  <span className="font-semibold capitalize">{user.user_tier}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Monthly Points:</span>
                  <span className="font-bold text-pink-600">{tierPoints} points</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Key Equivalent:</span>
                  <span className="font-medium">{Math.floor(tierPoints / 500)} keys</span>
                </div>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-pr-text-1">
                Instagram Username
              </label>
              <input
                type="text"
                value={instagramUsername}
                onChange={(e) => setInstagramUsername(e.target.value)}
                placeholder="@yourusername"
                className="w-full rounded-lg border border-pr-surface-3 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-pink-500"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="mt-6 rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 p-4">
              <h4 className="mb-2 flex items-center space-x-2 font-medium text-blue-900">
                <TrendingUp className="h-4 w-4" />
                <span>Want Even More Rewards?</span>
              </h4>
              <p className="mb-4 text-sm text-blue-700">
                Try our new <strong>Influence Rewards</strong> program! Earn dynamic monthly points based on your actual follower count (followers × 0.01).
              </p>
              <div className="flex items-center justify-between text-sm">
                <div className="space-y-1 text-blue-600">
                  <div>• 5,000 followers = 50 points/month</div>
                  <div>• 10,000 followers = 100 points/month</div>
                  <div>• 50,000 followers = 500 points/month</div>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    window.location.href = RoutePaths.profile(profileSlug, { openInfluenceRewards: 'true' });
                  }}
                  className="rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2 font-medium text-white transition-all duration-200 hover:from-blue-600 hover:to-cyan-600"
                >
                  Learn More
                </button>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 rounded-lg border border-pr-surface-3 px-4 py-2 font-medium text-pr-text-1 transition-colors hover:bg-pr-surface-2"
              >
                Cancel
              </button>
              <button
                onClick={handleRegisterInstagram}
                disabled={loading || !instagramUsername.trim()}
                className="flex-1 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-2 font-medium text-white transition-all duration-200 hover:from-pink-600 hover:to-purple-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Registering...' : 'Continue'}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-pr-text-1">Send Verification DM</h3>
              <p className="text-sm text-pr-text-2">
                Send a DM to @promorangco on Instagram with the word below
              </p>
            </div>

            <div className="rounded-lg bg-pr-surface-2 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-pr-text-1">Message to send:</h4>
                  <code className="mt-2 block rounded border bg-pr-surface-card px-3 py-2 font-mono text-lg">
                    promopoints
                  </code>
                </div>
                <button
                  onClick={() => copyToClipboard('promopoints')}
                  className="rounded bg-pr-surface-3 p-2 transition-colors hover:bg-pr-surface-3"
                  title="Copy message"
                >
                  {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h4 className="mb-2 font-medium text-blue-900">Next Steps:</h4>
              <ol className="space-y-1 text-sm text-blue-700">
                <li>1. Open Instagram and go to @promorangco</li>
                <li>
                  2. Send a DM with exactly: <strong>promopoints</strong>
                </li>
                <li>3. Wait for verification (usually within 24 hours)</li>
                <li>4. Return here to claim your monthly points</li>
              </ol>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleClaimPoints}
                disabled={loading}
                className="w-full rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 font-medium text-white transition-all duration-200 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50"
              >
                {loading ? 'Checking...' : 'Claim Points (if verified)'}
              </button>

              <button
                onClick={() => {
                  setStep(1);
                  setInstagramUsername('');
                  setError(null);
                }}
                className="w-full rounded-lg border border-pr-surface-3 px-4 py-2 font-medium text-pr-text-1 transition-colors hover:bg-pr-surface-2"
              >
                Try Different Username
              </button>
            </div>

            <div className="mt-6 rounded-lg border border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 p-4">
              <h4 className="mb-2 flex items-center space-x-2 font-medium text-purple-900">
                <TrendingUp className="h-4 w-4" />
                <span>Maximize Your Instagram Earning Potential!</span>
              </h4>
              <p className="mb-4 text-sm text-purple-700">
                While you wait for verification, explore our <strong>Influence Rewards</strong> program for dynamic monthly points based on your follower count.
              </p>
              <button
                onClick={() => {
                  onClose();
                  window.location.href = RoutePaths.profile(profileSlug, { openInfluenceRewards: 'true' });
                }}
                className="w-full rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 font-medium text-white transition-all duration-200 hover:from-purple-600 hover:to-pink-600"
              >
                Discover Influence Rewards
              </button>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </ModalBase>
  );
}

import { useState, useEffect } from 'react';
import { X, Instagram, CheckCircle, Copy, Check, TrendingUp, ExternalLink, Loader2 } from 'lucide-react';
import { UserType } from '@/shared/types';

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
  const [isPolling, setIsPolling] = useState(false);
  const [verifiedFollowers, setVerifiedFollowers] = useState<number | null>(null);
  const [pointsAwarded, setPointsAwarded] = useState<number | null>(null);

  // Poll for verification status when in Step 2
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isOpen && step === 2) {
      setIsPolling(true);
      interval = setInterval(async () => {
        try {
          const response = await fetch('/api/users/instagram-status', {
            credentials: 'include'
          });
          if (response.ok) {
            const data = await response.json();
            if (data.verified) {
              setVerifiedFollowers(data.follower_count || 0);
              setPointsAwarded(data.points_awarded || 500);
              setStep(3); // Move to success step
              if (interval) clearInterval(interval);
              setIsPolling(false);
            }
          }
        } catch (err) {
          console.warn('Instagram verification polling check:', err);
        }
      }, 4000);
    } else {
      setIsPolling(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, step]);

  if (!isOpen || !user) return null;

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
        const data = await response.json();
        setPointsAwarded(data.points_awarded || 500);
        setStep(3);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Followers not synced yet. Please send the DM first!');
      }
    } catch (error) {
      console.error('Point claiming failed:', error);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
  };

  const getTierPoints = (tier: string) => {
    switch (tier) {
      case 'super': return 1000;
      case 'premium': return 750;
      case 'free':
      default: return 500;
    }
  };

  const tierPoints = getTierPoints(user.user_tier || 'free');

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-gradient-to-tr from-pink-500 to-purple-600 rounded-xl">
              <Instagram className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">Instagram Verification</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 1 && (
          <div className="space-y-5">
            <div className="text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-500/20 to-purple-600/20 border border-pink-500/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Instagram className="w-7 h-7 text-pink-400" />
              </div>
              <h3 className="text-lg font-semibold mb-1">Connect Your Instagram</h3>
              <p className="text-slate-400 text-sm">
                Verify your account to automatically earn influence points and unlock campaigns.
              </p>
            </div>

            <div className="bg-gradient-to-r from-pink-950/40 to-purple-950/40 border border-pink-500/20 rounded-xl p-4">
              <h4 className="font-medium text-pink-300 text-sm mb-2">Monthly Rewards Benefit</h4>
              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Account Tier:</span>
                  <span className="font-semibold capitalize text-white">{user.user_tier || 'Creator'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Base Reward:</span>
                  <span className="font-bold text-pink-400">{tierPoints} Points / mo</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Follower Multiplier:</span>
                  <span className="text-emerald-400 font-medium">+10 pts per verified follower</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Instagram Username
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-sm">@</span>
                <input
                  type="text"
                  value={instagramUsername}
                  onChange={(e) => setInstagramUsername(e.target.value.replace(/^@/, ''))}
                  placeholder="yourusername"
                  className="w-full pl-8 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-950/40 border border-red-500/40 rounded-xl p-3">
                <p className="text-xs text-red-300">{error}</p>
              </div>
            )}

            <div className="flex space-x-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-slate-700 rounded-xl text-slate-300 font-medium hover:bg-slate-800 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleRegisterInstagram}
                disabled={loading || !instagramUsername.trim()}
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-pink-500/25 text-sm"
              >
                {loading ? 'Registering...' : 'Continue'}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="text-center">
              <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Instagram className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold mb-1">Send Verification DM</h3>
              <p className="text-slate-400 text-sm">
                Send a DM to <span className="text-pink-400 font-semibold">@promorangco</span> with the keyword below:
              </p>
            </div>

            {/* Keyword block */}
            <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block mb-1">Trigger keyword:</span>
                <code className="text-lg font-mono font-bold text-pink-400 tracking-wider">
                  promopoints
                </code>
              </div>
              <button
                onClick={() => copyToClipboard('promopoints')}
                className="p-2.5 bg-slate-700 hover:bg-slate-600 active:scale-95 rounded-xl transition-all flex items-center gap-1.5 text-xs text-slate-200"
                title="Copy message"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            {/* Direct Link to IG DM */}
            <a
              href="https://ig.me/m/promorangco"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-gradient-to-r from-pink-500/20 to-purple-600/20 hover:from-pink-500/30 hover:to-purple-600/30 border border-pink-500/30 rounded-xl text-pink-300 font-medium text-sm transition-all"
            >
              <span>Open Instagram DM with @promorangco</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            {/* Live Waiting Poller Status */}
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-3.5 flex items-center gap-3">
              {isPolling ? (
                <Loader2 className="w-5 h-5 text-pink-400 animate-spin flex-shrink-0" />
              ) : (
                <CheckCircle className="w-5 h-5 text-slate-500 flex-shrink-0" />
              )}
              <div className="text-xs text-slate-300">
                <span className="font-semibold text-white block">Listening for DM webhook...</span>
                Once you send the DM, this window will automatically detect the follower sync.
              </div>
            </div>

            {error && (
              <div className="bg-red-950/40 border border-red-500/40 rounded-xl p-3">
                <p className="text-xs text-red-300">{error}</p>
              </div>
            )}

            <div className="space-y-2.5 pt-1">
              <button
                onClick={handleClaimPoints}
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-emerald-500/20 text-sm"
              >
                {loading ? 'Verifying...' : 'I Sent the DM — Check Status'}
              </button>

              <button
                onClick={() => {
                  setStep(1);
                  setInstagramUsername('');
                  setError(null);
                }}
                className="w-full px-4 py-2 border border-slate-700 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors text-xs"
              >
                Change Username
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5 text-center py-2">
            <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Instagram Connected!</h3>
              <p className="text-slate-400 text-sm">
                Your profile is now verified and synced with Promorang.
              </p>
            </div>

            <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-4 text-sm text-slate-300 space-y-2">
              {verifiedFollowers !== null && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Verified Followers:</span>
                  <span className="font-semibold text-white">{verifiedFollowers.toLocaleString()}</span>
                </div>
              )}
              {pointsAwarded !== null && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Points Awarded:</span>
                  <span className="font-bold text-emerald-400">+{pointsAwarded.toLocaleString()} pts</span>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                onSuccess();
                onClose();
              }}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-4 py-2.5 rounded-xl font-medium transition-all text-sm shadow-lg shadow-emerald-500/20"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

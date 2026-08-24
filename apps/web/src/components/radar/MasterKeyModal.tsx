import React, { useState } from 'react';
import { 
  X, 
  Flame, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Crown, 
  Star, 
  Zap, 
  ArrowRight,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { UserType } from '@/shared/types';
import { useMasterKey } from '@/hooks/useMasterKey';
import { toast } from 'sonner';

interface MasterKeyModalProps {
  user: UserType | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function MasterKeyModal({ user, isOpen, onClose, onSuccess }: MasterKeyModalProps) {
  const userTier = user?.user_tier || 'starter';
  const { pulseState, refreshPulse, loading } = useMasterKey(userTier);
  const [activating, setActivating] = useState(false);

  if (!isOpen || !user) return null;

  const canActivate = pulseState.proofDropsCompleted >= pulseState.proofDropsRequired;

  const handleActivate = async () => {
    if (!canActivate || activating) return;
    setActivating(true);

    try {
      // Simulate/trigger activation
      setTimeout(() => {
        setActivating(false);
        toast.success("Master Key Activated! 24-Hour Multiplier Pulse Live.");
        refreshPulse();
        if (onSuccess) onSuccess();
      }, 1200);
    } catch (err) {
      console.error(err);
      setActivating(false);
    }
  };

  const getTierIcon = () => {
    const tier = userTier.toLowerCase();
    if (tier === 'power_user' || tier === 'super') return Crown;
    if (tier === 'professional' || tier === 'premium') return Star;
    return Zap;
  };

  const TierIcon = getTierIcon();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 rounded-3xl border border-orange-500/30 p-6 md:p-8 text-white shadow-2xl overflow-hidden">
        
        {/* Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white bg-gray-800/60 p-2 rounded-full transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-6">
          {/* Top Header */}
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/40 rounded-2xl text-orange-400">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">
                  Daily Network Pulse
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-orange-500/20 border border-orange-500/30 text-orange-300">
                  {pulseState.tierName} Tier
                </span>
              </div>
              <h2 className="text-xl font-bold text-white leading-tight">
                Master Key Status
              </h2>
            </div>
          </div>

          {/* Tier Overview Card */}
          <div className="bg-gray-800/50 border border-gray-700/70 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-400">
                <TierIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">{pulseState.tierName} Multiplier Boost</p>
                <p className="text-[11px] text-gray-400">
                  Requires {pulseState.proofDropsRequired} daily verified action{pulseState.proofDropsRequired > 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-black text-amber-400 font-mono">
                {pulseState.multiplier}x Multiplier
              </span>
              <p className="text-[10px] text-emerald-400 font-semibold">Active Earnings</p>
            </div>
          </div>

          {/* Daily 24h Progress & Heartbeat */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-300">Today's Daily Proof Progress</span>
              <span className="font-mono font-bold text-orange-400">
                {pulseState.proofDropsCompleted} / {pulseState.proofDropsRequired} Actions
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-orange-500 to-amber-400 h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${Math.min(100, (pulseState.proofDropsCompleted / pulseState.proofDropsRequired) * 100)}%` 
                }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-orange-400" />
                {pulseState.hoursRemaining}h remaining on current pulse
              </span>
              <span className="text-amber-400 font-bold">
                {pulseState.streakDays} Day Active Streak 🔥
              </span>
            </div>
          </div>

          {/* Master Key Active Perks List */}
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              Ecosystem Benefits
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-800/40 border border-gray-800 p-2.5 rounded-xl flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-gray-300 font-medium">Boosted Gem Splits</span>
              </div>
              <div className="bg-gray-800/40 border border-gray-800 p-2.5 rounded-xl flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="text-gray-300 font-medium">Daily Vault Entry</span>
              </div>
              <div className="bg-gray-800/40 border border-gray-800 p-2.5 rounded-xl flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-400 shrink-0" />
                <span className="text-gray-300 font-medium">Midweek Hub Perks</span>
              </div>
              <div className="bg-gray-800/40 border border-gray-800 p-2.5 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="text-gray-300 font-medium">Zero-Drop Decay</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors border border-gray-700"
            >
              Dismiss
            </button>

            <button
              onClick={handleActivate}
              disabled={!canActivate || activating}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                canActivate && !activating
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-gray-950 font-black shadow-lg shadow-orange-500/20'
                  : 'bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed'
              }`}
            >
              {activating ? (
                <span>Syncing Pulse...</span>
              ) : pulseState.isActive ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Pulse Active</span>
                </>
              ) : canActivate ? (
                <>
                  <Flame className="w-4 h-4" />
                  <span>Activate 24h Master Key</span>
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4" />
                  <span>Complete Proof Drop</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

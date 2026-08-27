import React, { useState, useRef } from 'react';
import { ShieldCheck, Zap, Activity, Cpu, Flame, Lock, ChevronRight } from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';
import { hapticAudio } from '@/lib/hapticAudio';
import nodeAmmCore from '@/assets/nodes/node-amm-core.jpg';
import nodeMerchantVault from '@/assets/nodes/node-merchant-vault.jpg';
import nodeCreatorPrism from '@/assets/nodes/node-creator-prism.jpg';

interface TangibleNodeCardProps {
  serialNumber?: string;
  nodeName: string;
  nodeCategory: string;
  nodeType?: 'amm_liquidity' | 'merchant_coupon_float' | 'bounty_settlement';
  userTier?: 'free' | 'premium' | 'super';
  stakedAmount: number;
  multiplier: number;
  totalTickets: number;
  onIgniteStake?: () => void;
}

export const TangibleNodeCard: React.FC<TangibleNodeCardProps> = ({
  serialNumber = 'PRM-0842-X',
  nodeName = 'Commerce & Coupon Float Engine',
  nodeCategory = 'Merchant Settlement Float',
  nodeType = 'merchant_coupon_float',
  userTier = 'premium',
  stakedAmount = 1000,
  multiplier = 3,
  totalTickets = 345,
  onIgniteStake,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState<number>(0);
  const [rotateY, setRotateY] = useState<number>(0);
  const [isIgnited, setIsIgnited] = useState<boolean>(false);

  // 3D Tilt Effect on Mouse Move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setRotateX(-y / 15);
    setRotateY(x / 15);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  const handleIgnition = () => {
    triggerHaptic('heavy');
    hapticAudio.playSuccess();
    setIsIgnited(true);
    if (onIgniteStake) onIgniteStake();
    setTimeout(() => setIsIgnited(false), 2500);
  };

  // Tier Theme Config
  const tierColors = {
    free: {
      border: 'border-zinc-700',
      badge: 'bg-zinc-800 text-zinc-300 border-zinc-600',
      glow: 'from-zinc-700/20 via-zinc-900 to-zinc-950',
      accent: 'text-zinc-400',
      metal: 'from-zinc-800 via-zinc-900 to-black',
    },
    premium: {
      border: 'border-amber-500/50',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      glow: 'from-amber-500/25 via-amber-950/40 to-zinc-950',
      accent: 'text-amber-400',
      metal: 'from-amber-900/30 via-zinc-900 to-zinc-950',
    },
    super: {
      border: 'border-purple-500/60',
      badge: 'bg-purple-500/20 text-purple-300 border-purple-500/50',
      glow: 'from-purple-600/30 via-purple-950/50 to-zinc-950',
      accent: 'text-purple-400',
      metal: 'from-purple-950/40 via-zinc-900 to-zinc-950',
    },
  }[userTier];

  const nodeArtwork =
    nodeType === 'amm_liquidity'
      ? nodeAmmCore
      : nodeType === 'bounty_settlement'
      ? nodeCreatorPrism
      : nodeMerchantVault;

  return (
    <div
      style={{ perspective: 1000 }}
      className="w-full max-w-lg mx-auto select-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={cardRef}
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transition: 'transform 0.15s ease-out',
        }}
        className={`relative rounded-3xl p-6 md:p-8 bg-gradient-to-br ${tierColors.metal} border ${tierColors.border} shadow-2xl overflow-hidden transition-all duration-300`}
      >
        {/* Holographic Sheen Layer */}
        <div 
          className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none opacity-60"
          style={{
            transform: `translate(${rotateY * 4}px, ${rotateX * 4}px)`,
          }}
        />

        {/* Engine Header */}
        <div className="flex items-center justify-between relative z-10 border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-zinc-900/90 border border-zinc-700/60 shadow-inner">
              <Cpu className={`w-6 h-6 ${tierColors.accent} animate-pulse`} />
            </div>
            <div>
              <div className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
                SERIAL: {serialNumber}
              </div>
              <h3 className="text-lg font-black text-white tracking-wide">{nodeName}</h3>
            </div>
          </div>

          <div className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider border ${tierColors.badge}`}>
            {userTier} Core
          </div>
        </div>

        {/* 3D Visual Engine Artwork */}
        <div className="relative my-4 overflow-hidden rounded-2xl border border-white/10 shadow-2xl group">
          <img
            src={nodeArtwork}
            alt={nodeName}
            className="w-full h-48 sm:h-56 object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80" />
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <span className="text-[10px] font-mono bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 text-white font-bold">
              ⚡ ACTIVE POWER CORE
            </span>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-emerald-500/40 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              SYNCHRONIZED
            </span>
          </div>
        </div>

        {/* Live Machine Specs Grid */}
        <div className="grid grid-cols-2 gap-4 my-4 relative z-10">
          <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-3.5 shadow-inner">
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold block">
              Node Fuel (Principal)
            </span>
            <div className="text-xl font-black text-white mt-1 flex items-baseline gap-1.5">
              ${stakedAmount.toLocaleString()}
              <span className="text-[10px] text-emerald-400 font-bold">100% Intact</span>
            </div>
          </div>

          <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-3.5 shadow-inner">
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold block">
              Draw Power Output
            </span>
            <div className={`text-xl font-black ${tierColors.accent} mt-1 flex items-baseline gap-1.5`}>
              {totalTickets.toLocaleString()}
              <span className="text-[10px] text-zinc-400 font-bold">({multiplier}x Boost)</span>
            </div>
          </div>

          <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-3.5 shadow-inner">
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold block">
              Operational Status
            </span>
            <div className="text-xs font-bold text-emerald-400 mt-1.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              ONLINE / SETTLING
            </div>
          </div>

          <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-3.5 shadow-inner">
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold block">
              Base Commerce Yield
            </span>
            <div className="text-xs font-bold text-white mt-1.5 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              ~5.0% APY Guaranteed
            </div>
          </div>
        </div>

        {/* Tactile Ignition Button */}
        <div className="relative z-10 pt-2">
          <button
            onClick={handleIgnition}
            disabled={isIgnited}
            className={`w-full py-3.5 rounded-2xl font-black text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-xl transition-all duration-300 ${
              isIgnited
                ? 'bg-emerald-500 text-black shadow-emerald-500/50 scale-[0.98]'
                : 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-amber-500/20 active:scale-[0.97]'
            }`}
          >
            <Flame className={`w-4 h-4 ${isIgnited ? 'animate-spin' : ''}`} />
            <span>{isIgnited ? '⚡ ENGINE RUNNING AT FULL THROTTLE' : '⚡ POWER UP / INJECT FUEL'}</span>
          </button>
        </div>

        {/* Footer Subtext */}
        <div className="mt-4 pt-3 border-t border-zinc-800/60 text-center relative z-10">
          <p className="text-[10px] text-zinc-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Your principal is 100% protected and withdrawable at any time.</span>
          </p>
        </div>
      </div>
    </div>
  );
};

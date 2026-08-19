import React, { useState } from 'react';
import { X, Sparkles, Trophy, ArrowRight, RefreshCw } from 'lucide-react';

interface SpinWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardClaimed?: (reward: string, amount: number) => void;
}

const REWARDS = [
  { label: '50 Gems', amount: 50, type: 'Gems', color: '#F59E0B' },
  { label: '2x Boost', amount: 2, type: 'Multiplier', color: '#EC4899' },
  { label: '100 Gems', amount: 100, type: 'Gems', color: '#10B981' },
  { label: '1 Free Piece', amount: 1, type: 'Piece', color: '#8B5CF6' },
  { label: '25 Gems', amount: 25, type: 'Gems', color: '#3B82F6' },
  { label: '3x Dividend', amount: 3, type: 'Boost', color: '#F43F5E' },
];

export const SpinWheelModal: React.FC<SpinWheelModalProps> = ({
  isOpen,
  onClose,
  onRewardClaimed,
}) => {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonReward, setWonReward] = useState<typeof REWARDS[0] | null>(null);

  if (!isOpen) return null;

  const handleSpin = () => {
    if (spinning) return;
    setSpinning(true);
    setWonReward(null);

    // Pick random prize index
    const prizeIndex = Math.floor(Math.random() * REWARDS.length);
    const degreesPerSegment = 360 / REWARDS.length;
    
    // Add 5 to 8 full rotations + target angle offset
    const extraRounds = (5 + Math.floor(Math.random() * 4)) * 360;
    const targetDegree = extraRounds + (360 - (prizeIndex * degreesPerSegment + degreesPerSegment / 2));

    setRotation(targetDegree);

    setTimeout(() => {
      setSpinning(false);
      const prize = REWARDS[prizeIndex];
      setWonReward(prize);
      if (onRewardClaimed) {
        onRewardClaimed(prize.label, prize.amount);
      }
    }, 4500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-zinc-900 border border-amber-500/30 rounded-3xl p-6 shadow-2xl overflow-hidden text-center">
        {/* Ambient Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs font-semibold text-amber-400 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>DAILY GAMIFIED UNLOCK</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-1">Spin to Boost Rewards</h2>
        <p className="text-xs text-zinc-400 mb-6">
          Unlock instantaneous Piece bonuses, multipliers, or Gems!
        </p>

        {/* Wheel Container */}
        <div className="relative w-64 h-64 mx-auto mb-6 flex items-center justify-center">
          {/* Wheel Pointer Indicator */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-amber-400 filter drop-shadow-md" />

          {/* SVG Canvas Wheel */}
          <div
            className="w-full h-full rounded-full border-4 border-amber-500/40 shadow-inner overflow-hidden"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: spinning ? 'transform 4.5s cubic-bezier(0.15, 0.9, 0.25, 1)' : 'none',
            }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              {REWARDS.map((reward, i) => {
                const angle = 360 / REWARDS.length;
                const startAngle = i * angle;
                const endAngle = (i + 1) * angle;

                const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
                const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
                const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
                const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);

                const d = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

                return (
                  <g key={i}>
                    <path d={d} fill={reward.color} opacity={i % 2 === 0 ? 0.95 : 0.8} />
                    <text
                      x="72"
                      y="50"
                      fill="#FFFFFF"
                      fontSize="5"
                      fontWeight="bold"
                      textAnchor="middle"
                      alignmentBaseline="middle"
                      transform={`rotate(${startAngle + angle / 2}, 50, 50)`}
                    >
                      {reward.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Center Hub */}
          <div className="absolute inset-0 m-auto w-14 h-14 bg-zinc-900 border-2 border-amber-400 rounded-full flex items-center justify-center z-10 shadow-lg">
            <Trophy className="w-6 h-6 text-amber-400" />
          </div>
        </div>

        {/* Reward Result State */}
        {wonReward ? (
          <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/30 rounded-2xl p-4 mb-4 animate-bounce-short">
            <p className="text-xs uppercase tracking-wider text-amber-400 font-semibold mb-1">
              CONGRATULATIONS!
            </p>
            <p className="text-xl font-bold text-white">
              You unlocked <span className="text-amber-400">{wonReward.label}</span>!
            </p>
          </div>
        ) : null}

        {/* Action Button */}
        <button
          onClick={wonReward ? onClose : handleSpin}
          disabled={spinning}
          className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-black shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
        >
          {spinning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Spinning Wheel...</span>
            </>
          ) : wonReward ? (
            <>
              <span>Claim Prize</span>
              <ArrowRight className="w-4 h-4" />
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>SPIN FOR FREE REWARDS</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

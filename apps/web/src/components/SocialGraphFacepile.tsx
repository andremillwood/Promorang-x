import React, { useState } from 'react';
import { Flame, Sparkles, Heart, Zap, Share2 } from 'lucide-react';

interface SocialGraphFacepileProps {
  claimedCount?: number;
  friends?: Array<{ id: string; name: string; avatar: string }>;
}

export const SocialGraphFacepile: React.FC<SocialGraphFacepileProps> = ({
  claimedCount = 42,
  friends = [
    { id: '1', name: 'Alex', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80' },
    { id: '2', name: 'Sarah', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80' },
  ],
}) => {
  const [reacted, setReacted] = useState<string | null>(null);

  const reactions = [
    { id: 'hot', icon: '🔥', label: 'Hot' },
    { id: 'boost', icon: '⚡', label: 'Boost' },
    { id: 'gem', icon: '💎', label: 'Gem' },
    { id: 'viral', icon: '🚀', label: 'Viral' },
  ];

  return (
    <div className="flex flex-col gap-2.5 pt-2 border-t border-zinc-800/60">
      {/* Facepile social proof */}
      <div className="flex items-center gap-2">
        <div className="flex -space-x-2 overflow-hidden">
          {friends.map((f) => (
            <img
              key={f.id}
              src={f.avatar}
              alt={f.name}
              className="inline-block h-6 w-6 rounded-full ring-2 ring-zinc-900 object-cover"
            />
          ))}
        </div>
        <p className="text-[11px] text-zinc-400">
          <span className="font-bold text-zinc-200">{friends[0]?.name || 'Alex'}</span> & {claimedCount} scene members claimed this
        </p>
      </div>

      {/* 1-Tap Reaction Pill Bar */}
      <div className="flex items-center gap-1.5 pt-1">
        {reactions.map((r) => {
          const isActive = reacted === r.id;
          return (
            <button
              key={r.id}
              onClick={() => setReacted(isActive ? null : r.id)}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                isActive
                  ? 'bg-orange-500/20 border border-orange-500 text-orange-400 scale-105'
                  : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
              }`}
            >
              <span>{r.icon}</span>
              <span>{r.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

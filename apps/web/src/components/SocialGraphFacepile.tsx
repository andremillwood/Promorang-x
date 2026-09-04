import React, { useState } from 'react';

interface SocialGraphFacepileProps {
  claimedCount?: number;
  friends?: Array<{ id: string; name: string; avatar: string }>;
}

export const SocialGraphFacepile: React.FC<SocialGraphFacepileProps> = ({
  claimedCount,
  friends = [],
}) => {
  const [reacted, setReacted] = useState<string | null>(null);
  const namedFriend = friends[0];
  const others = Math.max((claimedCount || 0) - (namedFriend ? 1 : 0), 0);

  if (!namedFriend && !claimedCount) return null;

  const reactions = [
    { id: 'hot', label: 'Hot' },
    { id: 'boost', label: 'Boost' },
    { id: 'keep', label: 'Keep' },
  ];

  return (
    <div className="flex flex-col gap-2.5 pt-2 border-t border-zinc-800/60">
      <div className="flex items-center gap-2">
        {friends.length > 0 && (
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
        )}
        <p className="text-[11px] text-zinc-400">
          {namedFriend ? (
            <>
              <span className="font-bold text-zinc-200">{namedFriend.name}</span>
              {others > 0 ? ` and ${others} others are in` : " is in"}
            </>
          ) : (
            <>{claimedCount} people have claimed this</>
          )}
        </p>
      </div>

      <div className="flex items-center gap-1.5 pt-1">
        {reactions.map((r) => {
          const isActive = reacted === r.id;
          return (
            <button
              key={r.id}
              onClick={() => setReacted(isActive ? null : r.id)}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-orange-500/20 border border-orange-500 text-orange-400 scale-105'
                  : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
              }`}
            >
              {r.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Flame, Sparkles } from 'lucide-react';

const MOCK_NOTIFICATIONS = [
  { user: '@alex_m', action: 'slashed Target Coupon to $5', time: '2s ago' },
  { user: '@sarah_k', action: 'claimed 3x Dividend Boost', time: '5s ago' },
  { user: '@devon_r', action: 'unlocked 100 Free Gems', time: '12s ago' },
  { user: '@maria_g', action: 'completed 7-Day Streak', time: '18s ago' },
];

export const LiveSocialProofToast: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % MOCK_NOTIFICATIONS.length);
        setVisible(true);
      }, 400);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const current = MOCK_NOTIFICATIONS[currentIndex];

  return (
    <div
      className={`fixed bottom-6 left-6 z-40 transition-all duration-500 transform ${
        visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
      }`}
    >
      <div className="flex items-center gap-3 px-4 py-2.5 bg-zinc-900/90 border border-orange-500/30 rounded-2xl shadow-xl backdrop-blur-md">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-black font-bold text-xs shadow-md">
          <Flame className="w-4 h-4 text-black fill-black" />
        </div>

        <div className="flex flex-col">
          <p className="text-xs font-medium text-zinc-200">
            <span className="font-bold text-orange-400">{current.user}</span> {current.action}
          </p>
          <span className="text-[10px] text-zinc-500 flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-amber-400" /> {current.time}
          </span>
        </div>
      </div>
    </div>
  );
};

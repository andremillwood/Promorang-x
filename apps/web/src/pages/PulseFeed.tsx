import React, { useState } from 'react';
import { Heart, Share2, Zap, Flame, Trophy, Sparkles, MessageCircle, ArrowUp } from 'lucide-react';

const MOCK_PULSE_ITEMS = [
  {
    id: '1',
    title: 'Nike Air Max Excee - 40% OFF Coupon',
    brand: 'Nike Official',
    discount: '40% OFF',
    yieldBoost: '3.5x Dividend',
    claimedPercent: 88,
    timeLeft: '04:12',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
    piecesRemaining: 14,
  },
  {
    id: '2',
    title: 'Starbucks Seasonal Brew - Free Upgrade Piece',
    brand: 'Starbucks Reserve',
    discount: 'FREE PIECE',
    yieldBoost: '2.0x Dividend',
    claimedPercent: 95,
    timeLeft: '01:45',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
    piecesRemaining: 5,
  },
  {
    id: '3',
    title: 'Apple AirPods Pro - Flash Promoshare Pool',
    brand: 'Apple Store',
    discount: '$50 REBATE',
    yieldBoost: '5.0x Dividend',
    claimedPercent: 72,
    timeLeft: '12:30',
    image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80',
    piecesRemaining: 28,
  },
];

export const PulseFeed: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [liked, setLiked] = useState<Record<string, boolean>>({});

  const currentItem = MOCK_PULSE_ITEMS[activeIndex];

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % MOCK_PULSE_ITEMS.length);
  };

  const handleLike = (id: string) => {
    setLiked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="relative w-full h-[calc(100vh-80px)] bg-black overflow-hidden flex items-center justify-center">
      {/* Dynamic Background Image Blur */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-30 scale-110 transition-all duration-700"
        style={{ backgroundImage: `url(${currentItem.image})` }}
      />

      {/* Main Full-Screen TikTok Card */}
      <div className="relative w-full max-w-sm h-full max-h-[750px] bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between">
        {/* Card Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={currentItem.image}
            alt={currentItem.title}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        </div>

        {/* Top Floating Badge Bar */}
        <div className="relative z-10 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 px-3 py-1 bg-black/60 border border-orange-500/40 rounded-full backdrop-blur-md">
            <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400 animate-pulse" />
            <span className="text-xs font-bold text-orange-400">{currentItem.yieldBoost}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500/20 border border-red-500/40 rounded-full backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span className="text-xs font-mono font-bold text-red-400">
              EXPIRING IN {currentItem.timeLeft}
            </span>
          </div>
        </div>

        {/* Right Interaction Sidebar */}
        <div className="absolute right-4 bottom-28 z-20 flex flex-col items-center gap-4">
          <button
            onClick={() => handleLike(currentItem.id)}
            className={`p-3 rounded-full border backdrop-blur-md transition-all ${
              liked[currentItem.id]
                ? 'bg-red-500/20 border-red-500 text-red-500 scale-110'
                : 'bg-black/60 border-zinc-700 text-white'
            }`}
          >
            <Heart
              className={`w-6 h-6 ${liked[currentItem.id] ? 'fill-red-500' : ''}`}
            />
          </button>

          <button className="p-3 rounded-full bg-black/60 border border-zinc-700 text-white backdrop-blur-md">
            <Share2 className="w-6 h-6 text-orange-400" />
          </button>

          <button className="p-3 rounded-full bg-black/60 border border-zinc-700 text-white backdrop-blur-md">
            <MessageCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Bottom Content & Action Trigger */}
        <div className="relative z-10 p-6 flex flex-col justify-end">
          {/* Brand Tag */}
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 bg-amber-500 text-black text-[10px] font-black uppercase rounded-md tracking-wider">
              {currentItem.discount}
            </span>
            <span className="text-xs text-zinc-300 font-semibold">{currentItem.brand}</span>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-white mb-3 line-clamp-2 leading-tight">
            {currentItem.title}
          </h2>

          {/* Claim Bar Progress */}
          <div className="mb-4 bg-black/60 border border-zinc-800 rounded-xl p-2.5 backdrop-blur-md">
            <div className="flex justify-between text-xs mb-1 font-medium">
              <span className="text-zinc-400">Claimed Volume</span>
              <span className="text-orange-400 font-bold">{currentItem.claimedPercent}%</span>
            </div>
            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full"
                style={{ width: `${currentItem.claimedPercent}%` }}
              />
            </div>
            <p className="text-[10px] text-zinc-400 mt-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" /> Only {currentItem.piecesRemaining}{' '}
              Pieces remaining in pool
            </p>
          </div>

          {/* Big CTA Button */}
          <button className="w-full py-3.5 px-6 rounded-2xl font-black text-sm bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-black shadow-xl shadow-orange-500/30 flex items-center justify-center gap-2 transition-all active:scale-95 mb-3">
            <Zap className="w-4 h-4" />
            <span>CLAIM PIECE NOW</span>
          </button>

          {/* Swipe Next Gesture Hint */}
          <button
            onClick={handleNext}
            className="w-full py-2 text-center text-xs text-zinc-400 hover:text-white flex items-center justify-center gap-1 transition-colors"
          >
            <span>Swipe for next deal</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

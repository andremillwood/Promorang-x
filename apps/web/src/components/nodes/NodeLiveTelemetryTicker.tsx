import React, { useState, useEffect } from 'react';
import { Activity, ShoppingCart, Award, ArrowRight, ShieldCheck } from 'lucide-react';

interface TelemetryEvent {
  id: string;
  timestamp: string;
  type: 'coupon_settlement' | 'bounty_cleared' | 'amm_swap';
  description: string;
  amountUsd: number;
  feeCapturedUsd: number;
  ticketsEarned: number;
}

const INITIAL_EVENTS: TelemetryEvent[] = [
  {
    id: 'evt-1',
    timestamp: 'Just now',
    type: 'coupon_settlement',
    description: 'Instant Checkout Float: Nike Air Max Purchase (Miami)',
    amountUsd: 140.00,
    feeCapturedUsd: 2.10,
    ticketsEarned: 3,
  },
  {
    id: 'evt-2',
    timestamp: '28s ago',
    type: 'bounty_cleared',
    description: 'Creator Proof-of-Post Verified (@jordan_fit on TikTok)',
    amountUsd: 75.00,
    feeCapturedUsd: 1.50,
    ticketsEarned: 2,
  },
  {
    id: 'evt-3',
    timestamp: '1m ago',
    type: 'amm_swap',
    description: 'Pieces AMM Liquidity Swap (100 Culture Pieces)',
    amountUsd: 250.00,
    feeCapturedUsd: 2.50,
    ticketsEarned: 5,
  },
  {
    id: 'evt-4',
    timestamp: '2m ago',
    type: 'coupon_settlement',
    description: 'Instant Checkout Float: Sephora Summer Drop (NYC)',
    amountUsd: 85.00,
    feeCapturedUsd: 1.25,
    ticketsEarned: 2,
  },
];

export const NodeLiveTelemetryTicker: React.FC = () => {
  const [events, setEvents] = useState<TelemetryEvent[]>(INITIAL_EVENTS);

  // Periodically insert live mock transaction activity to show physical activity
  useEffect(() => {
    const interval = setInterval(() => {
      const sampleTypes: ('coupon_settlement' | 'bounty_cleared' | 'amm_swap')[] = [
        'coupon_settlement',
        'bounty_cleared',
        'amm_swap',
      ];
      const selectedType = sampleTypes[Math.floor(Math.random() * sampleTypes.length)];
      
      const newEvent: TelemetryEvent = {
        id: `evt-${Date.now()}`,
        timestamp: 'Just now',
        type: selectedType,
        description:
          selectedType === 'coupon_settlement'
            ? 'Instant Merchant Settlement (Apple Store Online)'
            : selectedType === 'bounty_cleared'
            ? 'Creator Campaign Milestone Verified (@alex_creative)'
            : 'AMM Swap Execution (50 Moment Pieces)',
        amountUsd: Math.floor(Math.random() * 150) + 30,
        feeCapturedUsd: Number((Math.random() * 2 + 0.5).toFixed(2)),
        ticketsEarned: Math.floor(Math.random() * 3) + 1,
      };

      setEvents((prev) => [newEvent, ...prev.slice(0, 4)]);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-zinc-950/80 border border-zinc-800/80 rounded-3xl p-5 md:p-6 shadow-xl">
      {/* Telemetry Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4 mb-4">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">
            Live Commerce Settlement Stream
          </h4>
        </div>
        <span className="text-xs text-zinc-400 font-mono">NODE THROUGHPUT: 12.4 TX/SEC</span>
      </div>

      {/* Live Events List */}
      <div className="space-y-3">
        {events.map((evt) => (
          <div
            key={evt.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-zinc-900/60 border border-zinc-800/60 rounded-2xl text-xs hover:border-zinc-700 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-zinc-800/80 text-amber-400">
                {evt.type === 'coupon_settlement' && <ShoppingCart className="w-4 h-4" />}
                {evt.type === 'bounty_cleared' && <Award className="w-4 h-4 text-purple-400" />}
                {evt.type === 'amm_swap' && <Activity className="w-4 h-4 text-blue-400" />}
              </div>
              <div>
                <div className="font-semibold text-zinc-200">{evt.description}</div>
                <div className="text-[11px] text-zinc-400 flex items-center gap-2">
                  <span>${evt.amountUsd.toFixed(2)} volume</span>
                  <span>•</span>
                  <span>{evt.timestamp}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 sm:justify-end">
              <div className="text-right">
                <div className="text-emerald-400 font-bold">+${evt.feeCapturedUsd.toFixed(2)} fee</div>
                <div className="text-[10px] text-amber-400/90 font-medium">+{evt.ticketsEarned} jackpot tickets</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

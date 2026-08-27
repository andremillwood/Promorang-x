import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  Ticket, 
  Zap, 
  Flame, 
  Crown, 
  ArrowUpRight, 
  Lock, 
  Coins, 
  TrendingUp, 
  Clock, 
  Info 
} from 'lucide-react';
import { TangibleNodeCard } from './TangibleNodeCard';
import { NodeLiveTelemetryTicker } from './NodeLiveTelemetryTicker';
import jackpotMegaVault from '@/assets/nodes/jackpot-mega-vault.jpg';
import { ProofReceiptModal } from '@/components/value/ProofReceiptModal';
import { ProofPassportCard } from '@/components/value/ProofPassportCard';
import { ValueReceiptData } from '@/components/value/TactileValueReceipt';

interface NodeHubProps {
  userTier?: 'free' | 'premium' | 'super';
  streakDays?: number;
  stakedBalance?: number;
  onUpgradeTier?: () => void;
  onStake?: (nodeId: string, amount: number) => void;
}

export const PromorangNodeHub: React.FC<NodeHubProps> = ({
  userTier = 'premium',
  streakDays = 28,
  stakedBalance = 500,
  onUpgradeTier,
  onStake,
}) => {
  const [selectedNode, setSelectedNode] = useState<string>('pieces-amm-node');
  const [activeReceipt, setActiveReceipt] = useState<ValueReceiptData | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);

  const multiplier = userTier === 'super' ? 10 : userTier === 'premium' ? 3 : 1;
  const baseTickets = Math.floor(stakedBalance / 10);
  const streakBoostPct = Math.round(Math.min(streakDays, 365) * 0.5);
  const totalTickets = Math.floor(baseTickets * multiplier * (1 + streakBoostPct / 100));

  const handleIgniteNode = (nodeId: string, amount: number) => {
    if (onStake) onStake(nodeId, amount);

    // Generate real-time Proof of Value Staking Receipt
    const newReceipt: ValueReceiptData = {
      id: `rec_node_stake_${Date.now()}`,
      receiptNumber: `REC-VAULT-${Math.floor(1000 + Math.random() * 9000)}`,
      actorHandle: '@community_backer',
      actorName: 'Community Vault Supporter',
      actionType: 'commerce',
      actionTitle: 'Stashed Gems in City Vault',
      targetEntity: 'Local Merchant Float & Community Vault',
      timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'verified',
      verificationMethod: 'Promorang Transparent Savings Ledger',
      proofHash: `0x${Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      hostQuote: 'Community funds successfully routed to back local perks and instant check-ins. Your money is 100% protected and withdrawable.',
      hostSigner: 'Promorang Community Treasury',
      metrics: [
        { label: 'Amount Stashed', value: `$${amount}.00 USD`, highlight: true },
        { label: 'Free Draw Tickets', value: `+${amount * multiplier / 10} Tickets` },
        { label: 'Bonus Yield', value: '5.0% Growth' },
      ],
      rewards: [
        { type: 'cash', label: '100% Protected Savings', value: `$${amount}.00 USD` },
        { type: 'keys', label: 'Active Prize Draw Entries', value: `+${Math.floor(amount / 10 * multiplier)} Tickets` },
      ],
    };

    setActiveReceipt(newReceipt);
    setIsReceiptModalOpen(true);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 p-4 md:p-6 text-white">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/20 via-zinc-900 to-zinc-950 border border-amber-500/30 p-6 md:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-full text-xs font-bold text-amber-400">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>100% PROTECTED SAVINGS • ZERO RISK</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Community Vaults &amp; Save-and-Win Pots
            </h1>
            <p className="text-zinc-400 text-sm md:text-base max-w-2xl">
              Stash your Gems to power instant discounts, check-ins, and local perks. You keep 100% of your money at all times, earn steady bonuses, and unlock free tickets into weekly and monthly cash prize draws.
            </p>
          </div>

          <div className="flex flex-col items-end bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 min-w-[220px]">
            <span className="text-xs text-zinc-400 font-medium">Your Member Tier</span>
            <div className="flex items-center gap-2 mt-1">
              <Crown className={`w-5 h-5 ${userTier === 'super' ? 'text-purple-400' : userTier === 'premium' ? 'text-amber-400' : 'text-zinc-400'}`} />
              <span className="text-lg font-bold uppercase tracking-wider">{userTier} Member</span>
            </div>
            <div className="mt-2 text-xs font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full">
              {multiplier}x Free Ticket Multiplier
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Card 1: Stashed Principal */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Your Stashed Savings</span>
            <Coins className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">${stakedBalance.toFixed(2)}</span>
            <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              100% Protected
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-2">
            Earns ~5.0% steady bonus • Withdraw 100% of your funds anytime.
          </p>
        </div>

        {/* Card 2: Draw Tickets */}
        <div className="bg-zinc-900/90 border border-amber-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Free Prize Tickets</span>
            <Ticket className="w-5 h-5 text-amber-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-300">{totalTickets.toLocaleString()}</span>
            <span className="text-xs font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
              {multiplier}x Multiplier
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-2">
            Includes +{streakBoostPct}% bonus from your {streakDays}-day check-in streak.
          </p>
        </div>

        {/* Card 3: Next Draw */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Next Sunday Draw</span>
            <Clock className="w-5 h-5 text-blue-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">$1,250.00</span>
            <span className="text-xs font-medium text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
              In 3d 12h
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-2">
            1 Grand Winner ($750) + 10 Minor Winners ($50 each).
          </p>
        </div>
      </div>

      {/* Tangible Holographic Node Machine & Live Telemetry Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-6 flex justify-center">
          <TangibleNodeCard
            nodeName="Coupon Settlement & AMM Core"
            nodeCategory="Merchant Float & AMM"
            userTier={userTier}
            stakedAmount={stakedBalance}
            multiplier={multiplier}
            totalTickets={totalTickets}
            onIgniteStake={() => handleIgniteNode(selectedNode, 100)}
          />
        </div>
        <div className="lg:col-span-6">
          <NodeLiveTelemetryTicker />
        </div>
      </div>

      {/* Prize Pools Showcase */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Active Save &amp; Win Prize Pots
            </h2>
            <p className="text-xs text-zinc-400">
              Community drawings occur automatically and transparently every Sunday and month end.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Pool 1 */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-xs font-semibold text-emerald-400">
                  Weekly Draw
                </span>
                <span className="text-xs text-zinc-400 font-medium">All Members</span>
              </div>
              <h3 className="text-lg font-bold text-white">Sunday Community Treat Pot</h3>
              <div className="text-2xl font-black text-emerald-400">$1,250.00</div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Funded by platform check-in fees and verified local business sponsors.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-800 text-xs text-zinc-400 flex justify-between items-center">
              <span>Your Tickets: <strong className="text-white">{totalTickets}</strong></span>
              <span className="text-emerald-400 font-semibold">Active &amp; Ready</span>
            </div>
          </div>

          {/* Pool 2 */}
          <div className="bg-gradient-to-b from-amber-500/10 to-zinc-900 border border-amber-500/40 rounded-2xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden group">
            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full text-xs font-semibold text-amber-400">
                  Monthly Mega
                </span>
                <span className="text-xs text-amber-400 font-medium">Pro &amp; Super</span>
              </div>
              
              <div className="relative my-2 rounded-xl overflow-hidden border border-amber-500/30">
                <img 
                  src={jackpotMegaVault} 
                  alt="Mega Jackpot Vault" 
                  className="w-full h-32 object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-70" />
                <div className="absolute bottom-2 left-2.5 text-[10px] font-bold text-amber-300 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-full border border-amber-500/30">
                  💰 MONTHLY COMMUNITY POT
                </div>
              </div>

              <h3 className="text-lg font-bold text-amber-200">Monthly City Mega Pot</h3>
              <div className="text-2xl font-black text-amber-400">$6,500.00</div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Bigger prize pot built from city-wide shopping deals and venue check-ins.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-amber-500/20 text-xs text-zinc-300 flex justify-between items-center relative z-10">
              <span>Your Tickets: <strong className="text-white">{totalTickets}</strong></span>
              <span className="text-amber-400 font-semibold">Active &amp; Ready</span>
            </div>
          </div>

          {/* Pool 3 */}
          <div className="bg-zinc-900 border border-purple-500/30 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-xs font-semibold text-purple-400">
                  Seasonal Crown
                </span>
                <span className="text-xs text-purple-400 font-medium">Super Tier Only</span>
              </div>
              <h3 className="text-lg font-bold text-purple-200">Seasonal Champion Pot</h3>
              <div className="text-2xl font-black text-purple-400">$35,000.00</div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                The grand prize awarded to community champions at the end of each season.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-800 text-xs text-zinc-400 flex justify-between items-center">
              {userTier === 'super' ? (
                <span className="text-purple-400 font-semibold">Active &amp; Ready</span>
              ) : (
                <button
                  onClick={onUpgradeTier}
                  className="w-full py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-bold transition-all text-center"
                >
                  Upgrade to Super to Unlock
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cumulative Proof Passport & Verified Resume */}
      <div className="pt-4">
        <ProofPassportCard
          userHandle="@pioneer_operator"
          pioneerRank={`Level ${userTier === 'super' ? '5 (Titan)' : userTier === 'premium' ? '3 (Pro)' : '1 (Explorer)'}`}
          totalCommerceDriven={stakedBalance * 3.4}
          totalFootfall={24}
          totalGemsEarned={Math.floor(stakedBalance * 1.5)}
          onSelectReceipt={(rec) => {
            setActiveReceipt(rec);
            setIsReceiptModalOpen(true);
          }}
        />
      </div>

      {/* Interactive Proof Receipt Modal */}
      {activeReceipt && (
        <ProofReceiptModal
          isOpen={isReceiptModalOpen}
          receipt={activeReceipt}
          onClose={() => setIsReceiptModalOpen(false)}
        />
      )}
    </div>
  );
};

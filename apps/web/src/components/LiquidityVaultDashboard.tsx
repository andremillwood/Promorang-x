import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePromoShareRail } from '@/hooks/usePromoShareRail';
import { updateUnifiedBalances } from '@/lib/rewardEvents';
import { 
  Gem, 
  TrendingUp, 
  ShieldCheck, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Zap, 
  Coins, 
  Info,
  Layers,
  ArrowRight,
  HeartHandshake
} from 'lucide-react';
import { toast } from 'sonner';

const VAULT_POSITION_KEY = 'promorang_vault_position_gems';

export const LiquidityVaultDashboard: React.FC = () => {
  const { balances } = usePromoShareRail();
  const [activeAction, setActiveAction] = useState<'deposit' | 'withdraw'>('deposit');
  const [amountInput, setAmountInput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  // Real user backing stake
  const [userVaultGems, setUserVaultGems] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(VAULT_POSITION_KEY);
      return saved ? Number(saved) : 0;
    } catch {
      return 0;
    }
  });

  // Base platform community reserve + user contribution
  const baseProtocolTvlGems = 125000;
  const currentTvlGems = baseProtocolTvlGems + userVaultGems;
  const apyPercentage = 16.4;
  const userLpShares = userVaultGems;

  const availableGems = balances.gems || 0;

  const handleDeposit = async () => {
    const numAmount = parseFloat(amountInput);
    if (!amountInput || isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid Gem amount');
      return;
    }

    if (numAmount > availableGems) {
      toast.error(`Insufficient Gems. You have ${availableGems} Gems available.`);
      return;
    }

    setIsProcessing(true);
    try {
      // Deduct from available Gems balance
      updateUnifiedBalances({ gems: -numAmount });

      // Add to user's backing position
      const newPosition = userVaultGems + numAmount;
      setUserVaultGems(newPosition);
      localStorage.setItem(VAULT_POSITION_KEY, newPosition.toString());

      toast.success(`Successfully committed ${numAmount} Gems to the Community Growth Reserve!`);
      setAmountInput('');
    } catch (err) {
      toast.error('Commitment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWithdraw = async () => {
    const numAmount = parseFloat(amountInput);
    if (!amountInput || isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid Gem amount');
      return;
    }

    if (numAmount > userVaultGems) {
      toast.error(`Cannot withdraw more than your current backing stake (${userVaultGems} Gems).`);
      return;
    }

    setIsProcessing(true);
    try {
      // Credit back to user available Gems balance
      updateUnifiedBalances({ gems: numAmount });

      // Deduct from user's backing position
      const newPosition = Math.max(0, userVaultGems - numAmount);
      setUserVaultGems(newPosition);
      localStorage.setItem(VAULT_POSITION_KEY, newPosition.toString());

      toast.success(`Successfully returned ${numAmount} Gems back to your available balance.`);
      setAmountInput('');
    } catch (err) {
      toast.error('Withdrawal failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSetMax = () => {
    if (activeAction === 'deposit') {
      setAmountInput(availableGems.toString());
    } else {
      setAmountInput(userVaultGems.toString());
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 sm:p-8 space-y-8 bg-slate-950 text-white rounded-3xl border border-slate-800/80 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs tracking-wider uppercase">
            <HeartHandshake className="w-4 h-4 text-blue-400" /> Promorang Ecosystem Backing
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1 text-white">
            Community &amp; Brand Growth Reserve
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1.5 max-w-2xl">
            Back platform member perks and experiences with Gems to earn shared rewards from platform redemptions and cultural trades. (1 Gem = US$1.00 platform value)
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Gem className="w-3.5 h-3.5 mr-1" /> 1 Gem = US$1.00
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Protected Reserve
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Zap className="w-3.5 h-3.5 mr-1" /> Instant Payouts
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* TVL */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm space-y-2">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center justify-between">
            <span>Total Community Reserve</span>
            <Coins className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {currentTvlGems.toLocaleString()} Gems
          </div>
          <div className="text-slate-400 text-xs flex items-center gap-1.5">
            <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> Backing Active
            </span>
            <span>· ≈ ${currentTvlGems.toLocaleString()} USD</span>
          </div>
        </div>

        {/* APY */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-950/40 via-indigo-950/20 to-slate-900/60 border border-blue-500/30 backdrop-blur-sm space-y-2">
          <div className="text-blue-300 text-xs font-bold uppercase tracking-wider flex items-center justify-between">
            <span>Estimated Annual Rewards</span>
            <Zap className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-400">
            {apyPercentage}% Est. Rate
          </div>
          <div className="text-slate-400 text-xs">
            Distributed automatically from 80% platform trade &amp; perk redemption fees
          </div>
        </div>

        {/* User Vault Position */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm space-y-2">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center justify-between">
            <span>Your Backing Stake</span>
            <Gem className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {userVaultGems.toLocaleString()} Gems
          </div>
          <div className="text-slate-400 text-xs flex items-center justify-between">
            <span>{userLpShares.toFixed(2)} Reserve Share</span>
            <span className="text-xs text-blue-400 font-medium">≈ ${userVaultGems.toFixed(2)} USD</span>
          </div>
        </div>
      </div>

      {/* Action Card: Commit & Withdraw */}
      <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setActiveAction('deposit'); setAmountInput(''); }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeAction === 'deposit'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Commit Gems
            </button>
            <button
              onClick={() => { setActiveAction('withdraw'); setAmountInput(''); }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeAction === 'withdraw'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Withdraw Gems
            </button>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span>
              {activeAction === 'deposit' ? 'Available in Wallet:' : 'Active in Reserve:'}
            </span>
            <span className="font-bold text-white font-mono">
              {activeAction === 'deposit' ? `${availableGems} Gems` : `${userVaultGems} Gems`}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-300 block">
            {activeAction === 'deposit' ? 'Specify Gems to Commit to Reserve' : 'Specify Gems to Withdraw to Wallet'}
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="number"
                min="0"
                step="any"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                placeholder={activeAction === 'deposit' ? 'Amount in Gems (e.g. 10)' : 'Amount in Gems to withdraw'}
                className="w-full pl-4 pr-24 py-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm font-medium"
              />
              <div className="absolute right-2.5 top-2.5 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleSetMax}
                  className="text-[10px] uppercase font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 px-2 py-1 rounded-md transition-colors"
                >
                  Max
                </button>
                <span className="text-xs font-bold text-slate-300 bg-slate-800 px-2 py-1 rounded">
                  GEMS
                </span>
              </div>
            </div>

            {activeAction === 'deposit' ? (
              <button
                onClick={handleDeposit}
                disabled={isProcessing || availableGems <= 0}
                className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowUpRight className="w-4 h-4" />
                {isProcessing ? 'Processing Commitment...' : 'Commit Gems'}
              </button>
            ) : (
              <button
                onClick={handleWithdraw}
                disabled={isProcessing || userVaultGems <= 0}
                className="px-6 py-3.5 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowDownLeft className="w-4 h-4" />
                {isProcessing ? 'Processing Withdrawal...' : 'Withdraw Gems'}
              </button>
            )}
          </div>
        </div>

        {availableGems === 0 && activeAction === 'deposit' && (
          <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-500/20 flex items-start gap-3">
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-300">
              You currently have <span className="font-bold text-white">0 Gems</span> in your wallet. Earn Gems by completing missions, hosting moments, or sharing viral links, or explore Co-Producer drops below.
            </p>
          </div>
        )}
      </div>

      {/* Cultural Co-Producer Pools Callout */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/30 via-slate-900 to-slate-900 border border-purple-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Become a Co-Producer for Cultural Drops</h4>
            <p className="text-xs text-slate-400">
              Back music, live events, and creator drops with Pieces + Gems to earn shared cuts of ticket sales and passes.
            </p>
          </div>
        </div>
        <Link
          to="/liquidity"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold transition-colors whitespace-nowrap"
        >
          <span>Explore Co-Producer Drops</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};



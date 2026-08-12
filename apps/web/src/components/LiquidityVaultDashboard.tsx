import React, { useState } from 'react';
import { useWeb3Vault } from '@promorang/shared';
import { Coins, TrendingUp, ShieldCheck, ArrowUpRight, ArrowDownLeft, Zap } from 'lucide-react';

export const LiquidityVaultDashboard: React.FC = () => {
  const { tvlUsdc, apyPercentage, userLpShares, userUsdcValue, depositLiquidity, withdrawLiquidity } = useWeb3Vault();
  const [depositAmount, setDepositAmount] = useState<string>('100');
  const [isDepositing, setIsDepositing] = useState<boolean>(false);

  const handleDeposit = async () => {
    if (!depositAmount || isNaN(Number(depositAmount))) return;
    setIsDepositing(true);
    await depositLiquidity(Number(depositAmount));
    setIsDepositing(false);
    setDepositAmount('');
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 bg-slate-950 text-white rounded-2xl border border-slate-800 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm tracking-wide uppercase">
            <Coins className="w-4 h-4" /> Promorang Protocol Vaults
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mt-1">Brand & LP Liquidity Pool</h1>
          <p className="text-slate-400 text-sm mt-1">
            Deposit USDC liquidity to power automated promo redemptions and earn 80% protocol fee splits.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" /> ERC-4626 Vault
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Zap className="w-3.5 h-3.5 mr-1" /> Base L2 Network
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
          <div className="text-slate-400 text-xs font-semibold uppercase">Total Pool Liquidity (TVL)</div>
          <div className="text-3xl font-extrabold text-white mt-2">${tvlUsdc.toLocaleString()} USDC</div>
          <div className="text-emerald-400 text-xs font-medium mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +12.4% this week
          </div>
        </div>

        <div className="p-6 rounded-xl bg-gradient-to-br from-indigo-900/40 to-slate-900/60 border border-indigo-500/30 backdrop-blur-sm">
          <div className="text-indigo-300 text-xs font-semibold uppercase">Estimated Pool APY</div>
          <div className="text-3xl font-extrabold text-indigo-400 mt-2">{apyPercentage}%</div>
          <div className="text-slate-400 text-xs mt-2">Auto-compounded from 80% fee splits</div>
        </div>

        <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
          <div className="text-slate-400 text-xs font-semibold uppercase">Your Vault Position</div>
          <div className="text-3xl font-extrabold text-white mt-2">${userUsdcValue.toFixed(2)} USDC</div>
          <div className="text-slate-400 text-xs mt-2">{userLpShares.toFixed(2)} pVAULT Shares</div>
        </div>
      </div>

      {/* Action Card */}
      <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800">
        <h3 className="text-lg font-bold text-white mb-4">Provide Liquidity</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="Amount in USDC"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm font-medium"
            />
            <span className="absolute right-3 top-3 text-xs font-bold text-slate-400 bg-slate-800 px-2 py-1 rounded">
              USDC
            </span>
          </div>
          <button
            onClick={handleDeposit}
            disabled={isDepositing}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm shadow-lg shadow-indigo-600/20 disabled:opacity-50"
          >
            <ArrowUpRight className="w-4 h-4" /> {isDepositing ? 'Processing...' : 'Deposit Liquidity'}
          </button>
        </div>
      </div>
    </div>
  );
};

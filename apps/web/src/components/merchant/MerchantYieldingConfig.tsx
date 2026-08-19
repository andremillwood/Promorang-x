import React, { useState } from 'react';
import { DollarSign, TrendingUp, Clock, Percent, ShieldCheck, Save } from 'lucide-react';

export const MerchantYieldingConfig: React.FC = () => {
  const [commissionRate, setCommissionRate] = useState<number>(10);
  const [tippingThreshold, setTippingThreshold] = useState<number>(15);
  const [offPeakDiscount, setOffPeakDiscount] = useState<number>(35);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl text-white max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" /> Dynamic Deal Yielding & Tipping Controls
          </h2>
          <p className="text-xs text-gray-400">Manage collective tipping thresholds and off-peak revenue boosts.</p>
        </div>
        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold rounded-full">
          Active Merchant Yield
        </span>
      </div>

      <div className="space-y-6">
        {/* Tipping Threshold Config */}
        <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl space-y-3">
          <label className="text-sm font-semibold flex items-center justify-between text-slate-200">
            <span>Minimum Tipping Threshold (Group Unlock)</span>
            <span className="text-amber-400 font-bold">{tippingThreshold} Orders Needed</span>
          </label>
          <input
            type="range"
            min="1"
            max="100"
            value={tippingThreshold}
            onChange={(e) => setTippingThreshold(parseInt(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
          <p className="text-xs text-gray-400">
            Guarantees you only offer this promotion if at least {tippingThreshold} customers commit to claiming it.
          </p>
        </div>

        {/* Off-Peak Yield Management */}
        <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl space-y-3">
          <label className="text-sm font-semibold flex items-center justify-between text-slate-200">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-purple-400" /> Off-Peak Hours Boost (Tue-Thu 2PM-5PM)
            </span>
            <span className="text-purple-400 font-bold">{offPeakDiscount}% Discount</span>
          </label>
          <input
            type="range"
            min="10"
            max="70"
            value={offPeakDiscount}
            onChange={(e) => setOffPeakDiscount(parseInt(e.target.value))}
            className="w-full accent-purple-500 cursor-pointer"
          />
          <p className="text-xs text-gray-400">
            Boost customer foot traffic during slow hours without discounting peak weekend slots.
          </p>
        </div>

        {/* Platform Revenue Commission Preview */}
        <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-xl flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-emerald-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Promorang Platform Commission Rate
            </h4>
            <p className="text-xs text-gray-400">Pay-for-performance model. Keeps 90% of revenue with your business.</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-emerald-400">{commissionRate}%</span>
            <span className="block text-[10px] text-gray-400">Standard Platform Fee</span>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition"
        >
          <Save className="w-4 h-4" /> {saved ? 'Yield Configuration Saved!' : 'Save Yield Settings'}
        </button>
      </div>
    </div>
  );
};

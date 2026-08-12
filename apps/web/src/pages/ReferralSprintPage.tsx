import { useState, useEffect } from "react";
import { Sparkles, Trophy, Gift, Share2, Copy, CheckCircle, ShieldCheck, Zap, Flame, Clock } from "lucide-react";

export default function ReferralSprintPage() {
  const [copied, setCopied] = useState(false);
  const [referralCode] = useState("VIP-GOLDEN-PASS-998");
  const [referralCount] = useState(32);
  const [targetCount] = useState(50);

  const referralLink = `https://promorang.co/vip?pass=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* HERO SECTION */}
        <header className="relative overflow-hidden rounded-3xl border border-[#FF6A00]/30 bg-gradient-to-br from-[#FF6A00]/10 via-black to-[#FFC300]/5 px-6 py-10 sm:px-10">
          <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[#FF6A00]/20 blur-3xl" />
          
          <div className="relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#FF6A00]/50 bg-[#FF6A00]/20 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#FFC300]">
                <Flame className="h-4 w-4 text-[#FF6A00]" />
                VIP Golden Pass Sprint • Active Now
              </div>

              {/* Countdown */}
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-white/80">
                <Clock className="h-4 w-4 text-[#FF6A00]" />
                Sprint Closes In: <span className="font-mono text-[#FFC300] font-bold">02d : 14h : 38m</span>
              </div>
            </div>

            <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-tight sm:text-6xl text-white">
              Gift VIP Golden Passes. <br />
              <span className="bg-gradient-to-r from-[#FF6A00] to-[#FFC300] bg-clip-text text-transparent">
                Unlock Lifetime 10% Cash Split.
              </span>
            </h1>

            <p className="mt-4 max-w-2xl text-base text-white/70">
              Every Gem your invited friends earn is backed 1:1 by brand advertiser deposits ($1 Gem = $1.00 USD withdrawable cash). Gift your 3 VIP Passes today.
            </p>

            {/* ONE-CLICK SHARE BOX */}
            <div className="mt-8 rounded-2xl border border-white/15 bg-black/60 p-4 sm:p-6 backdrop-blur-xl">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <div className="flex-1 overflow-hidden rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-mono text-[#FFC300]">
                  {referralLink}
                </div>
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6A00] to-[#FF9000] px-6 py-3 text-sm font-black text-black shadow-lg shadow-[#FF6A00]/25 transition hover:brightness-110 active:scale-95"
                >
                  {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Pass Copied!" : "Copy VIP Pass Link"}
                </button>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-white/60">
                <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-[#10B981]" /> 100% Cash Backed (1 Gem = $1.00 USD)</span>
                <span className="inline-flex items-center gap-1.5"><Zap className="h-4 w-4 text-[#FFC300]" /> 3 VIP Passes Remaining</span>
              </div>
            </div>
          </div>
        </header>

        {/* PROGRESS & VALUE STACK GRID */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          {/* TIER PROGRESS CARD */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-[#FF6A00]">Your Sprint Status</span>
              <span className="rounded-full bg-[#FF6A00]/20 px-3 py-1 text-xs font-bold text-[#FFC300]">SILVER TIER</span>
            </div>

            <h3 className="mt-4 text-3xl font-black text-white">32 / 50 Invites</h3>
            <p className="mt-1 text-xs text-white/60">18 more invites to unlock GOLD TIER status.</p>

            {/* Progress Bar */}
            <div className="mt-6 h-3 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-gradient-to-r from-[#FF6A00] to-[#FFC300] transition-all duration-500"
                style={{ width: `${Math.min(100, (referralCount / targetCount) * 100)}%` }}
              />
            </div>

            <div className="mt-8 space-y-4 border-t border-white/10 pt-6">
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Withdrawable Cash Earnings</span>
                <span className="font-mono font-bold text-[#10B981]">$145.50 USD</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Gems Balance (1 Gem = $1 USD)</span>
                <span className="font-mono font-bold text-[#FFC300]">145.5 Gems</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Current Cash Split Rate</span>
                <span className="font-bold text-white">6.0% (Silver)</span>
              </div>
            </div>
          </div>

          {/* GRAND SLAM VALUE STACK */}
          <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-white">Your Unlocked VIP Bonus Stack</h3>
              <span className="text-xs font-bold text-[#FFC300]">$2,725 Total Perceived Value</span>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span>Fee Waiver</span>
                  <span className="font-mono font-bold text-[#10B981]">$25 Value</span>
                </div>
                <h4 className="mt-2 text-sm font-bold text-white">0% Cash Withdrawal Processing Fee</h4>
                <p className="mt-1 text-xs text-white/50">Applies to your first $500 in Gem cash-outs.</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span>Priority Queue</span>
                  <span className="font-mono font-bold text-[#10B981]">$200 Value</span>
                </div>
                <h4 className="mt-2 text-sm font-bold text-white">24-Hour Early Access Pass</h4>
                <p className="mt-1 text-xs text-white/50">First access to limited $50+ brand drops.</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span>VIP Vault</span>
                  <span className="font-mono font-bold text-[#10B981]">$499 Value</span>
                </div>
                <h4 className="mt-2 text-sm font-bold text-white">Private Creator Director Mastermind</h4>
                <p className="mt-1 text-xs text-white/50">Unlocks at Gold Tier (50 invites).</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span>Zero Risk Guarantee</span>
                  <span className="font-mono font-bold text-[#10B981]">Risk-Free</span>
                </div>
                <h4 className="mt-2 text-sm font-bold text-white">100% Escrow Reserve Backed</h4>
                <p className="mt-1 text-xs text-white/50">Every Gem is 1:1 cash backed by brand deposits.</p>
              </div>
            </div>
          </div>
        </div>

        {/* LEADERBOARD TABLE */}
        <section className="mt-12 rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#FF6A00]">Top Performers</p>
              <h2 className="text-2xl font-black text-white">Sprint Leaderboard</h2>
            </div>
            <span className="text-xs text-white/50">Live updates via Supabase Realtime</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 text-xs font-bold uppercase text-white/50">
                <tr>
                  <th className="pb-3">Rank</th>
                  <th className="pb-3">Member</th>
                  <th className="pb-3">Invites</th>
                  <th className="pb-3">Current Tier</th>
                  <th className="pb-3">Withdrawable Cash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/90">
                <tr className="hover:bg-white/5">
                  <td className="py-4 font-bold text-[#FFC300]">🥇 #1</td>
                  <td className="py-4 font-semibold">@alex_creator</td>
                  <td className="py-4 font-mono font-bold">142</td>
                  <td className="py-4"><span className="rounded-full bg-[#FFC300]/20 px-3 py-1 text-xs font-bold text-[#FFC300]">Platinum</span></td>
                  <td className="py-4 font-mono font-bold text-[#10B981]">$1,420.00 USD</td>
                </tr>
                <tr className="hover:bg-white/5">
                  <td className="py-4 font-bold text-[#C0C0C0]">🥈 #2</td>
                  <td className="py-4 font-semibold">@sarah_growth</td>
                  <td className="py-4 font-mono font-bold">98</td>
                  <td className="py-4"><span className="rounded-full bg-[#FFC300]/20 px-3 py-1 text-xs font-bold text-[#FFC300]">Platinum</span></td>
                  <td className="py-4 font-mono font-bold text-[#10B981]">$980.00 USD</td>
                </tr>
                <tr className="hover:bg-white/5">
                  <td className="py-4 font-bold text-[#CD7F32]">🥉 #3</td>
                  <td className="py-4 font-semibold">@marcus_dev</td>
                  <td className="py-4 font-mono font-bold">64</td>
                  <td className="py-4"><span className="rounded-full bg-[#FF6A00]/20 px-3 py-1 text-xs font-bold text-[#FF6A00]">Gold</span></td>
                  <td className="py-4 font-mono font-bold text-[#10B981]">$640.00 USD</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </main>
  );
}

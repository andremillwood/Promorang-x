import { Link } from "react-router-dom";
import { Calculator, ShieldCheck, QrCode, Plus } from "lucide-react";
import { PostPerkModal } from "@/components/merchant/PostPerkModal";
import { useAuth } from "@/contexts/AuthContext";
import { useMerchantSalesAnalytics } from "@/hooks/useMerchantSalesAnalytics";
import { formatPayoutDate } from "@/lib/payout-calendar";
import { useState } from "react";

export default function MerchantCouponHub() {
  const [productPrice, setProductPrice] = useState(50);
  const [targetOrders, setTargetOrders] = useState(100);
  const [postPerkOpen, setPostPerkOpen] = useState(false);
  const { user } = useAuth();
  const analytics = useMerchantSalesAnalytics();
  const funnel = analytics.data;

  const grossRevenue = productPrice * targetOrders;
  const platformFee = grossRevenue * 0.10;
  const netRevenue = grossRevenue - platformFee;
  const payoutLabel = formatPayoutDate(funnel?.nextPayoutAt);

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 via-black to-teal-950/20 px-6 py-10 sm:px-10">
          <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-400">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Pay when they redeem
            </div>

            <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-tight sm:text-6xl text-white">
              Grow with customers, <br />
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                not leads.
              </span>
            </h1>

            <p className="mt-4 max-w-2xl text-base text-white/70">
              List a member perk for free. People claim it, show up, and you confirm the visit. You pay only when a real guest redeems in your place.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={() => setPostPerkOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3.5 text-sm font-black text-black shadow-lg shadow-emerald-500/25 transition hover:brightness-110 active:scale-95 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Post a member perk</span>
              </button>

              <Link
                to="/staff/scanner"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 px-6 py-3.5 text-sm font-bold text-white transition active:scale-95"
              >
                <QrCode className="h-4 w-4 text-emerald-400" />
                <span>Open Staff QR Scanner</span>
              </Link>
            </div>
          </div>
        </header>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <div className="flex items-center gap-2 text-emerald-400 mb-6">
              <Calculator className="h-5 w-5" />
              <h2 className="text-xl font-black text-white">What a drop could return</h2>
            </div>
            <p className="mb-6 text-xs text-white/45">Estimator only. Your live funnel is below, from sales — not these numbers.</p>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase text-white/70">Average Product Price ($ USD)</label>
                <input
                  type="number"
                  value={productPrice}
                  onChange={(e) => setProductPrice(Number(e.target.value))}
                  className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-lg font-mono text-emerald-400 focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-white/70">Target guests who redeem</label>
                <input
                  type="number"
                  value={targetOrders}
                  onChange={(e) => setTargetOrders(Number(e.target.value))}
                  className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-lg font-mono text-emerald-400 focus:border-emerald-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-300">
              <span className="font-bold">If nobody redeems:</span> your upfront spend stays <span className="font-mono font-bold text-white">$0.00</span>.
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-white/50">Estimator</span>
              <h3 className="mt-2 text-3xl font-black text-[#10B981]">${netRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })} if they all redeem</h3>
              <p className="mt-1 text-xs text-white/60">Cash after a 10% performance fee. Not a forecast of your live drop.</p>

              <div className="mt-8 space-y-4 border-t border-white/10 pt-6">
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Upfront spend</span>
                  <span className="font-mono font-bold text-[#10B981]">$0.00 USD</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">If every guest buys</span>
                  <span className="font-mono font-bold text-white">${grossRevenue.toLocaleString()} USD</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Promorang fee (10%)</span>
                  <span className="font-mono font-bold text-white/60">-${platformFee.toLocaleString()} USD</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-12 rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">Your live funnel</p>
              <h2 className="text-2xl font-black text-white">Issued, claimed, redeemed</h2>
            </div>
            {user ? (
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-200">
                Next payout · {payoutLabel}
              </span>
            ) : (
              <Link to="/auth?redirect=/merchant/coupons" className="text-xs font-bold text-emerald-300 hover:text-emerald-200">
                Sign in to see your numbers
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <span className="text-xs text-white/60">Issued</span>
              <p className="mt-1 text-2xl font-black text-white">{user ? funnel?.issued ?? "—" : "—"}</p>
              <p className="mt-1 text-[11px] text-white/40">Passes you put out</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <span className="text-xs text-white/60">Claimed</span>
              <p className="mt-1 text-2xl font-black text-white">{user ? funnel?.claimed ?? "—" : "—"}</p>
              <p className="mt-1 text-[11px] text-white/40">People holding them</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <span className="text-xs text-white/60">Redeemed</span>
              <p className="mt-1 text-2xl font-black text-emerald-400">{user ? funnel?.redeemed ?? "—" : "—"}</p>
              <p className="mt-1 text-[11px] text-white/40">Verified in your place</p>
            </div>
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
              <span className="text-xs text-emerald-200/80">Next payout</span>
              <p className="mt-1 text-2xl font-black text-[#10B981]">{payoutLabel}</p>
              <p className="mt-1 text-[11px] text-white/40">
                {funnel?.cameBack
                  ? `$${Number(funnel.cameBack).toLocaleString()} already back from redemptions`
                  : "The date money lands. Not a projected yield."}
              </p>
            </div>
          </div>
        </section>
      </div>

      <PostPerkModal
        open={postPerkOpen}
        onOpenChange={setPostPerkOpen}
        onCreated={() => {}}
      />
    </main>
  );
}

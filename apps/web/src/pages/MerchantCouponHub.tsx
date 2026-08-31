import { useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Calculator, CheckCircle2, ShieldCheck, Tag, ArrowRight, Zap, TrendingUp, QrCode, Plus } from "lucide-react";
import { PostPerkModal } from "@/components/merchant/PostPerkModal";
import { useI18n } from "@/i18n/I18nContext";

export default function MerchantCouponHub() {
  const { t, formatNumber } = useI18n();
  const [productPrice, setProductPrice] = useState(50);
  const [targetOrders, setTargetOrders] = useState(100);
  const [postPerkOpen, setPostPerkOpen] = useState(false);

  const grossRevenue = productPrice * targetOrders;
  const platformFee = grossRevenue * 0.10; // 10% performance fee
  const netRevenue = grossRevenue - platformFee;

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* HERO HEADER */}
        <header className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 via-black to-teal-950/20 px-6 py-10 sm:px-10">
          <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-400">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              {t("couponHub.badge")}
            </div>

            <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-tight sm:text-6xl text-white">
              {t("couponHub.hero1")} <br />
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                {t("couponHub.hero2")}
              </span>
            </h1>

            <p className="mt-4 max-w-2xl text-base text-white/70">
              {t("couponHub.lede")}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <button 
                onClick={() => setPostPerkOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3.5 text-sm font-black text-black shadow-lg shadow-emerald-500/25 transition hover:brightness-110 active:scale-95 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>{t("couponHub.launch")}</span>
              </button>

              <Link
                to="/staff/scanner"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 px-6 py-3.5 text-sm font-bold text-white transition active:scale-95"
              >
                <QrCode className="h-4 w-4 text-emerald-400" />
                <span>{t("couponHub.scanner")}</span>
              </Link>
            </div>
          </div>
        </header>

        {/* INTERACTIVE ROI CALCULATOR GRID */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          
          {/* CALCULATOR INPUTS */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <div className="flex items-center gap-2 text-emerald-400 mb-6">
              <Calculator className="h-5 w-5" />
              <h2 className="text-xl font-black text-white">{t("couponHub.calcTitle")}</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase text-white/70">{t("couponHub.avgPrice")}</label>
                <input
                  type="number"
                  value={productPrice}
                  onChange={(e) => setProductPrice(Number(e.target.value))}
                  className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-lg font-mono text-emerald-400 focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-white/70">{t("couponHub.targetCustomers")}</label>
                <input
                  type="number"
                  value={targetOrders}
                  onChange={(e) => setTargetOrders(Number(e.target.value))}
                  className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-lg font-mono text-emerald-400 focus:border-emerald-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-300">
              <span className="font-bold">{t("couponHub.zeroRisk")}</span> {t("couponHub.zeroRiskCopy")} <span className="font-mono font-bold text-white">$0.00</span>.
            </div>
          </div>

          {/* CALCULATOR BREAKDOWN */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-white/50">{t("couponHub.outcomes")}</span>
              <h3 className="mt-2 text-3xl font-black text-[#10B981]">{t("couponHub.netRevenue", { amount: `$${formatNumber(netRevenue, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` })}</h3>
              <p className="mt-1 text-xs text-white/60">{t("couponHub.cashCopy")}</p>

              <div className="mt-8 space-y-4 border-t border-white/10 pt-6">
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">{t("couponHub.upfront")}</span>
                  <span className="font-mono font-bold text-[#10B981]">$0.00 USD</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">{t("couponHub.gross")}</span>
                  <span className="font-mono font-bold text-white">${grossRevenue.toLocaleString()} USD</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">{t("couponHub.fee")}</span>
                  <span className="font-mono font-bold text-white/60">-${platformFee.toLocaleString()} USD</span>
                </div>
              </div>
            </div>

            <button className="mt-8 w-full rounded-xl bg-emerald-500 py-3.5 text-sm font-black text-black transition hover:bg-emerald-400">
              {t("couponHub.claimBonus")}
            </button>
          </div>
        </div>

        {/* ACTIVE MERCHANT PERFORMANCE METRICS */}
        <section className="mt-12 rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">{t("couponHub.storePerf")}</p>
              <h2 className="text-2xl font-black text-white">{t("couponHub.liveMetrics")}</h2>
            </div>
            <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400">{t("couponHub.conversion", { pct: "54.9" })}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <span className="text-xs text-white/60">{t("couponHub.issued")}</span>
              <p className="mt-1 text-2xl font-black text-white">500</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <span className="text-xs text-white/60">{t("couponHub.claimed")}</span>
              <p className="mt-1 text-2xl font-black text-white">342</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <span className="text-xs text-white/60">{t("couponHub.redeemed")}</span>
              <p className="mt-1 text-2xl font-black text-emerald-400">188</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <span className="text-xs text-white/60">{t("couponHub.netSales")}</span>
              <p className="mt-1 text-2xl font-black text-[#10B981]">$8,460.00</p>
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

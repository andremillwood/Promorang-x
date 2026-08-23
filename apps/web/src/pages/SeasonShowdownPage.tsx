import { useState } from "react";
import { Sparkles, Trophy, Users, DollarSign, Award, ArrowUpRight, ShieldCheck, Flame, Layers } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";

export default function SeasonShowdownPage() {
  const { t, formatNumber } = useI18n();
  const [seasons] = useState([
    {
      id: "hub-001",
      title: "Tech Unboxed Season 1",
      director: "Alex Tech (Director)",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      category: "Tech",
      themeColor: "from-purple-600 to-indigo-600",
      totalBudget: "$12,500 USD",
      directorShare: "$10,000 USD (80%)",
      completers: 4250,
      dropsCount: 14
    },
    {
      id: "hub-002",
      title: "Fitness & Fuel Season 2",
      director: "Katrina Fit (Director)",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
      category: "Fitness",
      themeColor: "from-pink-600 to-rose-600",
      totalBudget: "$9,000 USD",
      directorShare: "$7,200 USD (80%)",
      completers: 3100,
      dropsCount: 10
    },
    {
      id: "hub-003",
      title: "Gamer Grind & Drops",
      director: "Marcus Gaming (Director)",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      category: "Gaming",
      themeColor: "from-emerald-600 to-teal-600",
      totalBudget: "$15,000 USD",
      directorShare: "$12,000 USD (80%)",
      completers: 5800,
      dropsCount: 18
    }
  ]);

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* HERO SECTION */}
        <header className="relative overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-900/20 via-black to-indigo-950/20 px-6 py-10 sm:px-10">
          <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-purple-500/20 blur-3xl" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/40 bg-purple-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-purple-300">
              <Trophy className="h-4 w-4 text-purple-400" />
              {t("seasonShowdownPage.badge")}
            </div>

            <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-tight sm:text-6xl text-white">
              {t("seasonShowdownPage.heroTitle1")} <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
                {t("seasonShowdownPage.heroTitle2")}
              </span>
            </h1>

            <p className="mt-4 max-w-2xl text-base text-white/70">
              {t("seasonShowdownPage.heroSubtitle")}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-purple-500/25 transition hover:brightness-110 active:scale-95">
                {t("seasonShowdownPage.applyStatus")}
                <ArrowUpRight className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-2 text-xs text-white/60 px-4 py-3 border border-white/10 rounded-xl bg-white/5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" /> {t("seasonShowdownPage.escrowGuaranteed")}
              </div>
            </div>
          </div>
        </header>

        {/* VALUE EQUATION & REVENUE SPLIT CARDS */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-center gap-3 text-purple-400">
              <DollarSign className="h-6 w-6" />
              <span className="text-xs font-bold uppercase tracking-wider text-white/50">{t("seasonShowdownPage.revenueSplit")}</span>
            </div>
            <h3 className="mt-3 text-2xl font-black text-white">{t("seasonShowdownPage.revenueSplitRatio")}</h3>
            <p className="mt-1 text-xs text-white/60">{t("seasonShowdownPage.revenueSplitDesc")}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-center gap-3 text-pink-400">
              <Layers className="h-6 w-6" />
              <span className="text-xs font-bold uppercase tracking-wider text-white/50">{t("seasonShowdownPage.turnkeyTemplates")}</span>
            </div>
            <h3 className="mt-3 text-2xl font-black text-white">{t("seasonShowdownPage.turnkeyDrops")}</h3>
            <p className="mt-1 text-xs text-white/60">{t("seasonShowdownPage.turnkeyDesc")}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-center gap-3 text-emerald-400">
              <Flame className="h-6 w-6" />
              <span className="text-xs font-bold uppercase tracking-wider text-white/50">{t("seasonShowdownPage.downsideGuarantee")}</span>
            </div>
            <h3 className="mt-3 text-2xl font-black text-white">{t("seasonShowdownPage.zeroCapitalRisk")}</h3>
            <p className="mt-1 text-xs text-white/60">{t("seasonShowdownPage.downsideDesc")}</p>
          </div>
        </div>

        {/* ACTIVE SEASONS SHOWCASE */}
        <section className="mt-12">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-purple-400">{t("seasonShowdownPage.activeOperatorHubs")}</p>
              <h2 className="text-2xl font-black text-white">{t("seasonShowdownPage.leaderboardTitle")}</h2>
            </div>
            <span className="text-xs text-white/50">{t("seasonShowdownPage.activeDirectorsCount", { count: formatNumber(3) })}</span>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {seasons.map((s) => (
              <div key={s.id} className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] transition hover:border-purple-500/50 hover:bg-white/[0.05]">
                <div className={`h-24 bg-gradient-to-r ${s.themeColor} p-4 flex items-end justify-between`}>
                  <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">
                    {s.category}
                  </span>
                  <span className="text-xs font-mono font-bold text-white/90">{t("seasonShowdownPage.activeDropsCount", { count: formatNumber(s.dropsCount) })}</span>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-3">
                    <img src={s.avatar} alt={s.director} className="h-10 w-10 rounded-full border border-white/20 object-cover" />
                    <div>
                      <h3 className="font-black text-white">{s.title}</h3>
                      <p className="text-xs text-white/60">{s.director}</p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3 border-t border-white/10 pt-4 text-xs">
                    <div className="flex justify-between">
                      <span className="text-white/60">{t("seasonShowdownPage.totalBrandBudget")}</span>
                      <span className="font-mono font-bold text-white">{s.totalBudget}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">{t("seasonShowdownPage.directorNetEarnings")}</span>
                      <span className="font-mono font-bold text-emerald-400">{s.directorShare}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">{t("seasonShowdownPage.totalCompleters")}</span>
                      <span className="font-bold text-purple-300">{t("seasonShowdownPage.completersUsers", { count: formatNumber(s.completers) })}</span>
                    </div>
                  </div>

                  <button className="mt-6 w-full rounded-xl border border-purple-500/30 bg-purple-500/10 py-2.5 text-xs font-bold text-purple-300 transition hover:bg-purple-500/20">
                    {t("seasonShowdownPage.exploreHubDrops")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}


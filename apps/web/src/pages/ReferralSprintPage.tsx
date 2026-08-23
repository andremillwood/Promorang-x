import { useState } from "react";
import { Sparkles, Trophy, Gift, Share2, Copy, CheckCircle, ShieldCheck, Zap, Flame, Clock } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";

export default function ReferralSprintPage() {
  const { t, formatNumber } = useI18n();
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
                {t("referralSprintPage.badge")}
              </div>

              {/* Countdown */}
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-white/80">
                <Clock className="h-4 w-4 text-[#FF6A00]" />
                {t("referralSprintPage.sprintClosesIn")} <span className="font-mono text-[#FFC300] font-bold">02d : 14h : 38m</span>
              </div>
            </div>

            <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-tight sm:text-6xl text-white">
              {t("referralSprintPage.heroTitle1")} <br />
              <span className="bg-gradient-to-r from-[#FF6A00] to-[#FFC300] bg-clip-text text-transparent">
                {t("referralSprintPage.heroTitle2")}
              </span>
            </h1>

            <p className="mt-4 max-w-2xl text-base text-white/70">
              {t("referralSprintPage.heroSubtitle")}
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
                  {copied ? t("referralSprintPage.passCopied") : t("referralSprintPage.copyPassLink")}
                </button>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-white/60">
                <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-[#10B981]" /> {t("referralSprintPage.cashBackedNotice")}</span>
                <span className="inline-flex items-center gap-1.5"><Zap className="h-4 w-4 text-[#FFC300]" /> {t("referralSprintPage.vipPassesRemaining")}</span>
              </div>
            </div>
          </div>
        </header>

        {/* PROGRESS & VALUE STACK GRID */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          {/* TIER PROGRESS CARD */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-[#FF6A00]">{t("referralSprintPage.sprintStatus")}</span>
              <span className="rounded-full bg-[#FF6A00]/20 px-3 py-1 text-xs font-bold text-[#FFC300]">{t("referralSprintPage.silverTier")}</span>
            </div>

            <h3 className="mt-4 text-3xl font-black text-white">{t("referralSprintPage.invitesCount", { current: formatNumber(referralCount), target: formatNumber(targetCount) })}</h3>
            <p className="mt-1 text-xs text-white/60">{t("referralSprintPage.invitesToGold", { count: formatNumber(targetCount - referralCount) })}</p>

            {/* Progress Bar */}
            <div className="mt-6 h-3 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-gradient-to-r from-[#FF6A00] to-[#FFC300] transition-all duration-500"
                style={{ width: `${Math.min(100, (referralCount / targetCount) * 100)}%` }}
              />
            </div>

            <div className="mt-8 space-y-4 border-t border-white/10 pt-6">
              <div className="flex justify-between text-sm">
                <span className="text-white/70">{t("referralSprintPage.withdrawableCashEarnings")}</span>
                <span className="font-mono font-bold text-[#10B981]">$145.50 USD</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/70">{t("referralSprintPage.gemsBalanceLabel")}</span>
                <span className="font-mono font-bold text-[#FFC300]">145.5 Gems</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/70">{t("referralSprintPage.currentSplitRate")}</span>
                <span className="font-bold text-white">6.0% (Silver)</span>
              </div>
            </div>
          </div>

          {/* GRAND SLAM VALUE STACK */}
          <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-white">{t("referralSprintPage.unlockedBonusStack")}</h3>
              <span className="text-xs font-bold text-[#FFC300]">{t("referralSprintPage.totalPerceivedValue")}</span>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span>{t("referralSprintPage.feeWaiver")}</span>
                  <span className="font-mono font-bold text-[#10B981]">{t("referralSprintPage.feeWaiverValue")}</span>
                </div>
                <h4 className="mt-2 text-sm font-bold text-white">{t("referralSprintPage.feeWaiverTitle")}</h4>
                <p className="mt-1 text-xs text-white/50">{t("referralSprintPage.feeWaiverDesc")}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span>{t("referralSprintPage.priorityQueue")}</span>
                  <span className="font-mono font-bold text-[#10B981]">{t("referralSprintPage.priorityQueueValue")}</span>
                </div>
                <h4 className="mt-2 text-sm font-bold text-white">{t("referralSprintPage.priorityQueueTitle")}</h4>
                <p className="mt-1 text-xs text-white/50">{t("referralSprintPage.priorityQueueDesc")}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span>{t("referralSprintPage.vipVault")}</span>
                  <span className="font-mono font-bold text-[#10B981]">{t("referralSprintPage.vipVaultValue")}</span>
                </div>
                <h4 className="mt-2 text-sm font-bold text-white">{t("referralSprintPage.vipVaultTitle")}</h4>
                <p className="mt-1 text-xs text-white/50">{t("referralSprintPage.vipVaultDesc")}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span>{t("referralSprintPage.zeroRiskGuarantee")}</span>
                  <span className="font-mono font-bold text-[#10B981]">{t("referralSprintPage.zeroRiskValue")}</span>
                </div>
                <h4 className="mt-2 text-sm font-bold text-white">{t("referralSprintPage.zeroRiskTitle")}</h4>
                <p className="mt-1 text-xs text-white/50">{t("referralSprintPage.zeroRiskDesc")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* LEADERBOARD TABLE */}
        <section className="mt-12 rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#FF6A00]">{t("referralSprintPage.topPerformers")}</p>
              <h2 className="text-2xl font-black text-white">{t("referralSprintPage.leaderboardTitle")}</h2>
            </div>
            <span className="text-xs text-white/50">{t("referralSprintPage.liveUpdates")}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 text-xs font-bold uppercase text-white/50">
                <tr>
                  <th className="pb-3">{t("referralSprintPage.thRank")}</th>
                  <th className="pb-3">{t("referralSprintPage.thMember")}</th>
                  <th className="pb-3">{t("referralSprintPage.thInvites")}</th>
                  <th className="pb-3">{t("referralSprintPage.thCurrentTier")}</th>
                  <th className="pb-3">{t("referralSprintPage.thWithdrawableCash")}</th>
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


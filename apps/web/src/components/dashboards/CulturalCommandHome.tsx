import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Calendar,
  Check,
  ChevronRight,
  Compass,
  Flame,
  Gem,
  Gift,
  HelpCircle,
  KeyRound,
  MapPin,
  Plus,
  Radio,
  Share2,
  Sparkles,
  Target,
  Ticket,
  Trophy,
  Zap,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useJoinedMoments, useHostedMoments, useParticipantStats } from "@/hooks/useMoments";
import { useUserBalance } from "@/hooks/useEconomy";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/I18nContext";
import { ShareButton } from "@/components/ShareButton";
import { DailyRewardsModal } from "@/components/DailyRewardsModal";
import { CURATED_KINGSTON_MOMENTS } from "@/lib/curated-radar";
const WEEKLY_STAGE = [
  { dayKey: "opsWeek.sun.day", phaseKey: "cultDesk.phase.sun", tagKey: "cultDesk.tag.sun", icon: Sparkles, color: "text-purple-400 bg-purple-500/10 border-purple-500/30" },
  { dayKey: "opsWeek.mon.day", phaseKey: "cultDesk.phase.mon", tagKey: "cultDesk.tag.mon", icon: Zap, color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
  { dayKey: "opsWeek.tue.day", phaseKey: "cultDesk.phase.tue", tagKey: "cultDesk.tag.tue", icon: Trophy, color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30" },
  { dayKey: "opsWeek.wed.day", phaseKey: "cultDesk.phase.wed", tagKey: "cultDesk.tag.wed", icon: Flame, color: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
  { dayKey: "opsWeek.thu.day", phaseKey: "cultDesk.phase.thu", tagKey: "cultDesk.tag.thu", icon: Sparkles, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
  { dayKey: "opsWeek.fri.day", phaseKey: "cultDesk.phase.fri", tagKey: "cultDesk.tag.fri", icon: Gem, color: "text-primary bg-primary/10 border-primary/30" },
  { dayKey: "opsWeek.sat.day", phaseKey: "cultDesk.phase.sat", tagKey: "cultDesk.tag.sat", icon: Ticket, color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
] as const;

export function CulturalCommandHome() {
  const { t, formatNumber } = useI18n();
  const { user } = useAuth();
  const { data: balance } = useUserBalance();
  const { data: stats } = useParticipantStats();
  const { data: joinedMoments = [] } = useJoinedMoments();
  const { data: hostedMoments = [] } = useHostedMoments();
  const [showDailyRewards, setShowDailyRewards] = useState(false);

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || t("cultDesk.explorer");
  const opsStage = WEEKLY_STAGE[new Date().getDay()];

  // Prioritize joined upcoming moment or top curated moment
  const upcomingMoment = useMemo(() => {
    const userUpcoming = joinedMoments.find((m) => new Date(m.starts_at) > new Date());
    if (userUpcoming) return userUpcoming;

    const curated = CURATED_KINGSTON_MOMENTS[0];
    return {
      id: curated.id,
      title: curated.title,
      description: curated.description,
      venue_name: curated.venueName,
      location: curated.location,
      starts_at: new Date().toISOString(),
      image_url: curated.image,
      reward: t("cultDesk.points", { count: curated.pointsReward }),
      category: t("cultDesk.featured"),
    };
  }, [joinedMoments, t]);

  const curatedMoments = useMemo(() => {
    return CURATED_KINGSTON_MOMENTS.slice(1, 4);
  }, []);

  const metricCards = [
    { label: t("cultDesk.metricShowed"), value: stats?.checkedIn || 0, detail: t("cultDesk.metricShowedHint"), icon: Check, href: "/profile" },
    { label: t("cultDesk.metricGems"), value: balance?.gems || 0, detail: t("cultDesk.metricGemsHint"), icon: Gem, href: "/wallet" },
    { label: t("cultDesk.metricKeys"), value: balance?.promokeys || 0, detail: t("cultDesk.metricKeysHint"), icon: KeyRound, href: "/wallet" },
    { label: t("cultDesk.metricPts"), value: balance?.points || 0, detail: t("cultDesk.metricPtsHint"), icon: Sparkles, href: "/rewards" },
  ];

  return (
    <div className="space-y-6 text-white pb-12 animate-in fade-in-50 duration-300">
      {/* 1. Header Greeting, Ops Theatre Stage & Live Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl border border-white/10 bg-gradient-to-r from-white/[0.04] via-white/[0.02] to-transparent backdrop-blur-xl">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center text-black font-black shadow-lg shadow-primary/20 shrink-0">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">
                {t("commandHome.welcome", { name: firstName })}
              </h1>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-wider ${opsStage.color}`}>
                <opsStage.icon className="h-3 w-3" />
                <span>{t(opsStage.dayKey)}: {t(opsStage.phaseKey)}</span>
              </span>
            </div>
            <p className="text-xs text-white/60 mt-0.5">
              {t("cultDesk.opsHint")}
            </p>
          </div>
        </div>

        {/* Quick Balance Pills */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          <Link
            to="/wallet"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border border-white/10 bg-white/5 hover:border-primary/40 hover:bg-white/10 transition"
          >
            <Gem className="h-4 w-4 text-primary" />
            <span className="text-sm font-black text-white">{balance?.gems || 0}</span>
            <span className="text-[10px] text-white/50 font-bold uppercase">{t("cultDesk.gems")}</span>
          </Link>

          <Link
            to="/wallet"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border border-white/10 bg-white/5 hover:border-amber-400/40 hover:bg-white/10 transition"
          >
            <KeyRound className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-black text-white">{balance?.promokeys || 0}</span>
            <span className="text-[10px] text-white/50 font-bold uppercase">{t("cultDesk.keys")}</span>
          </Link>
        </div>
      </div>

      {/* 2. Personal Success Journey Runway (Compact Guided Milestone Bar) */}
      <div className="p-4 sm:p-5 rounded-3xl border border-primary/25 bg-gradient-to-r from-primary/10 via-black to-black text-xs text-white/80 space-y-3 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-primary text-black font-black text-[10px] uppercase tracking-wider">
              {t("cultDesk.level1")}
            </span>
            <span className="font-bold text-white text-xs sm:text-sm">
              {t("cultDesk.pathTitle")}
            </span>
          </div>
          <span className="text-[11px] text-white/50 font-medium">
            {t("cultDesk.pathSteps")}
          </span>
        </div>

        {/* 3 Clickable Action Runway Chips */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <Link
            to="/discover"
            className="p-2.5 rounded-2xl border border-white/10 bg-white/[0.03] hover:border-primary/40 hover:bg-white/[0.06] transition flex items-center justify-between group"
          >
            <div className="flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[10px]">1</span>
              <div>
                <p className="font-bold text-white text-[11px]">{t("cultDesk.step1")}</p>
                <p className="text-[10px] text-emerald-400 font-semibold">{t("cultDesk.step1Pts")}</p>
              </div>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-white/30 group-hover:text-primary transition" />
          </Link>

          <Link
            to="/missions"
            className="p-2.5 rounded-2xl border border-white/10 bg-white/[0.03] hover:border-amber-400/40 hover:bg-white/[0.06] transition flex items-center justify-between group"
          >
            <div className="flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold text-[10px]">2</span>
              <div>
                <p className="font-bold text-white text-[11px]">{t("cultDesk.step2")}</p>
                <p className="text-[10px] text-amber-300 font-semibold">{t("cultDesk.step2Pts")}</p>
              </div>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-white/30 group-hover:text-amber-400 transition" />
          </Link>

          <Link
            to="/discover"
            className="p-2.5 rounded-2xl border border-white/10 bg-white/[0.03] hover:border-cyan-400/40 hover:bg-white/[0.06] transition flex items-center justify-between group"
          >
            <div className="flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-cyan-400/20 text-cyan-400 flex items-center justify-center font-bold text-[10px]">3</span>
              <div>
                <p className="font-bold text-white text-[11px]">{t("cultDesk.step3")}</p>
                <p className="text-[10px] text-cyan-300 font-semibold">{t("cultDesk.step3Pts")}</p>
              </div>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-white/30 group-hover:text-cyan-400 transition" />
          </Link>
        </div>
      </div>

      {/* 3. The 4 Operational Arenas (Balanced 4-Card Hub) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Arena 1: Ops Theatre / Live Moments */}
        <Link
          to="/discover"
          className="group p-5 rounded-3xl border border-white/10 bg-white/[0.03] hover:border-primary/40 hover:bg-white/[0.06] transition duration-200 flex flex-col justify-between min-h-[145px]"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-2xl bg-primary/10 border border-primary/20 text-primary group-hover:scale-105 transition">
              <Ticket className="h-5 w-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-[10px]">
              {t("cultDesk.arenaLive")}
            </span>
          </div>
          <div>
            <h3 className="font-bold text-sm text-white group-hover:text-primary transition">
              {t("cultDesk.arena1")}
            </h3>
            <p className="text-xs text-white/50 mt-0.5">
              {t("cultDesk.arena1Desc")}
            </p>
          </div>
        </Link>

        {/* Arena 2: Community Polls & Discoveries */}
        <Link
          to="/discover"
          className="group p-5 rounded-3xl border border-white/10 bg-white/[0.03] hover:border-amber-400/40 hover:bg-white/[0.06] transition duration-200 flex flex-col justify-between min-h-[145px]"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400 group-hover:scale-105 transition">
              <HelpCircle className="h-5 w-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-400 font-bold text-[10px]">
              {t("cultDesk.arenaVote")}
            </span>
          </div>
          <div>
            <h3 className="font-bold text-sm text-white group-hover:text-amber-400 transition">
              {t("cultDesk.arena2")}
            </h3>
            <p className="text-xs text-white/50 mt-0.5">
              {t("cultDesk.arena2Desc")}
            </p>
          </div>
        </Link>

        {/* Arena 3: Missions & Proof Runway */}
        <Link
          to="/missions"
          className="group p-5 rounded-3xl border border-white/10 bg-white/[0.03] hover:border-cyan-400/40 hover:bg-white/[0.06] transition duration-200 flex flex-col justify-between min-h-[145px]"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-2xl bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 group-hover:scale-105 transition">
              <Target className="h-5 w-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-400 font-bold text-[10px]">
              {t("cultDesk.arenaBounties")}
            </span>
          </div>
          <div>
            <h3 className="font-bold text-sm text-white group-hover:text-cyan-400 transition">
              {t("cultDesk.arena3")}
            </h3>
            <p className="text-xs text-white/50 mt-0.5">
              {t("cultDesk.arena3Desc")}
            </p>
          </div>
        </Link>

        {/* Arena 4: PromoShare & The Vault */}
        <Link
          to="/wallet"
          className="group p-5 rounded-3xl border border-white/10 bg-white/[0.03] hover:border-emerald-400/40 hover:bg-white/[0.06] transition duration-200 flex flex-col justify-between min-h-[145px]"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-2xl bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 group-hover:scale-105 transition">
              <Gem className="h-5 w-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-400 font-bold text-[10px]">
              {t("cultDesk.arenaEarn")}
            </span>
          </div>
          <div>
            <h3 className="font-bold text-sm text-white group-hover:text-emerald-400 transition">
              {t("cultDesk.arena4")}
            </h3>
            <p className="text-xs text-white/50 mt-0.5">
              {t("cultDesk.arena4Desc")}
            </p>
          </div>
        </Link>
      </div>

      {/* 4. Hero Focus: Today's Stage Spotlight */}
      <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-[#111216] shadow-2xl">
        <div className="grid lg:grid-cols-12 min-h-[300px]">
          {/* Image preview banner */}
          <div className="lg:col-span-5 relative min-h-[220px] lg:min-h-full">
            <img
              src={upcomingMoment.image_url || "/og-image.png"}
              alt={upcomingMoment.title}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 rounded-full bg-primary/90 text-black font-black text-[10px] uppercase tracking-wider shadow-md">
                {upcomingMoment.category}
              </span>
            </div>
          </div>

          {/* Details & Action */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-widest text-primary">
                {t("cultDesk.tonight")}
              </p>
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {upcomingMoment.title}
              </h2>
              <p className="text-xs sm:text-sm text-white/70 line-clamp-2">
                {upcomingMoment.description}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-white/75 pt-2 border-t border-white/10">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span>{upcomingMoment.venue_name || upcomingMoment.location}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-amber-400 shrink-0" />
                <span>{t("cultDesk.startsTonight")}</span>
              </div>
              {upcomingMoment.reward && (
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-[11px]">
                  <span>{t("cultDesk.earnReward", { reward: upcomingMoment.reward })}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                asChild
                size="lg"
                className="h-12 px-6 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-sm shadow-[0_0_20px_rgba(255,106,0,0.35)]"
              >
                <Link to={`/moments/${upcomingMoment.id}`}>
                  <span>{t("cultDesk.enter")}</span>
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <ShareButton
                title={upcomingMoment.title}
                url={`https://www.promorang.co/moments/${upcomingMoment.id}`}
                description={t("cultDesk.shareDesc")}
                className="h-12 px-5 rounded-2xl border-white/15 bg-white/5 hover:bg-white/10 text-white font-bold text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 5. Value Canon & Activity Metrics */}
      <div className="p-6 rounded-3xl border border-white/10 bg-black/40 backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/50">
            {t("cultDesk.canon")}
          </p>
          <Link to="/wallet" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
            <span>{t("cultDesk.openVault")}</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {metricCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.label}
                to={card.href}
                className="p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-white/20 transition group flex flex-col justify-between min-h-[100px]"
              >
                <div className="flex items-center justify-between">
                  <span className="p-1.5 rounded-xl bg-white/5 text-white/70 group-hover:text-primary transition">
                    <Icon className="h-4 w-4" />
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-white/20 group-hover:text-white/60 transition" />
                </div>
                <div>
                  <p className="text-2xl font-black text-white">{formatNumber(card.value)}</p>
                  <p className="text-xs font-bold text-white/70">{card.label}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 6. Recommended Moments for Tonight */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-white">{t("cultDesk.recTitle")}</h2>
            <p className="text-xs text-white/50">{t("cultDesk.recSub")}</p>
          </div>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-xs font-bold text-primary hover:text-primary/80"
          >
            <Link to="/discover">
              <span>{t("cultDesk.viewAll")}</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {curatedMoments.map((moment) => (
            <Link
              key={moment.id}
              to={`/moments/${moment.id}`}
              className="group relative rounded-3xl border border-white/10 bg-[#121316] overflow-hidden p-5 flex flex-col justify-between min-h-[220px] transition hover:border-primary/40 hover:scale-[1.01]"
            >
              <img
                src={moment.image}
                alt={moment.title}
                className="absolute inset-0 h-full w-full object-cover opacity-35 group-hover:opacity-50 transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

              <div className="relative z-10 flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-bold text-white">
                  {moment.intentType === "ATTEND" ? t("cultDesk.music") : t("cultDesk.food")}
                </span>
                <span className="h-7 w-7 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-primary group-hover:text-black transition">
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>

              <div className="relative z-10 space-y-1">
                <h3 className="text-base font-black text-white group-hover:text-primary transition leading-tight line-clamp-1">
                  {moment.title}
                </h3>
                <p className="text-xs text-white/60 flex items-center gap-1.5">
                  <MapPin className="h-3 w-3 text-primary shrink-0" />
                  <span className="truncate">{moment.venueName}</span>
                </p>
                <div className="pt-2">
                  <span className="text-[11px] font-extrabold text-emerald-400">
                    {t("cultDesk.earnPts", { count: moment.pointsReward })}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Daily Rewards Modal */}
      <DailyRewardsModal
        isOpen={showDailyRewards}
        onClose={() => setShowDailyRewards(false)}
      />
    </div>
  );
}

export default CulturalCommandHome;

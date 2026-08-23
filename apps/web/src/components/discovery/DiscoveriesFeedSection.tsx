import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Compass,
  Plus,
  MapPin,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Flame,
  CheckCircle2,
  Gift,
  Users,
  Award,
  ChevronRight,
  ShieldCheck,
  Zap,
  CalendarCheck,
} from "lucide-react";
import { formatDiscoveryCategory, discoveryLocation } from "@promorang/shared";
import { useDiscoveries } from "@/hooks/useDiscoveries";
import { SubmitDiscoveryModal } from "./SubmitDiscoveryModal";
import { AskQuestionModal } from "./AskQuestionModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useUserBalance } from "@/hooks/useEconomy";
import { DISCOVERY_POLLS, type DiscoveryPoll } from "@/data/discoveriesData";
import { toast } from "sonner";
import { castListingDiscoveryVote, useListingDiscoveryPolls } from "@/hooks/useListingDiscoveryPolls";

import { useI18n } from "@/i18n/I18nContext";

export function DiscoveriesFeedSection() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { data: balance } = useUserBalance();
  const { data: discoveries, isLoading: isDiscoveriesLoading } = useDiscoveries({ limit: 6 });
  const { data: listingPolls = [] } = useListingDiscoveryPolls(6);

  const [activeTab, setActiveTab] = useState<"polls" | "discoveries" | "my_scout">("polls");
  const [polls, setPolls] = useState<DiscoveryPoll[]>(DISCOVERY_POLLS);
  useEffect(() => {
    if (listingPolls.length) {
      setPolls([...listingPolls, ...DISCOVERY_POLLS].slice(0, 9));
    }
  }, [listingPolls]);
  const [userVotes, setUserVotes] = useState<Record<string, string>>({
    "disc-arla-price-003": "opt-p2", // default sample vote state
  });

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Scout";
  const userPoints = balance?.points || 420;
  const userKeys = balance?.promokeys || 3;

  const handleVote = async (pollId: string, optionId: string, pointsReward: number) => {
    if (userVotes[pollId]) {
      toast.info("You have already cast your vote on this ballot.");
      return;
    }

    const targetPoll = polls.find((poll) => poll.id === pollId);
    if (targetPoll?.detailUrl) {
      if (!user) {
        toast.info("Sign in to verify local place information.");
        return;
      }
      try {
        await castListingDiscoveryVote(pollId, optionId);
      } catch (error: any) {
        toast.error(error?.message?.includes("duplicate") ? "You already voted on this place." : "We couldn't record that vote.");
        return;
      }
    }

    setUserVotes((prev) => ({ ...prev, [pollId]: optionId }));
    setPolls((prevPolls) =>
      prevPolls.map((p) => {
        if (p.id === pollId) {
          return {
            ...p,
            totalVotes: p.totalVotes + 1,
            options: p.options.map((opt) =>
              opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
            ),
          };
        }
        return p;
      })
    );

    toast.success(targetPoll?.detailUrl ? "Place signal recorded." : `Vote cast! +${pointsReward} PromoPoints added to your account.`, {
      description: targetPoll?.detailUrl ? "Your vote now guides the linked Scout proof missions." : "Community unlock threshold updated in real-time.",
    });
  };

  const totalPollsCount = polls.length;
  const votedCount = Object.keys(userVotes).length;

  return (
    <section className="my-6 sm:my-10 rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-black/40 p-4 sm:p-6 md:p-8 backdrop-blur-md shadow-2xl relative overflow-hidden">
      {/* Background glow effects */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-60 w-60 sm:h-72 sm:w-72 rounded-full bg-primary/10 blur-[80px] sm:blur-[100px]" />
      <div className="pointer-events-none absolute -right-32 -bottom-32 h-60 w-60 sm:h-72 sm:w-72 rounded-full bg-amber-500/10 blur-[80px] sm:blur-[100px]" />

      {/* Header section with Scout Network identity */}
      <div className="flex flex-col gap-4 sm:gap-6 border-b border-white/10 pb-5 sm:pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-primary">
            <Compass className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> {t("home.scoutNetworkEyebrow")}
          </div>
          <h2 className="mt-1 font-serif text-xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white">
            {t("home.scoutNetworkTitle")}
          </h2>
          <Link to="/scout/events" className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline">{t("home.scoutNetworkVerify")} <CalendarCheck className="h-4 w-4" /></Link>
          <p className="mt-1 max-w-2xl text-xs sm:text-sm text-white/60 leading-relaxed">
            {t("home.scoutNetworkCopy")}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
          <AskQuestionModal
            trigger={
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 rounded-full border-white/20 bg-white/5 text-[11px] sm:text-xs font-bold text-white hover:border-primary/50 hover:bg-primary/10 h-9 px-3.5"
              >
                <HelpCircle className="h-3.5 w-3.5 text-primary" />
                <span>{t("home.proposeBallot")}</span>
                <span className="text-amber-400 font-mono text-[10px]">(+50)</span>
              </Button>
            }
          />
          <SubmitDiscoveryModal
            trigger={
              <Button
                size="sm"
                className="gap-1.5 rounded-full bg-primary px-3.5 sm:px-4 font-bold text-black hover:bg-orange-400 transition-transform active:scale-95 shadow-lg shadow-primary/20 h-9 text-[11px] sm:text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{t("home.submitFind")}</span>
                <span className="font-mono text-[10px]">(+100)</span>
              </Button>
            }
          />
        </div>
      </div>

      {/* Signed-in Scout Recognition Banner */}
      {user ? (
        <div className="mt-4 sm:mt-5 flex flex-col gap-3.5 rounded-2xl border border-primary/20 bg-primary/5 p-3.5 sm:p-4 backdrop-blur-md md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-amber-300 text-xs sm:text-sm font-black text-black ring-2 ring-primary/40">
              {firstName[0].toUpperCase()}
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 sm:h-3.5 sm:w-3.5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-black">
                <CheckCircle2 className="h-2 w-2 sm:h-2.5 sm:w-2.5 text-black stroke-[3]" />
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-white truncate">Scout {firstName}</span>
                <Badge className="border-amber-400/30 bg-amber-500/20 text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-amber-300 shrink-0">
                  {t("scout.pioneerTier")}
                </Badge>
              </div>
              <p className="text-[11px] sm:text-xs text-white/50 truncate">
                <span className="font-bold text-primary">{votedCount} {t("scout.ballots")}</span> • <span className="font-bold text-amber-300">+{votedCount * 35} pts</span> {t("scout.rewards")}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4 text-xs">
            <div className="flex-1 sm:flex-initial rounded-xl border border-white/10 bg-black/40 px-2.5 sm:px-3 py-1.5 text-center">
              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-white/40 block">{t("scout.points")}</span>
              <span className="font-mono font-bold text-amber-400 text-xs sm:text-sm">{userPoints} PTS</span>
            </div>
            <div className="flex-1 sm:flex-initial rounded-xl border border-white/10 bg-black/40 px-2.5 sm:px-3 py-1.5 text-center">
              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-white/40 block">{t("scout.keys")}</span>
              <span className="font-mono font-bold text-cyan-400 text-xs sm:text-sm">{userKeys} KEYS</span>
            </div>
            <Link
              to="/growth"
              className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-2.5 sm:px-3 py-2 font-bold text-white/80 hover:border-primary/40 hover:text-white transition text-xs shrink-0"
            >
              <span>{t("scout.rank")}</span> <ArrowRight className="h-3 w-3 text-primary" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-4 sm:mt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3.5 sm:p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">{t("scout.demandEngineTitle")}</p>
              <p className="text-[10px] sm:text-[11px] text-white/60">{t("scout.demandEngineCopy")}</p>
            </div>
          </div>
          <Link
            to="/auth"
            className="w-full sm:w-auto text-center rounded-full bg-white/10 px-4 py-2 sm:py-1.5 text-xs font-bold text-white hover:bg-primary hover:text-black transition shrink-0"
          >
            {t("scout.signInToVote")}
          </Link>
        </div>
      )}

      {/* Navigation Tabs - Horizontal scrolling with no scrollbar */}
      <div className="mt-5 sm:mt-6 flex items-center justify-between gap-3 border-b border-white/5 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none max-w-full">
          <button
            onClick={() => setActiveTab("polls")}
            className={`flex items-center gap-1.5 sm:gap-2 rounded-xl px-3 sm:px-4 py-2 text-xs font-bold transition shrink-0 ${
              activeTab === "polls"
                ? "bg-primary text-black shadow-lg shadow-primary/20"
                : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Flame className="h-3.5 w-3.5" />
            <span>{t("scout.demandSignals")}</span>
            <span className={`ml-0.5 rounded-full px-1.5 py-0.2 text-[9px] font-black ${
              activeTab === "polls" ? "bg-black text-primary" : "bg-white/10 text-white/60"
            }`}>
              {totalPollsCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("discoveries")}
            className={`flex items-center gap-1.5 sm:gap-2 rounded-xl px-3 sm:px-4 py-2 text-xs font-bold transition shrink-0 ${
              activeTab === "discoveries"
                ? "bg-primary text-black shadow-lg shadow-primary/20"
                : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Compass className="h-3.5 w-3.5" />
            <span>{t("scout.scoutFinds")}</span>
            <span className={`ml-0.5 rounded-full px-1.5 py-0.2 text-[9px] font-black ${
              activeTab === "discoveries" ? "bg-black text-primary" : "bg-white/10 text-white/60"
            }`}>
              {discoveries?.length || 6}
            </span>
          </button>

          {user && (
            <button
              onClick={() => setActiveTab("my_scout")}
              className={`flex items-center gap-1.5 sm:gap-2 rounded-xl px-3 sm:px-4 py-2 text-xs font-bold transition shrink-0 ${
                activeTab === "my_scout"
                  ? "bg-primary text-black shadow-lg shadow-primary/20"
                : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Award className="h-3.5 w-3.5" />
              <span>{t("scout.myScoutLog")}</span>
            </button>
          )}
        </div>

        <Link
          to="/discover"
          className="hidden md:inline-flex text-xs font-bold text-white/50 hover:text-primary transition items-center gap-1 shrink-0"
        >
          {t("scout.viewFullRadar")} <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: DEMAND SIGNALS & ACTIVE POLLS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "polls" && (
        <div className="mt-5 sm:mt-6 grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {polls.slice(0, 6).map((poll) => {
            const hasVoted = Boolean(userVotes[poll.id]);
            const selectedOptionId = userVotes[poll.id];
            const totalVotes = poll.options.reduce((sum, o) => sum + o.votes, 0);
            const progressPercent = Math.min(100, Math.round((totalVotes / poll.thresholdForMoment) * 100));
            const votesRemaining = Math.max(0, poll.thresholdForMoment - totalVotes);

            return (
              <div
                key={poll.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-primary/40 hover:bg-white/[0.06]"
              >
                <div>
                  {/* Top tags & points reward */}
                  <div className="flex items-start justify-between gap-2">
                    <Badge className="border-amber-400/30 bg-amber-400/10 text-[10px] font-black uppercase tracking-wider text-amber-300">
                      {poll.category}
                    </Badge>
                    {poll.pointsReward > 0 ? <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] font-black text-primary">
                      <Sparkles className="h-3 w-3" /> +{poll.pointsReward} PTS
                    </span> : null}
                  </div>

                  {/* Question */}
                  <h3 className="mt-3 font-serif text-lg font-bold leading-snug text-white group-hover:text-primary transition">
                    {poll.question}
                  </h3>

                  {/* Target Unlock Perk Banner */}
                  <div className="mt-3 rounded-xl border border-white/10 bg-black/40 p-2.5">
                    <div className="flex items-center justify-between text-[10px] font-bold text-white/50">
                      <span className="flex items-center gap-1 text-primary">
                        <Gift className="h-3 w-3" /> {t("scout.targetPerkUnlock")}
                      </span>
                      <span>
                        {votesRemaining === 0 ? t("scout.unlocked") : t("scout.votesToGo", { count: votesRemaining })}
                      </span>
                    </div>
                    <p className="mt-1 text-xs font-semibold text-white truncate">
                      {poll.targetUnlockPerk}
                    </p>
                    {/* Progress Bar */}
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-amber-300 transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Interactive Options List */}
                  <div className="mt-4 space-y-2">
                    {poll.options.map((opt) => {
                      const isUserPick = selectedOptionId === opt.id;
                      const optPercent = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;

                      return (
                        <button
                          key={opt.id}
                          disabled={hasVoted}
                          onClick={() => handleVote(poll.id, opt.id, poll.pointsReward)}
                          className={`relative w-full overflow-hidden rounded-xl border p-2.5 text-left transition ${
                            isUserPick
                              ? "border-primary bg-primary/15 text-white ring-1 ring-primary shadow-sm"
                              : hasVoted
                              ? "border-white/5 bg-white/[0.02] text-white/70"
                              : "border-white/10 bg-white/[0.03] text-white/80 hover:border-primary/50 hover:bg-white/[0.08] active:scale-[0.99]"
                          }`}
                        >
                          {/* Percentage fill background when voted */}
                          {hasVoted && (
                            <div
                              className={`absolute inset-y-0 left-0 transition-all duration-700 ${
                                isUserPick ? "bg-primary/20" : "bg-white/[0.04]"
                              }`}
                              style={{ width: `${optPercent}%` }}
                            />
                          )}

                          <div className="relative flex items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                              {isUserPick ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                              ) : (
                                <span className="h-1.5 w-1.5 rounded-full bg-white/30 shrink-0" />
                              )}
                              <span className="font-semibold text-white truncate">{opt.text}</span>
                            </div>
                            {hasVoted && (
                              <span className="font-mono text-[11px] font-bold text-primary shrink-0">
                                {optPercent}%
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Post-Vote Micro-Teaser */}
                  {hasVoted && (
                    <div className="mt-3 p-2.5 rounded-xl bg-gradient-to-r from-primary/10 to-transparent border border-primary/20 flex items-center justify-between gap-2 text-[11px]">
                      <span className="text-primary font-bold flex items-center gap-1 truncate">
                        <Sparkles className="w-3 h-3 shrink-0" /> {t("scout.matchedDealsReady")}
                      </span>
                      <Link
                        to={poll.detailUrl || `/discoveries/${poll.slug}`}
                        className="text-white font-bold hover:text-primary transition shrink-0 underline decoration-primary/50"
                      >
                        {t("scout.exploreLink")}
                      </Link>
                    </div>
                  )}
                </div>

                {/* Card Bottom Meta */}
                <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3 text-[11px] text-white/40">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-white/50" />
                    {totalVotes} {t("scout.totalVotes")}
                  </span>

                  <Link
                    to={poll.detailUrl || `/discoveries/${poll.slug}`}
                    className="flex items-center gap-1 font-bold text-primary hover:underline"
                  >
                    <span>{hasVoted ? "View Hub & Squad" : "View Discussion"}</span>
                    {poll.comments?.length > 0 && (
                      <span className="rounded-full bg-white/10 px-1.5 py-0.2 text-[9px] text-white">
                        {poll.comments.length}
                      </span>
                    )}
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: SCOUT DISCOVERIES (CURATED & USER-SUBMITTED SPOTS) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "discoveries" && (
        <>
          {isDiscoveriesLoading ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="h-64 animate-pulse rounded-2xl bg-white/5" />
              <div className="h-64 animate-pulse rounded-2xl bg-white/5" />
              <div className="h-64 animate-pulse rounded-2xl bg-white/5" />
            </div>
          ) : discoveries && discoveries.length > 0 ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {discoveries.map((item) => (
                <Link
                  key={item.id}
                  to={`/discoveries/${item.slug}`}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition hover:border-primary/50 hover:bg-white/[0.07]"
                >
                  <div>
                    <div className="relative h-44 w-full overflow-hidden bg-white/5">
                      {item.cover_image ? (
                        <img
                          src={item.cover_image}
                          alt={item.title}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="grid h-full place-items-center bg-white/5">
                          <Compass className="h-8 w-8 text-white/20" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                      <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                        <Badge className="border-cyan-300/30 bg-black/70 text-[10px] font-black uppercase tracking-[0.14em] text-cyan-300 backdrop-blur-md">
                          Scout Find
                        </Badge>
                        <Badge
                          variant="outline"
                          className="border-black/40 bg-black/60 text-[10px] font-bold text-primary backdrop-blur-md"
                        >
                          {formatDiscoveryCategory(item.category)}
                        </Badge>
                      </div>

                      {item.creator_profile && (
                        <div className="absolute bottom-2 left-3 flex items-center gap-1.5 text-[10px] text-white/70">
                          <ShieldCheck className="h-3 w-3 text-primary" />
                          <span>Logged by <strong className="text-white">{item.creator_profile.display_name}</strong></span>
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="font-serif text-lg font-bold text-white transition group-hover:text-primary">
                        {item.title}
                      </h3>
                      <p className="mt-1 flex items-center gap-1 text-xs text-white/50">
                        <MapPin className="h-3 w-3 text-primary shrink-0" />
                        <span className="truncate">{discoveryLocation(item)}</span>
                      </p>
                      {item.description && (
                        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-white/60">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <div className="flex items-center justify-between border-t border-white/5 pt-3 text-[10px] text-white/40">
                      <span>{item.checkin_count || 120}+ visits</span>
                      <span className="flex items-center gap-1 font-bold text-primary">
                        View Spot <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-white/10 p-8 text-center">
              <Sparkles className="mx-auto h-8 w-8 text-primary" />
              <h3 className="mt-2 text-sm font-bold text-white">Be the first Scout to log a Discovery!</h3>
              <p className="mt-1 text-xs text-white/50">Recommend your favorite local dining, beaches, trails, or spots.</p>
              <div className="mt-4">
                <SubmitDiscoveryModal />
              </div>
            </div>
          )}
        </>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: MY SCOUT LOG & IMPACT (SIGNED IN) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "my_scout" && (
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 lg:col-span-2">
            <h3 className="font-serif text-xl font-bold text-white">Your Scout Footprint</h3>
            <p className="mt-1 text-xs text-white/50">
              Every ballot you cast and spot you submit directly impacts what moments get funded, subsidized, and scheduled across the network.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 block">Ballots Cast</span>
                <span className="mt-1 font-mono text-2xl font-black text-primary">{votedCount}</span>
                <span className="text-[10px] text-white/50 block mt-1">Active demand signals</span>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 block">Signal Points</span>
                <span className="mt-1 font-mono text-2xl font-black text-amber-400">+{votedCount * 35}</span>
                <span className="text-[10px] text-white/50 block mt-1">Proof rewards earned</span>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 block">Perks Tracked</span>
                <span className="mt-1 font-mono text-2xl font-black text-cyan-400">3</span>
                <span className="text-[10px] text-white/50 block mt-1">Approaching milestone</span>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Share a hidden gem with the Scout Network</p>
                <p className="text-[11px] text-white/60">Earn +100 PromoPoints and a permanent creator attribution badge.</p>
              </div>
              <SubmitDiscoveryModal
                trigger={
                  <Button size="sm" className="bg-primary text-black font-bold hover:bg-orange-400 text-xs">
                    + Submit Now
                  </Button>
                }
              />
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-primary">Next Unlocks In Your Vault</h4>
              <div className="mt-4 space-y-3">
                <div className="rounded-xl border border-white/5 bg-black/40 p-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Gift className="h-3.5 w-3.5 text-primary" />
                    <span>J$500 Off Arla Pro Tasting Voucher</span>
                  </div>
                  <p className="text-[10px] text-white/50 mt-1">2 community votes until automatic drop</p>
                </div>
                <div className="rounded-xl border border-white/5 bg-black/40 p-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Gift className="h-3.5 w-3.5 text-amber-400" />
                    <span>25% Off Kingston Jerk Platter Pass</span>
                  </div>
                  <p className="text-[10px] text-white/50 mt-1">8 community votes until automatic drop</p>
                </div>
              </div>
            </div>

            <Link
              to="/vault"
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-bold text-white hover:bg-white/10 transition"
            >
              Open Your Rewards Vault <ArrowRight className="h-3.5 w-3.5 text-primary" />
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}

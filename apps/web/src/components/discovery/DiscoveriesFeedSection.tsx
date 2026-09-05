import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Compass,
  Plus,
  MapPin,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Award,
  CheckCircle2,
  ChevronRight,
  Gift,
  ShieldCheck,
  Zap,
  CalendarCheck,
} from "lucide-react";
import { formatDiscoveryCategory, discoveryLocation } from "@promorang/shared";
import { useDiscoveries } from "@/hooks/useDiscoveries";
import { SubmitDiscoveryModal } from "./SubmitDiscoveryModal";
import { AskQuestionModal } from "./AskQuestionModal";
import { DiscoveryPath } from "./DiscoveryPath";
import { PromoAcceptanceBadge } from "@/components/promocard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useMarket } from "@/contexts/MarketContext";
import { useUserBalance } from "@/hooks/useEconomy";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { DISCOVERY_POLLS, type DiscoveryPoll } from "@/data/discoveriesData";
import { toast } from "sonner";
import { castListingDiscoveryVote, useListingDiscoveryPolls } from "@/hooks/useListingDiscoveryPolls";
import { useI18n } from "@/i18n/I18nContext";
import { cn } from "@/lib/utils";
import {
  DISCOVER_VOTED_STORAGE_KEY,
  filterDiscoveryPollsForHub,
  mergeDiscoveryPolls,
  readStoredIdList,
} from "@/lib/discovery-path";

export function DiscoveriesFeedSection() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { city } = useMarket();
  const { data: preferences } = useUserPreferences();
  const { data: balance } = useUserBalance();
  const { data: discoveries, isLoading: isDiscoveriesLoading } = useDiscoveries({ limit: 6 });
  const { data: listingPolls = [] } = useListingDiscoveryPolls(12);

  const [activeTab, setActiveTab] = useState<"polls" | "discoveries" | "my_scout">("polls");
  const [livePolls, setLivePolls] = useState<DiscoveryPoll[]>([]);
  const [votedCount, setVotedCount] = useState(() => readStoredIdList(DISCOVER_VOTED_STORAGE_KEY).length);

  const catalog = useMemo(
    () => mergeDiscoveryPolls(livePolls, listingPolls, DISCOVERY_POLLS),
    [livePolls, listingPolls],
  );
  const hubPolls = useMemo(() => filterDiscoveryPollsForHub(catalog, city), [catalog, city]);

  useEffect(() => {
    setVotedCount(readStoredIdList(DISCOVER_VOTED_STORAGE_KEY).length);
  }, []);

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Scout";
  const userPoints = balance?.points || 420;
  const userKeys = balance?.promokeys || 3;
  const isPath = activeTab === "polls";

  return (
    <section
      id="home-discover-path"
      className={cn(
        "relative my-6 scroll-mt-24 sm:my-10",
        isPath
          ? ""
          : "overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-black/40 p-4 shadow-2xl backdrop-blur-md sm:p-6 md:p-8",
      )}
    >
      {isPath ? null : (
        <>
          <div className="pointer-events-none absolute -left-32 -top-32 h-60 w-60 rounded-full bg-primary/10 blur-[80px] sm:h-72 sm:w-72 sm:blur-[100px]" />
          <div className="pointer-events-none absolute -right-32 -bottom-32 h-60 w-60 rounded-full bg-amber-500/10 blur-[80px] sm:h-72 sm:w-72 sm:blur-[100px]" />
        </>
      )}

      {isPath ? null : (
      <>
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
      </>
      )}

      <div className={cn("flex items-center justify-between gap-3", isPath ? "mb-3" : "mt-5 border-b border-white/5 pb-3 sm:mt-6")}>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none max-w-full">
          {isPath ? (
            <Link
              to="/discover?tab=discoveries"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-300 hover:text-white"
            >
              {t("discover.pathInviteOpen")}
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          ) : (
          <button
            onClick={() => setActiveTab("polls")}
            className={`flex items-center gap-1.5 sm:gap-2 rounded-xl px-3 sm:px-4 py-2 text-xs font-bold transition shrink-0 ${
              activeTab === "polls"
                ? "bg-primary text-black shadow-lg shadow-primary/20"
                : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{t("discover.pathTab")}</span>
          </button>
          )}

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
          to="/discover?tab=discoveries"
          className="hidden md:inline-flex text-xs font-bold text-white/50 hover:text-primary transition items-center gap-1 shrink-0"
        >
          {t("discover.pathInviteOpen")} <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: DEMAND SIGNALS & ACTIVE POLLS */}
      {activeTab === "polls" && (
        <div>
          {hubPolls.length > 0 ? (
            <DiscoveryPath
              polls={hubPolls}
              cityName={city.name}
              preferredCategories={preferences?.preferred_categories || []}
              syncUrl={false}
              surface="invite"
              onQuestionCreated={(newQ) => {
                setLivePolls((prev) => [newQ, ...prev]);
              }}
              onVoted={() => setVotedCount(readStoredIdList(DISCOVER_VOTED_STORAGE_KEY).length)}
              onCastVote={async (poll, optionId) => {
                if (!poll.detailUrl) return;
                if (!user) {
                  toast.info("Sign in to verify local place information.");
                  return;
                }
                try {
                  await castListingDiscoveryVote(poll.id, optionId);
                } catch (error: any) {
                  toast.error(error?.message?.includes("duplicate") ? "You already voted on this place." : "We couldn't record that vote.");
                }
              }}
            />
          ) : (
            <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">
                {t("discover.pathHomeEyebrow", { city: city.name })}
              </p>
              <h3 className="mt-2 font-serif text-2xl font-bold text-white">{t("discover.pathMissTitle")}</h3>
              <p className="mt-2 max-w-xl text-sm leading-6 text-white/55">
                {t("discover.pathBrowseEmpty")}
              </p>
            </div>
          )}
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
                      <div className="mt-3">
                        <PromoAcceptanceBadge allowanceAmount={15} minSpend={35} />
                      </div>
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
                <span className="text-[10px] text-white/50 block mt-1">Active community votes</span>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 block">PromoPoints</span>
                <span className="mt-1 font-mono text-2xl font-black text-amber-400">+{votedCount * 35}</span>
                <span className="text-[10px] text-white/50 block mt-1">Points earned</span>
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

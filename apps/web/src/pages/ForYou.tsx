import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Compass, Coins, MapPin, MoonStar, SlidersHorizontal, Sparkles, Gift, Share2, Store, QrCode } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useForYouFeed } from "@/hooks/useFeed";
import type { FeedIntent } from "@/services/feed";
import { FeedStream } from "@/components/feed/FeedStream";
import { HomeFeedToggle } from "@/components/feed/HomeFeedToggle";
import { DiscoveriesFeedSection } from "@/components/discovery/DiscoveriesFeedSection";
import { GlobalTicketBalancePill } from "@/components/promoshare/GlobalTicketBalancePill";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/I18nContext";
import { TranslationKey } from "@/i18n/translations";

const lenses: Array<{
  value: FeedIntent | null;
  labelKey: TranslationKey;
  icon: typeof Compass;
  descKey: TranslationKey;
}> = [
  { value: null, labelKey: "forYou.lensForYou", icon: Compass, descKey: "forYou.lensForYouDesc" },
  { value: "nearby", labelKey: "forYou.lensNearYou", icon: MapPin, descKey: "forYou.lensNearYouDesc" },
  { value: "tonight", labelKey: "forYou.lensTonight", icon: MoonStar, descKey: "forYou.lensTonightDesc" },
  { value: "earn", labelKey: "forYou.lensEarn", icon: Coins, descKey: "forYou.lensEarnDesc" },
];

const ForYou = () => {
  const { t } = useI18n();
  const { user } = useAuth();
  const [activeIntent, setActiveIntent] = useState<FeedIntent | null>(null);
  const feedQuery = useForYouFeed(activeIntent);
  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || t("forYou.explorer");
  const rankedItems = useMemo(
    () => feedQuery.data?.feed || [],
    [feedQuery.data],
  );

  return (
    <main className="relative min-h-screen bg-black pb-20 text-white">
      <HomeFeedToggle />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_12%_0%,rgba(255,106,0,.11),transparent_38%)]" />

      <header className="relative border-b border-white/10 pb-8 pt-3 sm:pb-10 sm:pt-6">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.26em] text-primary">
                <Sparkles className="h-3.5 w-3.5" /> {t("forYou.curatedFor", { name: firstName })}
              </div>
              <GlobalTicketBalancePill />
            </div>
            <h1 className="mt-2 max-w-4xl font-sans text-[clamp(3rem,6vw,5.8rem)] font-semibold leading-[0.94] tracking-[-0.065em]">
              {t("forYou.heroTitle1")}<br className="hidden sm:block" /> {t("forYou.heroTitle2")}
            </h1>
            <p className="max-w-2xl text-[15px] leading-7 text-white/52">{t("forYou.heroCopy")}</p>

            {/* 3-Sided Market Quick Navigation Strip */}
            <div className="flex flex-wrap gap-2 pt-2">
              <Link
                to="/discover?tab=discoveries"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 text-xs font-bold transition"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Vote &amp; Unlock Perks (+25 Pts)</span>
              </Link>

              <Link
                to="/discover?tab=perks"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold transition"
              >
                <Gift className="w-3.5 h-3.5" />
                <span>Claim Perks</span>
              </Link>

              <Link
                to="/creators"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 text-xs font-bold transition"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Things Worth Sharing (Earn Draw Tickets)</span>
              </Link>

              <Link
                to="/staff/scanner"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-700 bg-zinc-800/80 text-zinc-300 hover:text-white text-xs font-bold transition"
              >
                <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                <span>Staff QR Scanner</span>
              </Link>
            </div>
          </div>

          <div className="max-w-xs rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-xs font-semibold text-white/72"><SlidersHorizontal className="h-4 w-4 text-primary" /> {t("forYou.rankingPersonal")}</div>
            <p className="mt-1.5 text-[11px] leading-5 text-white/35">{t("forYou.rankingAdapts")}</p>
          </div>
        </div>
      </header>

      <DiscoveriesFeedSection />

      <section aria-label="Choose a feed lens" className="sticky top-[72px] z-20 border-b border-white/10 bg-black/88 py-3 backdrop-blur-2xl lg:top-0">
        <div className="grid gap-1.5 rounded-[1.35rem] border border-white/10 bg-white/[0.035] p-1.5 sm:grid-cols-2 xl:grid-cols-4">
          {lenses.map((lens) => {
            const isActive = activeIntent === lens.value;
            return (
              <button
                key={lens.labelKey}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActiveIntent(lens.value)}
                className={cn(
                  "flex min-h-14 items-center gap-3 rounded-2xl border px-4 text-left transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black",
                  isActive ? "border-white bg-white text-black shadow-[0_8px_30px_rgba(0,0,0,.24)]" : "border-transparent text-white/70 hover:bg-white/[0.055] hover:text-white",
                )}
              >
                <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", isActive ? "bg-primary text-black" : "bg-white/[0.06] text-white/55")}><lens.icon className="h-3.5 w-3.5" /></span>
                <span><span className="block text-xs font-black">{t(lens.labelKey)}</span><span className={cn("mt-0.5 block text-[10px]", isActive ? "text-black/55" : "text-white/35")}>{t(lens.descKey)}</span></span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="relative pt-8 sm:pt-10" aria-label="Ranked feed">
        <FeedStream
          items={rankedItems}
          isLoading={feedQuery.isLoading && !rankedItems.length}
          isRefreshing={feedQuery.isFetching}
          onRefresh={() => void feedQuery.refetch()}
        />
      </section>
    </main>
  );
};

export default ForYou;

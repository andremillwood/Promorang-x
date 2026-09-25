import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, CalendarDays, Compass, Filter, Gift, MapPin, Search, Sparkles, Users, WalletCards, X } from "lucide-react";
import SEO from "@/components/SEO";
import { useMarket } from "@/contexts/MarketContext";
import { useDiscoveries } from "@/hooks/useDiscoveries";
import { useDiscoveryDemand } from "@/hooks/useDiscoveryDemand";
import { useCanonicalMomentFeed } from "@/hooks/useCanonicalMomentFeed";
import { usePublicOffers } from "@/hooks/useOffers";
import { discoveryLocation, formatDiscoveryCategory } from "@promorang/shared";
import { discoverPathHref } from "@/lib/discovery-path";
import { DemandSignalObject } from "@/components/promorang/DemandSignalObject";
import { FindOrAskQuestionRail } from "@/components/discovery/FindOrAskQuestionRail";
import { FindOrAskDemandRail } from "@/components/discovery/FindOrAskDemandRail";
import { useFindOrAskDiscoveries } from "@/hooks/useFindOrAsk";
import { useI18n } from "@/i18n/I18nContext";
import { PromoCardFace } from "@/components/promorang/SignatureObjects";
import { TasteCalibration } from "@/components/promorang/TasteCalibration";
import { EditorialWorldRail } from "@/components/marketing/EditorialWorldRail";
import { CurrentArc } from "@/components/marketing/MarketingPhysics";
import { momentLifecycleLabel } from "@/services/moment-feed";
import heroMoments from "@/assets/hero-moments.jpg";
import { getSiteUrl } from "@/lib/discovery";

function offerAvailability(quantityTotal?: number | null, quantityReserved = 0, quantityRedeemed = 0) {
  if (typeof quantityTotal !== "number") return "Availability set by operator";
  return `${Math.max(0, quantityTotal - quantityReserved - quantityRedeemed)} available`;
}

function signalState(votesRemaining: number, closeness: "unlocking" | "warming" | "early") {
  if (votesRemaining === 0) return "threshold_met" as const;
  if (closeness === "unlocking") return "near_threshold" as const;
  return closeness;
}

type ResultType = "all" | "discoveries" | "moments" | "offers" | "questions" | "wants";
type InterestFilter = "all" | "food" | "music" | "culture" | "outdoors";

const interestFilters: Array<{ id: InterestFilter; labelKey: string; terms: string[] }> = [
  { id: "all", labelKey: "publicDiscover.interest.everything", terms: [] },
  { id: "food", labelKey: "publicDiscover.interest.food", terms: ["food", "drink", "restaurant", "dining", "cuisine", "dish", "menu", "cafe", "coffee", "brunch", "lunch", "dinner", "chinese", "rice"] },
  { id: "music", labelKey: "publicDiscover.interest.music", terms: ["music", "concert", "party", "dance", "dj", "live", "nightlife", "club"] },
  { id: "culture", labelKey: "publicDiscover.interest.culture", terms: ["art", "culture", "gallery", "theatre", "theater", "film", "craft", "heritage", "museum"] },
  { id: "outdoors", labelKey: "publicDiscover.interest.outdoors", terms: ["outdoor", "hike", "beach", "nature", "garden", "trail", "adventure", "wellness"] },
];

function searchableText(values: unknown[]) {
  return values.filter(Boolean).join(" ").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ");
}

function matchesDiscoverySearch(values: unknown[], query: string, interest: InterestFilter) {
  const haystack = searchableText(values);
  const tokens = searchableText([query]).split(" ").filter(Boolean);
  const aliases: Record<string, string[]> = {
    food: interestFilters.find((item) => item.id === "food")?.terms || [],
    restaurant: ["restaurant", "dining", "cuisine", "food", "cafe", "eatery"],
    event: ["event", "moment", "party", "concert", "show", "gathering"],
  };
  const matchesQuery = tokens.length === 0 || tokens.every((token) =>
    haystack.includes(token) || Boolean(aliases[token]?.some((alias) => haystack.includes(alias))),
  );
  const filter = interestFilters.find((item) => item.id === interest);
  const matchesInterest = interest === "all" || Boolean(filter?.terms.some((term) => haystack.includes(term)));
  return matchesQuery && matchesInterest;
}

export function PublicDiscoverExperience() {
  const { city, country } = useMarket();
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get("q") || "");
  const [resultType, setResultType] = useState<ResultType>("all");
  const [interest, setInterest] = useState<InterestFilter>("all");
  const cityFilter = city.id === "all-jamaica" ? undefined : city.name;

  const discoveriesQuery = useDiscoveries({ city: cityFilter, limit: 24 });
  const demand = useDiscoveryDemand(city.name, country.slug || "jamaica", city.id === "all-jamaica" ? undefined : city.id);
  const findOrAskQuery = useFindOrAskDiscoveries(city.name);
  const momentsQuery = useCanonicalMomentFeed();
  const offersQuery = usePublicOffers();

  const discoveries = useMemo(() => discoveriesQuery.data || [], [discoveriesQuery.data]);
  const moments = useMemo(() => (momentsQuery.data?.moments || []).filter((moment) =>
    ["live", "starting_soon", "upcoming"].includes(moment.lifecycle),
  ), [momentsQuery.data?.moments]);
  const offers = useMemo(() => (offersQuery.data || []).filter((offer) =>
    ["active", "published", "live"].includes(offer.status),
  ), [offersQuery.data]);

  const normalizedQuery = query.trim();
  const filteredDiscoveries = useMemo(
    () =>
      discoveries.filter((item) => matchesDiscoverySearch(
        [item.title, item.description, item.category, item.city, item.country], normalizedQuery, interest,
      )),
    [discoveries, normalizedQuery, interest],
  );

  const filteredMoments = useMemo(
    () =>
      moments.filter((item) => matchesDiscoverySearch(
        [item.title, item.description, item.category, item.location, item.venue_name, item.reward], normalizedQuery, interest,
      )),
    [moments, normalizedQuery, interest],
  );

  const filteredOffers = useMemo(
    () =>
      offers.filter((offer) => matchesDiscoverySearch(
        [offer.title, offer.description, offer.reward_type, offer.fulfillment_type], normalizedQuery, interest,
      )),
    [offers, normalizedQuery, interest],
  );

  const filteredSignals = useMemo(
    () =>
      demand.inbox.questions.filter((signal) => matchesDiscoverySearch(
        [signal.poll.question, signal.poll.contextNotes, ...signal.poll.options.map((option) => option.text)], normalizedQuery, interest,
      )),
    [demand.inbox.questions, normalizedQuery, interest],
  );

  const explicitQuestions = (findOrAskQuery.data || []).filter((row) =>
    row.semantic_kind === "question" && matchesDiscoverySearch([row.question, row.city], normalizedQuery, interest),
  );
  const explicitDemands = (findOrAskQuery.data || []).filter((row) =>
    row.semantic_kind === "demand" && matchesDiscoverySearch([row.question, row.city], normalizedQuery, interest),
  );

  const resultCounts = {
    discoveries: filteredDiscoveries.length,
    moments: filteredMoments.length,
    offers: filteredOffers.length,
    questions: explicitQuestions.length,
    wants: filteredSignals.length + explicitDemands.length,
  };
  const totalResults = Object.values(resultCounts).reduce((total, count) => total + count, 0);
  const hasFilters = Boolean(normalizedQuery) || interest !== "all" || resultType !== "all";
  const clearFilters = () => { setQuery(""); setInterest("all"); setResultType("all"); };

  const featuredMoment = filteredMoments[0] || moments[0] || null;
  const heroDiscovery = filteredDiscoveries[0] || discoveries[0] || null;
  const heroImage = featuredMoment?.image_url || heroDiscovery?.cover_image || heroMoments;
  const heroIsEditorial = !featuredMoment?.image_url && !heroDiscovery?.cover_image;
  const liveSignals = filteredSignals.slice(0, 4);

  return (
    <main className="marketing-cinematic public-discover-world min-h-screen bg-[#050505] text-white">
      <SEO
        title="Discover PROMORANG | Find what moves you"
        description="Explore Discoveries, current Moments, offers and what people are looking for on PROMORANG."
        url={getSiteUrl("/discover")}
      />

      <section
        className="marketing-cinematic-hero public-discover-hero border-b border-white/10 px-5 pb-16 pt-12 sm:px-6 md:pb-20 md:pt-20"
        style={{ backgroundImage: `url("${heroImage}")` }}
      >
        <CurrentArc variant="hero" className="marketing-hero-current" />
        <div className="relative mx-auto flex min-h-[34rem] max-w-[1440px] items-end">
          <div className="max-w-4xl pb-4 md:pb-8">
            <p className="marketing-kicker"><Compass className="h-3.5 w-3.5" /> Discover · {city.name}</p>
            <h1 className="mt-6 max-w-[9ch] text-5xl font-black sm:text-6xl lg:text-7xl xl:text-[5.8rem]">
              See what’s
              <br />
              <span className="text-orange-400">moving.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/70 sm:text-lg">
              Find things worth knowing about, Moments you can actually join, access someone has really made available, and signals other people are already behind.
            </p>

            <div className="mt-8 max-w-3xl rounded-2xl border border-white/15 bg-black/65 p-2 shadow-2xl shadow-black/30 backdrop-blur-xl">
              <label htmlFor="public-discover-search" className="sr-only">Search PROMORANG</label>
              <div className="flex min-h-14 items-center gap-3 px-3">
                <Search className="h-4 w-4 text-orange-400" />
                <input
                  id="public-discover-search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t("publicDiscover.searchPlaceholder")}
                  className="min-w-0 flex-1 bg-transparent text-base text-white outline-none placeholder:text-white/35"
                />
                {query ? <button type="button" onClick={() => setQuery("")} aria-label={t("publicDiscover.clearSearch")} className="grid h-9 w-9 place-items-center rounded-full text-white/55 hover:bg-white/10 hover:text-white"><X className="h-4 w-4" /></button> : null}
              </div>
              <div className="flex gap-2 overflow-x-auto border-t border-white/10 px-2 pb-1 pt-2 scrollbar-none" aria-label={t("publicDiscover.interestFilterLabel")}>
                {interestFilters.map((item) => <button key={item.id} type="button" onClick={() => setInterest(item.id)} aria-pressed={interest === item.id} className={`shrink-0 rounded-full px-3 py-2 text-[11px] font-bold transition ${interest === item.id ? "bg-orange-500 text-black" : "bg-white/[0.06] text-white/60 hover:bg-white/10 hover:text-white"}`}>{t(item.labelKey as any)}</button>)}
              </div>
            </div>

            {heroIsEditorial ? (
              <p className="mt-5 text-[9px] font-black uppercase tracking-[0.14em] text-white/38">{t("publicDiscover.editorialHint")}</p>
            ) : null}

            <div className="marketing-hero-promocard-outcomes">
              <span className="marketing-hero-promocard-label">PromoCard</span>
              <span><strong>WATCH</strong> what matters</span>
              <span><strong>OPEN</strong> Moments & access</span>
              <span><strong>KEEP</strong> what counted</span>
            </div>
          </div>
        </div>
      </section>

      <section className="sticky top-0 z-30 border-b border-white/10 bg-[#080808]/95 px-5 py-3 backdrop-blur-xl sm:px-6" aria-label={t("publicDiscover.filtersLabel")}>
        <div className="mx-auto flex max-w-[1440px] items-center gap-3 overflow-x-auto scrollbar-none">
          <span className="flex shrink-0 items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-white/40"><Filter className="h-3.5 w-3.5" /> {t("publicDiscover.show")}</span>
          {([
            ["all", t("publicDiscover.allResults"), totalResults], ["discoveries", t("findOrAsk.resultDiscoveries"), resultCounts.discoveries], ["moments", t("search.moments"), resultCounts.moments], ["offers", t("findOrAsk.resultOffers"), resultCounts.offers], ["questions", t("common.questions"), resultCounts.questions], ["wants", t("publicNav.wanted"), resultCounts.wants],
          ] as Array<[ResultType, string, number]>).map(([id, label, count]) => <button key={id} type="button" onClick={() => setResultType(id)} aria-pressed={resultType === id} className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-bold transition ${resultType === id ? "border-orange-400 bg-orange-400/15 text-orange-200" : "border-white/10 text-white/55 hover:border-white/25 hover:text-white"}`}>{label} <span className="ml-1 text-[10px] opacity-60">{count}</span></button>)}
          {hasFilters ? <button type="button" onClick={clearFilters} className="ml-auto flex shrink-0 items-center gap-1.5 px-2 py-2 text-xs font-bold text-white/45 hover:text-white"><X className="h-3.5 w-3.5" /> {t("publicDiscover.reset")}</button> : null}
        </div>
      </section>

      {(resultType === "all" || resultType === "questions") && <section className="border-b border-white/10 bg-black px-5 py-14 sm:px-6 md:py-20">
        <div className="mx-auto max-w-[1440px]">
          <div className="marketing-section-head">
            <div>
              <p className="marketing-kicker">{t("findOrAsk.questionsKicker")}</p>
              <h2 className="mt-3 text-4xl font-black sm:text-5xl">{t("findOrAsk.questionsTitle")}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/55">{t("findOrAsk.questionsCopy")}</p>
            </div>
          </div>
          <FindOrAskQuestionRail city={city.name} query={normalizedQuery} />
        </div>
      </section>}

      {(resultType === "all" || resultType === "wants") && <section className="border-b border-white/10 bg-[#080808] px-5 py-14 sm:px-6 md:py-20">
        <div className="mx-auto max-w-[1440px]">
          <div className="marketing-section-head">
            <div>
              <p className="marketing-kicker">{t("publicDiscover.wantsKicker", { city: demand.inbox.city })}</p>
              <h2 className="mt-3 text-4xl font-black sm:text-5xl">{t("publicDiscover.wantsTitle")}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/55">{t("publicDiscover.wantsCopy")}</p>
            </div>
            <Link to="/#ask" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.1em] text-orange-300">{t("publicDiscover.putSomethingElse")} <ArrowRight className="h-4 w-4" /></Link>
          </div>

          {(demand.isLoading || findOrAskQuery.isLoading) && !liveSignals.length && !explicitDemands.length ? <p className="text-sm text-white/45">{t("publicDiscover.loadingWants")}</p> : null}
          <FindOrAskDemandRail city={city.name} query={normalizedQuery} />
          {liveSignals.length ? (
            <div className="marketing-demand-rail">
              {liveSignals.map((signal) => (
                <DemandSignalObject
                  key={signal.poll.id}
                  city={demand.inbox.city}
                  title={signal.poll.question}
                  leadingOption={signal.leading?.text}
                  demandCount={signal.poll.totalVotes || 0}
                  threshold={signal.poll.thresholdForMoment}
                  responseLabel={signal.poll.targetUnlockPerk}
                  href={`/auth?mode=login&role=participant&next=${encodeURIComponent(discoverPathHref(signal.poll.question))}`}
                  shareHref={discoverPathHref(signal.poll.question)}
                  state={signalState(signal.votesRemaining, signal.closeness)}
                  actionLabel={t("clarity.wantAction")}
                />
              ))}
            </div>
          ) : !demand.isLoading && !findOrAskQuery.isLoading && !explicitDemands.length ? (
            <div className="marketing-compact-empty">
              <Users className="h-5 w-5 text-orange-400" />
              <div><p className="text-sm font-black">{t("publicDiscover.noWantsTitle")}</p><p className="mt-1 text-xs leading-5 text-white/45">{t("publicDiscover.noWantsCopy")}</p></div>
            </div>
          ) : null}
        </div>
      </section>}

      {!hasFilters && <TasteCalibration marketLabel={city.name} />}

      {!hasFilters && <section className="px-5 py-14 sm:px-6 md:py-20">
        <div className="mx-auto max-w-[1440px]">
          <EditorialWorldRail />
        </div>
      </section>}

      {(resultType === "all" || resultType === "discoveries") && <section className="border-b border-white/10 px-5 py-14 sm:px-6 md:py-20">
        <div className="mx-auto max-w-[1440px]">
          <div className="marketing-section-head">
            <div>
              <p className="marketing-kicker">Worth knowing now</p>
              <h2 className="mt-3 text-4xl font-black sm:text-5xl">Discoveries worth a look.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/55">Places, people, ideas and possibilities worth knowing about right now.</p>
            </div>
          </div>

          {discoveriesQuery.isLoading ? (
            <div className="marketing-discovery-rail">{[0,1,2,3,4,5].map((item) => <div key={item} className="marketing-discovery-card animate-pulse bg-white/[0.04]" />)}</div>
          ) : filteredDiscoveries.length ? (
            <div className="marketing-discovery-rail">
              {filteredDiscoveries.slice(0, 6).map((item) => (
                <Link key={item.id} to={`/discoveries/${item.slug}`} className="marketing-discovery-card group">
                  <div className="marketing-discovery-card__media">
                    {item.cover_image ? <img src={item.cover_image} alt="" /> : <div className="grid h-full place-items-center bg-[#111]"><Compass className="h-8 w-8 text-white/15" /></div>}
                  </div>
                  <div className="marketing-discovery-card__content">
                    <span className="marketing-discovery-card__tag">{formatDiscoveryCategory(item.category)}</span>
                    <h3 className="marketing-discovery-card__title">{item.title}</h3>
                    <p className="marketing-discovery-card__meta"><MapPin className="mt-0.5 h-3 w-3 shrink-0 text-orange-400" />{discoveryLocation(item)}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="marketing-compact-empty">
              <Compass className="h-5 w-5 text-orange-400" />
              <div><p className="text-sm font-black">Nothing matches this view yet.</p><p className="mt-1 text-xs leading-5 text-white/45">Try another filter or come back as new Discoveries appear.</p></div>
            </div>
          )}
        </div>
      </section>}

      {(resultType === "all" || resultType === "moments") && <section className="border-b border-white/10 bg-[#080808] px-5 py-14 sm:px-6 md:py-20">
        <div className="mx-auto max-w-[1440px]">
          <div className="marketing-section-head">
            <div>
              <p className="marketing-kicker">Happening now & next</p>
              <h2 className="mt-3 text-4xl font-black sm:text-5xl">Moments you can actually enter.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/55">Plans, rooms and experiences happening now or coming up.</p>
            </div>
            <Link to="/discover/moments" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.1em] text-orange-300">See all Moments <ArrowRight className="h-4 w-4" /></Link>
          </div>

          {momentsQuery.isLoading ? (
            <div className="marketing-live-rail">{[0,1,2,3].map((item) => <div key={item} className="marketing-live-card animate-pulse bg-white/[0.04]" />)}</div>
          ) : filteredMoments.length ? (
            <div className="marketing-live-rail">
              {filteredMoments.slice(0,4).map((moment) => (
                <Link key={moment.id} to={`/moments/${moment.slug || moment.id}`} className="marketing-live-card group">
                  <div className="marketing-live-card__media">
                    {moment.image_url ? <img src={moment.image_url} alt="" /> : <div className="grid h-full place-items-center bg-[#111]"><CalendarDays className="h-8 w-8 text-white/15" /></div>}
                    <div className="marketing-live-card__scrim" />
                    <span className="marketing-live-card__state">{momentLifecycleLabel(moment.lifecycle)}</span>
                  </div>
                  <div className="marketing-live-card__body">
                    <p className="text-[9px] font-black uppercase tracking-[0.14em] text-orange-300">{moment.category || "Moment"}</p>
                    <h3>{moment.title}</h3>
                    <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-5 text-white/45"><MapPin className="mt-0.5 h-3 w-3 shrink-0 text-orange-400" />{moment.venue_name || moment.location || "Location on Moment"}</p>
                    {moment.reward ? <p className="marketing-live-card__perk"><Gift className="h-3.5 w-3.5" />{moment.reward}</p> : null}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="marketing-compact-empty">
              <CalendarDays className="h-5 w-5 text-orange-400" />
              <div><p className="text-sm font-black">No Moments match this view right now.</p><p className="mt-1 text-xs leading-5 text-white/45">Try another filter or see everything that’s coming up.</p></div>
            </div>
          )}
        </div>
      </section>}

      {(resultType === "all" || resultType === "offers") && <section className="border-b border-white/10 px-5 py-14 sm:px-6 md:py-20">
        <div className="mx-auto max-w-[1440px]">
          <div className="marketing-section-head">
            <div>
              <p className="marketing-kicker">Perks & access</p>
              <h2 className="mt-3 text-4xl font-black sm:text-5xl">Things you can claim or use.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/55">Open an offer to see what’s available, the terms and what to do next.</p>
            </div>
            <Link to="/discover/rewards#offers" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.1em] text-orange-300">Explore perks <ArrowRight className="h-4 w-4" /></Link>
          </div>

          {offersQuery.isLoading ? (
            <div className="marketing-offer-rail">{[0,1,2,3].map((item) => <div key={item} className="marketing-offer-card animate-pulse bg-white/[0.04]" />)}</div>
          ) : offersQuery.isError ? (
            <div className="marketing-compact-empty"><Gift className="h-5 w-5 text-orange-400" /><div><p className="text-sm font-black">We couldn’t load perks right now.</p><p className="mt-1 text-xs leading-5 text-white/45">Try again in a moment.</p></div></div>
          ) : filteredOffers.length ? (
            <div className="marketing-offer-rail">
              {filteredOffers.slice(0,4).map((offer) => (
                <article key={offer.id} className="marketing-offer-card">
                  <div className="marketing-offer-card__mark"><Gift className="h-5 w-5" /></div>
                  <p className="mt-4 text-[9px] font-black uppercase tracking-[0.14em] text-orange-300">{offer.reward_type.replace(/_/g, " ")}</p>
                  <h3>{offer.title}</h3>
                  {offer.description ? <p className="marketing-offer-card__copy">{offer.description}</p> : null}
                  <div className="marketing-offer-card__facts"><span>{offerAvailability(offer.quantity_total, offer.quantity_reserved, offer.quantity_redeemed)}</span><span>{offer.fulfillment_type.replace(/_/g, " ")}</span></div>
                </article>
              ))}
            </div>
          ) : (
            <div className="marketing-compact-empty">
              <Gift className="h-5 w-5 text-orange-400" />
              <div><p className="text-sm font-black">No direct offers right now.</p><p className="mt-1 text-xs leading-5 text-white/45">Check Moments or come back as new perks open up.</p></div>
            </div>
          )}
        </div>
      </section>}

      

      <section className="public-discover-promocard px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[.78fr_1.22fr] lg:items-center">
          <div>
            <p className="marketing-kicker"><WalletCards className="h-3.5 w-3.5" /> Keep your place</p>
            <h2 className="mt-3 text-4xl font-black sm:text-5xl">Discovery gets more useful when PROMORANG can remember what matters to you.</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/55">Watch something, come back when it changes, keep access that opens, and remember what you were part of.</p>
            <Link to="/auth?mode=signup&role=participant&next=/card" className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-md bg-orange-500 px-5 text-xs font-black uppercase tracking-[0.08em] text-black">Get my PromoCard <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="marketing-promocard-stage">
            <PromoCardFace
              holder="Your PromoCard"
              available="What changed because you cared"
              limit="Watching · Open · Kept"
              places="Discoveries, Moments, access and your history stay connected to you."
              action="See what changed"
              variant="membership"
              interactive={false}
            />
          </div>
        </div>
      </section>
    </main>
  );
}

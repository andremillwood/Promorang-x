import { FormEvent, useMemo, useState } from "react";
import { ArrowRight, Building2, CheckCircle2, Compass, MapPin, Search, Sparkles, Users, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { discoveryLocation, formatDiscoveryCategory } from "@promorang/shared";
import { DemandSignalObject } from "@/components/promorang/DemandSignalObject";
import { TasteCalibration } from "@/components/promorang/TasteCalibration";
import { ParticipationEconomy } from "@/components/promorang/ParticipationEconomy";
import { EditorialWorldRail } from "@/components/marketing/EditorialWorldRail";
import { PromoCardValueShowcase } from "@/components/marketing/PromoCardValueShowcase";
import { CurrentArc, ReturnLoopStory } from "@/components/marketing/MarketingPhysics";
import { PromoCardFace } from "@/components/promorang/SignatureObjects";
import { useDiscoveryDemand } from "@/hooks/useDiscoveryDemand";
import { useDiscoveries } from "@/hooks/useDiscoveries";
import { useMarket } from "@/contexts/MarketContext";
import { useAuth } from "@/contexts/AuthContext";
import { discoverPathHref } from "@/lib/discovery-path";
import { useI18n } from "@/i18n/I18nContext";
import { FindOrAskEntry } from "@/components/discovery/FindOrAskEntry";
import heroMoments from "@/assets/hero-moments.jpg";
import operatorImage from "@/assets/moment-concert.jpg";

const STOP_WORDS = new Set([
  "and", "are", "for", "from", "have", "here", "into", "like", "looking", "need", "place", "see", "some", "something", "somewhere", "that", "the", "this", "want", "with", "would", "your",
]);

function normalizedText(value?: string | null) {
  return (value || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function meaningfulTokens(value?: string | null) {
  return normalizedText(value)
    .split(" ")
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

function relevance(query: string, candidate: string) {
  const normalizedQuery = normalizedText(query);
  const normalizedCandidate = normalizedText(candidate);
  if (!normalizedQuery || !normalizedCandidate) return 0;
  if (normalizedCandidate.includes(normalizedQuery)) return 3;

  const queryTokens = meaningfulTokens(query);
  if (!queryTokens.length) return 0;
  const candidateTokens = new Set(meaningfulTokens(candidate));
  const overlap = queryTokens.filter((token) => candidateTokens.has(token)).length;
  return overlap / queryTokens.length;
}

function signalState(votesRemaining: number, closeness: "unlocking" | "warming" | "early") {
  if (votesRemaining === 0) return "threshold_met" as const;
  if (closeness === "unlocking") return "near_threshold" as const;
  return closeness;
}

export default function PublicMarketHome() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { city, country } = useMarket();
  const { inbox, recordAsk, isLoading } = useDiscoveryDemand(
    city.name,
    country.slug || "jamaica",
    city.id === "all-jamaica" ? undefined : city.id,
  );
  const { data: discoveries = [], isLoading: discoveriesLoading } = useDiscoveries({
    city: city.id === "all-jamaica" ? undefined : city.name,
    limit: 18,
  });

  const [ask, setAsk] = useState("");
  const [askResult, setAskResult] = useState<{ query: string; recorded: boolean } | null>(null);
  const [resolution, setResolution] = useState<{ query: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const liveSignals = useMemo(() => inbox.questions.slice(0, 4), [inbox.questions]);
  const featuredDiscoveries = discoveries.slice(0, 6);

  const relatedDiscoveries = useMemo(() => {
    if (!resolution) return [];
    return discoveries
      .map((item) => ({
        item,
        score: relevance(
          resolution.query,
          [item.title, item.description, item.category, item.city, item.country].filter(Boolean).join(" "),
        ),
      }))
      .filter(({ score }) => score >= 0.5)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(({ item }) => item);
  }, [discoveries, resolution]);

  const relatedSignals = useMemo(() => {
    if (!resolution) return [];
    return inbox.questions
      .map((signal) => ({
        signal,
        score: relevance(
          resolution.query,
          [signal.poll.question, signal.poll.contextNotes, ...signal.poll.options.map((option) => option.text)].filter(Boolean).join(" "),
        ),
      }))
      .filter(({ score }) => score >= 0.5)
      .sort((a, b) => b.score - a.score)
      .slice(0, 2)
      .map(({ signal }) => signal);
  }, [inbox.questions, resolution]);

  function findRelated(query: string) {
    const discoveryMatches = discoveries.some((item) =>
      relevance(query, [item.title, item.description, item.category, item.city, item.country].filter(Boolean).join(" ")) >= 0.5,
    );
    const signalMatches = inbox.questions.some((signal) =>
      relevance(
        query,
        [signal.poll.question, signal.poll.contextNotes, ...signal.poll.options.map((option) => option.text)].filter(Boolean).join(" "),
      ) >= 0.5,
    );
    return discoveryMatches || signalMatches;
  }

  async function recordAskNow(query: string) {
    if (!query.trim() || submitting) return;
    setSubmitting(true);
    try {
      const recorded = await recordAsk(query.trim());
      setAskResult({ query: query.trim(), recorded });
      setResolution(null);
      if (recorded) setAsk("");
    } finally {
      setSubmitting(false);
    }
  }

  async function submitAsk(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = ask.trim();
    if (!next || submitting) return;

    setAskResult(null);
    if (findRelated(next)) {
      setResolution({ query: next });
      return;
    }

    await recordAskNow(next);
  }

  const marketName = city.name === "All Jamaica" ? "Jamaica" : city.name;
  const wantHref = (question: string) => {
    const next = discoverPathHref(question);
    return user ? next : `/auth?mode=login&role=participant&next=${encodeURIComponent(next)}`;
  };

  return (
    <main className="marketing-cinematic min-h-screen overflow-x-clip bg-[#050505] text-white selection:bg-orange-500 selection:text-black">
      <section
        className="marketing-cinematic-hero marketing-cinematic-hero--world border-b border-white/10 px-4 pb-10 pt-8 sm:px-6 sm:pb-14 sm:pt-12 md:pb-20 md:pt-20"
        style={{ backgroundImage: `url("${heroMoments}")` }}
      >
        <CurrentArc variant="hero" className="marketing-hero-current" />
        <div className="relative mx-auto grid max-w-[1440px] gap-8 sm:gap-10 lg:min-h-[42rem] lg:grid-cols-[minmax(0,1.04fr)_minmax(440px,.76fr)] lg:items-center">
          <div className="max-w-4xl py-2 sm:py-6 md:py-10">
            <p className="marketing-kicker"><Sparkles className="h-3.5 w-3.5" /> {t("clarity.heroKicker")}</p>
            <h1 className="mt-4 max-w-[12ch] text-[clamp(2.65rem,12vw,4rem)] font-black leading-[0.95] sm:mt-6 sm:max-w-[11ch] sm:text-6xl lg:text-7xl xl:text-[5.8rem]">
              {t("clarity.heroTitle", { market: marketName })}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/70 sm:mt-6 sm:text-lg sm:leading-8">
              {t("clarity.heroCopy")}
            </p>
            <FindOrAskEntry source="home" city={marketName} className="mt-6 max-w-3xl sm:mt-8" />
            <div className="mt-5 flex flex-wrap gap-3">
              <a href="#wanted" className="inline-flex min-h-12 items-center gap-2 rounded-md border border-white/20 bg-black/45 px-5 text-xs font-black uppercase tracking-[0.08em] text-white transition hover:border-orange-400/50 hover:bg-black/65">
                {t("clarity.seeWhatsMoving", { market: marketName })} <Users className="h-4 w-4" />
              </a>
            </div>
            <p className="mt-5 max-w-xl text-xs leading-6 text-white/45">
              {t("clarity.heroProof")}
            </p>
          </div>
          <div className="relative pb-2 lg:min-h-[34rem] lg:pb-0">
            <div className="pointer-events-none absolute inset-8 rounded-full bg-orange-500/20 blur-3xl" />
            <CurrentArc variant="return" className="marketing-promocard-return-arc" />
            <div className="relative flex flex-col justify-center lg:min-h-[34rem]">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">{t("clarity.yourNextPlace")}</p>
                  <p className="mt-2 text-sm font-bold text-white/75">{t("clarity.askOnce")}</p>
                </div>
                <span className="h-2.5 w-2.5 rounded-full bg-orange-400 shadow-[0_0_24px_rgba(251,146,60,.95)]" />
              </div>
              <Link to={user ? "/card" : "/auth?mode=signup&role=participant&next=/card"} className="group relative block transition duration-500 sm:rotate-[-1.5deg] sm:hover:rotate-0 sm:hover:scale-[1.015] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400">
                <PromoCardFace
                  holder={t("clarity.yourPromoCard")}
                  available={t("clarity.whatOpens")}
                  limit={t("clarity.cardStates")}
                  places={t("clarity.cardSummary")}
                  action={user ? t("clarity.openMyCard") : t("clarity.getMyCard")}
                  variant="membership"
                  interactive={false}
                />
              </Link>
              <div className="mt-5 border-y border-white/15 bg-black/45 px-4 py-4 backdrop-blur-xl">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[9px] font-black uppercase tracking-[0.14em] text-white/55">
                  <span className="text-orange-300">{t("clarity.youWantIt")}</span><ArrowRight className="h-3 w-3" />
                  <span>{t("clarity.peopleJoin")}</span><ArrowRight className="h-3 w-3" />
                  <span>{t("clarity.somethingOpens")}</span><ArrowRight className="h-3 w-3" />
                  <span className="text-white">{t("clarity.cardBringsBack")}</span>
                </div>
                <p className="mt-3 text-xs leading-5 text-white/45">{t("clarity.cardRemembers")}</p>
              </div>
            </div>
          </div>
        </div>

      </section>

      <section id="wanted" className="border-b border-white/10 bg-[#080808] px-5 py-14 sm:px-6 md:py-20">
        <div className="mx-auto max-w-[1440px]">
          <div className="marketing-section-head">
            <div>
              <p className="marketing-kicker">{t("clarity.marketWants", { market: marketName })}</p>
              <h2 className="mt-3 max-w-4xl text-4xl font-black sm:text-5xl">{t("clarity.wantsTitle")}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/55">{t("clarity.wantsCopy")}</p>
            </div>
            <a href="#ask" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.1em] text-orange-300">{t("clarity.putSomethingElse")} <ArrowRight className="h-4 w-4" /></a>
          </div>

          {isLoading && !liveSignals.length ? <p className="text-sm text-white/45">{t("clarity.loadingWants")}</p> : null}
          {liveSignals.length ? (
            <div className="marketing-demand-rail">
              {liveSignals.map((signal) => (
                <DemandSignalObject
                  key={signal.poll.id}
                  city={inbox.city}
                  title={signal.poll.question}
                  leadingOption={signal.leading?.text}
                  demandCount={signal.poll.totalVotes || 0}
                  threshold={signal.poll.thresholdForMoment}
                  responseLabel={signal.poll.targetUnlockPerk}
                  href={wantHref(signal.poll.question)}
                  shareHref={discoverPathHref(signal.poll.question)}
                  state={signalState(signal.votesRemaining, signal.closeness)}
                  actionLabel={t("clarity.wantAction")}
                />
              ))}
            </div>
          ) : !isLoading ? (
            <div className="marketing-compact-empty">
              <Users className="h-5 w-5 text-orange-400" />
              <div>
                <p className="text-sm font-black text-white">No one has put a want on the table here yet.</p>
                <p className="mt-1 text-xs leading-5 text-white/45">Be the first to ask, or explore what people are already discovering.</p>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-white/10 bg-[#050505] px-5 py-16 sm:px-6 md:py-24">
        <CurrentArc variant="return" className="marketing-promocard-return-arc" />
        <div className="relative mx-auto max-w-[1240px]">
          <div>
            <p className="marketing-kicker">Your choice changes the signal</p>
            <h2 className="mt-3 max-w-4xl text-4xl font-black sm:text-5xl">Your vote isn’t just a poll.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55">It helps turn scattered interest into something the people who can respond can actually see.</p>
          </div>
          <ol className="mt-10 grid gap-0 border-y border-white/15 lg:grid-cols-4">
            {[
              ["01", "Say what you want.", "Choose an existing Want or tell PROMORANG what is missing."],
              ["02", "Others join you.", "Every recorded vote makes genuine shared demand clearer."],
              ["03", "The opportunity shows up.", "Businesses, hosts, creators, venues and brands can see where interest is forming."],
              ["04", "Someone can respond.", "If something real opens, PROMORANG can bring the people who wanted it back."],
            ].map(([number, title, copy]) => (
              <li key={number} className="border-b border-white/10 py-6 lg:border-b-0 lg:border-r lg:px-6 lg:first:pl-0 lg:last:border-r-0">
                <p className="font-mono text-[10px] font-black tracking-[0.18em] text-orange-300">{number}</p>
                <h3 className="mt-4 text-xl font-black text-white">{title}</h3>
                <p className="mt-3 text-xs leading-6 text-white/48">{copy}</p>
              </li>
            ))}
          </ol>
          <div className="mt-8 flex flex-col gap-4 border-l-2 border-orange-400 pl-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-lg font-black">Want it to happen? Bring in people who would genuinely want it too.</p>
              <p className="mt-1 text-xs leading-5 text-white/45">Each Want now has a share action. Sharing opens the same real demand object; it does not fabricate a vote or promise a reward.</p>
            </div>
            <a href="#wanted" className="inline-flex min-h-11 shrink-0 items-center gap-2 text-xs font-black uppercase tracking-[0.1em] text-orange-300">Choose a Want to share <ArrowRight className="h-4 w-4" /></a>
          </div>
        </div>
      </section>

      <section className="marketing-operator-band relative overflow-hidden border-b border-white/10 px-5 py-16 sm:px-6 md:py-24">
        <img src={operatorImage} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/55" />
        <div className="relative mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-3xl">
            <p className="marketing-kicker"><Building2 className="h-3.5 w-3.5" /> The people who can respond</p>
            <h2 className="mt-3 text-4xl font-black sm:text-5xl">Instead of guessing, they can see what people are asking for.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/60">Merchants, brands, hosts, creators and venues can read visible demand and decide whether to answer with a real product, offer, service, experience, Moment or access.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/for-merchants" className="inline-flex min-h-12 items-center gap-2 rounded-md bg-orange-500 px-5 text-xs font-black uppercase tracking-[0.08em] text-black">See the business side <ArrowRight className="h-4 w-4" /></Link>
            <Link to="/join" className="inline-flex min-h-12 items-center gap-2 rounded-md border border-white/20 bg-black/45 px-5 text-xs font-black uppercase tracking-[0.08em] text-white">Choose another role</Link>
          </div>
        </div>
      </section>

      <PromoCardValueShowcase />

      <section className="px-5 py-14 sm:px-6 md:py-20">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-8 max-w-3xl">
            <p className="marketing-kicker">What could move you?</p>
            <h2 className="mt-3 text-4xl font-black sm:text-5xl">Find your way into the city.</h2>
            <p className="mt-3 text-sm leading-7 text-white/55">These visual paths help you recognize what feels relevant before you know exactly what to ask for.</p>
          </div>
          <EditorialWorldRail />
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#050505] px-5 py-14 sm:px-6 md:py-20">
        <div className="mx-auto grid max-w-[1440px] gap-8 xl:grid-cols-[.62fr_1.38fr] xl:items-center">
          <div>
            <p className="marketing-kicker">Not sure what you want yet?</p>
            <h2 className="mt-3 text-4xl font-black sm:text-5xl">Start with what feels like you.</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/55">A few quick choices help PROMORANG show you more relevant places, people and possibilities. These private taste choices personalize your experience; they do not add to public demand.</p>
          </div>
          <TasteCalibration marketLabel={marketName} />
        </div>
      </section>

      <section className="border-b border-white/10 px-5 py-14 sm:px-6 md:py-20">
        <div className="mx-auto max-w-[1440px]">
          <div className="marketing-section-head">
            <div>
              <p className="marketing-kicker">Discoveries around you</p>
              <h2 className="mt-3 text-4xl font-black sm:text-5xl">Worth knowing now.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/55">
                Places, people, ideas and possibilities worth a closer look right now.
              </p>
            </div>
            <Link to="/discover" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.1em] text-orange-300">
              View all Discoveries <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {discoveriesLoading ? (
            <div className="marketing-discovery-rail">{[0, 1, 2, 3, 4, 5].map((item) => <div key={item} className="marketing-discovery-card animate-pulse bg-white/[0.04]" />)}</div>
          ) : featuredDiscoveries.length ? (
            <div className="marketing-discovery-rail">
              {featuredDiscoveries.map((item) => (
                <Link key={item.id} to={`/discoveries/${item.slug}`} className="marketing-discovery-card group">
                  <div className="marketing-discovery-card__media">
                    {item.cover_image ? <img src={item.cover_image} alt="" className="transition duration-500 group-hover:scale-105" /> : <div className="grid h-full place-items-center bg-[#111]"><Compass className="h-8 w-8 text-white/15" /></div>}
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
              <div>
                <p className="text-sm font-black text-white">Nothing new here yet.</p>
                <p className="mt-1 text-xs leading-5 text-white/45">Explore the market, tell us what you want, or come back as new Discoveries appear.</p>
              </div>
              <Link to="/discover" className="ml-auto hidden items-center gap-2 text-xs font-black uppercase tracking-[0.08em] text-orange-300 sm:inline-flex">Open Discovery <ArrowRight className="h-3.5 w-3.5" /></Link>
            </div>
          )}
        </div>
      </section>

      <section id="ask" className="marketing-stage border-b border-white/10 px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_.62fr] lg:items-start">
          <div>
            <p className="marketing-kicker">Looking for something?</p>
            <h2 className="mt-3 text-4xl font-black sm:text-5xl">Tell PROMORANG what belongs on your radar.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55">
              A place. A product. Something to do. Access. An experience. Something you wish existed. PROMORANG first checks what it already knows and whether other people want something similar. Signed-in participants can keep the things that matter on PromoCard.
            </p>

            <form onSubmit={submitAsk} className="mt-7 max-w-2xl">
              <label htmlFor="public-ask" className="mb-2 block text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
                What are you looking for in {marketName}?
              </label>
              <div className="flex flex-col gap-2 border border-white/12 bg-white/[0.055] p-2 sm:flex-row">
                <div className="flex min-w-0 flex-1 items-center gap-3 px-3">
                  <Search className="h-4 w-4 shrink-0 text-orange-400" />
                  <input
                    id="public-ask"
                    value={ask}
                    onChange={(event) => {
                      setAsk(event.target.value);
                      setResolution(null);
                      setAskResult(null);
                    }}
                    placeholder="A late-night cafe, a product drop, somewhere to dance…"
                    className="min-h-12 w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30"
                  />
                </div>
                <button type="submit" disabled={!ask.trim() || submitting} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-orange-500 px-5 text-xs font-black uppercase tracking-[0.12em] text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-40">
                  {submitting ? "Checking…" : "See what’s out there"}<ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {resolution ? (
                <div className="mt-4 border border-orange-300/20 bg-orange-300/[0.06] p-4 sm:p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-300">Things that might fit</p>
                  <p className="mt-2 text-sm leading-6 text-white/62">These look related to “{resolution.query}”. They are not being claimed as exact matches.</p>

                  {relatedDiscoveries.length ? (
                    <div className="mt-4 space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/35">Things worth a look</p>
                      {relatedDiscoveries.map((item) => (
                        <Link key={item.id} to={`/discoveries/${item.slug}`} className="flex items-center justify-between gap-3 border border-white/10 bg-black/25 px-4 py-3 transition hover:border-orange-300/35">
                          <span>
                            <span className="block text-sm font-bold text-white">{item.title}</span>
                            <span className="mt-1 block text-[11px] text-white/40">{formatDiscoveryCategory(item.category)} · {discoveryLocation(item)}</span>
                          </span>
                          <ArrowRight className="h-4 w-4 shrink-0 text-orange-300" />
                        </Link>
                      ))}
                    </div>
                  ) : null}

                  {relatedSignals.length ? (
                    <div className="mt-4 space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/35">People want this too</p>
                      {relatedSignals.map((signal) => (
                        <Link key={signal.poll.id} to={discoverPathHref(signal.poll.question)} className="flex items-center justify-between gap-3 border border-white/10 bg-black/25 px-4 py-3 transition hover:border-orange-300/35">
                          <span>
                            <span className="block text-sm font-bold text-white">{signal.poll.question}</span>
                            <span className="mt-1 block text-[11px] text-white/40">{signal.poll.totalVotes || 0} voice{signal.poll.totalVotes === 1 ? "" : "s"}</span>
                          </span>
                          <ArrowRight className="h-4 w-4 shrink-0 text-orange-300" />
                        </Link>
                      ))}
                    </div>
                  ) : null}

                  <div className="mt-5 flex flex-wrap gap-3 border-t border-white/10 pt-4">
                    <button type="button" disabled={submitting} onClick={() => recordAskNow(resolution.query)} className="inline-flex min-h-11 items-center gap-2 rounded-md bg-white px-5 text-xs font-black text-black transition hover:bg-orange-100 disabled:opacity-50">
                      None of these. Keep looking for this
                    </button>
                    <button type="button" onClick={() => setResolution(null)} className="inline-flex min-h-11 items-center gap-2 rounded-md border border-white/15 px-5 text-xs font-bold text-white/65 transition hover:text-white">
                      Change what I’m looking for
                    </button>
                  </div>
                </div>
              ) : null}

              {askResult?.recorded ? (
                <div className="mt-4 border-l-2 border-emerald-300 pl-4">
                  <p className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-300"><CheckCircle2 className="h-4 w-4" /> Your request for “{askResult.query}” was recorded.</p>
                  <p className="mt-2 text-xs leading-5 text-white/45">That adds a real request to the picture. Keep it on PromoCard if you want PROMORANG to bring you back when something relevant changes.</p>
                  <Link to="/auth?mode=signup&role=participant&next=/card" className="mt-3 inline-flex min-h-10 items-center gap-2 text-xs font-black uppercase tracking-[0.08em] text-orange-300">Keep my place <ArrowRight className="h-3.5 w-3.5" /></Link>
                </div>
              ) : askResult ? (
                <p className="mt-3 inline-flex items-start gap-2 text-sm font-semibold text-amber-300"><XCircle className="mt-0.5 h-4 w-4 shrink-0" /> We couldn’t save “{askResult.query}” right now. Try again.</p>
              ) : null}
            </form>
          </div>

          <aside className="marketing-dark-note">
            <p className="marketing-kicker">What happens next</p>
            <h3 className="mt-4 text-2xl font-black">First help me find it. Only then keep looking for what is still missing.</h3>
            <div className="mt-6 space-y-4 text-sm leading-6 text-white/55">
              <p><strong className="text-white">Found something?</strong><br />Open the Discovery first.</p>
              <p><strong className="text-white">Others already want it?</strong><br />Join the same want instead of splitting the crowd.</p>
              <p><strong className="text-white">Still missing?</strong><br />Keep looking for it. We’ll keep similar wants together so you can see whether more people join.</p>
            </div>
          </aside>
        </div>
      </section>

      <ReturnLoopStory />

      <ParticipationEconomy variant="public" />

      <section className="border-b border-white/10 bg-[#050505] px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-5xl border-y border-white/15 py-10 text-center sm:py-14">
          <p className="marketing-kicker justify-center">Choose your first move</p>
          <h2 className="mx-auto mt-4 max-w-4xl text-4xl font-black sm:text-6xl">Ask for something. Join a Want. See what changes.</h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/55">You do not need to understand every part of PROMORANG to start. Make one real signal, then keep your place in what happens next.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="#ask" className="inline-flex min-h-12 items-center gap-2 rounded-md bg-orange-500 px-6 text-xs font-black uppercase tracking-[0.08em] text-black">Tell us what you want <ArrowRight className="h-4 w-4" /></a>
            <a href="#wanted" className="inline-flex min-h-12 items-center gap-2 rounded-md border border-white/20 px-6 text-xs font-black uppercase tracking-[0.08em] text-white">See what people want</a>
          </div>
        </div>
      </section>
    </main>
  );
}

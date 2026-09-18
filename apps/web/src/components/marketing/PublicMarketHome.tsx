import { FormEvent, useMemo, useState } from "react";
import { ArrowRight, Building2, CheckCircle2, Compass, MapPin, Search, Sparkles, Users, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { discoveryLocation, formatDiscoveryCategory } from "@promorang/shared";
import { DemandSignalObject } from "@/components/promorang/DemandSignalObject";
import { EditorialWorldRail } from "@/components/marketing/EditorialWorldRail";
import { NightTrail, PaperReceipt, PromoCardFace } from "@/components/promorang/SignatureObjects";
import { useDiscoveryDemand } from "@/hooks/useDiscoveryDemand";
import { useDiscoveries } from "@/hooks/useDiscoveries";
import { useMarket } from "@/contexts/MarketContext";
import { discoveryHref } from "@/lib/discovery-path";
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

  return (
    <main className="marketing-cinematic min-h-screen overflow-x-clip bg-[#050505] text-white selection:bg-orange-500 selection:text-black">
      <section
        className="marketing-cinematic-hero marketing-cinematic-hero--world border-b border-white/10 px-5 pb-16 pt-12 sm:px-6 md:pb-20 md:pt-20"
        style={{ backgroundImage: `url("${heroMoments}")` }}
      >
        <div className="relative mx-auto flex min-h-[32rem] max-w-[1440px] items-end">
          <div className="max-w-4xl pb-4 md:pb-8">
            <p className="marketing-kicker"><Sparkles className="h-3.5 w-3.5" /> Find what moves you. Help make more of it happen.</p>
            <h1 className="mt-6 max-w-[9.5ch] text-5xl font-black sm:text-6xl lg:text-7xl xl:text-[5.6rem]">
              Find what
              <br />
              <span className="text-orange-400">moves you.</span>
              <br />
              Help move it.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/70 sm:text-lg">
              Discover things worth knowing about, recognize what you care about, join what other people want, or put something missing into the market.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/discover" className="inline-flex min-h-12 items-center gap-2 rounded-md bg-orange-500 px-5 text-xs font-black uppercase tracking-[0.08em] text-black transition hover:bg-orange-400">
                <Compass className="h-4 w-4" /> Explore PROMORANG
              </Link>
              <a href="#ask" className="inline-flex min-h-12 items-center gap-2 rounded-md border border-white/20 bg-black/45 px-5 text-xs font-black uppercase tracking-[0.08em] text-white transition hover:border-orange-400/50 hover:bg-black/65">
                I know what I want <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            <p className="mt-7 max-w-xl text-[10px] font-bold uppercase tracking-[0.12em] text-white/35">
              Editorial atmosphere only · source-backed market state begins below
            </p>
          </div>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-6 md:py-20">
        <div className="mx-auto max-w-[1440px]">
          <EditorialWorldRail />
        </div>
      </section>

      <section className="border-b border-white/10 px-5 py-14 sm:px-6 md:py-20">
        <div className="mx-auto max-w-[1440px]">
          <div className="marketing-section-head">
            <div>
              <p className="marketing-kicker">What the market actually knows</p>
              <h2 className="mt-3 text-4xl font-black sm:text-5xl">Worth knowing now.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/55">
                Everything in this rail comes from approved Discovery records. Editorial imagery above is not substituted for live inventory.
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
                <p className="text-sm font-black text-white">No approved Discoveries are live in this market yet.</p>
                <p className="mt-1 text-xs leading-5 text-white/45">PROMORANG keeps that absence visible instead of replacing it with sample inventory.</p>
              </div>
              <Link to="/discover" className="ml-auto hidden items-center gap-2 text-xs font-black uppercase tracking-[0.08em] text-orange-300 sm:inline-flex">Open Discovery <ArrowRight className="h-3.5 w-3.5" /></Link>
            </div>
          )}
        </div>
      </section>

      <section id="wanted" className="border-b border-white/10 bg-[#080808] px-5 py-14 sm:px-6 md:py-20">
        <div className="mx-auto max-w-[1440px]">
          <div className="marketing-section-head">
            <div>
              <p className="marketing-kicker">What people are asking for · {inbox.city}</p>
              <h2 className="mt-3 max-w-4xl text-4xl font-black sm:text-5xl">When private preferences overlap, a market starts to appear.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/55">These are recorded Demand questions—not attendance, purchases or guaranteed supply.</p>
            </div>
            <a href="#ask" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.1em] text-orange-300">Put something up <ArrowRight className="h-4 w-4" /></a>
          </div>

          {isLoading && !liveSignals.length ? <p className="text-sm text-white/45">Reading recorded market state…</p> : null}
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
                  href={discoveryHref(signal.poll)}
                  state={signalState(signal.votesRemaining, signal.closeness)}
                />
              ))}
            </div>
          ) : !isLoading ? (
            <div className="marketing-compact-empty">
              <Users className="h-5 w-5 text-orange-400" />
              <div>
                <p className="text-sm font-black text-white">No recorded Demand questions are live here yet.</p>
                <p className="mt-1 text-xs leading-5 text-white/45">One legitimate ask can start a signal. PROMORANG does not invent popularity to fill the rail.</p>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section id="ask" className="marketing-stage border-b border-white/10 px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_.62fr] lg:items-start">
          <div>
            <p className="marketing-kicker">Know what is missing?</p>
            <h2 className="mt-3 text-4xl font-black sm:text-5xl">Ask the market.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55">
              Tell PROMORANG what you would like to find, try, attend, buy or experience. We first check related approved Discoveries and recorded Demand. If none fit, you can put your ask into the market.
            </p>

            <form onSubmit={submitAsk} className="mt-7 max-w-2xl">
              <label htmlFor="public-ask" className="mb-2 block text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
                What would you like to see in {marketName}?
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
                  {submitting ? "Recording…" : "Check the market"}<ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {resolution ? (
                <div className="mt-4 border border-orange-300/20 bg-orange-300/[0.06] p-4 sm:p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-300">Related market objects</p>
                  <p className="mt-2 text-sm leading-6 text-white/62">These look related to “{resolution.query}”. They are not being claimed as exact matches.</p>

                  {relatedDiscoveries.length ? (
                    <div className="mt-4 space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/35">Approved Discoveries</p>
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
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/35">Recorded Demand</p>
                      {relatedSignals.map((signal) => (
                        <Link key={signal.poll.id} to={discoveryHref(signal.poll)} className="flex items-center justify-between gap-3 border border-white/10 bg-black/25 px-4 py-3 transition hover:border-orange-300/35">
                          <span>
                            <span className="block text-sm font-bold text-white">{signal.poll.question}</span>
                            <span className="mt-1 block text-[11px] text-white/40">{signal.poll.totalVotes || 0} recorded vote{signal.poll.totalVotes === 1 ? "" : "s"}</span>
                          </span>
                          <ArrowRight className="h-4 w-4 shrink-0 text-orange-300" />
                        </Link>
                      ))}
                    </div>
                  ) : null}

                  <div className="mt-5 flex flex-wrap gap-3 border-t border-white/10 pt-4">
                    <button type="button" disabled={submitting} onClick={() => recordAskNow(resolution.query)} className="inline-flex min-h-11 items-center gap-2 rounded-md bg-white px-5 text-xs font-black text-black transition hover:bg-orange-100 disabled:opacity-50">
                      None of these — record my ask
                    </button>
                    <button type="button" onClick={() => setResolution(null)} className="inline-flex min-h-11 items-center gap-2 rounded-md border border-white/15 px-5 text-xs font-bold text-white/65 transition hover:text-white">
                      Edit my ask
                    </button>
                  </div>
                </div>
              ) : null}

              {askResult?.recorded ? (
                <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-emerald-300"><CheckCircle2 className="h-4 w-4" /> “{askResult.query}” was recorded as interest. It is not attendance, inventory or guaranteed supply.</p>
              ) : askResult ? (
                <p className="mt-3 inline-flex items-start gap-2 text-sm font-semibold text-amber-300"><XCircle className="mt-0.5 h-4 w-4 shrink-0" /> We could not confirm that “{askResult.query}” reached the market. It is not being presented as recorded public demand.</p>
              ) : null}
            </form>
          </div>

          <aside className="marketing-dark-note">
            <p className="marketing-kicker">Resolve before record</p>
            <h3 className="mt-4 text-2xl font-black">PROMORANG should try to help before it asks you to create more demand.</h3>
            <div className="mt-6 space-y-4 text-sm leading-6 text-white/55">
              <p><strong className="text-white">Found something?</strong><br />Open the approved Discovery first.</p>
              <p><strong className="text-white">Others already want it?</strong><br />Join the existing signal instead of fragmenting demand.</p>
              <p><strong className="text-white">Still missing?</strong><br />Then your ask becomes useful new market information.</p>
            </div>
          </aside>
        </div>
      </section>

      <section className="border-b border-white/10 px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[.78fr_1.22fr] lg:items-center">
          <div>
            <p className="marketing-kicker">PromoCard keeps the thread</p>
            <h2 className="mt-3 text-4xl font-black sm:text-5xl">Your place in the market should survive the moment.</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/55">
              PromoCard carries what you are watching, what you joined, access that was actually issued, and verified history worth keeping. It is continuity—not a promise that supply exists.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {[
                ["WATCHING", "What matters to me"],
                ["OPEN", "What I can actually use"],
                ["KEPT", "What really happened"],
              ].map(([label, text]) => (
                <div key={label} className="border-l-2 border-orange-500 bg-white/[0.025] px-4 py-3">
                  <p className="text-[10px] font-black tracking-[0.15em] text-orange-300">{label}</p>
                  <p className="mt-1 text-sm font-bold text-white">{text}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="marketing-promocard-stage">
            <PromoCardFace
              holder="Your PromoCard"
              available="What you're part of"
              limit="Watching · Open · Kept"
              places="One place to keep what you discover, back, access and actually do."
              action="See what changed"
              variant="membership"
              interactive={false}
            />
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#080808] px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <NightTrail eyebrow="One human loop" title="See → want → join → respond" steps={[
            { label: "See", title: "Encounter something worth noticing.", text: "An editorial lens can lead you in; an approved Discovery tells you what PROMORANG actually knows." },
            { label: "Want", title: "Recognize or express interest.", text: "React to what you discover or put something missing into the market yourself." },
            { label: "Join", title: "Shared interest becomes legible.", text: "Recorded Demand shows overlap without pretending interest is a purchase or attendance." },
            { label: "Respond", title: "Someone can put real supply behind it.", text: "A merchant, creator, host or brand decides whether to respond. Proof comes later from recorded action." },
          ]} />

          <PaperReceipt heading={`${inbox.city} market truth`} lines={[
            { label: "Discovery source", value: "Approved records", strong: true },
            { label: "Demand questions", value: inbox.questions.length.toLocaleString(), strong: true },
            { label: "Recorded votes", value: inbox.liveVoteCount.toLocaleString(), strong: true },
            { label: "Truth gate", value: "Interest ≠ supply", strong: true },
          ]} footer="When a response becomes an action, verified proof—not marketing language—determines what actually happened." />
        </div>
      </section>

      <section className="marketing-operator-band relative overflow-hidden border-b border-white/10 px-5 py-16 sm:px-6 md:py-24">
        <img src={operatorImage} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/55" />
        <div className="relative mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-3xl">
            <p className="marketing-kicker"><Building2 className="h-3.5 w-3.5" /> For the people who can respond</p>
            <h2 className="mt-3 text-4xl font-black sm:text-5xl">See what people want before you decide what to put into the market.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/60">Brands, merchants, hosts, creators and communities enter the same market from the supply side. A response stays separate from the Demand that caused it.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/for-brands" className="inline-flex min-h-12 items-center gap-2 rounded-md bg-orange-500 px-5 text-xs font-black uppercase tracking-[0.08em] text-black">For business <ArrowRight className="h-4 w-4" /></Link>
            <Link to="/join" className="inline-flex min-h-12 items-center gap-2 rounded-md border border-white/20 bg-black/45 px-5 text-xs font-black uppercase tracking-[0.08em] text-white">Choose a role</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

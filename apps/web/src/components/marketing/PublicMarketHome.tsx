import { FormEvent, useMemo, useState } from "react";
import { ArrowRight, Building2, CheckCircle2, Compass, MapPin, Search, Sparkles, Users, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { discoveryLocation, formatDiscoveryCategory } from "@promorang/shared";
import { PublicHomeBar } from "@/components/culture/PublicHomeBar";
import { DemandSignalObject } from "@/components/promorang/DemandSignalObject";
import { NightTrail, PaperReceipt, PromoCardFace, TicketPass } from "@/components/promorang/SignatureObjects";
import { useDiscoveryDemand } from "@/hooks/useDiscoveryDemand";
import { useDiscoveries } from "@/hooks/useDiscoveries";
import { useMarket } from "@/contexts/MarketContext";
import { discoveryHref } from "@/lib/discovery-path";

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
    limit: 3,
  });
  const [ask, setAsk] = useState("");
  const [askResult, setAskResult] = useState<{ query: string; recorded: boolean } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const liveSignals = useMemo(() => inbox.questions.slice(0, 4), [inbox.questions]);
  const leadSignal = liveSignals[0];

  async function submitAsk(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = ask.trim();
    if (!next || submitting) return;
    setSubmitting(true);
    try {
      const recorded = await recordAsk(next);
      setAskResult({ query: next, recorded });
      if (recorded) setAsk("");
    } finally {
      setSubmitting(false);
    }
  }

  const marketName = city.name === "All Jamaica" ? "Jamaica" : city.name;

  return (
    <main className="min-h-screen overflow-x-clip bg-[#070707] text-white selection:bg-orange-500 selection:text-black">
      <PublicHomeBar />

      <section className="relative border-b border-white/10 px-5 pb-16 pt-10 sm:px-6 md:pb-24 md:pt-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_5%,rgba(249,115,22,.2),transparent_34%),radial-gradient(circle_at_85%_22%,rgba(255,255,255,.05),transparent_28%)]" />
        <div className="relative mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-[minmax(0,.9fr)_minmax(500px,1.1fr)] lg:items-center">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 border-b border-orange-400/40 pb-2 font-mono text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">
              <Sparkles className="h-3.5 w-3.5" />
              Discover what moves you. Help shape what happens next.
            </div>
            <h1 className="mt-7 font-serif text-5xl font-bold leading-[.91] tracking-[-0.055em] sm:text-6xl lg:text-7xl xl:text-[5.35rem]">
              Find something.
              <br />
              <span className="text-orange-400">Want something.</span>
              <br />
              Move something.
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-white/65 sm:text-lg">
              You do not need to arrive knowing what you want. Explore things worth knowing about, join what other people are asking for, or put something missing into the market. Your PromoCard keeps your place in what happens next.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/discover" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-orange-500 px-6 text-sm font-black text-black transition hover:bg-orange-400">
                <Compass className="h-4 w-4" /> See what is out there
              </Link>
              <a href="#ask" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-6 text-sm font-black text-white transition hover:bg-white/[0.08]">
                I already want something <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="pointer-events-none absolute -inset-8 rounded-full bg-orange-500/10 blur-3xl" />
            <PromoCardFace
              holder="Your PromoCard"
              available="What you're part of"
              limit="Wants · openings · proof"
              places="One place to keep the things you discover, back, access and actually do."
              action="Keep your place"
              variant="membership"
              interactive={false}
            />
            <p className="mt-5 text-center text-xs leading-5 text-white/38">PromoCard is continuity, not a promise of supply. It keeps only the relationships, access and history PROMORANG can actually support.</p>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
            <div>
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">Do not know what you want yet?</p>
              <h2 className="mt-3 font-serif text-4xl font-bold tracking-[-0.045em] sm:text-5xl">Start with Discovery.</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/55">Discoveries are approved things worth knowing about. They help a preference become visible before a person ever thinks to type it into a search box.</p>
              <Link to="/discover" className="mt-6 inline-flex items-center gap-2 text-sm font-black text-orange-300">Explore approved Discoveries <ArrowRight className="h-4 w-4" /></Link>
            </div>

            {discoveriesLoading ? (
              <div className="grid gap-4 sm:grid-cols-3">{[0, 1, 2].map((item) => <div key={item} className="h-64 animate-pulse rounded-[1.6rem] bg-white/[0.04]" />)}</div>
            ) : discoveries.length ? (
              <div className="grid gap-4 sm:grid-cols-3">
                {discoveries.map((item) => (
                  <Link key={item.id} to={`/discoveries/${item.slug}`} className="group overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/[0.025] transition hover:border-orange-400/45">
                    <div className="relative h-36 bg-white/[0.04]">
                      {item.cover_image ? <img src={item.cover_image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="grid h-full place-items-center"><Compass className="h-8 w-8 text-white/15" /></div>}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    </div>
                    <div className="p-4">
                      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-orange-300">{formatDiscoveryCategory(item.category)}</p>
                      <h3 className="mt-2 font-serif text-xl font-bold leading-tight text-white">{item.title}</h3>
                      <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-5 text-white/40"><MapPin className="mt-0.5 h-3 w-3 shrink-0 text-orange-300" />{discoveryLocation(item)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <TicketPass kicker="Nothing approved yet" title="Being early should still be honest." detail="PROMORANG does not invent Discoveries to make a market look alive. Explore, ask for something, or help surface something worth knowing." stub="OPEN" stubLabel="Discovery" />
            )}
          </div>
        </div>
      </section>

      <section id="ask" className="border-b border-white/10 bg-[#0b0b0b] px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_.8fr] lg:items-start">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">Know what is missing?</p>
            <h2 className="mt-3 font-serif text-4xl font-bold tracking-[-0.045em] sm:text-5xl">Put it into the market.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55">Tell PROMORANG what you would like to find, try, attend, buy or experience. A recorded ask is interest—not attendance, inventory or a guaranteed response.</p>

            <form onSubmit={submitAsk} className="mt-7 max-w-2xl">
              <label htmlFor="public-ask" className="mb-2 block text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
                What would you like to see in {marketName}?
              </label>
              <div className="flex flex-col gap-2 rounded-[1.35rem] border border-white/12 bg-white/[0.055] p-2 sm:flex-row">
                <div className="flex min-w-0 flex-1 items-center gap-3 px-3">
                  <Search className="h-4 w-4 shrink-0 text-orange-400" />
                  <input id="public-ask" value={ask} onChange={(event) => setAsk(event.target.value)} placeholder="A late-night cafe, a product drop, somewhere to dance…" className="min-h-12 w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30" />
                </div>
                <button type="submit" disabled={!ask.trim() || submitting} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[1rem] bg-orange-500 px-5 text-xs font-black uppercase tracking-[0.12em] text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-40">
                  {submitting ? "Recording…" : "Put it up"}<ArrowRight className="h-4 w-4" />
                </button>
              </div>
              {askResult?.recorded ? (
                <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-emerald-300"><CheckCircle2 className="h-4 w-4" /> “{askResult.query}” was recorded.</p>
              ) : askResult ? (
                <p className="mt-3 inline-flex items-start gap-2 text-sm font-semibold text-amber-300"><XCircle className="mt-0.5 h-4 w-4 shrink-0" /> We could not confirm that “{askResult.query}” reached the market. It is not being presented as recorded public demand.</p>
              ) : null}
            </form>
          </div>

          {leadSignal ? (
            <DemandSignalObject city={inbox.city} title={leadSignal.poll.question} leadingOption={leadSignal.leading?.text} demandCount={leadSignal.poll.totalVotes || 0} threshold={leadSignal.poll.thresholdForMoment} responseLabel={leadSignal.poll.targetUnlockPerk} href={discoveryHref(leadSignal.poll)} actionLabel="Open signal" state={signalState(leadSignal.votesRemaining, leadSignal.closeness)} />
          ) : (
            <TicketPass kicker="No recorded signal yet" title="You can be early." detail="A market can begin with one legitimate ask. PROMORANG keeps empty state honest rather than substituting fake popularity." stub="FIRST" stubLabel="Signal" />
          )}
        </div>
      </section>

      <section id="wanted" className="border-b border-white/10 px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-[1440px]">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">What people are already behind · {inbox.city}</p>
              <h2 className="mt-3 max-w-4xl font-serif text-4xl font-bold tracking-[-0.045em] sm:text-5xl md:text-6xl">A private preference becomes more useful when other people feel it too.</h2>
            </div>
            <Link to="/discover" className="inline-flex items-center gap-2 text-sm font-black text-orange-300">Explore the market <ArrowRight className="h-4 w-4" /></Link>
          </div>

          {isLoading && !liveSignals.length ? <p className="mt-10 text-sm text-white/45">Reading recorded market state…</p> : null}
          {liveSignals.length ? (
            <div className="mt-10 grid gap-5 xl:grid-cols-2">
              {liveSignals.map((signal) => (
                <DemandSignalObject key={signal.poll.id} city={inbox.city} title={signal.poll.question} leadingOption={signal.leading?.text} demandCount={signal.poll.totalVotes || 0} threshold={signal.poll.thresholdForMoment} responseLabel={signal.poll.targetUnlockPerk} href={discoveryHref(signal.poll)} state={signalState(signal.votesRemaining, signal.closeness)} />
              ))}
            </div>
          ) : !isLoading ? (
            <div className="mt-10 border-y border-dashed border-white/15 py-10"><p className="font-serif text-2xl font-bold text-white">No recorded demand questions are live in this market yet.</p><p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">That absence is information. Discoveries can still help people recognize what they care about while legitimate demand forms.</p></div>
          ) : null}
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#0b0b0b] px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <NightTrail eyebrow="One human loop" title="See → want → join → respond → prove" steps={[
            { label: "See", title: "Encounter something worth noticing.", text: "An approved Discovery can surface a place, product, experience or possibility you did not know to ask for." },
            { label: "Want", title: "Recognize or express interest.", text: "You can react to what you discover or put something missing into the market yourself." },
            { label: "Join", title: "Shared interest becomes legible.", text: "Recorded demand shows when other people feel the same way without pretending interest is a purchase." },
            { label: "Respond", title: "Someone can put real supply behind it.", text: "A merchant, creator, host or brand decides whether and how to respond with a distinct offer or Moment." },
          ]} />

          <PaperReceipt heading={`${inbox.city} market truth`} lines={[
            { label: "Approved Discoveries", value: discoveries.length.toLocaleString(), strong: true },
            { label: "Demand questions", value: inbox.questions.length.toLocaleString(), strong: true },
            { label: "Recorded votes", value: inbox.liveVoteCount.toLocaleString(), strong: true },
            { label: "Truth gate", value: "Interest ≠ supply", strong: true },
          ]} footer="When a response becomes an action, verified proof—not marketing language—determines what actually happened." />
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-8 rounded-[2rem] border border-white/10 bg-white/[0.035] p-7 md:grid-cols-[1fr_auto] md:items-center md:p-10">
          <div>
            <p className="inline-flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-[0.2em] text-orange-300"><Users className="h-4 w-4" /> PromoCard is the thread</p>
            <h2 className="mt-3 font-serif text-3xl font-bold tracking-[-0.04em] sm:text-4xl">Keep your place in what you discover, want and actually do.</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/55">PromoCard connects the public market to your personal history: things you are watching, signals you joined, access that was actually issued, and verified participation worth keeping.</p>
          </div>
          <div className="flex flex-col gap-2">
            <Link to="/auth?mode=signup&next=/wallet" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-black text-black transition hover:bg-orange-100">Get PromoCard <ArrowRight className="h-4 w-4" /></Link>
            <Link to="/for-brands" className="inline-flex items-center justify-center gap-2 text-xs font-bold text-white/45"><Building2 className="h-3.5 w-3.5" /> See the business side</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
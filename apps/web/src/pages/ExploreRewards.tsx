import { FormEvent, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Gift, MapPin, Radio, Search, Sparkles } from "lucide-react";
import SEO from "@/components/SEO";
import { DemandSignalObject } from "@/components/promorang/DemandSignalObject";
import { WatchMarketObjectButton } from "@/components/market/WatchMarketObjectButton";
import { useDiscoveryDemand } from "@/hooks/useDiscoveryDemand";
import { useMarket } from "@/contexts/MarketContext";
import { usePublicOffers } from "@/hooks/useOffers";
import { discoveryHref } from "@/lib/discovery-path";
import { supabase } from "@/integrations/supabase/client";
import { getSiteUrl } from "@/lib/discovery";
import { trackGrowthEvent } from "@/lib/marketing-attribution";
import { CurrentArc } from "@/components/marketing/MarketingPhysics";
import { PromoCardFace } from "@/components/promorang/SignatureObjects";

function signalState(votesRemaining: number, closeness: "unlocking" | "warming" | "early") {
  if (votesRemaining === 0) return "threshold_met" as const;
  if (closeness === "unlocking") return "near_threshold" as const;
  return closeness;
}

export function ExploreRewards() {
  const { city, country } = useMarket();
  const { inbox, recordAsk, isLoading } = useDiscoveryDemand(
    city.name,
    country.slug || "jamaica",
    city.id === "all-jamaica" ? undefined : city.id,
  );
  const offersQuery = usePublicOffers();
  const [ask, setAsk] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ query: string; recorded: boolean } | null>(null);

  const responsesQuery = useQuery({
    queryKey: ["public-market-responses", city.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("view_public_moment_directory")
        .select("id, slug, title, venue_name, location, reward, image_url, starts_at, category")
        .not("reward", "is", null)
        .order("starts_at", { ascending: true })
        .limit(8);
      if (error) throw error;
      return (data || []).filter((row) => Boolean(row.reward));
    },
    staleTime: 30_000,
  });

  const liveSignals = useMemo(() => inbox.questions.slice(0, 8), [inbox.questions]);
  const responses = responsesQuery.data || [];
  const offers = (offersQuery.data || []).filter((offer) => ["active", "published", "live"].includes(offer.status)).slice(0, 8);
  const marketName = city.name === "All Jamaica" ? "Jamaica" : city.name;

  async function submitAsk(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = ask.trim();
    if (!query || submitting) return;
    setSubmitting(true);
    setResult(null);
    try {
      const recorded = await recordAsk(query);
      setResult({ query, recorded });
      if (recorded) {
        setAsk("");
        void trackGrowthEvent({
          eventName: "market_ask_recorded",
          journey: "participant",
          stage: "captured",
          entityType: "demand_intent",
          entityId: query.toLowerCase().slice(0, 120),
          properties: { city: marketName },
        });
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="marketing-cinematic min-h-screen bg-[#080808] px-5 pb-24 pt-24 text-white sm:px-6">\n      <CurrentArc variant="hero" className="marketing-hero-current" />
      <SEO
        title="Wanted + Responses — PROMORANG"
        description="See recorded demand separately from the Moments and offers operators have actually put into market."
        url={getSiteUrl("/discover/rewards")}
      />

      <div className="mx-auto max-w-[1320px]">
        <header className="grid gap-8 border-b border-white/10 pb-10 lg:grid-cols-[1fr_.72fr] lg:items-end">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-primary">Wanted + responses · {marketName}</p>
            <h1 className="mt-3 max-w-4xl font-serif text-5xl font-bold leading-[.94] tracking-[-.055em] sm:text-7xl">What people want is not the same thing as what exists.</h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/55 sm:text-base">This surface keeps the two sides separate. Demand shows recorded questions and votes. Responses show real Moments with a recorded reward or access proposition. A threshold never creates supply by itself.</p>
          </div>
          <div className="rounded-[1.7rem] border border-white/10 bg-white/[0.035] p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">Truth boundary</p>
            <p className="mt-3 font-serif text-2xl font-bold">Signal ≠ response ≠ outcome.</p>
            <p className="mt-2 text-xs leading-5 text-white/45">PROMORANG only advances the state when a separate source-backed record exists.</p>
          </div>
        </header>

        <section className="grid gap-8 border-b border-white/10 py-12 lg:grid-cols-[.72fr_1.28fr]">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-primary">Looking for something?</p>
            <h2 className="mt-3 font-serif text-4xl font-bold tracking-[-.04em]">Tell PROMORANG.</h2>
            <p className="mt-3 max-w-lg text-sm leading-6 text-white/50">Tell PROMORANG what you are looking for. Saving your interest does not create an Offer, reward Points, or promise that somebody will respond.</p>
          </div>
          <form onSubmit={submitAsk} className="self-end">
            <div className="flex flex-col gap-2 rounded-[1.4rem] border border-white/12 bg-white/[0.045] p-2 sm:flex-row">
              <div className="flex min-w-0 flex-1 items-center gap-3 px-3">
                <Search className="h-4 w-4 shrink-0 text-primary" />
                <input
                  value={ask}
                  onChange={(event) => { setAsk(event.target.value); setResult(null); }}
                  placeholder="A late-night café, a first-visit offer, a product, an experience…"
                  className="min-h-12 w-full bg-transparent text-sm outline-none placeholder:text-white/25"
                />
              </div>
              <button type="submit" disabled={!ask.trim() || submitting} className="min-h-12 rounded-[1rem] bg-primary px-5 text-xs font-black uppercase tracking-[0.12em] text-black disabled:opacity-40">
                {submitting ? "Saving…" : "Keep looking for this"}
              </button>
            </div>
            {result ? (
              <p className={`mt-3 text-xs leading-5 ${result.recorded ? "text-emerald-300" : "text-amber-200"}`}>
                {result.recorded
                  ? `PROMORANG is keeping an eye on “${result.query}”. This is recorded interest behind the scenes, not supply.`
                  : `PROMORANG could not confirm “${result.query}” was saved. Nothing is being presented as watched or counted.`}
              </p>
            ) : null}
          </form>
        </section>

        <section className="py-14" id="wanted">
          <div className="mb-7 flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-primary">Recorded demand</p>
              <h2 className="mt-2 font-serif text-4xl font-bold tracking-[-.04em]">What people are signaling.</h2>
            </div>
            <p className="max-w-md text-xs leading-5 text-white/40">Votes and asks are evidence of interest. They are not attendance, purchase intent, inventory or entitlement.</p>
          </div>

          {isLoading ? <p className="text-sm text-white/40">Loading recorded demand…</p> : liveSignals.length ? (
            <div className="grid gap-5 lg:grid-cols-2">
              {liveSignals.map((question) => {
                const href = discoveryHref(question.poll);
                return (
                  <div key={question.poll.id} className="space-y-3">
                    <DemandSignalObject
                      city={marketName}
                      title={question.poll.question}
                      leadingOption={question.leading?.text || null}
                      demandCount={question.poll.totalVotes || 0}
                      threshold={question.poll.thresholdForMoment || null}
                      matchedAsk={question.matchedAsks[0] || null}
                      responseLabel={question.poll.targetUnlockPerk || null}
                      href={href}
                      state={signalState(question.votesRemaining, question.closeness)}
                    />
                    <WatchMarketObjectButton
                      type="demand"
                      id={question.poll.id}
                      title={question.poll.question}
                      subtitle={`${question.poll.totalVotes || 0} recorded votes in ${marketName}`}
                      href={href}
                      metadata={{ city: marketName, recordedVotes: question.poll.totalVotes || 0 }}
                      compact
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[1.7rem] border border-dashed border-white/12 p-7">
              <Radio className="h-6 w-6 text-primary" />
              <h3 className="mt-4 font-serif text-2xl font-bold">No recorded demand questions are live here yet.</h3>
              <p className="mt-2 max-w-xl text-sm leading-6 text-white/45">That absence is real. Use the ask above or explore approved Discoveries rather than filling the surface with synthetic activity.</p>
              <Link to="/discover" className="mt-5 inline-flex items-center gap-2 text-sm font-black text-primary">Explore Discoveries <ArrowRight className="h-4 w-4" /></Link>
            </div>
          )}
        </section>

        <section className="border-t border-white/10 py-14" id="offers">
          <div className="mb-7 grid gap-4 border-b border-white/10 pb-5 lg:grid-cols-[1fr_.6fr] lg:items-end">
            <div>
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-primary">Offers & perks</p>
              <h2 className="mt-2 font-serif text-4xl font-bold tracking-[-.04em]">What somebody has actually made available.</h2>
            </div>
            <p className="text-xs leading-5 text-white/40">A public Offer is supply. Seeing it is not the same as receiving an issuance, claiming it, redeeming it or completing fulfillment.</p>
          </div>

          {offersQuery.isLoading ? <p className="text-sm text-white/40">Loading public Offers…</p> : offers.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {offers.map((offer) => (
                <article key={offer.id} className="flex min-h-[250px] flex-col border border-white/10 bg-white/[0.025] p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-orange-400/30 bg-orange-400/10 text-orange-300"><Gift className="h-5 w-5" /></div>
                  <p className="mt-5 text-[9px] font-black uppercase tracking-[0.16em] text-primary">{offer.reward_type.replace(/_/g, " ")}</p>
                  <h3 className="mt-2 text-xl font-black leading-tight">{offer.title}</h3>
                  {offer.description ? <p className="mt-3 line-clamp-3 text-xs leading-5 text-white/45">{offer.description}</p> : null}
                  <div className="mt-auto border-t border-white/10 pt-4 text-[10px] uppercase tracking-[0.1em] text-white/35">
                    {typeof offer.quantity_total === "number"
                      ? `${Math.max(0, offer.quantity_total - offer.quantity_reserved - offer.quantity_redeemed)} available`
                      : "Availability set by operator"}
                    <span className="mx-2">·</span>
                    {offer.fulfillment_type.replace(/_/g, " ")}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-white/12 p-7">
              <Gift className="h-6 w-6 text-primary" />
              <h3 className="mt-4 font-serif text-2xl font-bold">No public direct Offers are available right now.</h3>
              <p className="mt-2 max-w-xl text-sm leading-6 text-white/45">PROMORANG does not fill this space with sample perks. Reward-bearing Moments may still appear in the response section below.</p>
            </div>
          )}
        </section>

        <section className="border-t border-white/10 py-14" id="responses">
          <div className="mb-7 grid gap-4 border-b border-white/10 pb-5 lg:grid-cols-[1fr_.6fr] lg:items-end">
            <div>
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-primary">Actual responses</p>
              <h2 className="mt-2 font-serif text-4xl font-bold tracking-[-.04em]">What somebody has actually put into market.</h2>
            </div>
            <p className="text-xs leading-5 text-white/40">These are separate production Moment records carrying a recorded reward/access description. Opening one is not the same as receiving or redeeming it.</p>
          </div>

          {responsesQuery.isLoading ? <p className="text-sm text-white/40">Loading responses…</p> : responses.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {responses.map((moment) => {
                const href = `/moments/${moment.slug || moment.id}`;
                return (
                  <article key={moment.id} className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/[0.025]">
                    <div className="relative h-36 bg-white/[0.04]">
                      {moment.image_url ? <img src={moment.image_url} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center"><Sparkles className="h-7 w-7 text-white/15" /></div>}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                      <span className="absolute left-3 top-3 rounded-full border border-emerald-300/20 bg-black/65 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-emerald-200"><CheckCircle2 className="mr-1 inline h-3 w-3" />Recorded Moment</span>
                    </div>
                    <div className="p-4">
                      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-primary">{moment.category || "Moment"}</p>
                      <h3 className="mt-2 font-serif text-xl font-bold leading-tight">{moment.title}</h3>
                      <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-5 text-white/40"><MapPin className="mt-0.5 h-3 w-3 shrink-0 text-primary" />{moment.venue_name || moment.location || "Location on Moment"}</p>
                      <div className="mt-4 rounded-xl border border-white/10 bg-black/25 p-3">
                        <p className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.14em] text-white/35"><Gift className="h-3 w-3 text-primary" />Recorded response</p>
                        <p className="mt-1 text-xs font-bold text-white/75">{moment.reward}</p>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Link to={href} className="inline-flex min-h-9 items-center gap-2 rounded-full bg-primary px-4 text-[11px] font-black text-black">Open <ArrowRight className="h-3.5 w-3.5" /></Link>
                        <WatchMarketObjectButton type="moment" id={String(moment.id)} title={moment.title || "Moment"} subtitle={moment.reward || null} image={moment.image_url || null} href={href} compact />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[1.7rem] border border-dashed border-white/12 p-7">
              <Gift className="h-6 w-6 text-primary" />
              <h3 className="mt-4 font-serif text-2xl font-bold">No recorded responses with rewards are available right now.</h3>
              <p className="mt-2 max-w-xl text-sm leading-6 text-white/45">PROMORANG will not manufacture a deal because demand crossed a threshold. Operators have to put a distinct response into market.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default ExploreRewards;

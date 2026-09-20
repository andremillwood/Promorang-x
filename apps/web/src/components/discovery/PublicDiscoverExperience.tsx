import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, Compass, Gift, MapPin, Search, Sparkles, Users, WalletCards } from "lucide-react";
import SEO from "@/components/SEO";
import { useMarket } from "@/contexts/MarketContext";
import { useDiscoveries } from "@/hooks/useDiscoveries";
import { useDiscoveryDemand } from "@/hooks/useDiscoveryDemand";
import { useCanonicalMomentFeed } from "@/hooks/useCanonicalMomentFeed";
import { usePublicOffers } from "@/hooks/useOffers";
import { discoveryLocation, formatDiscoveryCategory } from "@promorang/shared";
import { discoveryHref } from "@/lib/discovery-path";
import { DemandSignalObject } from "@/components/promorang/DemandSignalObject";
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

export function PublicDiscoverExperience() {
  const { city, country } = useMarket();
  const [query, setQuery] = useState("");
  const cityFilter = city.id === "all-jamaica" ? undefined : city.name;

  const discoveriesQuery = useDiscoveries({ city: cityFilter, limit: 24 });
  const demand = useDiscoveryDemand(city.name, country.slug || "jamaica", city.id === "all-jamaica" ? undefined : city.id);
  const momentsQuery = useCanonicalMomentFeed();
  const offersQuery = usePublicOffers();

  const discoveries = discoveriesQuery.data || [];
  const moments = (momentsQuery.data?.moments || []).filter((moment) =>
    ["live", "starting_soon", "upcoming"].includes(moment.lifecycle),
  );
  const offers = (offersQuery.data || []).filter((offer) => ["active", "published", "live"].includes(offer.status));

  const normalizedQuery = query.trim().toLowerCase();
  const filteredDiscoveries = useMemo(
    () =>
      normalizedQuery
        ? discoveries.filter((item) =>
            [item.title, item.description, item.category, item.city, item.country]
              .filter(Boolean)
              .some((value) => String(value).toLowerCase().includes(normalizedQuery)),
          )
        : discoveries,
    [discoveries, normalizedQuery],
  );

  const filteredMoments = useMemo(
    () =>
      normalizedQuery
        ? moments.filter((item) =>
            [item.title, item.description, item.category, item.location, item.venue_name]
              .filter(Boolean)
              .some((value) => String(value).toLowerCase().includes(normalizedQuery)),
          )
        : moments,
    [moments, normalizedQuery],
  );

  const filteredOffers = useMemo(
    () =>
      normalizedQuery
        ? offers.filter((offer) =>
            [offer.title, offer.description, offer.reward_type, offer.fulfillment_type]
              .filter(Boolean)
              .some((value) => String(value).toLowerCase().includes(normalizedQuery)),
          )
        : offers,
    [offers, normalizedQuery],
  );

  const filteredSignals = useMemo(
    () =>
      normalizedQuery
        ? demand.inbox.questions.filter((signal) =>
            [signal.poll.question, signal.poll.contextNotes, ...signal.poll.options.map((option) => option.text)]
              .filter(Boolean)
              .some((value) => String(value).toLowerCase().includes(normalizedQuery)),
          )
        : demand.inbox.questions,
    [demand.inbox.questions, normalizedQuery],
  );

  const featuredMoment = filteredMoments[0] || moments[0] || null;
  const heroDiscovery = filteredDiscoveries[0] || discoveries[0] || null;
  const heroImage = featuredMoment?.image_url || heroDiscovery?.cover_image || heroMoments;
  const heroIsEditorial = !featuredMoment?.image_url && !heroDiscovery?.cover_image;
  const liveSignals = filteredSignals.slice(0, 4);

  return (
    <main className="marketing-cinematic public-discover-world min-h-screen bg-[#050505] text-white">
      <SEO
        title="Discover PROMORANG — Find what moves you"
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

            <div className="mt-8 max-w-2xl border border-white/14 bg-black/52 p-2 backdrop-blur">
              <label htmlFor="public-discover-search" className="sr-only">Search PROMORANG</label>
              <div className="flex min-h-12 items-center gap-3 px-3">
                <Search className="h-4 w-4 text-orange-400" />
                <input
                  id="public-discover-search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Food, house music, somewhere new, an offer…"
                  className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/35"
                />
                {query ? <button type="button" onClick={() => setQuery("")} className="text-[10px] font-black uppercase tracking-[0.12em] text-white/45">Clear</button> : null}
              </div>
            </div>

            {heroIsEditorial ? (
              <p className="mt-5 text-[9px] font-black uppercase tracking-[0.14em] text-white/38">Start with what catches your attention.</p>
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

      <section className="border-b border-white/10 bg-[#080808] px-5 py-14 sm:px-6 md:py-20">
        <div className="mx-auto max-w-[1440px]">
          <div className="marketing-section-head">
            <div>
              <p className="marketing-kicker">What {demand.inbox.city} wants</p>
              <h2 className="mt-3 text-4xl font-black sm:text-5xl">See where people are leaning right now.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/55">These are public Wants. Add your voice only when you genuinely want the same thing; your private taste choices are kept separate.</p>
            </div>
            <Link to="/#ask" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.1em] text-orange-300">Put something else on the table <ArrowRight className="h-4 w-4" /></Link>
          </div>

          {demand.isLoading && !liveSignals.length ? <p className="text-sm text-white/45">Loading what people want…</p> : null}
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
                  href={discoveryHref(signal.poll)}
                  state={signalState(signal.votesRemaining, signal.closeness)}
                  actionLabel="I want this too"
                />
              ))}
            </div>
          ) : !demand.isLoading ? (
            <div className="marketing-compact-empty">
              <Users className="h-5 w-5 text-orange-400" />
              <div><p className="text-sm font-black">No shared-interest questions here yet.</p><p className="mt-1 text-xs leading-5 text-white/45">Be the first to ask, or come back as more people speak up.</p></div>
            </div>
          ) : null}
        </div>
      </section>

      <TasteCalibration marketLabel={city.name} />

      <section className="px-5 py-14 sm:px-6 md:py-20">
        <div className="mx-auto max-w-[1440px]">
          <EditorialWorldRail />
        </div>
      </section>

      <section className="border-b border-white/10 px-5 py-14 sm:px-6 md:py-20">
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
      </section>

      <section className="border-b border-white/10 bg-[#080808] px-5 py-14 sm:px-6 md:py-20">
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
      </section>

      <section className="border-b border-white/10 px-5 py-14 sm:px-6 md:py-20">
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
      </section>

      

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

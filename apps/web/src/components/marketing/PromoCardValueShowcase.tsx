import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, Gift, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { PromoCardFace } from "@/components/promorang/SignatureObjects";
import { useCanonicalMomentFeed } from "@/hooks/useCanonicalMomentFeed";
import { usePublicOffers } from "@/hooks/useOffers";
import { useAuth } from "@/contexts/AuthContext";
import { momentLifecycleLabel } from "@/services/moment-feed";

function formatMomentDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(date);
}

function offerAvailability(quantityTotal?: number | null, quantityReserved = 0, quantityRedeemed = 0) {
  if (typeof quantityTotal !== "number") return "Availability set by operator";
  return `${Math.max(0, quantityTotal - quantityReserved - quantityRedeemed)} available`;
}

export function PromoCardValueShowcase() {
  const { user } = useAuth();
  const momentsQuery = useCanonicalMomentFeed();
  const offersQuery = usePublicOffers();

  const moments = (momentsQuery.data?.moments || [])
    .filter((moment) => ["live", "starting_soon", "upcoming"].includes(moment.lifecycle))
    .slice(0, 4);
  const offers = (offersQuery.data || [])
    .filter((offer) => offer.status === "active" || offer.status === "published" || offer.status === "live")
    .slice(0, 4);

  return (
    <section className="border-b border-white/10 px-5 py-16 sm:px-6 md:py-24">
      <div className="mx-auto max-w-[1440px]">
        <div className="marketing-section-head">
          <div>
            <p className="marketing-kicker">Why PromoCard matters</p>
            <h2 className="mt-3 max-w-4xl text-4xl font-black sm:text-5xl">The card should change what becomes possible for you.</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/55">
              PromoCard is not valuable because it is a card. It is valuable because it keeps your relationship to things you care about, carries real access when it opens, and preserves what actually happened afterward.
            </p>
          </div>
          <Link to={user ? "/wallet" : "/auth?mode=signup&next=/wallet"} className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.1em] text-orange-300">
            {user ? "Open my PromoCard" : "Get my PromoCard"} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="marketing-card-value-grid">
          <div className="marketing-promocard-stage">
            <PromoCardFace
              holder={user ? "Your PromoCard" : "Your PromoCard"}
              available="What changed because you joined"
              limit="Watching · Open · Kept"
              places="Interests, access, Moments, offers and verified history stay connected to one identity."
              action={user ? "See what changed" : "Keep your place"}
              variant="membership"
              interactive={false}
            />
          </div>

          <div className="marketing-benefit-stack">
            {[
              ["WATCH", "Do not lose the things you care about.", "Keep a Discovery, Demand signal or Moment attached to you so PROMORANG can show what changed."],
              ["OPEN", "See when something becomes usable.", "An issued Offer, access window or Moment is different from interest. PromoCard can surface what is actually available."],
              ["PROVE", "Let real actions count.", "Attendance, claims, purchases or other actions only move forward when their required proof exists."],
              ["KEEP", "Carry the result forward.", "Verified history, retained access and memories should still be there after the original moment passes."],
              ["RETURN", "Come back because something changed.", "A watched object can produce a source-backed update when PROMORANG has something materially new to show you."],
            ].map(([label, title, copy]) => (
              <article key={label} className="marketing-benefit-row">
                <span>{label}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-16">
          <div className="marketing-section-head">
            <div>
              <p className="marketing-kicker">Moments</p>
              <h2 className="mt-3 text-3xl font-black sm:text-4xl">Things you can actually show up for.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/50">These come from the canonical Moment feed. No sample Moments are substituted here.</p>
            </div>
            <Link to="/discover/moments" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.1em] text-orange-300">See all Moments <ArrowRight className="h-4 w-4" /></Link>
          </div>

          {momentsQuery.isLoading ? (
            <div className="marketing-live-rail">{[0,1,2,3].map((item) => <div key={item} className="marketing-live-card animate-pulse bg-white/[0.04]" />)}</div>
          ) : moments.length ? (
            <div className="marketing-live-rail">
              {moments.map((moment) => (
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
                    {formatMomentDate(moment.starts_at) ? <p className="mt-2 text-[11px] font-bold text-white/60">{formatMomentDate(moment.starts_at)}</p> : null}
                    {moment.reward ? <p className="marketing-live-card__perk"><Gift className="h-3.5 w-3.5" /> {moment.reward}</p> : null}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="marketing-compact-empty">
              <CalendarDays className="h-5 w-5 text-orange-400" />
              <div><p className="text-sm font-black">No current Moments are available from the canonical feed.</p><p className="mt-1 text-xs leading-5 text-white/45">PROMORANG will leave this honest rather than fill it with examples.</p></div>
            </div>
          )}
        </div>

        <div className="mt-16">
          <div className="marketing-section-head">
            <div>
              <p className="marketing-kicker">Perks & access</p>
              <h2 className="mt-3 text-3xl font-black sm:text-4xl">Things somebody has actually made available.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/50">Public Offers are supply. Seeing one does not mean it has been issued to you; claiming and fulfillment remain separate states.</p>
            </div>
            <Link to="/discover/rewards#offers" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.1em] text-orange-300">Explore perks & responses <ArrowRight className="h-4 w-4" /></Link>
          </div>

          {offersQuery.isLoading ? (
            <div className="marketing-offer-rail">{[0,1,2,3].map((item) => <div key={item} className="marketing-offer-card animate-pulse bg-white/[0.04]" />)}</div>
          ) : offers.length ? (
            <div className="marketing-offer-rail">
              {offers.map((offer) => (
                <article key={offer.id} className="marketing-offer-card">
                  <div className="marketing-offer-card__mark"><Gift className="h-5 w-5" /></div>
                  <p className="text-[9px] font-black uppercase tracking-[0.14em] text-orange-300">{offer.reward_type.replace(/_/g, " ")}</p>
                  <h3>{offer.title}</h3>
                  {offer.description ? <p className="marketing-offer-card__copy">{offer.description}</p> : null}
                  <div className="marketing-offer-card__facts">
                    <span>{offerAvailability(offer.quantity_total, offer.quantity_reserved, offer.quantity_redeemed)}</span>
                    <span>{offer.fulfillment_type.replace(/_/g, " ")}</span>
                  </div>
                  <div className="mt-auto border-t border-white/10 pt-3">
                    <p className="flex items-center gap-1.5 text-[10px] leading-5 text-white/42"><ShieldCheck className="h-3.5 w-3.5 text-orange-300" />Offer ≠ issuance ≠ redemption</p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="marketing-compact-empty">
              <Gift className="h-5 w-5 text-orange-400" />
              <div><p className="text-sm font-black">No public direct Offers are available in this market right now.</p><p className="mt-1 text-xs leading-5 text-white/45">Reward-bearing Moments may still exist below the responses surface.</p></div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

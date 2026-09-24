import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, Gift, MapPin, RotateCcw, ShieldCheck, Sparkles } from "lucide-react";
import { PromoCardFace } from "@/components/promorang/SignatureObjects";
import { CurrentArc } from "@/components/marketing/MarketingPhysics";
import { useCanonicalMomentFeed } from "@/hooks/useCanonicalMomentFeed";
import { usePublicOffers } from "@/hooks/useOffers";
import { useAuth } from "@/contexts/AuthContext";
import { momentLifecycleLabel } from "@/services/moment-feed";
import { useI18n } from "@/i18n/I18nContext";

function offerAvailability(quantityTotal?: number | null, quantityReserved = 0, quantityRedeemed = 0) {
  if (typeof quantityTotal !== "number") return "Availability set by operator";
  return `${Math.max(0, quantityTotal - quantityReserved - quantityRedeemed)} available`;
}

export function PromoCardValueShowcase() {
  const { t, formatDate } = useI18n();
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
            <p className="marketing-kicker">{t("clarity.cardValueKicker")}</p>
            <h2 className="mt-3 max-w-4xl text-4xl font-black sm:text-5xl">{t("clarity.cardValueTitle")}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/55">
              {t("clarity.cardValueCopy")}
            </p>
          </div>
          <Link to={user ? "/card" : "/auth?mode=signup&role=participant&next=/card"} className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.1em] text-orange-300">
            {user ? t("clarity.openMyCard") : t("clarity.getMyCard")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="marketing-card-value-grid relative">
          <CurrentArc variant="return" className="marketing-promocard-return-arc" />
          <div className="marketing-promocard-stage">
            <div className="marketing-return-landing__label mb-4"><RotateCcw className="h-4 w-4" /> {t("clarity.cardInOnePlace")}</div>
            <PromoCardFace
              holder={t("clarity.yourPromoCard")}
              available={t("clarity.whatOpens")}
              limit={t("clarity.cardStates")}
              places={t("clarity.cardSummary")}
              action={user ? t("clarity.openMyCard") : t("clarity.getMyCard")}
              variant="membership"
              interactive={false}
            />
          </div>

          <div className="marketing-benefit-stack">
            {[
              ["WANTED", "Remember what you asked for.", "Keep the things you care about connected to you while the signal grows."],
              ["WATCHING", "Know when something changes.", "Come back when a Want, Discovery, Moment or Offer has a meaningful update."],
              ["OPEN", "Find what became available.", "Real access, offers and Moments have a clear place to land when they open."],
              ["ACTIVE", "Keep your next move clear.", "See what you claimed, reserved or committed to without confusing it with completion."],
              ["KEPT", "Carry the outcome forward.", "What you used, earned or completed can stay in your history."],
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
              <p className="marketing-kicker">Open on PromoCard</p>
              <h2 className="mt-3 text-3xl font-black sm:text-4xl">Real things you can decide to join.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/50">Moments are one kind of thing that can move from interesting to actionable on your PromoCard.</p>
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
                    {moment.starts_at ? <p className="mt-2 text-[11px] font-bold text-white/60">{formatDate(moment.starts_at, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</p> : null}
                    {moment.reward ? <p className="marketing-live-card__perk"><Gift className="h-3.5 w-3.5" /> {moment.reward}</p> : null}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="marketing-compact-empty">
              <CalendarDays className="h-5 w-5 text-orange-400" />
              <div><p className="text-sm font-black">Nothing is happening here right now.</p><p className="mt-1 text-xs leading-5 text-white/45">Check back soon or explore what else is moving.</p></div>
            </div>
          )}
        </div>

        <div className="mt-16">
          <div className="marketing-section-head">
            <div>
              <p className="marketing-kicker">Offers & access</p>
              <h2 className="mt-3 text-3xl font-black sm:text-4xl">Things that can become usable.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/50">Open an Offer to see what exists, how much is available, the terms, and whether it belongs on your PromoCard.</p>
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
                    <p className="flex items-center gap-1.5 text-[10px] leading-5 text-white/42"><ShieldCheck className="h-3.5 w-3.5 text-orange-300" />Check the terms and availability before you use it</p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="marketing-compact-empty">
              <Gift className="h-5 w-5 text-orange-400" />
              <div><p className="text-sm font-black">Nothing is open here right now.</p><p className="mt-1 text-xs leading-5 text-white/45">Keep exploring or come back when something new opens.</p></div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

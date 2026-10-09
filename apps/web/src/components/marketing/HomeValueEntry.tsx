import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock3, MapPin, Sparkles, Utensils, Music2, Heart, ShoppingBag, Plus } from "lucide-react";
import { findOrAskRecoveryHref } from "@promorang/shared";
import { usePublicOffers } from "@/hooks/useOffers";
import { useI18n } from "@/i18n/I18nContext";
import type { TranslationKey } from "@/i18n/translations";

import foodPhoto from "@/assets/moment-food-festival.jpg";
import nightlifePhoto from "@/assets/moment-concert.jpg";
import wellnessPhoto from "@/assets/moment-yoga.jpg";
import shoppingPhoto from "@/assets/moments/pottery.jpg";
import explorePhoto from "@/assets/moments/sunset-photo.jpg";

const interestPhotos = { food: foodPhoto, nightlife: nightlifePhoto, wellness: wellnessPhoto, shopping: shoppingPhoto, other: explorePhoto };
const interests = ["food", "nightlife", "wellness", "shopping", "other"] as const;
const interestIcons = { food: Utensils, nightlife: Music2, wellness: Heart, shopping: ShoppingBag, other: Plus };

export function HomeValueEntry({ market }: { market: string }) {
  const { t, locale } = useI18n();
  const offers = usePublicOffers();
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);
  const offer = offers.data?.filter(item => item.status === "active" && item.offer_distributions?.some(distribution => distribution.channel === "direct" && distribution.is_active === true && (distribution.allocation_limit == null || (distribution.allocation_count != null && distribution.allocation_count < distribution.allocation_limit))) && Date.parse(item.starts_at) <= now && (!item.ends_at || Date.parse(item.ends_at) > now) && (item.quantity_total == null || item.quantity_total > item.quantity_reserved + item.quantity_redeemed))
    .sort((a, b) => (a.ends_at ? Date.parse(a.ends_at) : Infinity) - (b.ends_at ? Date.parse(b.ends_at) : Infinity))[0];
  const remaining = offer?.quantity_total == null ? null : offer.quantity_total - offer.quantity_reserved - offer.quantity_redeemed;

  return <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
    <div>
      <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-orange-300"><MapPin className="h-4 w-4" />{market}</p>
      <h2 className="mt-4 max-w-2xl font-sans text-3xl font-semibold leading-tight tracking-tight">{t("homeIntro.value")}</h2>
      <p className="mt-5 max-w-xl text-base leading-7 text-white/80">{t("homeIntro.valueCopy")}</p>
      <div className="mt-6 rounded-xl border border-white/15 bg-[#1b211b] p-5">
        {offers.isLoading ? <p role="status">{t("homeValue.loading")}</p> : offers.isError ? <div role="status"><p>{t("homeValue.error")}</p><button onClick={() => void offers.refetch()} className="mt-2 min-h-11 font-bold text-orange-300">{t("compression.retry")}</button></div> : offer ? <>
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-orange-300"><Sparkles className="h-4 w-4" />{t("homeValue.available")}</p>
          <h2 className="mt-3 text-2xl font-bold">{offer.title}</h2>
          <p className="mt-2 text-sm leading-6 text-white/80">{offer.description || offer.terms}</p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm text-amber-200">
            {offer.ends_at ? <span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4" />{t("homeValue.ends", { date: new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(offer.ends_at)) })}</span> : null}
            {remaining !== null ? <span>{t("homeValue.remaining", { count: remaining })}</span> : null}
          </div>
          <Link to={`/offers/${encodeURIComponent(offer.id)}`} className="mt-4 inline-flex min-h-11 items-center gap-2 font-bold text-orange-300">{t("homeValue.terms")}<ArrowRight className="h-4 w-4" /></Link>
        </> : <><h2 className="text-xl font-bold">{t("homeValue.noOffer")}</h2><p className="mt-2 text-sm leading-6 text-white/75">{t("homeValue.noOfferCopy")}</p></>}
      </div>
    </div>
    <HomeOfferRequest market={market} />
  </div>;
}

export function HomeOfferRequest({ market }: { market: string }) {
  const { t: webT } = useI18n();
  const { t, locale } = useI18n();
  const [interest, setInterest] = useState<string>("");
  const [request, setRequest] = useState("");
  const requestHref = findOrAskRecoveryHref("request_something", { query: request, city: market, language: locale, source: "home" });
  return (
    <section id="request-offer" aria-labelledby="offer-request-title" className="home-demand-card scroll-mt-36">
      <p className="home-demand-eyebrow"><Sparkles size={15} aria-hidden="true" />{t("homeDemand.eyebrow")}</p>
      <h2 id="offer-request-title" className="font-sans text-2xl font-semibold tracking-tight">{t("homeDemand.title")}</h2>
      <p className="mt-3 text-sm leading-6 text-white/75">{t("homeOpportunity.requestBenefit")}</p>
      <div className="home-demand-choices">
        {interests.map(key => { const Icon = interestIcons[key]; return <button key={key} type="button" aria-pressed={interest === key} onClick={() => { setInterest(key); setRequest(key === "other" ? "" : t(`homeValue.${key}` as TranslationKey)); }} className="home-demand-choice"><img className="home-demand-choice-photo" src={interestPhotos[key]} alt="" loading="lazy" decoding="async" /><Icon size={21} aria-hidden="true" /><span>{t(`homeValue.${key}` as TranslationKey)}</span><ArrowRight size={16} aria-hidden="true" /></button>; })}
      </div>
      <p className="home-demand-route"><span className={interest ? "is-complete" : "is-current"}>{webT("home.journey1Label")} {t("homeDemand.choose")}</span><ArrowRight size={13} aria-hidden="true" /><span className={interest ? "is-current" : ""}>{webT("home.journey2Label")} {t("homeDemand.define")}</span></p>
      {interest ? <div className="home-demand-detail">
        <label htmlFor="home-offer-request" className="block text-sm font-bold">{t("homeValue.detail")}</label>
        {interest === "food" ? <div className="mt-3 flex flex-wrap gap-2">{["two", "group", "lunch"].map(key => <button type="button" key={key} aria-pressed={request === t(`homeValue.${key}` as TranslationKey)} onClick={() => setRequest(t(`homeValue.${key}` as TranslationKey))} className="min-h-11 rounded-xl border border-white/20 px-3 text-left text-sm text-orange-200 hover:border-orange-300">{t(`homeValue.${key}` as TranslationKey)}</button>)}</div> : null}
        <textarea id="home-offer-request" value={request} maxLength={240} placeholder={t("homeDemand.placeholder")} onChange={event => setRequest(event.target.value)} className="mt-3 min-h-24 w-full rounded-xl border border-white/25 bg-black/40 p-3 text-base text-white focus:border-orange-300 focus:outline-none" />
        {request.trim().length >= 3 ? <Link to={requestHref} className="mt-3 inline-flex min-h-12 items-center gap-2 rounded-full bg-orange-400 px-5 text-sm font-black text-black hover:bg-orange-300">{t("homeValue.request")}<ArrowRight className="h-4 w-4" /></Link> : null}
      </div> : null}
      <div className="home-demand-footer"><MapPin size={14} aria-hidden="true" /><span>{market}</span><Link to="/discover?tab=wants">{t("homeDemand.browse")}<ArrowRight size={14} aria-hidden="true" /></Link></div>
      {interest ? <p className="mt-4 text-xs leading-5 text-white/65">{t("homeValue.hint")}</p> : null}
    </section>
  );
}

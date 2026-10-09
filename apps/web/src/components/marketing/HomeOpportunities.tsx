import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, MapPin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/i18n/I18nContext";
import { usePublicOffers } from "@/hooks/useOffers";
import { API_BASE_URL } from "@/lib/api";
import type { CanonicalMoment } from "@/services/moment-feed";
import { HomeOfferRequest } from "./HomeValueEntry";
import { buildHomeOpportunities, type HomeMission, type OpportunityKind } from "./home-opportunities";

export function HomeOpportunities({ market, moments, momentsLoading, momentsError, retryMoments }: {
  market: string; moments: CanonicalMoment[]; momentsLoading: boolean; momentsError: boolean; retryMoments: () => unknown;
}) {
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const offers = usePublicOffers();
  const missions = useQuery({
    queryKey: ["home-public-missions"],
    enabled: moments.length > 0,
    staleTime: 60_000,
    retry: 1,
    queryFn: async (): Promise<HomeMission[]> => {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 12000);
      try {
        const response = await fetch(`${API_BASE_URL}/o2o/feed`, { signal: controller.signal });
        const payload = await response.json();
        if (!response.ok || !Array.isArray(payload.feed)) throw new Error("Could not load missions");
        return payload.feed;
      } finally { window.clearTimeout(timeout); }
    },
  });
  const [selected, setSelected] = useState<OpportunityKind | "request" | null>(null);
  const [index, setIndex] = useState(0);
  const [now, setNow] = useState(Date.now);
  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 30_000); return () => window.clearInterval(timer); }, []);
  const inventory = buildHomeOpportunities(offers.data || [], moments, missions.data || [], now);
  const allLoading = offers.isLoading || momentsLoading || missions.isFetching;
  const kind = selected || inventory[0]?.kind || (allLoading ? "offers" : "request");
  const entries = inventory.filter(item => item.kind === kind);
  const item = entries[index % Math.max(1, entries.length)];
  const loading = kind === "offers" ? offers.isLoading : kind === "moments" ? momentsLoading : kind === "missions" ? momentsLoading || missions.isFetching : false;
  const error = kind === "offers" ? offers.isError : kind === "moments" ? momentsError : kind === "missions" ? missions.isError || momentsError : !inventory.length && (offers.isError || momentsError);
  const retry = () => { void offers.refetch(); void retryMoments(); if (moments.length) void missions.refetch(); };

  return <div className="home-opportunities">
    <div className="home-opportunity-tabs" aria-label={t("homeIntro.explore")}>
      {(["offers", "moments", "missions", "request"] as const).map(value => <button type="button" key={value} aria-pressed={kind === value} onClick={() => { setSelected(value); setIndex(0); }}>{t(`homeOpportunity.${value}`)}</button>)}
    </div>
    {error ? <div role="status" className="home-opportunity-notice">{t("homeOpportunity.error")} <button type="button" onClick={retry}>{t("compression.retry")}</button></div> : null}
    {kind === "request" ? <HomeOfferRequest market={market} /> : loading && !item ? <p role="status" className="home-opportunity-empty">{t("homeOpportunity.loading")}</p> : item ? <article className="home-opportunity-card">
      {item.image ? <img className="home-opportunity-image" src={item.image} alt="" /> : null}
      <div className="home-opportunity-body">
        <p className="home-opportunity-kicker">{t(`homeOpportunity.${item.kind}`)}</p>
        <h2>{item.title}</h2>
        {item.location ? <p className="home-opportunity-location"><MapPin size={14} aria-hidden="true" />{item.location}</p> : null}
        <p className="home-opportunity-benefit-label">{t("homeOpportunity.benefit")}</p>
        <p className="home-opportunity-summary">{item.benefit || t(item.kind === "missions" ? "homeOpportunity.missionTerms" : "homeOpportunity.eventBenefit")}</p>
        {item.date ? <p className="home-opportunity-date">{item.kind === "offers" ? t("homeValue.ends", { date: new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.date)) }) : new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.date))}</p> : null}
        <Link className="home-opportunity-details" to={item.href}>{t("homeOpportunity.details")}<ArrowRight size={16} /></Link>
        <Link className="home-primary-link" to={user ? item.href : `/auth?mode=signup&role=participant&next=${encodeURIComponent(item.href)}`}>{t(user ? "homeOpportunity.continue" : "homeOpportunity.activate")}<ArrowRight size={16} /></Link>
        <p className="home-opportunity-account">{t("homeOpportunity.account")}</p>
      </div>
    </article> : <div><p className="home-opportunity-empty">{t("homeOpportunity.empty")}</p><HomeOfferRequest market={market} /></div>}
    {entries.length > 1 ? <div className="home-opportunity-controls"><button type="button" aria-label={t("homeOpportunity.previous")} onClick={() => setIndex((index + entries.length - 1) % entries.length)}><ArrowLeft size={18} /></button><span>{index % entries.length + 1} / {entries.length}</span><button type="button" aria-label={t("homeOpportunity.next")} onClick={() => setIndex((index + 1) % entries.length)}><ArrowRight size={18} /></button></div> : null}
  </div>;
}

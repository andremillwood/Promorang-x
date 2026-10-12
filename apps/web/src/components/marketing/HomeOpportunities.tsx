import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import { usePublicOffers } from "@/hooks/useOffers";
import { API_BASE_URL } from "@/lib/api";
import type { CanonicalMoment } from "@/services/moment-feed";
import { HomeOpportunityCard } from "./HomeOpportunityCard";
import { HomeOfferRequest } from "./HomeValueEntry";
import { buildHomeOpportunities, type HomeMission, type OpportunityKind } from "./home-opportunities";

export function HomeOpportunities({ market, moments, momentsLoading, momentsError, retryMoments }: {
  market: string; moments: CanonicalMoment[]; momentsLoading: boolean; momentsError: boolean; retryMoments: () => unknown;
}) {
  const { t } = useI18n();
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

  const gesture = useRef<{ x: number; y: number; id: number; item: string } | null>(null);
  const move = (direction: number) => setIndex(current => (current + direction + entries.length) % Math.max(1, entries.length));
  const position = t("homeOpportunity.position", { current: index % Math.max(1, entries.length) + 1, total: entries.length });

  return <div className="home-opportunities">
    <div className="home-opportunity-tabs" aria-label={t("homeIntro.explore")}>
      {(["offers", "moments", "missions", "request"] as const).map(value => <button type="button" key={value} aria-pressed={kind === value} onClick={() => { setSelected(value); setIndex(0); }}>{t(`homeOpportunity.${value}`)}</button>)}
    </div>
    {error ? <div role="status" className="home-opportunity-notice">{t("homeOpportunity.error")} <button type="button" onClick={retry}>{t("compression.retry")}</button></div> : null}
    {kind === "request" ? <HomeOfferRequest market={market} /> : loading && !item ? <p role="status" className="home-opportunity-empty">{t("homeOpportunity.loading")}</p> : item ? <div
      className="home-opportunity-carousel"
      role="group"
      aria-label={t(`homeOpportunity.${item.kind}`)}
      tabIndex={entries.length > 1 ? 0 : undefined}
      onKeyDown={event => {
        if (event.target !== event.currentTarget || entries.length < 2) return;
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          move(event.key === "ArrowLeft" ? -1 : 1);
        }
      }}
      onPointerDown={event => {
        gesture.current = null;
        if (!event.isPrimary || event.pointerType === "mouse" || entries.length < 2 ||
          (event.target as HTMLElement).closest("a, button, input, textarea, select, summary")) return;
        gesture.current = { x: event.clientX, y: event.clientY, id: event.pointerId, item: item.id };
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerCancel={() => { gesture.current = null; }}
      onPointerUp={event => {
        const start = gesture.current;
        gesture.current = null;
        if (!start || start.id !== event.pointerId || start.item !== item.id) return;
        const dx = event.clientX - start.x;
        const dy = event.clientY - start.y;
        if (Math.abs(dx) >= 48 && Math.abs(dx) > Math.abs(dy) * 1.5) move(dx < 0 ? 1 : -1);
      }}
    >
      <HomeOpportunityCard key={`${item.kind}:${item.id}`} item={item} />
    </div> : <div><p className="home-opportunity-empty">{t("homeOpportunity.empty")}</p><HomeOfferRequest market={market} /></div>}
    {entries.length > 1 ? <div className="home-opportunity-controls">
      <button type="button" aria-label={t("homeOpportunity.previous")} onClick={() => move(-1)}><ArrowLeft size={16} aria-hidden="true" /></button>
      <span role="status" aria-live="polite" aria-atomic="true"><span aria-hidden="true">{index % entries.length + 1} / {entries.length}</span><span className="sr-only">{position}: {item?.title}</span></span>
      <button type="button" aria-label={t("homeOpportunity.next")} onClick={() => move(1)}><ArrowRight size={16} aria-hidden="true" /></button>
    </div> : null}
  </div>;
}

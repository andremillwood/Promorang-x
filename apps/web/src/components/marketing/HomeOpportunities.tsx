import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
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
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  useEffect(() => {
    const media = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!media) return;
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
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

  // Rotate real inventory only. Requests are never replaced while somebody is composing one.
  const rotationKey = inventory.map(entry => `${entry.kind}:${entry.id}`).join("|");
  const canRotate = inventory.length > 1 && kind !== "request";
  useEffect(() => {
    if (!canRotate || paused || hovered || focused || reducedMotion) return;
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      const current = inventory.findIndex(entry => entry.kind === kind && entry.id === item?.id);
      const next = inventory[(current + 1) % inventory.length];
      setSelected(next.kind);
      setIndex(inventory.filter(entry => entry.kind === next.kind).findIndex(entry => entry.id === next.id));
    }, 8000);
    return () => window.clearInterval(timer);
  // The stable inventory signature avoids restarting the clock on unrelated renders.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rotationKey, kind, item?.id, canRotate, paused, hovered, focused, reducedMotion]);

  const gesture = useRef<{ x: number; y: number; id: number; item: string } | null>(null);
  const move = (direction: number) => { setPaused(true); setIndex(current => (current + direction + entries.length) % Math.max(1, entries.length)); };
  const position = t("homeOpportunity.position", { current: index % Math.max(1, entries.length) + 1, total: entries.length });

  return <div className="home-opportunities"
    onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    onFocusCapture={() => setFocused(true)}
    onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false); }}>
    <div className="home-showcase-toolbar">
    <div className="home-opportunity-tabs" aria-label={t("homeIntro.explore")}>
      {(["offers", "moments", "missions", "request"] as const).map(value => <button type="button" key={value} aria-pressed={kind === value} onClick={() => { setSelected(value); setIndex(0); setPaused(true); }}>{t(`homeOpportunity.${value}`)}</button>)}
    </div>
    {canRotate && !reducedMotion ? <button className="home-rotation-toggle" type="button" aria-label={t(paused ? "homeOpportunity.resume" : "homeOpportunity.pause")} onClick={() => setPaused(value => !value)}>{paused ? <Play size={15} aria-hidden="true" /> : <Pause size={15} aria-hidden="true" />}</button> : null}
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
      <span role="status" aria-live={paused || focused ? "polite" : "off"} aria-atomic="true"><span aria-hidden="true">{index % entries.length + 1} / {entries.length}</span><span className="sr-only">{position}: {item?.title}</span></span>
      <button type="button" aria-label={t("homeOpportunity.next")} onClick={() => move(1)}><ArrowRight size={16} aria-hidden="true" /></button>
    </div> : null}
  </div>;
}

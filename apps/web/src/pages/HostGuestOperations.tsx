import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { AlertTriangle, ArrowLeft, CheckCircle2, Clock3, MessageCircleWarning, ScanLine, Search, TicketCheck, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GuidanceDisclosure } from "@/components/guidance/GuidanceDisclosure";
import { translate, useI18n } from "@/i18n/I18nContext";
import type { TranslationKey } from "@/i18n/translations";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";
async function api(path: string, options?: RequestInit) {
  const { data } = await supabase.auth.getSession();
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${data.session?.access_token || ""}`,
      ...options?.headers,
    },
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || translate("hostOps.requestFailed"));
  return body;
}

const STATUS_KEYS: Record<string, TranslationKey> = {
  checked_in: "hostOps.statusCheckedIn",
  confirmed: "hostOps.statusConfirmed",
};

export default function HostGuestOperations() {
  const { t, formatTime } = useI18n();
  const { momentId = "" } = useParams();
  const [search, setSearch] = useState("");
  const [code, setCode] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [retrying, setRetrying] = useState("");
  const query = useQuery({
    queryKey: ["guest-operations", momentId],
    queryFn: () => api(`/api/guest-rsvp/moments/${momentId}/operations`),
    refetchInterval: 30000,
  });

  const checkIn = async (raw: string) => {
    if (!raw.trim()) return;
    setBusy(true);
    setNotice("");
    try {
      const data = await api(`/api/guest-rsvp/moments/${momentId}/check-in`, {
        method: "POST",
        body: JSON.stringify({ code: raw, verification_method: "manual" }),
      });
      setNotice(
        data.already_checked_in
          ? t("hostOps.alreadyIn", { name: data.guest.full_name })
          : t("hostOps.nowIn", { name: data.guest.full_name }),
      );
      setCode("");
      await query.refetch();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : t("hostOps.passRejected"));
    } finally {
      setBusy(false);
    }
  };

  const retry = async (deliveryId: string) => {
    setRetrying(deliveryId);
    setNotice("");
    try {
      await api(`/api/guest-rsvp/moments/${momentId}/deliveries/${deliveryId}/retry`, { method: "POST", body: "{}" });
      setNotice(t("hostOps.msgAccepted"));
      await query.refetch();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : t("hostOps.retryFailed"));
    } finally {
      setRetrying("");
    }
  };

  const guests = useMemo(() => {
    const term = search.toLowerCase();
    return (query.data?.guests || []).filter(
      (g: any) => !term || `${g.full_name} ${g.group_name || ""} ${g.pass_code}`.toLowerCase().includes(term),
    );
  }, [query.data, search]);

  const deliveries = query.data?.deliveries || [];
  const latestDelivery = new Map<string, any>();
  deliveries.forEach((d: any) => {
    if (!latestDelivery.has(d.rsvp_id)) latestDelivery.set(d.rsvp_id, d);
  });

  if (query.isLoading) {
    return (
      <main className="grid min-h-[70vh] place-items-center">
        <span className="h-9 w-9 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </main>
    );
  }

  if (query.error) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-16">
        <h1 className="font-serif text-4xl font-semibold">{t("hostOps.unavailable")}</h1>
        <p className="mt-3 text-muted-foreground">{query.error.message}</p>
      </main>
    );
  }

  const { moment, summary } = query.data;
  const stats: Array<[typeof TicketCheck, number, TranslationKey]> = [
    [TicketCheck, summary.places_held, "hostOps.placesHeld"],
    [CheckCircle2, summary.checked_in, "hostOps.checkedIn"],
    [Users, summary.reservations, "hostOps.activePasses"],
    [Clock3, summary.cancelled, "hostOps.cancelled"],
    [MessageCircleWarning, summary.delivery_failures, "hostOps.messageIssues"],
  ];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_80%_0%,rgba(255,106,0,.12),transparent_28%),hsl(var(--background))] px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-7xl">
        <Link to="/dashboard?tab=moments" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[.16em] text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          {t("hostOps.backStudio")}
        </Link>
        <header className="mt-7 grid gap-7 border-b border-border/60 pb-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.28em] text-primary">{t("hostOps.kicker")}</p>
            <h1 className="mt-3 font-serif text-5xl font-semibold leading-none tracking-[-.05em] sm:text-7xl">{moment.title}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">{t("hostOps.lede")}</p>
          </div>
          <div className="rounded-[1.5rem] border border-primary/25 bg-primary/10 px-5 py-4">
            <p className="text-[10px] font-black uppercase tracking-[.2em] text-primary">{t("hostOps.momentStatus")}</p>
            <p className="mt-2 text-lg font-black capitalize">{moment.status}</p>
            <p className="mt-1 text-xs text-muted-foreground">{moment.location || t("hostOps.locationPending")}</p>
          </div>
        </header>
        <section aria-label={t("hostOps.summaryAria")} className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {stats.map(([Icon, value, labelKey]) => (
            <div key={labelKey} className="rounded-[1.35rem] border border-border/60 bg-card/70 p-5">
              <Icon className={`h-5 w-5 ${labelKey === "hostOps.messageIssues" && value > 0 ? "text-amber-500" : "text-primary"}`} />
              <p className="mt-5 text-4xl font-black tracking-[-.05em]">{value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t(labelKey)}</p>
            </div>
          ))}
        </section>
        <section className="mt-7 grid gap-6 xl:grid-cols-[.72fr_1.28fr]">
          <div className="rounded-[1.75rem] border border-border/60 bg-[#111] p-6 text-white">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-primary text-black">
                <ScanLine className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[.2em] text-primary">{t("hostOps.checkInNow")}</p>
                <h2 className="font-serif text-3xl font-semibold">{t("hostOps.scanTitle")}</h2>
              </div>
            </div>
            <GuidanceDisclosure
              id="host-guest-operations:scanner"
              eyebrow={t("hostOps.doorGuide")}
              title={t("hostOps.confirmTitle")}
              summary={t("hostOps.confirmSummary")}
              className="mt-5"
            >
              <div className="text-sm leading-6 text-white/55">
                <p>{t("hostOps.scannerHelp")}</p>
                <p className="mt-3 text-xs text-white/45">
                  <span className="font-bold text-white/70">{t("hostOps.mobileScanner")}</span> {t("hostOps.mobilePath")}
                </p>
              </div>
            </GuidanceDisclosure>
            <label className="mt-6 block text-[10px] font-black uppercase tracking-[.18em] text-white/45" htmlFor="pass-code">
              {t("hostOps.passCode")}
            </label>
            <Input
              id="pass-code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && checkIn(code)}
              placeholder="PR-12AB34CD"
              className="mt-2 h-14 border-white/15 bg-white/5 font-mono text-lg text-white"
            />
            <Button disabled={busy || !code.trim()} onClick={() => checkIn(code)} className="mt-3 h-12 w-full bg-primary font-black text-black">
              {busy ? t("hostOps.checking") : t("hostOps.confirmArrival")}
            </Button>
            <div aria-live="polite" className="mt-4 min-h-6 text-sm text-white/65">
              {notice}
            </div>
          </div>
          <div className="overflow-hidden rounded-[1.75rem] border border-border/60 bg-card/70">
            <div className="flex flex-col gap-4 border-b border-border/60 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[.2em] text-primary">{t("hostOps.manifest")}</p>
                <h2 className="mt-1 font-serif text-3xl font-semibold">{t("hostOps.doorList")}</h2>
              </div>
              <div className="relative sm:w-72">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("hostOps.searchPlaceholder")} className="pl-9" />
              </div>
            </div>
            <div className="max-h-[650px] overflow-auto">
              {guests.map((guest: any) => {
                const delivery = latestDelivery.get(guest.id);
                const statusLabel = STATUS_KEYS[guest.status] ? t(STATUS_KEYS[guest.status]) : guest.status.replace("_", " ");
                const placeLabel = t(guest.guest_count === 1 ? "hostOps.placeOne" : "hostOps.placeMany", { count: guest.guest_count });
                return (
                  <div key={guest.id} className="grid gap-4 border-b border-border/60 p-5 last:border-0 sm:grid-cols-[1fr_auto] sm:items-center">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-black">{guest.full_name}</h3>
                        <span className={`rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-wider ${guest.status === "checked_in" ? "bg-emerald-500/10 text-emerald-600" : guest.status === "confirmed" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                          {statusLabel}
                        </span>
                        {delivery?.status === "failed" ? (
                          <button
                            disabled={retrying === delivery.id}
                            onClick={() => retry(delivery.id)}
                            title={delivery.error_message}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 underline-offset-2 hover:underline"
                          >
                            <AlertTriangle className="h-3 w-3" />
                            {retrying === delivery.id ? t("hostOps.retrying") : t("hostOps.msgFailed")}
                          </button>
                        ) : null}
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {guest.group_name || t("hostOps.individual")} · {placeLabel} · {guest.meeting_point || t("hostOps.noMeeting")}
                      </p>
                      <p className="mt-2 font-mono text-xs text-muted-foreground">{guest.pass_code}</p>
                    </div>
                    {guest.status === "confirmed" ? (
                      <Button size="sm" onClick={() => checkIn(guest.pass_code)} className="rounded-full bg-primary font-black text-black">
                        {t("hostOps.checkIn")}
                      </Button>
                    ) : guest.checked_in_at ? (
                      <p className="text-right text-[10px] text-muted-foreground">
                        {t("hostOps.arrived")}
                        <br />
                        {formatTime(guest.checked_in_at, { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    ) : null}
                  </div>
                );
              })}
              {guests.length === 0 ? <p className="p-10 text-center text-sm text-muted-foreground">{t("hostOps.noGuests")}</p> : null}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

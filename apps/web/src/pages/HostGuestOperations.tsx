import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  MessageCircleWarning,
  RefreshCw,
  ScanLine,
  Search,
  TicketCheck,
  Users,
  Wifi,
  WifiOff,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GuidanceDisclosure } from "@/components/guidance/GuidanceDisclosure";

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
  if (!response.ok) throw new Error(body.error || "Request failed");
  return body;
}

export default function HostGuestOperations() {
  const { momentId = "" } = useParams();
  const [search, setSearch] = useState("");
  const [code, setCode] = useState("");
  const [notice, setNotice] = useState("");
  const [lastConfirmed, setLastConfirmed] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [retrying, setRetrying] = useState("");
  const [online, setOnline] = useState(() => (typeof navigator === "undefined" ? true : navigator.onLine));

  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  const query = useQuery({
    queryKey: ["guest-operations", momentId],
    queryFn: () => api(`/api/guest-rsvp/moments/${momentId}/operations`),
    refetchInterval: online ? 30000 : false,
  });

  const checkIn = async (raw: string) => {
    if (!raw.trim() || !online) return;
    setBusy(true);
    setNotice("");
    try {
      const data = await api(`/api/guest-rsvp/moments/${momentId}/check-in`, {
        method: "POST",
        body: JSON.stringify({ code: raw, verification_method: "manual" }),
      });
      const message = data.already_checked_in
        ? `${data.guest.full_name} was already checked in.`
        : `${data.guest.full_name} is checked in.`;
      setNotice(message);
      setLastConfirmed(message);
      setCode("");
      await query.refetch();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Pass not accepted");
    } finally {
      setBusy(false);
    }
  };

  const retry = async (deliveryId: string) => {
    if (!online) return;
    setRetrying(deliveryId);
    setNotice("");
    try {
      await api(`/api/guest-rsvp/moments/${momentId}/deliveries/${deliveryId}/retry`, {
        method: "POST",
        body: "{}",
      });
      setNotice("The message was accepted for delivery.");
      await query.refetch();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Message retry failed");
    } finally {
      setRetrying("");
    }
  };

  const guests = useMemo(() => {
    const term = search.toLowerCase();
    return (query.data?.guests || []).filter((guest: any) =>
      !term || `${guest.full_name} ${guest.group_name || ""} ${guest.pass_code}`.toLowerCase().includes(term)
    );
  }, [query.data, search]);

  const deliveries = query.data?.deliveries || [];
  const latestDelivery = new Map<string, any>();
  deliveries.forEach((delivery: any) => {
    if (!latestDelivery.has(delivery.rsvp_id)) latestDelivery.set(delivery.rsvp_id, delivery);
  });

  if (query.isLoading) {
    return (
      <main className="grid min-h-[70vh] place-items-center bg-background">
        <div className="text-center">
          <span className="mx-auto block h-9 w-9 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="mt-4 text-xs font-black uppercase tracking-[.18em] text-muted-foreground">Loading door board</p>
        </div>
      </main>
    );
  }

  if (query.error) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-16">
        <p className="text-[10px] font-black uppercase tracking-[.22em] text-destructive">Door board unavailable</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-.04em]">Guest operations could not load.</h1>
        <p className="mt-3 text-muted-foreground">{query.error.message}</p>
        <Button className="mt-6" onClick={() => query.refetch()}>Try again</Button>
      </main>
    );
  }

  const { moment, summary } = query.data;
  const lastUpdated = query.dataUpdatedAt ? new Date(query.dataUpdatedAt) : null;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_86%_0%,rgba(255,106,0,.10),transparent_26%),linear-gradient(180deg,hsl(var(--background)),hsl(var(--background)))] px-4 py-7 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to="/dashboard?tab=moments" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[.16em] text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Host workspace
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex min-h-9 items-center gap-2 rounded-full border px-3 text-[10px] font-black uppercase tracking-[.14em] ${online ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-600" : "border-amber-500/25 bg-amber-500/10 text-amber-600"}`}>
              {online ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
              {online ? "Live sync" : "Offline · writes paused"}
            </span>
            <Button variant="outline" size="sm" disabled={query.isFetching || !online} onClick={() => query.refetch()} className="min-h-9 rounded-full">
              <RefreshCw className={`mr-2 h-3.5 w-3.5 ${query.isFetching ? "animate-spin" : ""}`} /> Refresh
            </Button>
          </div>
        </div>

        <header className="mt-6 grid gap-6 border-b border-border/60 pb-7 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.26em] text-primary">Host Next · Door Board</p>
            <h1 className="mt-3 text-4xl font-black leading-[.98] tracking-[-.05em] sm:text-6xl">{moment.title}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
              Confirm real arrivals, resolve delivery issues and keep RSVP intent separate from checked-in attendance.
            </p>
          </div>
          <div className="min-w-[15rem] rounded-[1.35rem] border border-primary/20 bg-primary/[.06] px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-black uppercase tracking-[.18em] text-primary">Moment</p>
              <span className="rounded-full border border-border/70 px-2 py-1 text-[9px] font-black uppercase tracking-wider">{moment.status}</span>
            </div>
            <p className="mt-3 text-sm font-bold">{moment.location || "Location pending"}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">{lastUpdated ? `Last confirmed sync ${lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Sync time unavailable"}</p>
          </div>
        </header>

        {!online ? (
          <div role="status" className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4 text-sm">
            <WifiOff className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <div>
              <strong>Door Board is offline.</strong>
              <p className="mt-1 text-muted-foreground">The last confirmed guest list remains visible, but PROMORANG will not record a new arrival or retry a message until connectivity returns.</p>
            </div>
          </div>
        ) : null}

        <section aria-label="Arrival truth summary" className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {[
            [TicketCheck, summary.places_held, "Places held", "RSVP intent / capacity"],
            [CheckCircle2, summary.checked_in, "Checked in", "Recorded arrivals"],
            [Users, summary.reservations, "Active passes", "Valid reservations"],
            [Clock3, summary.cancelled, "Cancelled", "No longer expected"],
            [MessageCircleWarning, summary.delivery_failures, "Message issues", "Needs host attention"],
          ].map(([Icon, value, label, note]: any) => (
            <div key={label} className="rounded-[1.25rem] border border-border/60 bg-card/75 p-5">
              <div className="flex items-center justify-between gap-3">
                <Icon className={`h-4 w-4 ${label === "Message issues" && value > 0 ? "text-amber-500" : "text-primary"}`} />
                <span className="text-[9px] font-black uppercase tracking-[.15em] text-muted-foreground">{note}</span>
              </div>
              <p className="mt-5 text-4xl font-black tracking-[-.05em]">{value}</p>
              <p className="mt-1 text-sm font-bold">{label}</p>
            </div>
          ))}
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[.72fr_1.28fr]">
          <aside className="rounded-[1.6rem] border border-white/10 bg-[#101010] p-5 text-white shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-primary text-black"><ScanLine className="h-5 w-5" /></span>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[.2em] text-primary">Arrival instrument</p>
                  <h2 className="mt-1 text-2xl font-black tracking-[-.03em]">Confirm one arrival.</h2>
                </div>
              </div>
              <span className="rounded-full border border-white/10 px-2 py-1 text-[9px] font-black uppercase tracking-[.14em] text-white/45">Write action</span>
            </div>

            <p className="mt-4 text-sm leading-6 text-white/55">A successful check-in records attendance for this Moment. It does not approve proof, settle rewards or create a purchase.</p>

            <GuidanceDisclosure id="host-guest-operations:scanner" eyebrow="Door guide" title="How to confirm an arrival" summary="Scan a guest QR code from mobile, or enter the pass code printed beneath the guest pass." className="mt-5">
              <div className="text-sm leading-6 text-white/55"><p>Use the mobile host scanner for QR codes, or enter the code printed beneath the guest pass.</p><p className="mt-3 text-xs text-white/45"><span className="font-bold text-white/70">Mobile scanner:</span> Studio → select Moment → Check guests in.</p></div>
            </GuidanceDisclosure>

            <label className="mt-6 block text-[10px] font-black uppercase tracking-[.18em] text-white/45" htmlFor="pass-code">Pass code</label>
            <Input id="pass-code" value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} onKeyDown={(event) => event.key === "Enter" && void checkIn(code)} placeholder="PR-12AB34CD" disabled={!online || busy} className="mt-2 h-14 border-white/15 bg-white/5 font-mono text-lg uppercase tracking-[.12em] text-white" />
            <Button disabled={busy || !code.trim() || !online} onClick={() => void checkIn(code)} className="mt-3 h-12 w-full bg-primary font-black text-black">
              {busy ? "Checking…" : online ? "Confirm arrival" : "Offline · unavailable"}
            </Button>

            <div aria-live="polite" className="mt-4 min-h-16 rounded-xl border border-white/10 bg-white/[.03] p-3 text-sm text-white/65">
              {notice || lastConfirmed || "No arrival action recorded in this session yet."}
            </div>

            {lastConfirmed ? (
              <div className="mt-4 border-t border-white/10 pt-4">
                <div className="flex items-center gap-2 text-emerald-300"><BadgeCheck className="h-4 w-4" /><span className="text-[10px] font-black uppercase tracking-[.16em]">Last confirmed state</span></div>
                <p className="mt-2 text-xs leading-5 text-white/50">{lastConfirmed}</p>
              </div>
            ) : null}
          </aside>

          <section className="overflow-hidden rounded-[1.6rem] border border-border/60 bg-card/75">
            <div className="flex flex-col gap-4 border-b border-border/60 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[.2em] text-primary">Arrival Ledger</p>
                <h2 className="mt-1 text-2xl font-black tracking-[-.03em]">Door list</h2>
                <p className="mt-1 text-xs text-muted-foreground">Search reservations, see confirmed arrival state and surface delivery exceptions without changing the underlying record.</p>
              </div>
              <div className="relative sm:w-72">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, group or code" className="pl-9" />
              </div>
            </div>

            <div className="max-h-[680px] overflow-auto">
              {guests.map((guest: any) => {
                const delivery = latestDelivery.get(guest.id);
                const checkedIn = guest.status === "checked_in" || Boolean(guest.checked_in_at);
                const confirmed = guest.status === "confirmed";
                return (
                  <div key={guest.id} className="grid gap-4 border-b border-border/60 p-5 last:border-0 sm:grid-cols-[1fr_auto] sm:items-center">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-black">{guest.full_name}</h3>
                        <span className={`rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-wider ${checkedIn ? "bg-emerald-500/10 text-emerald-600" : confirmed ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{checkedIn ? "checked in" : guest.status.replace("_", " ")}</span>
                        {delivery?.status === "failed" ? (
                          <button disabled={retrying === delivery.id || !online} onClick={() => void retry(delivery.id)} title={delivery.error_message} className="inline-flex min-h-8 items-center gap-1 rounded-full border border-amber-500/20 px-2 text-[10px] font-bold text-amber-600 hover:bg-amber-500/5 disabled:cursor-not-allowed disabled:opacity-50">
                            <AlertTriangle className="h-3 w-3" />{retrying === delivery.id ? "Retrying…" : "Message failed · retry"}
                          </button>
                        ) : null}
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">{guest.group_name || "Individual"} · {guest.guest_count} {guest.guest_count === 1 ? "place" : "places"} · {guest.meeting_point || "No meeting point"}</p>
                      <p className="mt-2 font-mono text-xs text-muted-foreground">{guest.pass_code}</p>
                    </div>
                    {confirmed ? (
                      <Button size="sm" disabled={!online || busy} onClick={() => void checkIn(guest.pass_code)} className="min-h-10 rounded-full bg-primary font-black text-black">Confirm arrival</Button>
                    ) : guest.checked_in_at ? (
                      <div className="text-right">
                        <p className="text-[9px] font-black uppercase tracking-[.14em] text-emerald-600">Recorded arrival</p>
                        <p className="mt-1 text-xs font-bold">{new Date(guest.checked_in_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                      </div>
                    ) : null}
                  </div>
                );
              })}
              {guests.length === 0 ? <p className="p-10 text-center text-sm text-muted-foreground">No guests match this view.</p> : null}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

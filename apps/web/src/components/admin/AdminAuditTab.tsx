import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Archive, FileClock, Fingerprint, ShieldAlert } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const API_URL = import.meta.env.VITE_API_URL || "https://api.promorang.co";

type AuditEvent = {
  id: string;
  actor_id: string | null;
  action: string;
  target_type: string;
  target_id: string | null;
  reason: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

function humanAction(action: string) {
  return action.replace(/[._-]+/g, " ");
}

function metadataSummary(metadata: Record<string, unknown> | null | undefined) {
  if (!metadata) return [];
  return Object.entries(metadata)
    .filter(([, value]) => value !== null && value !== undefined && value !== "")
    .slice(0, 4)
    .map(([key, value]) => `${key.replace(/_/g, " ")}: ${typeof value === "object" ? JSON.stringify(value) : String(value)}`);
}

export function AdminAuditTab() {
  const { session } = useAuth();
  const audit = useQuery({
    queryKey: ["admin-audit"],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/admin/audit?limit=100`, {
        headers: { Authorization: `Bearer ${session?.access_token || ""}` },
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Unable to load audit history");
      return (payload.events || []) as AuditEvent[];
    },
    enabled: !!session?.access_token,
  });

  const events = audit.data || [];

  return (
    <div className="space-y-5" data-proof-family="admin-forensic-archive">
      <section className="overflow-hidden border border-cyan-400/20 bg-[#071116] text-white shadow-2xl">
        <div className="grid lg:grid-cols-[1fr_18rem]">
          <div className="p-5 sm:p-7">
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center border border-cyan-300/25 bg-cyan-300/10 text-cyan-200"><Archive className="h-5 w-5" /></span>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">Admin · forensic archive</p>
                <h2 className="mt-2 font-serif text-3xl font-semibold tracking-[-0.04em]">Preserve the source. Append what changed.</h2>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-white/55">This surface reads the immutable administrative audit stream. It does not rewrite earlier records and it does not pretend that every product proof correction is unified here yet.</p>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 bg-black/20 p-5 lg:border-l lg:border-t-0 sm:p-7">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">Visible archive</p>
            <p className="mt-2 font-serif text-4xl font-semibold">{audit.isLoading ? "…" : events.length}</p>
            <p className="mt-2 text-xs leading-5 text-white/45">Most recent sensitive administrative records, capped by the existing API at this view's requested limit.</p>
          </div>
        </div>
        <div className="grid border-t border-white/10 sm:grid-cols-3">
          {[
            [Fingerprint, "Source identity", "Actor, target and timestamp stay attached to the record."],
            [FileClock, "Decision residue", "Reasons and action metadata remain inspectable after the action."],
            [ShieldAlert, "Scope boundary", "A platform-wide proof dispute/correction ledger is not inferred where no unified source exists."],
          ].map(([Icon, title, copy]) => {
            const ItemIcon = Icon as typeof FileClock;
            return <div key={String(title)} className="border-b border-white/10 p-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0"><ItemIcon className="h-4 w-4 text-cyan-300" /><p className="mt-3 text-xs font-black uppercase tracking-[0.12em]">{String(title)}</p><p className="mt-1 text-xs leading-5 text-white/40">{String(copy)}</p></div>;
          })}
        </div>
      </section>

      {audit.isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-none" />)}</div>
      ) : audit.isError ? (
        <div className="flex gap-3 border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive"><ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />{audit.error.message}</div>
      ) : events.length ? (
        <div className="border-y border-border/70 bg-card">
          {events.map((event, index) => {
            const details = metadataSummary(event.metadata);
            return (
              <article key={event.id} className="grid gap-4 border-b border-border/70 p-4 last:border-b-0 sm:p-5 lg:grid-cols-[3.5rem_11rem_minmax(0,1fr)_14rem]">
                <div className="font-mono text-[10px] text-muted-foreground">{String(index + 1).padStart(2, "0")}</div>
                <div>
                  <Badge variant="outline" className="rounded-none font-mono text-[10px] uppercase">{humanAction(event.action)}</Badge>
                  <p className="mt-2 text-[11px] text-muted-foreground">{format(new Date(event.created_at), "MMM d, yyyy · HH:mm")}</p>
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2"><p className="text-sm font-black text-foreground">{event.target_type}</p><span className="font-mono text-[10px] text-muted-foreground">{event.target_id || "no target id"}</span></div>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">{event.reason || "No reason was supplied with this recorded action."}</p>
                  {details.length ? <div className="mt-3 flex flex-wrap gap-2">{details.map((detail) => <span key={detail} className="border border-border/70 bg-muted/30 px-2 py-1 font-mono text-[9px] text-muted-foreground">{detail}</span>)}</div> : null}
                </div>
                <div className="border-l border-border/70 pl-4">
                  <p className="text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground">Recorded by</p>
                  <p className="mt-2 break-all font-mono text-[10px] text-foreground/75">{event.actor_id || "system"}</p>
                  <p className="mt-3 font-mono text-[9px] text-muted-foreground">archive {event.id.slice(0, 12)}</p>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="border border-dashed border-border p-10 text-center"><Archive className="mx-auto h-7 w-7 text-muted-foreground" /><p className="mt-4 font-serif text-2xl font-semibold">No administrative source records yet.</p><p className="mt-2 text-sm text-muted-foreground">This archive remains empty rather than manufacturing an example history.</p></div>
      )}

      <section className="border-l-2 border-cyan-400/50 bg-cyan-400/[0.04] p-4 text-xs leading-5 text-muted-foreground"><strong className="text-foreground">Current boundary:</strong> this is the real master-admin audit source. Object-specific review systems may retain richer evidence and reversal history elsewhere. Until PROMORANG has one canonical correction source spanning those systems, this archive does not claim that parity.</section>
    </div>
  );
}
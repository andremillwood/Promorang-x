import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CheckCircle2, Clock3, LifeBuoy, Loader2, Mail, Send } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";

const API_URL = import.meta.env.VITE_API_URL || "https://api.promorang.co";

type SupportTicket = {
  id: string;
  user_id: string | null;
  category: string;
  subject: string;
  message: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high";
  admin_notes?: string | null;
  assigned_to?: string | null;
  first_response_at?: string | null;
  resolved_at?: string | null;
  sla_due_at?: string | null;
  receipt_id?: string | null;
  commerce_reason?: string | null;
  resolution?: Record<string, any> | null;
  assignee?: {
    display_name?: string | null;
    email?: string | null;
  } | null;
  events?: Array<{
    id: string;
    event_type: string;
    actor_type: string;
    message?: string | null;
    previous_status?: string | null;
    new_status?: string | null;
    created_at: string;
  }>;
  created_at: string;
  updated_at: string;
  user?: {
    display_name?: string | null;
    username?: string | null;
    email?: string | null;
  } | null;
};

const statusTone: Record<SupportTicket["status"], string> = {
  open: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  in_progress: "bg-sky-500/10 text-sky-700 border-sky-500/20",
  resolved: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  closed: "bg-zinc-500/10 text-zinc-700 border-zinc-500/20",
};

export function AdminSupportTab() {
  const { t, formatDate } = useI18n();
  const { session } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [nextStatus, setNextStatus] = useState<SupportTicket["status"]>("in_progress");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [remedy, setRemedy] = useState("refund");
  const [gems, setGems] = useState("300");
  const [couponAssignmentId, setCouponAssignmentId] = useState("");
  const [error, setError] = useState("");

  const headers = useMemo(() => ({
    Authorization: `Bearer ${session?.access_token || ""}`,
    "Content-Type": "application/json",
  }), [session?.access_token]);

  const selectedTicket = tickets.find((ticket) => ticket.id === selectedId) || tickets[0] || null;

  useEffect(() => {
    if (session?.access_token) {
      void fetchTickets();
    }
  }, [session?.access_token]);

  useEffect(() => {
    if (selectedTicket) {
      setSelectedId(selectedTicket.id);
      setReplyText(selectedTicket.admin_notes || "");
      setNextStatus(selectedTicket.status === "open" ? "in_progress" : selectedTicket.status);
    }
  }, [selectedTicket?.id]);

  async function fetchTickets() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/admin/support`, { headers });
      const payload = await response.json().catch(() => []);

      if (!response.ok) {
        throw new Error(payload.error || "Failed to load support tickets");
      }

      const rows = Array.isArray(payload) ? payload : [];
      setTickets(rows);
      if (!selectedId && rows[0]) setSelectedId(rows[0].id);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load support tickets");
    } finally {
      setLoading(false);
    }
  }

  async function saveReply() {
    if (!selectedTicket) return;
    if (!replyText.trim()) {
      setError(t("suppQ.required"));
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/admin/support/${selectedTicket.id}/reply`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          status: nextStatus,
          admin_notes: replyText.trim(),
          assigned_to: selectedTicket.assigned_to || undefined,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload.success === false) {
        throw new Error(payload.error || "Failed to update support ticket");
      }

      toast({
        title: t("suppQ.toastUpdated"),
        description: t("suppQ.toastUpdatedBody"),
      });

      await fetchTickets();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to update support ticket");
    } finally {
      setSaving(false);
    }
  }

  async function resolveCommerceCase() {
    if (!selectedTicket?.receipt_id || !replyText.trim()) return;
    setSaving(true); setError("");
    try {
      const response = await fetch(`${API_URL}/api/admin/support/${selectedTicket.id}/resolve-commerce`, { method: "POST", headers, body: JSON.stringify({ remedy, gems: Number(gems), coupon_assignment_id: couponAssignmentId || undefined, notes: replyText.trim() }) });
      const payload = await response.json().catch(()=>({}));
      if (!response.ok) throw new Error(payload.error || "Failed to execute resolution");
      toast({ title: t("suppQ.toastResolved"), description: remedy === "refund" ? t("suppQ.toastRefund") : t("suppQ.toastValue") });
      await fetchTickets();
    } catch (resolutionError) { setError(resolutionError instanceof Error ? resolutionError.message : "Failed to execute resolution"); }
    finally { setSaving(false); }
  }

  const openCount = tickets.filter((ticket) => ticket.status === "open" || ticket.status === "in_progress").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <LifeBuoy className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">{t("suppQ.title")}</h2>
          <p className="text-sm text-muted-foreground">{t("suppQ.openCount", { count: openCount })}</p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">{t("suppQ.tickets")}</h3>
            <Button variant="outline" size="sm" onClick={() => fetchTickets()} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Clock3 className="mr-2 h-4 w-4" />}
              {t("suppQ.refresh")}
            </Button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-24 rounded-lg" />
              ))}
            </div>
          ) : tickets.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
              {t("suppQ.empty")}
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <button
                  key={ticket.id}
                  type="button"
                  onClick={() => setSelectedId(ticket.id)}
                  className={`w-full rounded-lg border p-4 text-left transition-colors ${
                    selectedTicket?.id === ticket.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                  }`}
                >
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{ticket.subject}</p>
                      <p className="text-xs text-muted-foreground">#{ticket.id.slice(0, 8)}</p>
                    </div>
                    <Badge variant="outline" className={statusTone[ticket.status]}>
                      {ticket.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{ticket.message}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          {!selectedTicket ? (
            <div className="flex min-h-[360px] items-center justify-center text-muted-foreground">
              {t("suppQ.select")}
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">{t("suppQ.ticketId", { id: selectedTicket.id })}</p>
                  <h3 className="mt-1 text-xl font-semibold">{selectedTicket.subject}</h3>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{selectedTicket.user?.email || t("suppQ.noEmail")}</span>
                  </div>
                </div>
                <Badge variant="outline" className={statusTone[selectedTicket.status]}>
                  {selectedTicket.status.replace("_", " ")}
                </Badge>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs uppercase text-muted-foreground">{t("suppQ.category")}</p>
                  <p className="mt-1 text-sm font-medium capitalize">{selectedTicket.category.replace("_", " ")}</p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs uppercase text-muted-foreground">{t("suppQ.priority")}</p>
                  <p className="mt-1 text-sm font-medium capitalize">{selectedTicket.priority}</p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs uppercase text-muted-foreground">{t("suppQ.created")}</p>
                  <p className="mt-1 text-sm font-medium">{formatDate(selectedTicket.created_at)}</p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs uppercase text-muted-foreground">{t("suppQ.owner")}</p>
                  <p className="mt-1 text-sm font-medium">{selectedTicket.assignee?.display_name || selectedTicket.assignee?.email || t("suppQ.unassigned")}</p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs uppercase text-muted-foreground">{t("suppQ.sla")}</p>
                  <p className="mt-1 text-sm font-medium">{selectedTicket.sla_due_at ? formatDate(selectedTicket.sla_due_at) : t("suppQ.notSet")}</p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs uppercase text-muted-foreground">{t("suppQ.firstResp")}</p>
                  <p className="mt-1 text-sm font-medium">{selectedTicket.first_response_at ? formatDate(selectedTicket.first_response_at) : t("suppQ.waiting")}</p>
                </div>
              </div>

              <div>
                <h4 className="mb-2 font-medium">{t("suppQ.userMsg")}</h4>
                <div className="whitespace-pre-wrap rounded-lg border border-border bg-muted/30 p-4 text-sm leading-6">
                  {selectedTicket.message}
                </div>
              </div>

              {selectedTicket.receipt_id ? <div className="rounded-2xl border border-primary/25 bg-primary/[.04] p-4"><p className="text-[10px] font-black uppercase tracking-[.2em] text-primary">{t("suppQ.commerce")}</p><p className="mt-2 text-sm text-muted-foreground">{t("suppQ.receipt", { id: selectedTicket.receipt_id.slice(0,8) })} · {selectedTicket.commerce_reason?.replaceAll("_"," ")}</p><div className="mt-4 grid gap-3 sm:grid-cols-3"><select value={remedy} onChange={(event)=>setRemedy(event.target.value)} className="h-10 rounded-md border bg-background px-3 text-sm"><option value="refund">{t("suppQ.refund")}</option><option value="restore_reward">{t("suppQ.restore")}</option><option value="gems_credit">{t("suppQ.gems")}</option><option value="no_adjustment">{t("suppQ.noAdj")}</option></select>{remedy === "gems_credit" ? <input type="number" min="1" max="100000" value={gems} onChange={(event)=>setGems(event.target.value)} className="h-10 rounded-md border bg-background px-3 text-sm" placeholder={t("suppQ.gemsPh")}/> : null}{remedy === "restore_reward" ? <input value={couponAssignmentId} onChange={(event)=>setCouponAssignmentId(event.target.value)} className="h-10 rounded-md border bg-background px-3 text-sm" placeholder={t("suppQ.couponPh")}/> : null}<Button onClick={resolveCommerceCase} disabled={saving || !replyText.trim()}><CheckCircle2 className="mr-2 h-4 w-4"/>{t("suppQ.execute")}</Button></div><p className="mt-3 text-xs text-muted-foreground">{t("suppQ.commerceNote")}</p></div> : null}

              <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
                <div className="space-y-2">
                  <label htmlFor="support-reply" className="text-sm font-medium">{t("suppQ.response")}</label>
                  <Textarea
                    id="support-reply"
                    value={replyText}
                    onChange={(event) => setReplyText(event.target.value)}
                    className="min-h-[180px]"
                    placeholder={t("suppQ.replyPh")}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="support-status" className="text-sm font-medium">{t("suppQ.status")}</label>
                  <select
                    id="support-status"
                    value={nextStatus}
                    onChange={(event) => setNextStatus(event.target.value as SupportTicket["status"])}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="open">{t("suppQ.stOpen")}</option>
                    <option value="in_progress">{t("suppQ.stProgress")}</option>
                    <option value="resolved">{t("suppQ.stResolved")}</option>
                    <option value="closed">{t("suppQ.stClosed")}</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={saveReply} disabled={saving || !replyText.trim()}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                  {t("suppQ.save")}
                </Button>
              </div>

              <div>
                <h4 className="mb-2 font-medium">{t("suppQ.history")}</h4>
                <div className="space-y-2">
                  {(selectedTicket.events || []).length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">{t("suppQ.noHistory")}</div>
                  ) : selectedTicket.events?.map((event) => (
                    <div key={event.id} className="rounded-lg border border-border p-3 text-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Badge variant="secondary">{event.event_type.replace("_", " ")}</Badge>
                        <span className="text-xs text-muted-foreground">{formatDate(event.created_at)}</span>
                      </div>
                      {event.previous_status && event.new_status && (
                        <p className="mt-2 text-xs text-muted-foreground">{event.previous_status} to {event.new_status}</p>
                      )}
                      {event.message && <p className="mt-2 whitespace-pre-wrap text-muted-foreground">{event.message}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminSupportTab;

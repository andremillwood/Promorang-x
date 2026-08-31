import { useQuery } from "@tanstack/react-query";
import { FileClock, ShieldAlert } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/i18n/I18nContext";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export function AdminAuditTab() {
  const { t, formatDate } = useI18n();
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

  return (
    <Card className="overflow-hidden rounded-2xl">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2"><FileClock className="h-5 w-5 text-primary" />{t("auditLed.title")}</CardTitle>
        <p className="text-sm text-muted-foreground">{t("auditLed.copy")}</p>
      </CardHeader>
      <CardContent className="p-0">
        {audit.isLoading ? <div className="space-y-2 p-5">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
          : audit.isError ? <div className="m-5 flex gap-2 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive"><ShieldAlert className="h-4 w-4" />{audit.error.message}</div>
          : audit.data?.length ? audit.data.map((event) => (
            <div key={event.id} className="grid gap-2 border-b p-4 last:border-0 md:grid-cols-[150px_1fr_220px] md:items-center">
              <div><Badge variant="outline">{event.action.replace(".", " ")}</Badge><p className="mt-1 text-xs text-muted-foreground">{formatDate(event.created_at, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</p></div>
              <div><p className="text-sm font-semibold">{event.target_type}: {event.target_id || "—"}</p><p className="text-xs text-muted-foreground">{event.reason || t("auditLed.noReason")}</p></div>
              <p className="truncate text-xs text-muted-foreground">{t("auditLed.actor", { id: event.actor_id || "system", role: String(event.metadata.role || "") })}</p>
            </div>
          )) : <div className="p-10 text-center text-sm text-muted-foreground">{t("auditLed.empty")}</div>}
      </CardContent>
    </Card>
  );
}

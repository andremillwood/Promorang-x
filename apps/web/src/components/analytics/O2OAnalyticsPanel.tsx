import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/i18n/I18nContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

interface O2OAnalyticsPanelProps {
  audience: "host" | "brand";
}

export function O2OAnalyticsPanel({ audience }: O2OAnalyticsPanelProps) {
  const { t, formatNumber } = useI18n();
  const { session } = useAuth();

  const query = useQuery({
    queryKey: ["o2o-analytics", audience],
    enabled: !!session,
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/analytics/${audience}/o2o`, {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to load O2O analytics");
      }
      return payload;
    },
  });

  if (query.isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (query.error) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
        {(query.error as Error).message}
      </div>
    );
  }

  const summary = query.data?.summary || {};
  const breakdown = query.data?.mission_breakdown || [];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">{t("o2oAn.eyebrow")}</p>
        <h3 className="mt-2 font-serif text-2xl font-bold text-foreground">{t("o2oAn.title")}</h3>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: t("o2oAn.links"), value: summary.linked_missions || 0 },
          { label: t("o2oAn.engagements"), value: summary.digital_engagements || 0 },
          { label: t("o2oAn.joins"), value: summary.attributed_joins || 0 },
          { label: t("o2oAn.memories"), value: summary.memories_issued || 0 },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-border/60 bg-card p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">{item.label}</p>
            <p className="mt-3 text-3xl font-bold tracking-tight text-foreground">{formatNumber(Number(item.value))}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.72fr_1.28fr]">
        <div className="rounded-2xl border border-primary/15 bg-primary/5 p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary/80">{t("o2oAn.rates")}</p>
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">{t("o2oAn.joinRate")}</p>
              <p className="text-2xl font-bold text-foreground">{Number(summary.join_conversion_rate || 0).toFixed(2)}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("o2oAn.verifyRate")}</p>
              <p className="text-2xl font-bold text-foreground">{Number(summary.verification_rate || 0).toFixed(2)}%</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">{t("o2oAn.breakdown")}</p>
            <Badge className="bg-primary/10 text-primary border border-primary/20">
              {audience === "host" ? t("o2oAn.hostView") : t("o2oAn.brandView")}
            </Badge>
          </div>
          <div className="mt-4 space-y-3">
            {breakdown.length ? breakdown.slice(0, 5).map((item: any) => (
              <div key={item.id} className="rounded-2xl border border-border/60 bg-background/60 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{item.content_title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{t("o2oAn.linkedTo", { title: item.moment_title })}</p>
                  </div>
                  <span className="text-xs font-bold text-primary">{item.o2o_conversion_rate}%</span>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-4 text-sm">
                  <p className="text-muted-foreground">{t("o2oAn.eng", { count: item.digital_engagements })}</p>
                  <p className="text-muted-foreground">{t("o2oAn.joinsLbl", { count: item.attributed_joins })}</p>
                  <p className="text-muted-foreground">{t("o2oAn.checkins", { count: item.attributed_checkins })}</p>
                  <p className="text-muted-foreground">{t("o2oAn.mems", { count: item.memories_issued })}</p>
                </div>
              </div>
            )) : (
              <div className="rounded-2xl border border-dashed border-border/70 p-4 text-sm text-muted-foreground">
                {t("o2oAn.empty")}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

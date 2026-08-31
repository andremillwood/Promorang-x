import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, MapPin, Sparkles, TrendingUp, Coins, Flame, Trophy } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export function CreatorO2OSummaryPanel() {
  const { session } = useAuth();
  const { t } = useI18n();

  const summaryQuery = useQuery({
    queryKey: ["creator-o2o-summary"],
    enabled: !!session,
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/o2o/creator-summary`, {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || t("creO2O.loadFail"));
      }

      return payload?.summary || null;
    },
  });

  const economicsQuery = useQuery({
    queryKey: ["creator-economics"],
    enabled: !!session,
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/creator-economics/me`, {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || t("creO2O.loadFail"));
      }

      return payload?.economics || null;
    },
  });

  if (summaryQuery.isLoading || economicsQuery.isLoading) {
    return (
      <div className="grid gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (summaryQuery.error || economicsQuery.error || !summaryQuery.data || !economicsQuery.data) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
        {(summaryQuery.error as Error)?.message || (economicsQuery.error as Error)?.message || t("creO2O.loadFail")}
      </div>
    );
  }

  const summary = summaryQuery.data;
  const economics = economicsQuery.data;
  const ledgerSummary = economics.summary || {};
  const profile = economics.profile || {};

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">{t("creO2O.eyebrow")}</p>
          <h3 className="mt-2 font-serif text-2xl font-bold text-foreground">{t("creO2O.title")}</h3>
        </div>
        <Badge className="bg-primary/10 text-primary border border-primary/20">
          {t("creO2O.badge")}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: t("creO2O.linkedContent"), value: summary.linked_content_count || 0, icon: PlayCircle, tone: "text-primary" },
          { label: t("creO2O.linkedMoments"), value: summary.linked_moment_count || 0, icon: MapPin, tone: "text-emerald-500" },
          { label: t("creO2O.avgRate"), value: `${summary.avg_o2o_conversion_rate || 0}%`, icon: TrendingUp, tone: "text-blue-500" },
          { label: t("creO2O.sponsored"), value: summary.sponsored_links || 0, icon: Sparkles, tone: "text-accent-foreground" },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-border/60 bg-card p-5">
            <item.icon className={`h-5 w-5 ${item.tone}`} />
            <p className="mt-4 text-2xl font-bold tracking-tight text-foreground">{item.value}</p>
            <p className="mt-1 text-[11px] font-black uppercase tracking-[0.24em] text-muted-foreground">
              {item.label}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-border/60 bg-card p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">{t("creO2O.econEyebrow")}</p>
              <h4 className="mt-2 font-serif text-xl font-bold text-foreground">{t("creO2O.econTitle")}</h4>
            </div>
            <Badge className="border border-primary/20 bg-primary/10 text-primary">
              {(summary.catalyst_rank || "new_signal").replaceAll("_", " ")}
            </Badge>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {[
              { label: t("creO2O.joins"), value: summary.attributed_joins || 0, icon: MapPin, tone: "text-emerald-500" },
              { label: t("creO2O.unlocks"), value: summary.verified_unlocks || 0, icon: Trophy, tone: "text-primary" },
              { label: t("creO2O.memories"), value: summary.memories_issued || 0, icon: Sparkles, tone: "text-accent-foreground" },
              { label: t("creO2O.momentum"), value: `${summary.creator_momentum_value || 0}`, icon: Coins, tone: "text-amber-500" },
              { label: t("creO2O.impact"), value: summary.creator_impact_score || 0, icon: Flame, tone: "text-orange-500" },
              { label: t("creO2O.catalyst"), value: summary.catalyst_conversions || 0, icon: TrendingUp, tone: "text-blue-500" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-border/50 bg-background/40 p-4">
                <item.icon className={`h-4 w-4 ${item.tone}`} />
                <p className="mt-3 text-2xl font-bold tracking-tight text-foreground">{item.value}</p>
                <p className="mt-1 text-[11px] font-black uppercase tracking-[0.24em] text-muted-foreground">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-border/60 bg-card p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">{t("creO2O.ledger")}</p>
                <h4 className="mt-2 font-serif text-xl font-bold text-foreground">{t("creO2O.earnTitle")}</h4>
              </div>
              <Badge className="border border-primary/20 bg-primary/10 text-primary">
                {profile.tier || "starter"}
              </Badge>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                { label: t("creO2O.pending"), value: `$${Number(ledgerSummary.pending_value || 0).toFixed(2)}` },
                { label: t("creO2O.settled"), value: `$${Number(ledgerSummary.settled_value || 0).toFixed(2)}` },
                { label: t("creO2O.joinVal"), value: `$${Number(ledgerSummary.mission_join_value || 0).toFixed(2)}` },
                { label: t("creO2O.verifyVal"), value: `$${Number(ledgerSummary.verification_value || 0).toFixed(2)}` },
                { label: t("creO2O.memoryVal"), value: `$${Number(ledgerSummary.memory_value || 0).toFixed(2)}` },
                { label: t("creO2O.catalystVal"), value: `$${Number(ledgerSummary.catalyst_value || 0).toFixed(2)}` },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-border/50 bg-background/40 p-4">
                  <p className="text-2xl font-bold tracking-tight text-foreground">{item.value}</p>
                  <p className="mt-1 text-[11px] font-black uppercase tracking-[0.24em] text-muted-foreground">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-5">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">{t("creO2O.topEyebrow")}</p>
            <h4 className="mt-2 font-serif text-xl font-bold text-foreground">{t("creO2O.topTitle")}</h4>
            <div className="mt-5 space-y-3">
              {(summary.top_missions || []).length ? (
                summary.top_missions.map((mission: any) => (
                  <div key={mission.id} className="rounded-2xl border border-border/50 bg-background/40 p-4">
                    <p className="text-sm font-semibold text-foreground">{mission.content_title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{t("creO2O.unlocksTitle", { title: mission.moment_title || "" })}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>{t("creO2O.o2oPct", { rate: mission.o2o_conversion_rate || 0 })}</span>
                      <span>{t("creO2O.joinsCount", { count: mission.attributed_joins || 0 })}</span>
                      <span>{t("creO2O.unlocksCount", { count: mission.verified_unlocks || 0 })}</span>
                      <span>{t("creO2O.memoriesCount", { count: mission.memories_issued || 0 })}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-background/40 p-4 text-sm text-muted-foreground">
                  {t("creO2O.empty")}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

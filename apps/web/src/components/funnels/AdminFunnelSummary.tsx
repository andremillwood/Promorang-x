import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/i18n/I18nContext";
import { funnelRequest, type FunnelKind, type FunnelStage } from "@/lib/platform-funnels";

type Summary = { funnel: FunnelKind; entered: number; completed: number; checkpoints: { stage: FunnelStage; people: number }[] };

export function AdminFunnelSummary() {
  const { user } = useAuth();
  const { t } = useI18n();
  const query = useQuery({ queryKey: ["admin-funnel-summary", user?.id], queryFn: () => funnelRequest<Summary[]>("/funnels/summary"), enabled: Boolean(user), staleTime: 30000 });
  return <section className="rounded-xl border border-border bg-card p-6">
    <h3 className="font-semibold">{t("funnel.progressTitle")}</h3>
    <p className="mt-2 text-sm text-muted-foreground">{t("funnel.progressCopy")}</p>
    {query.isLoading ? <p role="status" className="mt-4">{t("funnel.loading")}</p> : query.isError ? <p role="alert" className="mt-4">{t("funnel.unavailable")} <button className="min-h-11 underline" onClick={() => void query.refetch()}>{t("funnel.retry")}</button></p> : <div className="mt-6 grid gap-6 lg:grid-cols-3">{query.data?.map(item => <div key={item.funnel}><h4 className="font-bold">{t(`funnel.${item.funnel}`)}</h4><dl className="mt-3 space-y-3">{item.checkpoints.map(checkpoint => <div key={checkpoint.stage} className="flex items-center justify-between gap-3 border-b border-border pb-2"><dt className="text-sm">{t(`funnel.${checkpoint.stage}`)}</dt><dd className="font-bold tabular-nums">{checkpoint.people}</dd></div>)}</dl></div>)}</div>}
  </section>;
}

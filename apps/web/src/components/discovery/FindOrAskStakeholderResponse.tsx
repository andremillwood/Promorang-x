import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Loader2, Send } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/i18n/I18nContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProposeFindOrAskOutcome } from "@/hooks/useFindOrAsk";
import { stakeholderRoutes, type FindOrAskStakeholderRole } from "@/lib/find-or-ask-stakeholder";
import { trackGrowthEvent } from "@/lib/marketing-attribution";

export function FindOrAskStakeholderResponse({ discoveryId }: { discoveryId: string }) {
  const { user, activeRole } = useAuth();
  const { t } = useI18n();
  const routes = useMemo(() => stakeholderRoutes(activeRole, discoveryId), [activeRole, discoveryId]);
  const [selectedAction, setSelectedAction] = useState(routes[0]?.action || "");
  const selectedRoute = routes.find((row) => row.action === selectedAction) || routes[0];
  const [objectId, setObjectId] = useState("");
  const [objectUrl, setObjectUrl] = useState("");
  const [sourceLabel, setSourceLabel] = useState("");
  const propose = useProposeFindOrAskOutcome();

  if (!user || !routes.length || !selectedRoute) return null;

  const submit = async () => {
    if (!objectId.trim()) return;
    await propose.mutateAsync({
      discoveryId,
      responderUserId: user.id,
      stakeholderRole: activeRole as FindOrAskStakeholderRole,
      actionKind: selectedRoute.action,
      canonicalObjectType: selectedRoute.objectType,
      canonicalObjectId: objectId,
      canonicalObjectUrl: objectUrl,
      sourceLabel,
    });
    void trackGrowthEvent({ eventName: "find_or_ask_outcome_proposed", journey: "commercial", stage: "outcome", entityType: selectedRoute.objectType, entityId: objectId.trim(), properties: { discoveryId, role: activeRole, action: selectedRoute.action } });
  };

  return (
    <details className="mt-4 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
      <summary className="cursor-pointer list-none text-xs font-black text-orange-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400">{t("findOrAsk.respondAs", { role: activeRole })}</summary>
      <div className="mt-4 space-y-4">
        <div className="flex flex-wrap gap-2">
          {routes.map((route) => (
            <Link key={route.action} to={route.href} onClick={() => setSelectedAction(route.action)} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/15 px-3 text-xs font-bold text-white/70 hover:border-orange-400/50 hover:text-white">
              {t(route.labelKey as any)} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ))}
        </div>
        <p className="text-xs leading-5 text-white/45">{t("findOrAsk.attachOutcomeHelp")}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input value={objectId} onChange={(event) => setObjectId(event.target.value)} placeholder={t("findOrAsk.objectIdPlaceholder")} aria-label={t("findOrAsk.objectIdLabel")} className="border-white/10 bg-black/30 text-white" />
          <Input value={objectUrl} onChange={(event) => setObjectUrl(event.target.value)} placeholder={t("findOrAsk.objectUrlPlaceholder")} aria-label={t("findOrAsk.objectUrlLabel")} className="border-white/10 bg-black/30 text-white" />
        </div>
        <Input value={sourceLabel} onChange={(event) => setSourceLabel(event.target.value)} placeholder={t("findOrAsk.sourceLabelPlaceholder")} aria-label={t("findOrAsk.sourceLabel")} className="border-white/10 bg-black/30 text-white" />
        {propose.isError ? <p role="alert" className="text-xs text-red-200">{t("findOrAsk.outcomeError")}</p> : null}
        {propose.isSuccess ? <p role="status" className="flex items-center gap-2 text-xs text-emerald-300"><CheckCircle2 className="h-4 w-4" />{t("findOrAsk.outcomePending")}</p> : null}
        <Button type="button" onClick={() => void submit()} disabled={!objectId.trim() || propose.isPending} className="bg-orange-500 font-black text-black hover:bg-orange-400">
          {propose.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}{t("findOrAsk.attachOutcome")}
        </Button>
      </div>
    </details>
  );
}

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Loader2, MapPin, Radio, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useFindOrAskDiscoveries, useSupportFindOrAskDemand } from "@/hooks/useFindOrAsk";
import { useI18n } from "@/i18n/I18nContext";
import { FindOrAskStakeholderResponse } from "@/components/discovery/FindOrAskStakeholderResponse";
import { trackGrowthEvent } from "@/lib/marketing-attribution";

function normalize(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
}

export function FindOrAskDemandRail({ city, query }: { city?: string; query?: string }) {
  const { user } = useAuth();
  const { t, formatNumber, formatDate } = useI18n();
  const demand = useFindOrAskDiscoveries(city);
  const support = useSupportFindOrAskDemand();
  const [supportedId, setSupportedId] = useState<string | null>(null);
  const rows = useMemo(() => {
    const needle = normalize(query || "").trim();
    return (demand.data || [])
      .filter((row) => row.semantic_kind === "demand")
      .filter((row) => !needle || normalize(`${row.question} ${row.city || ""}`).includes(needle))
      .slice(0, 6);
  }, [demand.data, query]);

  if (!rows.length) return null;

  const addSupport = async (id: string) => {
    const count = await support.mutateAsync(id);
    setSupportedId(id);
    void trackGrowthEvent({ eventName: "find_or_ask_demand_supported", journey: "participant", stage: "activated", entityType: "discovery_demand", entityId: id, value: count });
  };

  const next = typeof window === "undefined" ? "/discover" : `${window.location.pathname}${window.location.search}`;

  return (
    <div className="marketing-demand-rail">
      {rows.map((row) => {
        const count = Number(row.support_count || 0);
        const target = Number(row.demand_target || 0);
        const progress = target > 0 ? Math.min(100, Math.round((count / target) * 100)) : 0;
        const isSubmitting = support.isPending && support.variables === row.id;
        const added = supportedId === row.id || Boolean(row.user_supported);
        return (
          <article key={row.id} className="rounded-[1.6rem] border border-orange-400/20 bg-orange-400/[0.045] p-5">
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-orange-300"><Radio className="h-3.5 w-3.5" />{t("findOrAsk.demandLabel")}</span>
              <span className="text-[10px] font-bold text-white/35">{t("findOrAsk.askedOn", { date: formatDate(row.created_at) })}</span>
            </div>
            <h3 className="mt-4 text-xl font-black leading-snug text-white">{row.question}</h3>
            {row.city ? <p className="mt-3 flex items-center gap-1 text-[11px] text-white/42"><MapPin className="h-3 w-3 text-orange-300" />{row.city}</p> : null}
            <div className="mt-5 flex items-center justify-between text-xs"><span className="inline-flex items-center gap-2 font-black text-white"><Users className="h-4 w-4 text-orange-300" />{t("findOrAsk.peopleWantCount", { count: formatNumber(count) })}</span>{target > 0 ? <span className="text-white/40">{t("findOrAsk.demandTarget", { count: formatNumber(target) })}</span> : null}</div>
            {target > 0 ? <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-label={t("findOrAsk.demandProgressLabel")} aria-valuemin={0} aria-valuemax={target} aria-valuenow={count}><div className="h-full rounded-full bg-orange-400 transition-all" style={{ width: `${progress}%` }} /></div> : null}
            <p className="mt-4 text-xs leading-5 text-white/45">{t("findOrAsk.demandSupportRule")}</p>
            {support.isError && support.variables === row.id ? <p role="alert" className="mt-4 text-xs text-red-200">{t("findOrAsk.supportError")}</p> : null}
            <div className="mt-5">
              {user ? (
                <button type="button" onClick={() => void addSupport(row.id)} disabled={isSubmitting || added} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-orange-500 px-5 text-xs font-black text-black transition hover:bg-orange-400 disabled:opacity-60">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : added ? <Check className="h-4 w-4" /> : null}{added ? t("findOrAsk.supportAdded") : t("clarity.wantAction")}
                </button>
              ) : (
                <Link to={`/auth?mode=login&role=participant&next=${encodeURIComponent(next)}`} className="inline-flex min-h-11 items-center justify-center rounded-full bg-orange-500 px-5 text-xs font-black text-black transition hover:bg-orange-400">{t("clarity.wantAction")}</Link>
              )}
            </div>
            <FindOrAskStakeholderResponse discoveryId={row.id} />
          </article>
        );
      })}
    </div>
  );
}

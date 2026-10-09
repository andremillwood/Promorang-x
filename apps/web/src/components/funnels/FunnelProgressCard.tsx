import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { usePlatformFunnels } from "@/hooks/usePlatformFunnels";
import { useI18n } from "@/i18n/I18nContext";
import { funnelNextHref, type FunnelKind } from "@/lib/platform-funnels";

export function FunnelProgressCard({ funnel }: { funnel: FunnelKind }) {
  const { t } = useI18n();
  const query = usePlatformFunnels();
  const progress = query.data?.[funnel];
  return <section className="my-8 border-y border-white/15 py-6 text-white" aria-label={t(`funnel.${funnel}`)}>
    <p className="text-[10px] font-black uppercase tracking-[.2em] text-orange-300">{t(`funnel.${funnel}`)}</p>
    <h2 className="mt-2 font-serif text-2xl font-bold">{t("funnel.progressTitle")}</h2>
    {query.isLoading ? <p role="status" className="mt-4 text-sm text-white/55">{t("funnel.loading")}</p> : query.isError ? <p role="alert" className="mt-4 text-sm text-white/65">{t("funnel.unavailable")} <button type="button" onClick={() => void query.refetch()} className="min-h-11 underline">{t("funnel.retry")}</button></p> : progress ? <>
      <ol className="mt-5 flex flex-wrap gap-x-6 gap-y-4">{progress.stages.map((item, index) => <li key={item.stage} className={`flex items-center gap-2 text-xs ${item.complete ? "text-emerald-300" : "text-white/65"}`}><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-current">{item.complete ? <Check className="h-3 w-3" aria-hidden="true" /> : index + 1}</span><span>{t(`funnel.${item.stage}`)}{item.complete && <span className="sr-only"> — {t("funnel.complete")}</span>}</span></li>)}</ol>
      {progress.nextStage && <Link to={funnelNextHref(progress)} className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-orange-300">{t(`funnel.${progress.nextStage}`)} <ArrowRight className="h-4 w-4" /></Link>}
    </> : null}
  </section>;
}

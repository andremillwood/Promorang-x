import { useMemo } from "react";
import { CheckCircle2, HelpCircle, MapPin, MessageCircleQuestion } from "lucide-react";
import { useFindOrAskDiscoveries } from "@/hooks/useFindOrAsk";
import { useI18n } from "@/i18n/I18nContext";
import { FindOrAskStakeholderResponse } from "@/components/discovery/FindOrAskStakeholderResponse";

function normalize(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
}

export function FindOrAskQuestionRail({ city, query }: { city?: string; query?: string }) {
  const { t, formatDate } = useI18n();
  const questions = useFindOrAskDiscoveries(city);
  const rows = useMemo(() => {
    const needle = normalize(query || "").trim();
    return (questions.data || [])
      .filter((row) => row.semantic_kind === "question")
      .filter((row) => !needle || normalize(`${row.question} ${row.city || ""}`).includes(needle))
      .slice(0, 6);
  }, [questions.data, query]);

  if (questions.isLoading) {
    return <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6 text-sm text-white/45">{t("findOrAsk.loadingQuestions")}</div>;
  }
  if (questions.isError) {
    return <div role="alert" className="rounded-3xl border border-white/10 bg-white/[0.025] p-6 text-sm text-white/45"><HelpCircle className="mr-2 inline h-4 w-4 text-orange-300" />{t("findOrAsk.questionsUnavailable")}</div>;
  }
  if (!rows.length) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {rows.map((row) => (
        <article key={row.id} className="rounded-[1.6rem] border border-white/10 bg-white/[0.025] p-5">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-sky-300"><MessageCircleQuestion className="h-3.5 w-3.5" />{t("findOrAsk.questionLabel")}</span>
            {row.has_answer ? <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-300"><CheckCircle2 className="h-3.5 w-3.5" />{t("findOrAsk.answered")}</span> : <span className="text-[10px] font-bold text-white/35">{t("findOrAsk.waitingForAnswer")}</span>}
          </div>
          <h3 className="mt-4 text-xl font-black leading-snug text-white">{row.question}</h3>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-white/42">
            {row.city ? <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3 text-orange-300" />{row.city}</span> : null}
            <span>{t("findOrAsk.askedOn", { date: formatDate(row.created_at) })}</span>
          </div>
          <p className="mt-4 text-xs leading-5 text-white/45">{t("findOrAsk.questionNoTarget")}</p>
          <FindOrAskStakeholderResponse discoveryId={row.id} />
        </article>
      ))}
    </div>
  );
}

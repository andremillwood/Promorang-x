import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, Megaphone, MessageCircle, RotateCcw, Search, ShieldCheck, X } from "lucide-react";
import { findOrAskPostKind, type FindOrAskRecoveryAction } from "@promorang/shared";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/i18n/I18nContext";
import { Button } from "@/components/ui/button";
import { useCreateFindOrAskDiscovery, useFindOrAskOutcomes } from "@/hooks/useFindOrAsk";
import { trackGrowthEvent } from "@/lib/marketing-attribution";

type Props = {
  query: string;
  city?: string;
  source: string;
  recovery?: string | null;
  onSearchAgain: () => void;
};

const validRecovery = (value?: string | null): FindOrAskRecoveryAction | null =>
  value === "ask_people" || value === "request_something" || value === "search_again" ? value : null;

export function FindOrAskRecoveryPanel({ query, city, source, recovery, onSearchAgain }: Props) {
  const { user } = useAuth();
  const { t, locale, formatDate } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const selected = validRecovery(recovery);
  const postedParam = searchParams.get("posted");
  const kind = findOrAskPostKind(selected);
  const create = useCreateFindOrAskDiscovery();
  const [postedId, setPostedId] = useState<string | null>(() => postedParam);
  const [duplicate, setDuplicate] = useState(false);
  const outcomes = useFindOrAskOutcomes(postedId);

  const authorName = useMemo(() => user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Community member", [user]);

  useEffect(() => {
    if (postedParam) {
      setPostedId(postedParam);
      return;
    }
    setPostedId(null);
    setDuplicate(false);
    create.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, selected, postedParam]);

  const choose = (next: "ask_people" | "request_something") => {
    const params = new URLSearchParams(window.location.search);
    params.set("q", query);
    params.set("source", source || "search");
    params.set("recovery", next);
    params.set("lang", locale);
    if (city) params.set("city", city);
    setSearchParams(params);
    void trackGrowthEvent({ eventName: "find_or_ask_recovery_chosen", journey: "participant", stage: "captured", entityType: "search_recovery", entityId: next, properties: { query, city, source, language: locale } });
  };

  const cancel = () => {
    const params = new URLSearchParams(window.location.search);
    params.delete("recovery");
    params.delete("posted");
    setSearchParams(params);
    void trackGrowthEvent({ eventName: "find_or_ask_cancelled", journey: "participant", stage: "captured", entityType: "search_recovery", properties: { query, city, source } });
  };

  const submit = async () => {
    if (!kind || !selected || selected === "search_again") return;
    void trackGrowthEvent({ eventName: "find_or_ask_confirmed", journey: "participant", stage: "captured", entityType: kind, properties: { query, city, source, recovery: selected, language: locale } });
    const row = await create.mutateAsync({ query, kind, city, language: locale, source: source || "search", recovery: selected, authorName });
    setPostedId(row.discovery_id);
    setDuplicate(Boolean(row.duplicate));
    const params = new URLSearchParams(window.location.search);
    params.set("posted", row.discovery_id);
    setSearchParams(params, { replace: true });
    void trackGrowthEvent({ eventName: row.duplicate ? "find_or_ask_duplicate_found" : "find_or_ask_posted", journey: "participant", stage: "activated", entityType: kind, entityId: row.discovery_id, properties: { query, city, source, recovery: selected, language: locale } });
  };

  if (postedId) {
    const firstOutcome = outcomes.data?.[0];
    return (
      <div role="status" className="mx-auto mt-8 max-w-2xl rounded-3xl border border-emerald-400/25 bg-emerald-400/[0.06] p-6 text-left">
        <CheckCircle2 className="h-6 w-6 text-emerald-300" />
        <h4 className="mt-4 text-xl font-black text-white">{duplicate ? t("findOrAsk.duplicateTitle") : t("findOrAsk.postedTitle")}</h4>
        <p className="mt-2 text-sm leading-6 text-white/60">{kind === "question" ? t("findOrAsk.questionPostedCopy") : kind === "demand" ? t("findOrAsk.demandPostedCopy") : t("findOrAsk.responseStatusCopy")}</p>
        {outcomes.isLoading ? <p className="mt-4 text-xs text-white/45">{t("findOrAsk.checkingAnswers")}</p> : firstOutcome ? (
          <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 p-4">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-300">{t("findOrAsk.answerReturned")}</p>
            <p className="mt-2 text-sm font-bold text-white">{firstOutcome.source_label || firstOutcome.canonical_object_type}</p>
            <p className="mt-1 text-xs text-white/50">{t("findOrAsk.freshness", { date: formatDate(firstOutcome.freshness_at || firstOutcome.created_at) })} · {firstOutcome.verification_status === "verified" ? t("findOrAsk.verified") : t("findOrAsk.pendingVerification")}</p>
            {firstOutcome.canonical_object_url ? <Link to={firstOutcome.canonical_object_url} className="mt-3 inline-flex text-xs font-black text-orange-300">{t("findOrAsk.openAnswer")}</Link> : null}
          </div>
        ) : <p className="mt-4 text-xs leading-5 text-white/45">{t("findOrAsk.noAnswerYet")}</p>}
        <Button type="button" variant="ghost" onClick={cancel} className="mt-4 px-0 text-xs text-white/55 hover:bg-transparent hover:text-white"><RotateCcw className="mr-2 h-3.5 w-3.5" />{t("findOrAsk.backToSearch")}</Button>
      </div>
    );
  }

  if (!selected || selected === "search_again") {
    return (
      <div className="mx-auto mt-8 grid max-w-4xl gap-3 md:grid-cols-3" aria-label={t("findOrAsk.nextChoiceLabel")}>
        <button type="button" onClick={() => choose("ask_people")} className="rounded-2xl border border-[#ff5500]/35 bg-[#ff5500]/10 p-5 text-left transition hover:border-[#ff5500] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5500]">
          <MessageCircle className="h-5 w-5 text-[#ff7a25]" /><span className="mt-4 block font-bold text-white">{t("findOrAsk.askPeople")}</span><span className="mt-1 block text-xs leading-5 text-white/50">{t("findOrAsk.askPeopleCopy")}</span>
        </button>
        <button type="button" onClick={() => choose("request_something")} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left transition hover:border-[#ff5500]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5500]">
          <Megaphone className="h-5 w-5 text-[#ff7a25]" /><span className="mt-4 block font-bold text-white">{t("findOrAsk.requestSomething")}</span><span className="mt-1 block text-xs leading-5 text-white/50">{t("findOrAsk.requestSomethingCopy")}</span>
        </button>
        <button type="button" onClick={onSearchAgain} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left transition hover:border-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50">
          <Search className="h-5 w-5 text-white/65" /><span className="mt-4 block font-bold text-white">{t("findOrAsk.searchAgain")}</span><span className="mt-1 block text-xs leading-5 text-white/50">{t("findOrAsk.searchAgainCopy")}</span>
        </button>
      </div>
    );
  }

  const loginNext = `${window.location.pathname}${window.location.search}`;
  return (
    <div className="mx-auto mt-8 max-w-2xl rounded-3xl border border-white/10 bg-white/[0.035] p-6 text-left sm:p-8">
      <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.14em] text-[#ff7a25]">{t("findOrAsk.confirmBadge")}</p><h4 className="mt-2 text-2xl font-black text-white">{kind === "question" ? t("findOrAsk.confirmQuestionTitle") : t("findOrAsk.confirmDemandTitle")}</h4></div><button type="button" onClick={cancel} aria-label={t("findOrAsk.cancel")} className="rounded-full p-2 text-white/45 hover:bg-white/10 hover:text-white"><X className="h-4 w-4" /></button></div>
      <blockquote className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4 text-base font-bold leading-7 text-white">“{query}”</blockquote>
      <dl className="mt-5 grid gap-3 text-xs sm:grid-cols-2"><div><dt className="text-white/40">{t("findOrAsk.where")}</dt><dd className="mt-1 font-bold text-white/75">{city || t("findOrAsk.anywhere")}</dd></div><div><dt className="text-white/40">{t("findOrAsk.whatHappens")}</dt><dd className="mt-1 font-bold text-white/75">{kind === "question" ? t("findOrAsk.questionRule") : t("findOrAsk.demandRule")}</dd></div></dl>
      <p className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs leading-6 text-white/55"><ShieldCheck className="mr-2 inline h-4 w-4 text-emerald-300" />{t("findOrAsk.publicAfterConfirm")}</p>
      {create.isError ? <div role="alert" className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-xs text-red-100">{t("findOrAsk.postError")} <button type="button" onClick={() => void submit()} className="ml-2 font-black underline">{t("common.tryAgain")}</button></div> : null}
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="ghost" onClick={cancel} disabled={create.isPending}>{t("findOrAsk.cancel")}</Button>
        {user ? <Button type="button" onClick={() => void submit()} disabled={create.isPending} className="bg-[#ff5500] font-black text-white hover:bg-[#e04b00]">{create.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}{t("findOrAsk.postNow")}</Button> : <Button asChild className="bg-[#ff5500] font-black text-white hover:bg-[#e04b00]"><Link to={`/auth?mode=login&role=participant&next=${encodeURIComponent(loginNext)}`}>{t("findOrAsk.signInToPost")}</Link></Button>}
      </div>
    </div>
  );
}

import { commercialText } from "@/i18n/commercial-presentation";
import { useI18n } from "@/i18n/I18nContext";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Check, Compass, Sparkles } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useMarket } from "@/contexts/MarketContext";
import { authPathForReturn } from "@/lib/post-auth-next";
import { BusinessBriefCapture } from "./BusinessBriefCapture";
import { funnelRequest } from "@/lib/platform-funnels";
import {
  BUSINESS_OUTCOMES,
  businessContinuation,
  BUSINESS_TYPES,
  SUCCESS_ACTIONS,
  createBusinessOutcomeBrief,
  getOutcome,
  getProgramme,
  getSuccessAction,
  readBusinessOutcomeBrief,
  roleForBusinessType,
  saveBusinessOutcomeBrief,
  type BusinessOutcomeId,
  type BusinessTypeId,
  type SuccessActionId,
  type BusinessOutcomeBrief,
} from "@/lib/business-outcomes";

type Step = "outcome" | "business" | "success" | "context" | "recommendation";

export function BusinessOutcomeNavigator() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { city } = useMarket();
  const [params] = useSearchParams();
  const stored = useMemo(() => params.get("resume") === "1" ? readBusinessOutcomeBrief() : null, [params]);

  const queryOutcome = getOutcome(params.get("outcome"))?.id || null;
  const [step, setStep] = useState<Step>(stored ? "recommendation" : queryOutcome ? "business" : "outcome");
  const [outcomeId, setOutcomeId] = useState<BusinessOutcomeId | null>(stored?.outcomeId || queryOutcome);
  const [businessType, setBusinessType] = useState<BusinessTypeId | null>(stored?.businessType || null);
  const [successAction, setSuccessAction] = useState<SuccessActionId | null>(stored?.successAction || null);
  const [target, setTarget] = useState(stored?.target ? String(stored.target) : "");
  const [timeframe, setTimeframe] = useState(stored?.timeframe || "");
  const [geography, setGeography] = useState(stored?.geography || (city.name === "All Jamaica" ? "Jamaica" : city.name));
  const [audience, setAudience] = useState(stored?.audience || "");
  const [availableValue, setAvailableValue] = useState(stored?.availableValue || "");
  const [brief, setBrief] = useState(stored);
  const remoteBrief = useQuery({
    queryKey: ["business-brief", user?.id], enabled: Boolean(user && params.get("resume") === "1" && !stored),
    queryFn: () => funnelRequest<BusinessOutcomeBrief | null>("/funnels/brief"),
  });
  useEffect(() => {
    const recovered = remoteBrief.data;
    if (!recovered) return;
    saveBusinessOutcomeBrief(recovered);
    setBrief(recovered); setOutcomeId(recovered.outcomeId); setBusinessType(recovered.businessType);
    setSuccessAction(recovered.successAction); setTarget(recovered.target ? String(recovered.target) : "");
    setTimeframe(recovered.timeframe); setGeography(recovered.geography); setAudience(recovered.audience);
    setAvailableValue(recovered.availableValue); setStep("recommendation");
  }, [remoteBrief.data]);

  const outcome = getOutcome(outcomeId);
  const programme = getProgramme(brief?.programmeId);
  const selectedSuccess = getSuccessAction(successAction);
  const suggestedActions = outcome?.suggestedActions || [];
  const actions = [...SUCCESS_ACTIONS].sort((a, b) => Number(suggestedActions.includes(b.id)) - Number(suggestedActions.includes(a.id)));

  function finishBrief() {
    if (!outcomeId || !businessType || !successAction) return;
    const next = createBusinessOutcomeBrief({
      outcomeId,
      businessType,
      successAction,
      target: target ? Math.max(1, Number(target) || 1) : null,
      timeframe: timeframe.trim(),
      geography: geography.trim(),
      audience: audience.trim(),
      availableValue: availableValue.trim(),
    });
    saveBusinessOutcomeBrief(next);
    setBrief(next);
    setStep("recommendation");
  }

  const continuePath = brief ? businessContinuation(brief) : "/business/start";
  const authPath = brief
    ? authPathForReturn("/business/start?resume=1", { mode: "signup", role: roleForBusinessType(brief.businessType) })
    : "/auth?mode=signup";

  return (
    <div className="mx-auto max-w-6xl">
      {remoteBrief.isFetching && <p role="status" className="mb-5 text-sm text-white/65">{t("funnel.loading")}</p>}
      {remoteBrief.isError && <p role="alert" className="mb-5 text-sm text-white/65">{t("funnel.unavailable")} <button type="button" onClick={() => void remoteBrief.refetch()} className="min-h-11 underline">{t("funnel.retry")}</button></p>}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">{t("commercial.business.outcome.navigator.190")}</p>
          <p className="mt-2 text-sm text-white/45">{t("commercial.start.with.the.change.promorang.will.help.shape.191")}</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-white/30">
          {[t("createProposal.step1Short"), t("commercial.context.192"), t("commercial.success.193"), t("commercial.route.194")].map((label, index) => <span key={label} className="flex items-center gap-2"><span className="grid h-6 w-6 place-items-center rounded-full border border-white/15">{index + 1}</span>{label}</span>)}
        </div>
      </div>

      {step === "outcome" && (
        <section>
          <h1 className="max-w-4xl font-serif text-4xl font-bold tracking-[-.045em] sm:text-6xl">{t("commercial.what.do.you.need.to.make.happen.195")}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55">{t("commercial.choose.the.business.change.first.you.do.not.196")}</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {BUSINESS_OUTCOMES.map((item) => (
              <button key={item.id} type="button" onClick={() => { setOutcomeId(item.id); setStep("business"); }} className="group min-h-48 rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-5 text-left transition hover:border-orange-400/45 hover:bg-orange-400/[0.06]">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-300">{commercialText(item.short, t)}</p>
                <h2 className="mt-4 font-serif text-2xl font-bold">{commercialText(item.title, t)}</h2>
                <p className="mt-3 text-sm leading-6 text-white/45">{commercialText(item.description, t)}</p>
                <ArrowRight className="mt-6 h-4 w-4 text-white/20 transition group-hover:translate-x-1 group-hover:text-orange-300" />
              </button>
            ))}
          </div>
        </section>
      )}

      {step === "business" && outcome && (
        <section>
          <button onClick={() => setStep("outcome")} className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-white/45 hover:text-white"><ArrowLeft className="h-4 w-4" /> {t("commercial.change.outcome.197")}</button>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-300">{commercialText(outcome.title, t)}</p>
          <h2 className="mt-3 max-w-3xl font-serif text-4xl font-bold">{t("commercial.what.kind.of.business.is.this.198")}</h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {BUSINESS_TYPES.map((item) => (
              <button key={item.id} type="button" onClick={() => { setBusinessType(item.id); setStep("success"); }} className="rounded-[1.4rem] border border-white/10 bg-white/[0.035] p-5 text-left hover:border-orange-400/40">
                <h3 className="font-serif text-xl font-bold">{commercialText(item.title, t)}</h3>
                <p className="mt-2 text-sm leading-6 text-white/45">{commercialText(item.description, t)}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      {step === "success" && outcome && businessType && (
        <section>
          <button onClick={() => setStep("business")} className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-white/45 hover:text-white"><ArrowLeft className="h-4 w-4" /> {t("commercial.change.business.context.199")}</button>
          <h2 className="max-w-3xl font-serif text-4xl font-bold">{t("commercial.what.would.actually.prove.this.worked.200")}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/50">{t("commercial.choose.the.closest.measurable.customer.action.this.keeps.201")}</p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {actions.map((item) => (
              <button key={item.id} type="button" onClick={() => { setSuccessAction(item.id); setStep("context"); }} className="flex min-h-24 items-center justify-between rounded-[1.3rem] border border-white/10 bg-white/[0.03] p-5 text-left hover:border-orange-400/40">
                <span className="font-bold">{commercialText(item.title, t)}</span><Check className="h-4 w-4 text-white/20" />
              </button>
            ))}
          </div>
        </section>
      )}

      {step === "context" && outcome && successAction && (
        <section>
          <button onClick={() => setStep("success")} className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-white/45 hover:text-white"><ArrowLeft className="h-4 w-4" /> {t("commercial.change.success.action.202")}</button>
          <h2 className="max-w-3xl font-serif text-4xl font-bold">{t("commercial.give.promorang.enough.context.to.shape.the.route.203")}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/50">{t("commercial.these.are.planning.inputs.not.promises.you.can.204")}</p>
          <div className="mt-8 grid gap-5 rounded-[1.8rem] border border-white/10 bg-white/[0.03] p-6 md:grid-cols-2">
            <label className="text-xs font-black uppercase tracking-[0.12em] text-white/45">{t("commercial.target.205")} {" "}<span className="font-normal normal-case tracking-normal text-white/30">{t("commercial.optional.206")}</span><input type="number" min="1" value={target} onChange={(e) => setTarget(e.target.value)} placeholder={selectedSuccess ? t("commercial.exampleTarget", { unit: commercialText(selectedSuccess.unit, t) }) : t("commercial.exampleNumber")} className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-black/35 px-4 text-sm font-medium normal-case tracking-normal text-white outline-none focus:border-orange-400/50" /></label>
            <label className="text-xs font-black uppercase tracking-[0.12em] text-white/45">{t("commercial.timeframe.207")}<input value={timeframe} onChange={(e) => setTimeframe(e.target.value)} placeholder={t("commercial.e.g.next.30.days.208")} className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-black/35 px-4 text-sm font-medium normal-case tracking-normal text-white outline-none focus:border-orange-400/50" /></label>
            <label className="text-xs font-black uppercase tracking-[0.12em] text-white/45">{t("askMarket.city")}<input value={geography} onChange={(e) => setGeography(e.target.value)} placeholder={t("commercial.city.area.store.or.online.210")} className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-black/35 px-4 text-sm font-medium normal-case tracking-normal text-white outline-none focus:border-orange-400/50" /></label>
            <label className="text-xs font-black uppercase tracking-[0.12em] text-white/45">{t("commercial.audience.211")}<input value={audience} onChange={(e) => setAudience(e.target.value)} placeholder={t("commercial.who.should.take.this.action.212")} className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-black/35 px-4 text-sm font-medium normal-case tracking-normal text-white outline-none focus:border-orange-400/50" /></label>
            <label className="text-xs font-black uppercase tracking-[0.12em] text-white/45 md:col-span-2">{t("commercial.what.can.you.give.people.a.reason.to.213")}<input value={availableValue} onChange={(e) => setAvailableValue(e.target.value)} placeholder={t("commercial.sample.access.perk.useful.content.discount.experience.or.214")} className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-black/35 px-4 text-sm font-medium normal-case tracking-normal text-white outline-none focus:border-orange-400/50" /></label>
          </div>
          <button type="button" onClick={finishBrief} className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-orange-400 px-6 text-sm font-black text-black">{t("commercial.build.my.route.91")}<Sparkles className="h-4 w-4" /></button>
        </section>
      )}

      {step === "recommendation" && brief && programme && (
        <section>
          <button onClick={() => setStep("context")} className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-white/45 hover:text-white"><ArrowLeft className="h-4 w-4" /> {t("commercial.adjust.brief.215")}</button>
          <div className="grid gap-8 lg:grid-cols-[1.15fr_.85fr]">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-300">{t("commercial.promorang.recommends.216")}</p>
              <h2 className="mt-3 font-serif text-5xl font-bold tracking-[-.045em] sm:text-6xl">{commercialText(programme.title, t)}</h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-white/60">{commercialText(programme.promise, t)}</p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {programme.path.map((item, index) => <div key={item} className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] p-4"><span className="text-[10px] font-black text-orange-300">0{index + 1}</span><p className="mt-2 text-sm font-bold">{commercialText(item, t)}</p></div>)}
              </div>
              <p className="mt-6 max-w-2xl text-xs leading-6 text-white/35">{t("commercial.this.is.a.recommended.route.not.a.promised.217")}</p>
            </div>
            <aside className="rounded-[1.8rem] border border-orange-300/20 bg-orange-300/[0.06] p-6">
              <Compass className="h-6 w-6 text-orange-300" />
              <p className="mt-5 text-[10px] font-black uppercase tracking-[0.18em] text-orange-300">{t("commercial.your.outcome.brief.218")}</p>
              <h3 className="mt-2 font-serif text-2xl font-bold">{commercialText(getOutcome(brief.outcomeId)?.title, t)}</h3>
              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between gap-5 border-b border-white/10 pb-3"><dt className="text-white/40">{t("commercial.success.193")}</dt><dd className="text-right font-bold">{brief.target ? `${brief.target} × ` : ""}{commercialText(getSuccessAction(brief.successAction)?.title, t)}</dd></div>
                <div className="flex justify-between gap-5 border-b border-white/10 pb-3"><dt className="text-white/40">{t("askMarket.city")}</dt><dd className="text-right font-bold">{brief.geography || t("commercial.undecided")}</dd></div>
                <div className="flex justify-between gap-5 border-b border-white/10 pb-3"><dt className="text-white/40">{t("forMerchants.demandWhenLabel")}</dt><dd className="text-right font-bold">{brief.timeframe || t("commercial.undecided")}</dd></div>
                <div className="flex justify-between gap-5"><dt className="text-white/40">{t("commercial.reason.to.act.220")}</dt><dd className="max-w-[14rem] text-right font-bold">{brief.availableValue || t("commercial.nextValue")}</dd></div>
              </dl>
              <BusinessBriefCapture key={brief.id} brief={brief} onSaved={(leadId) => {
                const captured = { ...brief, leadId };
                saveBusinessOutcomeBrief(captured);
                setBrief(captured);
              }} />
              {brief.leadId && (user ? (
                <Link to={continuePath} className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-orange-400 px-5 text-sm font-black text-black">{t("commercial.customize.this.programme.221")}<ArrowRight className="h-4 w-4" /></Link>
              ) : (
                <Link to={authPath} className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-orange-400 px-5 text-sm font-black text-black">{t("commercial.save.and.continue.222")}<ArrowRight className="h-4 w-4" /></Link>
              ))}
              <div className="mt-4 grid gap-2 text-center">
                <Link to="/discover?tab=wants" className="text-xs font-bold text-white/55 hover:text-white">{t("commercial.show.me.what.people.want.instead.223")}</Link>
                {brief.leadId && <Link to={user ? continuePath : authPathForReturn(continuePath, { mode: "signup", role: roleForBusinessType(brief.businessType) })} className="text-xs font-bold text-white/55 hover:text-white">{t("commercial.i.already.know.what.i.want.to.run.224")}</Link>}
              </div>
            </aside>
          </div>
        </section>
      )}
    </div>
  );
}

export default BusinessOutcomeNavigator;

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Compass, Sparkles } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useMarket } from "@/contexts/MarketContext";
import { authPathForReturn } from "@/lib/post-auth-next";
import {
  BUSINESS_OUTCOMES,
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
} from "@/lib/business-outcomes";

type Step = "outcome" | "business" | "success" | "context" | "recommendation";

export function BusinessOutcomeNavigator() {
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

  const continuePath = "/create/campaign?from=business-outcome";
  const authPath = brief
    ? authPathForReturn("/business/start?resume=1", { mode: "signup", role: roleForBusinessType(brief.businessType) })
    : "/auth?mode=signup";

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">Business Outcome Navigator</p>
          <p className="mt-2 text-sm text-white/45">Start with the change. PROMORANG will help shape the response.</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-white/30">
          {["Outcome", "Context", "Success", "Route"].map((label, index) => <span key={label} className="flex items-center gap-2"><span className="grid h-6 w-6 place-items-center rounded-full border border-white/15">{index + 1}</span>{label}</span>)}
        </div>
      </div>

      {step === "outcome" && (
        <section>
          <h1 className="max-w-4xl font-serif text-4xl font-bold tracking-[-.045em] sm:text-6xl">What do you need to make happen?</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55">Choose the business change first. You do not need to know which PROMORANG tools, offers or campaign mechanics are involved.</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {BUSINESS_OUTCOMES.map((item) => (
              <button key={item.id} type="button" onClick={() => { setOutcomeId(item.id); setStep("business"); }} className="group min-h-48 rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-5 text-left transition hover:border-orange-400/45 hover:bg-orange-400/[0.06]">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-300">{item.short}</p>
                <h2 className="mt-4 font-serif text-2xl font-bold">{item.title}</h2>
                <p className="mt-3 text-sm leading-6 text-white/45">{item.description}</p>
                <ArrowRight className="mt-6 h-4 w-4 text-white/20 transition group-hover:translate-x-1 group-hover:text-orange-300" />
              </button>
            ))}
          </div>
        </section>
      )}

      {step === "business" && outcome && (
        <section>
          <button onClick={() => setStep("outcome")} className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-white/45 hover:text-white"><ArrowLeft className="h-4 w-4" /> Change outcome</button>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-300">{outcome.title}</p>
          <h2 className="mt-3 max-w-3xl font-serif text-4xl font-bold">What kind of business is this?</h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {BUSINESS_TYPES.map((item) => (
              <button key={item.id} type="button" onClick={() => { setBusinessType(item.id); setStep("success"); }} className="rounded-[1.4rem] border border-white/10 bg-white/[0.035] p-5 text-left hover:border-orange-400/40">
                <h3 className="font-serif text-xl font-bold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/45">{item.description}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      {step === "success" && outcome && businessType && (
        <section>
          <button onClick={() => setStep("business")} className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-white/45 hover:text-white"><ArrowLeft className="h-4 w-4" /> Change business context</button>
          <h2 className="max-w-3xl font-serif text-4xl font-bold">What would actually prove this worked?</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/50">Choose the closest measurable customer action. This keeps impressions, interest and real follow-through separate.</p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {actions.map((item) => (
              <button key={item.id} type="button" onClick={() => { setSuccessAction(item.id); setStep("context"); }} className="flex min-h-24 items-center justify-between rounded-[1.3rem] border border-white/10 bg-white/[0.03] p-5 text-left hover:border-orange-400/40">
                <span className="font-bold">{item.title}</span><Check className="h-4 w-4 text-white/20" />
              </button>
            ))}
          </div>
        </section>
      )}

      {step === "context" && outcome && successAction && (
        <section>
          <button onClick={() => setStep("success")} className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-white/45 hover:text-white"><ArrowLeft className="h-4 w-4" /> Change success action</button>
          <h2 className="max-w-3xl font-serif text-4xl font-bold">Give PROMORANG enough context to shape the route.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/50">These are planning inputs, not promises. You can change them later.</p>
          <div className="mt-8 grid gap-5 rounded-[1.8rem] border border-white/10 bg-white/[0.03] p-6 md:grid-cols-2">
            <label className="text-xs font-black uppercase tracking-[0.12em] text-white/45">Target <span className="font-normal normal-case tracking-normal text-white/30">optional</span><input type="number" min="1" value={target} onChange={(e) => setTarget(e.target.value)} placeholder={selectedSuccess ? `e.g. 50 ${selectedSuccess.unit}` : "e.g. 50"} className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-black/35 px-4 text-sm font-medium normal-case tracking-normal text-white outline-none focus:border-orange-400/50" /></label>
            <label className="text-xs font-black uppercase tracking-[0.12em] text-white/45">Timeframe <input value={timeframe} onChange={(e) => setTimeframe(e.target.value)} placeholder="e.g. Next 30 days" className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-black/35 px-4 text-sm font-medium normal-case tracking-normal text-white outline-none focus:border-orange-400/50" /></label>
            <label className="text-xs font-black uppercase tracking-[0.12em] text-white/45">Where <input value={geography} onChange={(e) => setGeography(e.target.value)} placeholder="City, area, store or online" className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-black/35 px-4 text-sm font-medium normal-case tracking-normal text-white outline-none focus:border-orange-400/50" /></label>
            <label className="text-xs font-black uppercase tracking-[0.12em] text-white/45">Audience <input value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="Who should take this action?" className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-black/35 px-4 text-sm font-medium normal-case tracking-normal text-white outline-none focus:border-orange-400/50" /></label>
            <label className="text-xs font-black uppercase tracking-[0.12em] text-white/45 md:col-span-2">What can you give people a reason to act? <input value={availableValue} onChange={(e) => setAvailableValue(e.target.value)} placeholder="Sample, access, perk, useful content, discount, experience — or leave blank if unsure" className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-black/35 px-4 text-sm font-medium normal-case tracking-normal text-white outline-none focus:border-orange-400/50" /></label>
          </div>
          <button type="button" onClick={finishBrief} className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-orange-400 px-6 text-sm font-black text-black">Build my route <Sparkles className="h-4 w-4" /></button>
        </section>
      )}

      {step === "recommendation" && brief && programme && (
        <section>
          <button onClick={() => setStep("context")} className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-white/45 hover:text-white"><ArrowLeft className="h-4 w-4" /> Adjust brief</button>
          <div className="grid gap-8 lg:grid-cols-[1.15fr_.85fr]">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-300">PROMORANG recommends</p>
              <h2 className="mt-3 font-serif text-5xl font-bold tracking-[-.045em] sm:text-6xl">{programme.title}</h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-white/60">{programme.promise}</p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {programme.path.map((item, index) => <div key={item} className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] p-4"><span className="text-[10px] font-black text-orange-300">0{index + 1}</span><p className="mt-2 text-sm font-bold">{item}</p></div>)}
              </div>
              <p className="mt-6 max-w-2xl text-xs leading-6 text-white/35">This is a recommended route, not a promised result. Real terms, availability, funding and evidence requirements are confirmed before anything goes live.</p>
            </div>
            <aside className="rounded-[1.8rem] border border-orange-300/20 bg-orange-300/[0.06] p-6">
              <Compass className="h-6 w-6 text-orange-300" />
              <p className="mt-5 text-[10px] font-black uppercase tracking-[0.18em] text-orange-300">Your outcome brief</p>
              <h3 className="mt-2 font-serif text-2xl font-bold">{getOutcome(brief.outcomeId)?.title}</h3>
              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between gap-5 border-b border-white/10 pb-3"><dt className="text-white/40">Success</dt><dd className="text-right font-bold">{brief.target ? `${brief.target} × ` : ""}{getSuccessAction(brief.successAction)?.title}</dd></div>
                <div className="flex justify-between gap-5 border-b border-white/10 pb-3"><dt className="text-white/40">Where</dt><dd className="text-right font-bold">{brief.geography || "To decide"}</dd></div>
                <div className="flex justify-between gap-5 border-b border-white/10 pb-3"><dt className="text-white/40">When</dt><dd className="text-right font-bold">{brief.timeframe || "To decide"}</dd></div>
                <div className="flex justify-between gap-5"><dt className="text-white/40">Reason to act</dt><dd className="max-w-[14rem] text-right font-bold">{brief.availableValue || "Shape this next"}</dd></div>
              </dl>
              {user ? (
                <Link to={continuePath} className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-orange-400 px-5 text-sm font-black text-black">Customize this programme <ArrowRight className="h-4 w-4" /></Link>
              ) : (
                <Link to={authPath} className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-orange-400 px-5 text-sm font-black text-black">Save and continue <ArrowRight className="h-4 w-4" /></Link>
              )}
              <div className="mt-4 grid gap-2 text-center">
                <Link to="/demand" className="text-xs font-bold text-white/55 hover:text-white">Show me what people want instead</Link>
                <Link to={user ? "/create/campaign" : authPathForReturn("/create/campaign", { mode: "signup", role: roleForBusinessType(brief.businessType) })} className="text-xs font-bold text-white/55 hover:text-white">I already know what I want to run</Link>
              </div>
            </aside>
          </div>
        </section>
      )}
    </div>
  );
}

export default BusinessOutcomeNavigator;

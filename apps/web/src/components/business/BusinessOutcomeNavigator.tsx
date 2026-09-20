import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Compass, Package, Sparkles, Store } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useMarket } from "@/contexts/MarketContext";
import { authPathForReturn } from "@/lib/post-auth-next";
import {
  BUSINESS_OUTCOMES,
  BUSINESS_TYPES,
  COMMERCE_SUBJECTS,
  EXECUTION_RAILS,
  SELLER_RESPONSIBILITIES,
  SUCCESS_ACTIONS,
  businessProgrammePrimaryPath,
  createBusinessOutcomeBrief,
  getExecutionRail,
  getOutcome,
  getProgramme,
  getSellerResponsibility,
  getSuccessAction,
  readBusinessOutcomeBrief,
  recommendExecutionRail,
  roleForBusinessType,
  saveBusinessOutcomeBrief,
  type BusinessOutcomeId,
  type BusinessTypeId,
  type CommerceSubjectId,
  type ExecutionRailId,
  type SellerResponsibilityId,
  type SuccessActionId,
} from "@/lib/business-outcomes";

type Step = "outcome" | "business" | "success" | "context" | "execution" | "recommendation";

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
  const [executionRailId, setExecutionRailId] = useState<ExecutionRailId | null>(stored?.executionRailId || null);
  const [commerceSubjectId, setCommerceSubjectId] = useState<CommerceSubjectId | null>(stored?.commerceSubjectId || null);
  const [subjectLabel, setSubjectLabel] = useState(stored?.subjectLabel || "");
  const [sellerResponsibilityId, setSellerResponsibilityId] = useState<SellerResponsibilityId | null>(stored?.sellerResponsibilityId || null);
  const [brief, setBrief] = useState(stored);

  const outcome = getOutcome(outcomeId);
  const programme = getProgramme(brief?.programmeId);
  const selectedSuccess = getSuccessAction(successAction);
  const suggestedActions = outcome?.suggestedActions || [];
  const actions = [...SUCCESS_ACTIONS].sort((a, b) => Number(suggestedActions.includes(b.id)) - Number(suggestedActions.includes(a.id)));
  const recommendedExecution = outcomeId && successAction && businessType
    ? recommendExecutionRail(outcomeId, successAction, businessType)
    : null;
  const sortedRails = [...EXECUTION_RAILS].sort((a, b) => Number(b.id === recommendedExecution) - Number(a.id === recommendedExecution));
  const needsCommerce = executionRailId === "commerce" || executionRailId === "mixed";

  function chooseExecution(id: ExecutionRailId) {
    setExecutionRailId(id);
    if (id !== "commerce" && id !== "mixed") {
      setCommerceSubjectId(null);
      setSubjectLabel("");
      setSellerResponsibilityId(null);
    }
  }

  function finishBrief() {
    if (!outcomeId || !businessType || !successAction || !executionRailId) return;
    if (needsCommerce && (!commerceSubjectId || !sellerResponsibilityId)) return;

    const next = createBusinessOutcomeBrief({
      outcomeId,
      businessType,
      successAction,
      target: target ? Math.max(1, Number(target) || 1) : null,
      timeframe: timeframe.trim(),
      geography: geography.trim(),
      audience: audience.trim(),
      availableValue: availableValue.trim(),
      executionRailId,
      commerceSubjectId: needsCommerce ? commerceSubjectId : null,
      subjectLabel: needsCommerce ? subjectLabel.trim() : "",
      sellerResponsibilityId: needsCommerce ? sellerResponsibilityId : null,
    });
    saveBusinessOutcomeBrief(next);
    setBrief(next);
    setStep("recommendation");
  }

  const continuePath = brief ? businessProgrammePrimaryPath(brief) : "/business/programme?resume=1";
  const authPath = brief
    ? authPathForReturn(continuePath, { mode: "signup", role: roleForBusinessType(brief.businessType) })
    : "/auth?mode=signup";

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">Business Outcome Navigator</p>
          <p className="mt-2 text-sm text-white/45">Start with the change. PROMORANG will help shape the response and the execution rail.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-white/30">
          {["Outcome", "Context", "Success", "Execution", "Route"].map((label, index) => <span key={label} className="flex items-center gap-2"><span className="grid h-6 w-6 place-items-center rounded-full border border-white/15">{index + 1}</span>{label}</span>)}
        </div>
      </div>

      {step === "outcome" && (
        <section>
          <h1 className="max-w-4xl font-serif text-4xl font-bold tracking-[-.045em] sm:text-6xl">What do you need to make happen?</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55">Choose the business change first. You do not need to decide whether this becomes commerce, an Offer, a Moment, distribution or a demand test yet.</p>
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
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/50">Choose the closest measurable customer action. This keeps impressions, interest, transaction and follow-through separate.</p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {actions.map((item) => (
              <button key={item.id} type="button" onClick={() => {
                setSuccessAction(item.id);
                const nextRail = outcomeId && businessType ? recommendExecutionRail(outcomeId, item.id, businessType) : null;
                if (nextRail) chooseExecution(nextRail);
                setStep("context");
              }} className="flex min-h-24 items-center justify-between rounded-[1.3rem] border border-white/10 bg-white/[0.03] p-5 text-left hover:border-orange-400/40">
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
          <button type="button" onClick={() => setStep("execution")} className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-orange-400 px-6 text-sm font-black text-black">Choose how this becomes real <ArrowRight className="h-4 w-4" /></button>
        </section>
      )}

      {step === "execution" && outcome && successAction && businessType && (
        <section>
          <button onClick={() => setStep("context")} className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-white/45 hover:text-white"><ArrowLeft className="h-4 w-4" /> Change context</button>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-300">Execution rail</p>
          <h2 className="mt-3 max-w-4xl font-serif text-4xl font-bold">What needs to become real for people to act?</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/50">PROMORANG has suggested a rail based on the outcome. You can change it. A Programme can use commerce, Offers, Moments, distribution or a demand test without treating all of them as the same thing.</p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sortedRails.map((item) => {
              const selected = executionRailId === item.id;
              const suggested = recommendedExecution === item.id;
              return (
                <button key={item.id} type="button" onClick={() => chooseExecution(item.id)} className={`rounded-[1.4rem] border p-5 text-left transition ${selected ? "border-orange-300/55 bg-orange-300/[0.08]" : "border-white/10 bg-white/[0.03] hover:border-white/20"}`}>
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-serif text-xl font-bold">{item.title}</h3>
                    {suggested ? <span className="rounded-full border border-orange-300/25 px-2 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-orange-300">Suggested</span> : null}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-white/45">{item.description}</p>
                  <p className="mt-4 text-[10px] font-black uppercase tracking-[0.1em] text-white/28">{item.boundary}</p>
                </button>
              );
            })}
          </div>

          {needsCommerce ? (
            <div className="mt-7 rounded-[1.7rem] border border-emerald-300/20 bg-emerald-300/[0.045] p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <Store className="mt-0.5 h-5 w-5 text-emerald-300" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-300">Commerce responsibility</p>
                  <h3 className="mt-2 font-serif text-2xl font-bold">Who is actually selling and fulfilling this?</h3>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-white/48">Brand, Creator or Host can help move the product. Merchant responsibility still owns price, stock, payment acceptance and fulfillment.</p>
                </div>
              </div>

              <div className="mt-6 grid gap-5 lg:grid-cols-2">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/40">What are we moving?</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {COMMERCE_SUBJECTS.map((item) => <button key={item.id} type="button" onClick={() => setCommerceSubjectId(item.id)} className={`rounded-full border px-3 py-2 text-xs font-bold ${commerceSubjectId === item.id ? "border-emerald-300/45 bg-emerald-300/10 text-emerald-200" : "border-white/10 text-white/55"}`}>{item.title}</button>)}
                  </div>
                  <label className="mt-4 block text-[10px] font-black uppercase tracking-[0.12em] text-white/40">Name / SKU / priority <span className="font-normal normal-case tracking-normal text-white/25">optional</span><input value={subjectLabel} onChange={(e) => setSubjectLabel(e.target.value)} placeholder="e.g. New mango flavour, Tuesday table package" className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/35 px-4 text-sm font-medium normal-case tracking-normal text-white outline-none focus:border-emerald-300/45" /></label>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/40">Seller / fulfiller</p>
                  <div className="mt-3 grid gap-2">
                    {SELLER_RESPONSIBILITIES.map((item) => <button key={item.id} type="button" onClick={() => setSellerResponsibilityId(item.id)} className={`rounded-xl border p-3 text-left ${sellerResponsibilityId === item.id ? "border-emerald-300/45 bg-emerald-300/10" : "border-white/10 bg-black/20"}`}><span className="text-xs font-black text-white">{item.title}</span><span className="mt-1 block text-[11px] leading-5 text-white/38">{item.description}</span></button>)}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <button type="button" disabled={!executionRailId || (needsCommerce && (!commerceSubjectId || !sellerResponsibilityId))} onClick={finishBrief} className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-full bg-orange-400 px-6 text-sm font-black text-black disabled:cursor-not-allowed disabled:opacity-35">Build my route <Sparkles className="h-4 w-4" /></button>
        </section>
      )}

      {step === "recommendation" && brief && programme && (
        <section>
          <button onClick={() => setStep("execution")} className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-white/45 hover:text-white"><ArrowLeft className="h-4 w-4" /> Adjust execution</button>
          <div className="grid gap-8 lg:grid-cols-[1.15fr_.85fr]">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-300">PROMORANG recommends</p>
              <h2 className="mt-3 font-serif text-5xl font-bold tracking-[-.045em] sm:text-6xl">{programme.title}</h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-white/60">{programme.promise}</p>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-black">
                <Package className="h-4 w-4 text-orange-300" /> Execution: {getExecutionRail(brief.executionRailId)?.title}
              </div>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {programme.path.map((item, index) => <div key={item} className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] p-4"><span className="text-[10px] font-black text-orange-300">0{index + 1}</span><p className="mt-2 text-sm font-bold">{item}</p></div>)}
              </div>
              {brief.sellerResponsibilityId ? (
                <div className="mt-6 rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.05] p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-300">Seller responsibility</p>
                  <p className="mt-2 text-sm font-black">{getSellerResponsibility(brief.sellerResponsibilityId)?.title}</p>
                  <p className="mt-1 text-xs leading-5 text-white/42">{getSellerResponsibility(brief.sellerResponsibilityId)?.description}</p>
                </div>
              ) : null}
              <p className="mt-6 max-w-2xl text-xs leading-6 text-white/35">This is a recommended route, not a promised result. Real seller relationships, price, stock, terms, funding, payment and fulfillment must exist before commerce is represented as available.</p>
            </div>
            <aside className="rounded-[1.8rem] border border-orange-300/20 bg-orange-300/[0.06] p-6">
              <Compass className="h-6 w-6 text-orange-300" />
              <p className="mt-5 text-[10px] font-black uppercase tracking-[0.18em] text-orange-300">Your outcome brief</p>
              <h3 className="mt-2 font-serif text-2xl font-bold">{getOutcome(brief.outcomeId)?.title}</h3>
              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between gap-5 border-b border-white/10 pb-3"><dt className="text-white/40">Success</dt><dd className="text-right font-bold">{brief.target ? `${brief.target} × ` : ""}{getSuccessAction(brief.successAction)?.title}</dd></div>
                <div className="flex justify-between gap-5 border-b border-white/10 pb-3"><dt className="text-white/40">Execution</dt><dd className="text-right font-bold">{getExecutionRail(brief.executionRailId)?.title}</dd></div>
                <div className="flex justify-between gap-5 border-b border-white/10 pb-3"><dt className="text-white/40">Where</dt><dd className="text-right font-bold">{brief.geography || "To decide"}</dd></div>
                <div className="flex justify-between gap-5 border-b border-white/10 pb-3"><dt className="text-white/40">When</dt><dd className="text-right font-bold">{brief.timeframe || "To decide"}</dd></div>
                <div className="flex justify-between gap-5"><dt className="text-white/40">Reason to act</dt><dd className="max-w-[14rem] text-right font-bold">{brief.availableValue || "Shape this next"}</dd></div>
              </dl>
              {user ? (
                <Link to={continuePath} className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-orange-400 px-5 text-sm font-black text-black">Open programme route <ArrowRight className="h-4 w-4" /></Link>
              ) : (
                <Link to={authPath} className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-orange-400 px-5 text-sm font-black text-black">Save and continue <ArrowRight className="h-4 w-4" /></Link>
              )}
              <div className="mt-4 grid gap-2 text-center">
                <Link to="/#wanted" className="text-xs font-bold text-white/55 hover:text-white">Show me what people want instead</Link>
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

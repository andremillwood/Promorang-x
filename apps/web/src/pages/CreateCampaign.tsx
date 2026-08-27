import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleDollarSign,
  Gift,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { useCreateCampaign } from "@/hooks/useCampaigns";
import { useCampaignCompiler, type CompiledCampaign, type CompilerMetadata } from "@/hooks/useCampaignCompiler";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cultureImages } from "@/data/culture-demo";
import { PromoPilotWorkspace } from "@/components/campaigns/PromoPilotWorkspace";
import type { DemandPlan } from "@promorang/shared";
import { useI18n } from "@/i18n/I18nContext";

type ActivationPlan = CompiledCampaign & { metadata: CompilerMetadata };

const CreateCampaign = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const createCampaign = useCreateCampaign();
  const { compile, isCompiling } = useCampaignCompiler();
  const [prompt, setPrompt] = useState("");
  const [plan, setPlan] = useState<ActivationPlan | null>(null);

  const proofLanguage = {
    LINK: t("createCampaign.proofLink"),
    OCR: t("createCampaign.proofOcr"),
    UPLOAD: t("createCampaign.proofUpload"),
  } as const;

  const handleCompile = async () => {
    if (!prompt.trim()) return;
    const { campaign, metadata } = await compile(prompt);
    setPlan({ ...campaign, metadata });
  };

  const handleSave = async () => {
    if (!plan) return;

    const demandPlan = plan.metadata.demandPlan;
    const gemValue = demandPlan?.sharedValue.find((value) => value.type === "gems" && value.enabled !== false)?.amount || plan.reward.baseGems;
    const description = [
      `Desired outcome: ${demandPlan?.intent.statement || prompt.trim()}`,
      `People will: ${demandPlan?.experience.actions.find((action) => action.required)?.label || plan.drop}`,
      `What counts: ${proofLanguage[plan.proof]}`,
      `What follows: ${demandPlan?.sharedValue.filter((value) => value.enabled !== false).map((value) => value.type).join(", ") || `${gemValue} Gems proposed`}`,
      `Expected movement: ${demandPlan?.measurement.primaryOutcome || plan.outcome.volume}`,
    ].join("\n");

    const campaign = await createCampaign.mutateAsync({
      title: demandPlan?.title || plan.moment.name,
      description,
      budget: null,
      reward_type: "gems",
      reward_value: gemValue ? `${gemValue} Gems proposed per accepted action` : "Shared value configured in PromoPilot",
      target_categories: [],
      is_active: false,
      system_module: "promopush",
      objective_type: plan.metadata.type === "PURCHASE" ? "purchase" : plan.metadata.type === "VISIT" ? "attendance" : "content",
      compiler_metadata: {
        ...plan.metadata,
        original_prompt: prompt.trim(),
        moves: plan.moves,
        proof_requirement: plan.proof,
        verification_type: plan.verificationType,
        planned_reward_per_action_gems: gemValue,
        value_unit: "GEM",
        funding_status: "unfunded",
        activation_status: "draft",
      },
    });

    navigate(`/dashboard/campaigns/${campaign.id}`);
  };

  const handleDemandPlanChange = (demandPlan: DemandPlan) => {
    if (!plan) return;
    setPlan({ ...plan, moment: { ...plan.moment, name: demandPlan.title, description: demandPlan.promise }, metadata: { ...plan.metadata, demandPlan } });
  };

  if (plan?.metadata.demandPlan) {
    return (
      <PromoPilotWorkspace
        plan={plan.metadata.demandPlan}
        saving={createCampaign.isPending}
        onBack={() => setPlan(null)}
        onChange={handleDemandPlanChange}
        onSave={handleSave}
      />
    );
  }

  return (
    <main className="min-h-screen bg-[#f2eee5] text-[#191816]">
      <AnimatePresence mode="wait">
        {!plan ? (
          <motion.section
            key="intention"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -16 }}
            className="mx-auto grid min-h-screen max-w-[1480px] lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.72fr)]"
          >
            <div className="flex flex-col px-5 py-7 sm:px-10 lg:px-16 lg:py-12 xl:px-24">
              <button onClick={() => navigate(-1)} className="flex w-fit items-center gap-2 text-sm font-semibold text-black/55 transition hover:text-black">
                <ArrowLeft className="h-4 w-4" /> {t("createCampaign.back")}
              </button>

              <div className="my-auto max-w-3xl py-16">
                <p className="text-[11px] font-black uppercase tracking-[0.26em] text-[#d85b24]">{t("createCampaign.eyebrow")}</p>
                <h1 className="mt-5 text-5xl font-black leading-[0.92] tracking-[-0.055em] sm:text-6xl xl:text-7xl">
                  {t("createCampaign.heroTitle")}
                </h1>
                <p className="mt-7 max-w-2xl text-lg leading-8 text-black/58">
                  {t("createCampaign.heroSubtitle")}
                </p>

                <div className="mt-10 border-y border-black/15 py-6">
                  <div className="flex items-center justify-between">
                    <label htmlFor="activation-intent" className="text-sm font-black">{t("createCampaign.intentLabel")}</label>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#d85b24]">Proven Blueprints</span>
                  </div>

                  {/* 1-Click Starter Blueprints */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[
                      {
                        label: "🛒 Retail Receipt Sweepstakes (Lifespan / Sunshine Snacks)",
                        promptText: "Reward verified retail shoppers who upload a supermarket receipt showing eligible product purchases with automated entries into a monthly cash draw.",
                      },
                      {
                        label: "📸 Live Event / Expo Selfie Draw (Ladies Expo Model)",
                        promptText: "Drive on-the-ground footfall at our expo booth by giving attendees who snap a branded selfie and signup 1 ticket into a $500 cash sweepstakes.",
                      },
                      {
                        label: "🎪 Dead-Night Venue Revival (I Luv Hip Hop Model)",
                        promptText: "Pack a slow weeknight by dropping 100 free VIP entry passes before 11 PM and giving each attendee a welcome drink perk.",
                      },
                    ].map((bp, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setPrompt(bp.promptText)}
                        className="text-left rounded-xl border border-black/10 bg-white/60 px-3 py-1.5 text-xs font-semibold text-black/75 hover:border-[#d85b24] hover:bg-white transition-all shadow-sm"
                      >
                        {bp.label}
                      </button>
                    ))}
                  </div>

                  <Textarea
                    id="activation-intent"
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                    placeholder={t("createCampaign.intentPlaceholder")}
                    className="mt-4 min-h-[130px] resize-none rounded-none border-0 bg-transparent p-0 text-xl leading-8 shadow-none placeholder:text-black/25 focus-visible:ring-0 sm:text-2xl"
                    autoFocus
                  />
                </div>

                <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Button
                    onClick={handleCompile}
                    disabled={!prompt.trim() || isCompiling}
                    className="h-14 rounded-full bg-[#191816] px-7 text-base font-black text-white hover:bg-[#d85b24]"
                  >
                    <Sparkles className={`mr-2 h-5 w-5 ${isCompiling ? "animate-spin" : ""}`} />
                    {isCompiling ? t("createCampaign.compilingButton") : t("createCampaign.planButton")}
                  </Button>
                  <p className="max-w-xs text-xs leading-5 text-black/45">{t("createCampaign.draftNotice")}</p>
                </div>
              </div>
            </div>

            <aside className="relative hidden min-h-screen overflow-hidden bg-[#151412] lg:block">
              <img src={cultureImages.openMic} alt="A live cultural gathering" className="absolute inset-0 h-full w-full object-cover opacity-75" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/25 to-black/90" />
              <div className="absolute inset-x-0 bottom-0 p-12 text-white xl:p-16">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-orange-300">{t("createCampaign.sidebarEyebrow")}</p>
                <p className="mt-4 max-w-md text-3xl font-black leading-tight tracking-tight">{t("createCampaign.sidebarHeading")}</p>
                <div className="mt-8 flex items-center gap-3 border-t border-white/25 pt-5 text-sm text-white/70">
                  <Users className="h-5 w-5 text-orange-300" /> {t("createCampaign.sidebarFooter")}
                </div>
              </div>
            </aside>
          </motion.section>
        ) : (
          <motion.section key="plan" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-[1480px] px-5 py-7 sm:px-10 lg:px-16 lg:py-12 xl:px-24">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <button onClick={() => setPlan(null)} className="flex items-center gap-2 text-sm font-semibold text-black/55 transition hover:text-black">
                <ArrowLeft className="h-4 w-4" /> {t("createCampaign.changeOutcome")}
              </button>
              <p className="rounded-full border border-black/15 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-black/55">{t("createCampaign.draftBadge")}</p>
            </div>

            <header className="mt-12 grid gap-7 border-b border-black/15 pb-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.26em] text-[#d85b24]">{t("createCampaign.storyEyebrow")}</p>
                <h1 className="mt-4 max-w-4xl text-5xl font-black leading-[0.92] tracking-[-0.055em] sm:text-6xl">{plan.moment.name}</h1>
                <p className="mt-5 max-w-3xl text-lg leading-8 text-black/58">{prompt}</p>
              </div>
              <div className="border-l-2 border-[#d85b24] pl-5">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-black/45">{t("createCampaign.movementEyebrow")}</p>
                <p className="mt-2 text-2xl font-black">{plan.outcome.volume}</p>
                <p className="mt-1 text-sm text-black/50">{t("createCampaign.reachEstimate", { reach: plan.outcome.reach.toLowerCase() })}</p>
              </div>
            </header>

            <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_390px] xl:gap-14">
              <div>
                <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
                  {[
                    { number: "01", label: t("createCampaign.card1Label"), title: t("createCampaign.card1Title"), copy: t("createCampaign.card1Copy"), icon: Users },
                    { number: "02", label: t("createCampaign.card2Label"), title: plan.drop, copy: plan.moves.join(" → "), icon: MapPin },
                    { number: "03", label: t("createCampaign.card3Label"), title: proofLanguage[plan.proof], copy: t("createCampaign.card3Copy"), icon: ShieldCheck },
                    { number: "04", label: t("createCampaign.card4Label"), title: t("createCampaign.card4Title", { gems: plan.reward.baseGems.toString() }), copy: t("createCampaign.card4Copy"), icon: Gift },
                  ].map((item) => (
                    <article key={item.number} className="border-t border-black/20 pt-5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-[#d85b24]">{item.number}</span>
                        <item.icon className="h-5 w-5 text-black/35" />
                      </div>
                      <p className="mt-7 text-[11px] font-black uppercase tracking-[0.2em] text-black/40">{item.label}</p>
                      <h2 className="mt-2 text-2xl font-black leading-tight tracking-tight">{item.title}</h2>
                      <p className="mt-3 text-sm leading-6 text-black/52">{item.copy}</p>
                    </article>
                  ))}
                </div>

                <div className="mt-12 bg-[#191816] p-7 text-white sm:p-9">
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-orange-300">{t("createCampaign.experienceInOneLine")}</p>
                  <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
                    {plan.moves.map((move, index) => (
                      <div key={move} className="flex flex-1 items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/25 text-xs font-black">{index + 1}</span>
                        <span className="text-sm font-semibold text-white/80">{move}</span>
                        {index < plan.moves.length - 1 && <ArrowRight className="ml-auto hidden h-4 w-4 text-orange-300 sm:block" />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <aside className="h-fit border border-black/15 bg-[#faf7f0] p-6 sm:p-8 lg:sticky lg:top-8">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-amber-800"><CircleDollarSign className="h-5 w-5" /></div>
                <p className="mt-6 text-[11px] font-black uppercase tracking-[0.2em] text-amber-800">{t("createCampaign.fundingDecisionEyebrow")}</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight">{t("createCampaign.fundingDecisionTitle")}</h2>
                <p className="mt-3 text-sm leading-6 text-black/55">{t("createCampaign.fundingDecisionCopy")}</p>
                <div className="mt-6 space-y-3 border-y border-black/10 py-5 text-sm">
                  <p className="flex items-center gap-3"><Check className="h-4 w-4 text-emerald-700" /> {t("createCampaign.checklist1")}</p>
                  <p className="flex items-center gap-3"><Check className="h-4 w-4 text-emerald-700" /> {t("createCampaign.checklist2")}</p>
                  <p className="flex items-center gap-3 text-black/45"><span className="h-4 w-4 rounded-full border border-black/25" /> {t("createCampaign.checklist3")}</p>
                  <p className="flex items-center gap-3 text-black/45"><span className="h-4 w-4 rounded-full border border-black/25" /> {t("createCampaign.checklist4")}</p>
                </div>
                <Button onClick={handleSave} disabled={createCampaign.isPending} className="mt-6 h-14 w-full rounded-full bg-[#d85b24] text-base font-black text-white hover:bg-[#ba4618]">
                  {createCampaign.isPending ? t("createCampaign.savingButton") : t("createCampaign.saveButton")}
                </Button>
                <p className="mt-4 text-center text-xs leading-5 text-black/42">{t("createCampaign.noChargeNotice")}</p>
              </aside>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  );
};

export default CreateCampaign;

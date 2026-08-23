import { useEffect, useMemo, useState } from "react";
import {
  ACTIVATION_COLLABORATORS,
  ACTIVATION_CREATION_GUIDANCE,
  ACTIVATION_CONTENT_NEEDS,
  ACTIVATION_OUTCOMES,
  ACTIVATION_PARTICIPANT_RETURNS,
  ACTIVATION_SUCCESS_LANGUAGE,
} from "@promorang/shared";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Building2, CalendarDays, Camera, Check, HeartHandshake, Lightbulb, MapPin, Save, Sparkles, Store, UserRoundPlus, Users, WalletCards } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { GuidanceDisclosure } from "@/components/guidance/GuidanceDisclosure";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { operationalSupabase } from "@/integrations/supabase/operational";
import { useI18n } from "@/i18n/I18nContext";
import { TranslationKey } from "@/i18n/translations";

const outcomeIcons = {
  gather: Users,
  visits: Store,
  content: Camera,
  launch: Sparkles,
  community: HeartHandshake,
  commercial: Building2,
} as const;

const collaboratorIcons = {
  host: Users,
  creator: Camera,
  venue: MapPin,
  merchant: Store,
  brand: Building2,
} as const;

const stepDefinitions = [
  { id: "outcome", shortLabelKey: "createProposal.step1Short" as TranslationKey, eyebrowKey: "createProposal.step1Eyebrow" as TranslationKey, titleKey: "createProposal.step1Title" as TranslationKey, detailKey: "createProposal.step1Detail" as TranslationKey, guide: "outcome" as const },
  { id: "scene", shortLabelKey: "createProposal.step2Short" as TranslationKey, eyebrowKey: "createProposal.step2Eyebrow" as TranslationKey, titleKey: "createProposal.step2Title" as TranslationKey, detailKey: "createProposal.step2Detail" as TranslationKey, guide: "scene_moment" as const },
  { id: "moment", shortLabelKey: "createProposal.step3Short" as TranslationKey, eyebrowKey: "createProposal.step3Eyebrow" as TranslationKey, titleKey: "createProposal.step3Title" as TranslationKey, detailKey: "createProposal.step3Detail" as TranslationKey, guide: "scene_moment" as const },
  { id: "content", shortLabelKey: "createProposal.step4Short" as TranslationKey, eyebrowKey: "createProposal.step4Eyebrow" as TranslationKey, titleKey: "createProposal.step4Title" as TranslationKey, detailKey: "createProposal.step4Detail" as TranslationKey, guide: "content_people" as const },
  { id: "people", shortLabelKey: "createProposal.step5Short" as TranslationKey, eyebrowKey: "createProposal.step5Eyebrow" as TranslationKey, titleKey: "createProposal.step5Title" as TranslationKey, detailKey: "createProposal.step5Detail" as TranslationKey, guide: "content_people" as const },
  { id: "value", shortLabelKey: "createProposal.step6Short" as TranslationKey, eyebrowKey: "createProposal.step6Eyebrow" as TranslationKey, titleKey: "createProposal.step6Title" as TranslationKey, detailKey: "createProposal.step6Detail" as TranslationKey, guide: "value_launch" as const },
  { id: "review", shortLabelKey: "createProposal.step7Short" as TranslationKey, eyebrowKey: "createProposal.step7Eyebrow" as TranslationKey, titleKey: "createProposal.step7Title" as TranslationKey, detailKey: "createProposal.step7Detail" as TranslationKey, guide: "return_review" as const },
] as const;

type BuilderForm = {
  outcome: string; outcomeDetail: string; scene: string; sceneId: string; title: string; location: string; description: string;
  contentNeeds: string[]; collaborators: string[]; whatCounts: string; participantReturns: string[]; fundingRequest: string;
  funderContribution: string; socialReturn: string; commercialReturn: string;
};

const VERTICAL_PRESETS: Record<string, Partial<BuilderForm>> = {
  fmcg: {
    outcome: "visits",
    outcomeDetail: "Convert product sampling and tastings into verified store checkout velocity and capture 1st-party customer data.",
    title: "Retail Sampling to Register Conversion Pilot",
    description: "On-site sampling activation where customers scan a Mark, upload their store receipt, and creators run recipe challenges for bounties.",
    contentNeeds: ["before", "live", "after"],
    collaborators: ["brand", "merchant", "creator"],
    whatCounts: "Verified store checkout receipts and recipe UGC posts",
    participantReturns: ["perk", "reward", "access"],
    socialReturn: "Authentic social reach through customer cooking and tasting stories.",
    commercialReturn: "Direct trackable retail sales with proof of receipt purchase.",
  },
  hospitality: {
    outcome: "visits",
    outcomeDetail: "Drive dining foot traffic during off-peak weekday hours and turn guests into advocates.",
    title: "Off-Peak Dining Social Bounty & Table-Fill",
    description: "Time-gated dining moments with table check-in marks unlocking instant bill perks and friend referral keys.",
    contentNeeds: ["live", "after"],
    collaborators: ["venue", "creator", "host"],
    whatCounts: "Table check-in scans during designated off-peak hours",
    participantReturns: ["perk", "access"],
    socialReturn: "Instagram and TikTok dining shares tagging the venue.",
    commercialReturn: "Incremental weekday covers and increased average check size.",
  },
  events: {
    outcome: "gather",
    outcomeDetail: "Mobilize community ambassadors to drive performance-tiered ticket sales and on-site proof of presence.",
    title: "Performance Ambassador Ticketing & Event Drop",
    description: "Tiered ambassador pass unlocks based on verified referral ticket sales and on-site QR drops.",
    contentNeeds: ["invite", "before", "live", "after"],
    collaborators: ["host", "creator", "venue"],
    whatCounts: "Verified ticket purchases and on-site attendance QR scans",
    participantReturns: ["access", "status", "reward"],
    socialReturn: "High-energy event recap content and attendee advocacy.",
    commercialReturn: "Direct ticket sales attribution with zero upfront comp ticket waste.",
  },
  dtc: {
    outcome: "launch",
    outcomeDetail: "Scale creator marketing with verified unboxing reviews and 100% performance-based affiliate commissions.",
    title: "Pay-Per-Sale Creator Affiliate & Unboxing Drop",
    description: "Sample trial boxes distributed to vetted creators with automatic revenue share on tracked checkout conversions.",
    contentNeeds: ["before", "live", "after"],
    collaborators: ["brand", "creator"],
    whatCounts: "Verified checkout orders generated via trackable affiliate links",
    participantReturns: ["reward", "piece"],
    socialReturn: "High-trust unboxing videos and honest product demonstrations.",
    commercialReturn: "Guaranteed ROAS with commission paid only on completed orders.",
  },
  fitness: {
    outcome: "community",
    outcomeDetail: "Slash 90-day member churn through habit check-in streaks and peer pass referral keys.",
    title: "Habit Retention Streak & Buddy Pass Campaign",
    description: "Attendance streak rewards unlocking studio merchandise and guest passes for members' workout partners.",
    contentNeeds: ["live", "after"],
    collaborators: ["host", "merchant"],
    whatCounts: "Verified studio check-in scans and guest pass conversions",
    participantReturns: ["status", "perk", "reward"],
    socialReturn: "Member fitness transformation stories and workout check-ins.",
    commercialReturn: "Extended member lifetime value and reduced cost of new member acquisition.",
  },
  city: {
    outcome: "gather",
    outcomeDetail: "Circulate local spending across merchant corridors and drive district-wide tourism loyalty.",
    title: "District Passport & Cross-Merchant Loyalty Circuit",
    description: "Localized Season pass rewarding residents and visitors for patronizing multiple participating district merchants.",
    contentNeeds: ["invite", "live", "after"],
    collaborators: ["host", "merchant", "venue", "brand"],
    whatCounts: "Multi-merchant scan marks and collective passport completions",
    participantReturns: ["perk", "status", "reward"],
    socialReturn: "District exploration stories and neighborhood pride.",
    commercialReturn: "Retained local economic circulation and merchant revenue growth.",
  },
};

export default function CreateProposal() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<BuilderForm>({
    outcome: "",
    outcomeDetail: "",
    scene: "",
    sceneId: "",
    title: "",
    location: "",
    description: "",
    contentNeeds: [] as string[],
    collaborators: [] as string[],
    whatCounts: "",
    participantReturns: [] as string[],
    fundingRequest: "",
    funderContribution: "",
    socialReturn: "",
    commercialReturn: "",
  });

  const applyPreset = (presetKey: string) => {
    const preset = VERTICAL_PRESETS[presetKey];
    if (preset) {
      setForm((current) => ({
        ...current,
        ...preset,
      }));
      toast.success(`Loaded ${presetKey.toUpperCase()} Blueprint Preset`);
    }
  };

  useEffect(() => {
    const vertical = searchParams.get("vertical");
    if (vertical && VERTICAL_PRESETS[vertical]) {
      applyPreset(vertical);
    }
  }, [searchParams]);

  const { data: availableScenes = [] } = useQuery({ queryKey: ["activation-scenes"], queryFn: async () => { const { data, error } = await operationalSupabase.from("scenes").select("id,title,city").eq("status", "active").order("title").limit(24); if (error) throw error; return data || []; } });
  const currentGuide = ACTIVATION_CREATION_GUIDANCE[stepDefinitions[step].guide];

  const setField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((current) => ({ ...current, [key]: value }));
  const toggle = (key: "contentNeeds" | "collaborators" | "participantReturns", value: string) => {
    setForm((current) => ({ ...current, [key]: current[key].includes(value) ? current[key].filter((item) => item !== value) : [...current[key], value] }));
  };
  const canContinue = useMemo(() => {
    if (step === 0) return Boolean(form.outcome && form.outcomeDetail.trim());
    if (step === 1) return Boolean(form.scene.trim());
    if (step === 2) return Boolean(form.title.trim() && form.description.trim());
    if (step === 3) return Boolean(form.contentNeeds.length);
    if (step === 4) return Boolean(form.collaborators.length);
    if (step === 5) return Boolean(form.whatCounts.trim() && form.participantReturns.length && form.socialReturn.trim() && form.commercialReturn.trim());
    return true;
  }, [form, step]);

  const save = async (status: "draft" | "sent") => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: proposal, error } = await supabase.from("proposals").insert({
        planner_id: user.id,
        title: form.title || "Untitled activation plan",
        description: form.description || form.outcomeDetail,
        budget: null,
        funding_goal_gems: form.fundingRequest ? Number(form.fundingRequest) : null,
        status,
        metadata: {
          desired_outcome: form.outcome,
          outcome_detail: form.outcomeDetail,
          scene: form.scene,
          location: form.location,
          content_needed: form.contentNeeds,
          collaborators: form.collaborators,
          what_counts: form.whatCounts,
          participant_value: form.participantReturns,
          funder_contribution: form.funderContribution,
          social_return: form.socialReturn,
          commercial_return: form.commercialReturn,
          creation_model: "scene_activation_v3_guided",
          builder_journey: stepDefinitions.map((item) => item.id),
        },
      }).select("id").single();
      if (error) throw error;
      let linkedSceneId = form.sceneId;
      if (!linkedSceneId && form.scene.trim()) {
        const slug = `${form.scene.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Date.now().toString(36)}`;
        const { data: scene, error: createSceneError } = await operationalSupabase.from("scenes").insert({ owner_user_id: user.id, title: form.scene.trim(), slug, city: form.location || null, status: "active", visibility: "public", description: form.outcomeDetail }).select("id").single();
        if (createSceneError) throw createSceneError;
        linkedSceneId = scene.id;
      }
      if (linkedSceneId && proposal) {
        const { error: sceneError } = await operationalSupabase.rpc("link_activation_scene", { p_proposal_id: proposal.id, p_scene_id: linkedSceneId });
        if (sceneError) throw sceneError;
      }
      toast.success(status === "draft" ? t("createProposal.toastSaved") : t("createProposal.toastSent"));
      navigate(`/dashboard/proposals/${proposal.id}`);
    } catch (error) {
      console.error(error);
      toast.error(t("createProposal.toastError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#080808] px-4 pb-20 pt-24 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="grid gap-6 border-b border-white/10 pb-8 lg:grid-cols-[1fr_380px] lg:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">{t("createProposal.heroEyebrow")}</p>
            <h1 className="mt-3 max-w-4xl font-serif text-4xl font-bold leading-[0.95] sm:text-6xl">{t("createProposal.heroTitle")}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/55">{t("createProposal.heroSubtitle")}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/35">{t("createProposal.thePath")}</p>
            <div className="mt-3 flex items-center gap-2" aria-label={`Step ${step + 1} of ${stepDefinitions.length}`}>
              {stepDefinitions.map((item, index) => <div key={item.id} className="min-w-0 flex-1"><div className={`h-1.5 rounded-full ${index <= step ? "bg-primary" : "bg-white/10"}`} /><p className={`mt-2 truncate text-[9px] ${index === step ? "font-bold text-white" : "text-white/35"}`}>{t(item.shortLabelKey)}</p></div>)}
            </div>
          </div>
        </header>

        {/* Vertical Presets Bar */}
        <div className="mt-6 flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs">
          <span className="text-[11px] font-mono uppercase text-white/50 font-bold mr-1">Load Blueprint Preset:</span>
          {[
            { key: "fmcg", label: "FMCG / Retail Velocity" },
            { key: "hospitality", label: "Hospitality & Off-Peak" },
            { key: "events", label: "Events & Ticket Ambassadors" },
            { key: "dtc", label: "DTC & Performance Affiliate" },
            { key: "fitness", label: "Fitness & Retention Streaks" },
            { key: "city", label: "City District Passport" },
          ].map((preset) => (
            <button
              key={preset.key}
              type="button"
              onClick={() => applyPreset(preset.key)}
              className="px-2.5 py-1 rounded-lg border border-white/15 bg-white/5 hover:bg-primary/20 hover:border-primary/50 text-white/80 hover:text-white transition font-medium"
            >
              ⚡ {preset.label}
            </button>
          ))}
        </div>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="rounded-[2rem] border border-white/10 bg-[#111110] p-5 sm:p-8">
            {step === 0 && <>
              <StepHeading eyebrow={`01 · ${t(stepDefinitions[0].eyebrowKey)}`} title={t(stepDefinitions[0].titleKey)} detail={t(stepDefinitions[0].detailKey)} />
              <GuidancePanel guide={currentGuide} />
              <div className="mt-7 grid gap-3 sm:grid-cols-2">{ACTIVATION_OUTCOMES.map(({ id, title, detail }) => {
                const Icon = outcomeIcons[id];
                return <Choice key={id} active={form.outcome === id} onClick={() => setField("outcome", id)}><Icon className="h-5 w-5" /><span><strong>{title}</strong><small>{detail}</small></span></Choice>;
              })}</div>
              <Field label={t("createProposal.describeChange")}><Textarea value={form.outcomeDetail} onChange={(event) => setField("outcomeDetail", event.target.value)} placeholder={t("createProposal.describeChangePlaceholder")} className="min-h-28 border-white/10 bg-black/40 text-white" /></Field>
            </>}

            {step === 1 && <>
              <StepHeading eyebrow={`02 · ${t(stepDefinitions[1].eyebrowKey)}`} title={t(stepDefinitions[1].titleKey)} detail={t(stepDefinitions[1].detailKey)} />
              <GuidancePanel guide={currentGuide} />
              <div className="mt-7"><Field label={t("createProposal.chooseScene")}><select value={form.sceneId} onChange={(event) => { const selected = availableScenes.find((scene) => scene.id === event.target.value); setField("sceneId", event.target.value); if (selected) setField("scene", String(selected.title)); }} className="h-11 w-full rounded-md border border-white/10 bg-black/40 px-3 text-sm text-white"><option value="">{t("createProposal.createSceneOption")}</option>{availableScenes.map((scene) => <option key={scene.id} value={scene.id}>{String(scene.title)}{scene.city ? ` · ${scene.city}` : ""}</option>)}</select></Field></div>
              {!form.sceneId && <Field label={t("createProposal.nameScene")}><Input value={form.scene} onChange={(event) => setField("scene", event.target.value)} placeholder={t("createProposal.nameScenePlaceholder")} className="border-white/10 bg-black/40 text-white" /></Field>}
              <div className="mt-6 rounded-2xl border border-primary/20 bg-[radial-gradient(circle_at_top_right,rgba(255,106,26,.15),transparent_45%),rgba(255,255,255,.025)] p-5"><p className="text-[9px] font-black uppercase tracking-[.18em] text-primary">{t("createProposal.sceneTest")}</p><p className="mt-2 font-serif text-2xl font-bold">{t("createProposal.sceneTestQuestion")}</p><p className="mt-2 text-xs leading-5 text-white/45">{t("createProposal.sceneTestCopy")}</p></div>
            </>}

            {step === 2 && <>
              <StepHeading eyebrow={`03 · ${t(stepDefinitions[2].eyebrowKey)}`} title={t(stepDefinitions[2].titleKey)} detail={t(stepDefinitions[2].detailKey)} />
              <GuidancePanel guide={currentGuide} />
              <Field label={t("createProposal.momentName")}><Input value={form.title} onChange={(event) => setField("title", event.target.value)} placeholder={t("createProposal.momentNamePlaceholder")} className="border-white/10 bg-black/40 text-white" /></Field>
              <Field label={t("createProposal.place")}><Input value={form.location} onChange={(event) => setField("location", event.target.value)} placeholder={t("createProposal.placePlaceholder")} className="border-white/10 bg-black/40 text-white" /></Field>
              <Field label={t("createProposal.experienceLabel")}><Textarea value={form.description} onChange={(event) => setField("description", event.target.value)} placeholder={t("createProposal.experiencePlaceholder")} className="min-h-32 border-white/10 bg-black/40 text-white" /></Field>
            </>}

            {step === 3 && <>
              <StepHeading eyebrow={`04 · ${t(stepDefinitions[3].eyebrowKey)}`} title={t(stepDefinitions[3].titleKey)} detail={t(stepDefinitions[3].detailKey)} />
              <GuidancePanel guide={currentGuide} />
              <ChoiceGroup label={t("createProposal.contentNeeded")}>{ACTIVATION_CONTENT_NEEDS.map(({ id, title, detail }) => <Choice key={id} active={form.contentNeeds.includes(id)} onClick={() => toggle("contentNeeds", id)}><Camera className="h-5 w-5" /><span><strong>{title}</strong><small>{detail}</small></span></Choice>)}</ChoiceGroup>
              <div className="mt-6 grid grid-cols-4 gap-2">{[t("createProposal.phaseInvite"), t("createProposal.phaseBefore"), t("createProposal.phaseLive"), t("createProposal.phaseAfter")].map((phase, index) => <div key={phase} className="rounded-xl border border-white/10 bg-black/25 p-3 text-center"><span className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[9px] font-black text-primary">{index + 1}</span><p className="mt-2 text-[9px] font-bold text-white/55">{phase}</p></div>)}</div>
            </>}

            {step === 4 && <>
              <StepHeading eyebrow={`05 · ${t(stepDefinitions[4].eyebrowKey)}`} title={t(stepDefinitions[4].titleKey)} detail={t(stepDefinitions[4].detailKey)} />
              <GuidancePanel guide={currentGuide} />
              <ChoiceGroup label={t("createProposal.peopleAndPlacesNeeded")}>{ACTIVATION_COLLABORATORS.map(({ id, title, detail }) => {
                const Icon = collaboratorIcons[id];
                return <Choice key={id} active={form.collaborators.includes(id)} onClick={() => toggle("collaborators", id)}><Icon className="h-5 w-5" /><span><strong>{title}</strong><small>{detail}</small></span></Choice>;
              })}</ChoiceGroup>
            </>}

            {step === 5 && <>
              <StepHeading eyebrow={`06 · ${t(stepDefinitions[5].eyebrowKey)}`} title={t(stepDefinitions[5].titleKey)} detail={t(stepDefinitions[5].detailKey)} />
              <GuidancePanel guide={currentGuide} />
              <ChoiceGroup label={t("createProposal.participantLeaveWith")}>{ACTIVATION_PARTICIPANT_RETURNS.map((value) => <Choice key={value} compact active={form.participantReturns.includes(value)} onClick={() => toggle("participantReturns", value)}><Check className="h-4 w-4" /><span><strong>{value}</strong></span></Choice>)}</ChoiceGroup>
              <Field label={t("createProposal.whatTellsWorked")}><Textarea value={form.whatCounts} onChange={(event) => setField("whatCounts", event.target.value)} placeholder={ACTIVATION_SUCCESS_LANGUAGE.whatCounts} className="min-h-28 border-white/10 bg-black/40 text-white" /></Field>
              <div className="mt-6 grid gap-4 sm:grid-cols-2"><Field label={t("createProposal.fundingGoalGems")}><Input type="number" value={form.fundingRequest} onChange={(event) => setField("fundingRequest", event.target.value)} placeholder={t("createProposal.fundingGoalPlaceholder")} className="border-white/10 bg-black/40 text-white" /></Field><Field label={t("createProposal.partnerContribute")}><Input value={form.funderContribution} onChange={(event) => setField("funderContribution", event.target.value)} placeholder={t("createProposal.partnerContributePlaceholder")} className="border-white/10 bg-black/40 text-white" /></Field></div>
              <p className="mt-3 rounded-2xl border border-primary/20 bg-primary/10 p-4 text-xs leading-5 text-white/60">{ACTIVATION_SUCCESS_LANGUAGE.gemsFunding}</p>
              <Field label={t("createProposal.humanReturn")}><Textarea value={form.socialReturn} onChange={(event) => setField("socialReturn", event.target.value)} placeholder={`e.g. ${ACTIVATION_SUCCESS_LANGUAGE.humanReturn}`} className="min-h-24 border-white/10 bg-black/40 text-white" /></Field>
              <Field label={t("createProposal.commercialReturn")}><Textarea value={form.commercialReturn} onChange={(event) => setField("commercialReturn", event.target.value)} placeholder={`e.g. ${ACTIVATION_SUCCESS_LANGUAGE.commercialReturn}`} className="min-h-24 border-white/10 bg-black/40 text-white" /></Field>
            </>}

            {step === 6 && <ActivationStory form={form} />}

            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-between">
              <Button variant="outline" className="border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white" onClick={() => step ? setStep(step - 1) : navigate(-1)}><ArrowLeft className="mr-2 h-4 w-4" />{step ? t("createProposal.back") : t("createProposal.cancel")}</Button>
              <div className="flex gap-3">{step === stepDefinitions.length - 1 && <Button variant="outline" className="border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white" disabled={loading} onClick={() => save("draft")}><Save className="mr-2 h-4 w-4" />{t("createProposal.savePlan")}</Button>}<Button disabled={!canContinue || loading} onClick={() => step < stepDefinitions.length - 1 ? setStep(step + 1) : save("sent")} className="flex-1 bg-primary font-black text-black hover:bg-primary/90 sm:flex-none">{step < stepDefinitions.length - 1 ? t("createProposal.continue") : t("createProposal.openActivation")}<ArrowRight className="ml-2 h-4 w-4" /></Button></div>
            </div>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-primary/25 bg-primary/10 p-5"><p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">{t("createProposal.sharedReturn")}</p><p className="mt-3 font-serif text-2xl font-bold">{ACTIVATION_SUCCESS_LANGUAGE.sharedReturn}</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/35">{t("createProposal.builderLens")}</p>
              <p className="mt-3 text-sm font-bold leading-5 text-white">{currentGuide.successQuestion}</p>
              <Summary icon={Users} label={t("createProposal.participant")} value={currentGuide.participantLens} />
              <Summary icon={Building2} label={t("createProposal.partner")} value={currentGuide.partnerLens} />
              <Summary icon={Camera} label={t("createProposal.content")} value={currentGuide.contentLens} />
              <Summary icon={WalletCards} label={t("createProposal.gems")} value={currentGuide.gemsLens} />
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"><p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/35">{t("createProposal.activationSoFar")}</p><Summary icon={HeartHandshake} label={t("createProposal.step1Short")} value={ACTIVATION_OUTCOMES.find((item) => item.id === form.outcome)?.title || t("createProposal.chooseChange")} /><Summary icon={Users} label={t("createProposal.step2Short")} value={form.scene || t("createProposal.chooseCommunity")} /><Summary icon={CalendarDays} label={t("createProposal.step3Short")} value={form.title || t("createProposal.shapeGathering")} /><Summary icon={Camera} label={t("createProposal.step4Short")} value={form.contentNeeds.length ? t("createProposal.rolesSelected", { count: form.contentNeeds.length.toString() }) : t("createProposal.planStory")} /><Summary icon={WalletCards} label={t("createProposal.step6Short")} value={form.participantReturns.length ? t("createProposal.participantReturnsCount", { count: form.participantReturns.length.toString() }) : t("createProposal.defineWhatOpens")} /></div>
          </aside>
        </section>
      </div>
    </main>
  );
}

function StepHeading({ eyebrow, title, detail }: { eyebrow: string; title: string; detail: string }) { return <div><p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">{eyebrow}</p><h2 className="mt-2 font-serif text-3xl font-bold sm:text-4xl">{title}</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">{detail}</p></div>; }
function GuidancePanel({ guide }: { guide: (typeof ACTIVATION_CREATION_GUIDANCE)[keyof typeof ACTIVATION_CREATION_GUIDANCE] }) {
  const { t } = useI18n();
  return (
    <GuidanceDisclosure
      id={`create-proposal:${guide.stepId}`}
      eyebrow="Success lens"
      title={guide.successQuestion}
      summary={guide.sceneLens}
    >
      <div className="flex gap-3">
        <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div>
          <p className="text-sm font-bold leading-5 text-white">{guide.successQuestion}</p>
          <p className="mt-2 text-xs leading-5 text-white/55">{guide.sceneLens}</p>
          <p className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3 text-xs leading-5 text-white/55"><span className="font-bold text-white/80">{t("createProposal.avoid")}</span> {guide.avoid}</p>
        </div>
      </div>
    </GuidanceDisclosure>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="mt-5 block space-y-2"><span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">{label}</span>{children}</label>; }
function ChoiceGroup({ label, children }: { label: string; children: React.ReactNode }) { return <div className="mt-6"><p className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-white/45">{label}</p><div className="grid gap-3 sm:grid-cols-2">{children}</div></div>; }
function Choice({ active, onClick, compact, children }: { active: boolean; onClick: () => void; compact?: boolean; children: React.ReactNode }) { return <button type="button" aria-pressed={active} onClick={onClick} className={`flex text-left ${compact ? "items-center" : "items-start"} gap-3 rounded-2xl border p-4 transition ${active ? "border-primary bg-primary/12 text-primary" : "border-white/10 bg-black/30 text-white hover:border-white/25"}`}>{children}</button>; }
function Summary({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) { return <div className="mt-4 flex gap-3 border-t border-white/8 pt-4"><Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><div><p className="text-[8px] font-black uppercase tracking-[0.16em] text-white/30">{label}</p><p className="mt-1 text-xs font-semibold text-white/75">{value}</p></div></div>; }
function ActivationStory({ form }: { form: BuilderForm }) {
  const { t } = useI18n();
  const outcome = ACTIVATION_OUTCOMES.find((item) => item.id === form.outcome)?.title || "A meaningful outcome";
  return <div>
    <StepHeading eyebrow={t("createProposal.storyEyebrow")} title={t("createProposal.storyTitle")} detail={t("createProposal.storyDetail")} />
    <div className="mt-7 overflow-hidden rounded-[2rem] border border-primary/25 bg-[radial-gradient(circle_at_85%_10%,rgba(255,106,26,.25),transparent_34%),#0b0b0a]">
      <div className="border-b border-white/10 p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-primary px-3 py-1 text-[9px] font-black uppercase tracking-[.16em] text-black">{form.scene}</span><span className="text-xs text-white/40">{form.location || t("createProposal.placeTbc")}</span></div>
        <h3 className="mt-5 font-serif text-4xl font-bold leading-none sm:text-5xl">{form.title}</h3>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-white/60">{form.description}</p>
        <p className="mt-5 border-l-2 border-primary pl-4 text-sm font-bold leading-6 text-white">{outcome}: {form.outcomeDetail}</p>
      </div>
      <div className="grid gap-px bg-white/10 sm:grid-cols-3">
        <StoryPanel icon={Camera} label={t("createProposal.storyTravels")} value={form.contentNeeds.map((item) => item.replaceAll("_", " ")).join(" · ")} />
        <StoryPanel icon={UserRoundPlus} label={t("createProposal.roomComesAlive")} value={form.collaborators.map((item) => item.replaceAll("_", " ")).join(" · ")} />
        <StoryPanel icon={WalletCards} label={t("createProposal.gemReserveToSecure")} value={form.fundingRequest ? `${Number(form.fundingRequest).toLocaleString()} Gems · US$${Number(form.fundingRequest).toLocaleString()} platform value` : t("createProposal.agreeGemReserve")} />
      </div>
    </div>
    <div className="mt-5 grid gap-3 sm:grid-cols-2"><ReviewCard label={t("createProposal.peopleLeaveWith")} value={form.participantReturns.join(" · ")} /><ReviewCard label={t("createProposal.partnersMakePossible")} value={form.funderContribution || t("createProposal.partnersDefault")} /><ReviewCard label={t("createProposal.humanReturn")} value={form.socialReturn} /><ReviewCard label={t("createProposal.commercialReturn")} value={form.commercialReturn} /></div>
    <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 p-5"><p className="text-[9px] font-black uppercase tracking-[.18em] text-primary">{t("createProposal.afterMoment")}</p><p className="mt-2 text-sm leading-6 text-white/60">{t("createProposal.afterMomentCopy")}</p></div>
  </div>;
}
function StoryPanel({ icon: Icon, label, value }: { icon: typeof Camera; label: string; value: string }) { return <div className="bg-[#10100f] p-5"><Icon className="h-5 w-5 text-primary" /><p className="mt-4 text-[8px] font-black uppercase tracking-[.16em] text-white/35">{label}</p><p className="mt-2 text-xs font-bold capitalize leading-5 text-white/70">{value}</p></div>; }
function ReviewCard({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-white/10 bg-black/25 p-5"><p className="text-[8px] font-black uppercase tracking-[.16em] text-primary">{label}</p><p className="mt-2 text-sm leading-6 text-white/60">{value}</p></div>; }


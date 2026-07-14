import { useMemo, useState } from "react";
import {
  ACTIVATION_COLLABORATORS,
  ACTIVATION_CREATION_GUIDANCE,
  ACTIVATION_CONTENT_NEEDS,
  ACTIVATION_OUTCOMES,
  ACTIVATION_PARTICIPANT_RETURNS,
  ACTIVATION_SUCCESS_LANGUAGE,
} from "@promorang/shared";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Building2, CalendarDays, Camera, Check, HeartHandshake, Lightbulb, MapPin, Save, Sparkles, Store, UserRoundPlus, Users, WalletCards } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { operationalSupabase } from "@/integrations/supabase/operational";

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

const steps = [
  { id: "outcome", shortLabel: "Outcome", eyebrow: "Desired outcome", title: "What do you want to make happen between people?", detail: "Start with the change people should feel, do, or carry forward.", guide: "outcome" },
  { id: "scene", shortLabel: "Scene", eyebrow: "Choose the Scene", title: "Which living community should this strengthen?", detail: "A Scene is the people, places, rituals, creators, and shared identity that continue after one event.", guide: "scene_moment" },
  { id: "moment", shortLabel: "Moment", eyebrow: "Shape the Moment", title: "What will give this Scene a reason to gather now?", detail: "Name the experience, place, feeling, and reason someone would leave their routine to join.", guide: "scene_moment" },
  { id: "content", shortLabel: "Story", eyebrow: "Plan the story", title: "How will people discover, feel, and remember it?", detail: "Plan the invitation, creator perspective, live energy, and after-story as part of the experience.", guide: "content_people" },
  { id: "people", shortLabel: "People", eyebrow: "Build the room", title: "Who will make the experience credible and alive?", detail: "Choose the hosts, creators, venues, merchants, and partners whose contributions make the idea real.", guide: "content_people" },
  { id: "value", shortLabel: "Value", eyebrow: "Define shared value", title: "What should everyone leave with?", detail: "Connect participant value, partner return, success signals, and Gem funding to the same experience.", guide: "value_launch" },
  { id: "review", shortLabel: "Review", eyebrow: "Activation story", title: "Does this feel worth joining and worth backing?", detail: "Review the whole activation as a human story before opening it to collaborators and funders.", guide: "return_review" },
] as const;

type BuilderForm = {
  outcome: string; outcomeDetail: string; scene: string; sceneId: string; title: string; location: string; description: string;
  contentNeeds: string[]; collaborators: string[]; whatCounts: string; participantReturns: string[]; fundingRequest: string;
  funderContribution: string; socialReturn: string; commercialReturn: string;
};

export default function CreateProposal() {
  const navigate = useNavigate();
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
  const { data: availableScenes = [] } = useQuery({ queryKey: ["activation-scenes"], queryFn: async () => { const { data, error } = await operationalSupabase.from("scenes").select("id,title,city").eq("status", "active").order("title").limit(24); if (error) throw error; return data || []; } });
  const currentGuide = ACTIVATION_CREATION_GUIDANCE[steps[step].guide];

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
        budget: form.fundingRequest ? Number(form.fundingRequest) : null,
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
          builder_journey: steps.map((item) => item.id),
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
      toast.success(status === "draft" ? "Plan saved" : "Activation plan sent");
      navigate(`/dashboard/proposals/${proposal.id}`);
    } catch (error) {
      console.error(error);
      toast.error("This plan could not be saved");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#080808] px-4 pb-20 pt-24 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="grid gap-6 border-b border-white/10 pb-8 lg:grid-cols-[1fr_380px] lg:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">Make something people want to be part of</p>
            <h1 className="mt-3 max-w-4xl font-serif text-4xl font-bold leading-[0.95] sm:text-6xl">Start with what you want to happen between people.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/55">Promorang will shape the Scene, Moment, content, partners, participant value, Gems funding, and return review around that human outcome.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/35">The path</p>
            <div className="mt-3 flex items-center gap-2" aria-label={`Step ${step + 1} of ${steps.length}`}>
              {steps.map((item, index) => <div key={item.id} className="min-w-0 flex-1"><div className={`h-1.5 rounded-full ${index <= step ? "bg-primary" : "bg-white/10"}`} /><p className={`mt-2 truncate text-[9px] ${index === step ? "font-bold text-white" : "text-white/35"}`}>{item.shortLabel}</p></div>)}
            </div>
          </div>
        </header>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="rounded-[2rem] border border-white/10 bg-[#111110] p-5 sm:p-8">
            {step === 0 && <>
              <StepHeading eyebrow={`01 · ${steps[0].eyebrow}`} title={steps[0].title} detail={steps[0].detail} />
              <GuidancePanel guide={currentGuide} />
              <div className="mt-7 grid gap-3 sm:grid-cols-2">{ACTIVATION_OUTCOMES.map(({ id, title, detail }) => {
                const Icon = outcomeIcons[id];
                return <Choice key={id} active={form.outcome === id} onClick={() => setField("outcome", id)}><Icon className="h-5 w-5" /><span><strong>{title}</strong><small>{detail}</small></span></Choice>;
              })}</div>
              <Field label="Describe the change you want to see"><Textarea value={form.outcomeDetail} onChange={(event) => setField("outcomeDetail", event.target.value)} placeholder="e.g. Help young designers meet collaborators, give local creators a platform, and bring repeat customers to the district." className="min-h-28 border-white/10 bg-black/40 text-white" /></Field>
            </>}

            {step === 1 && <>
              <StepHeading eyebrow={`02 · ${steps[1].eyebrow}`} title={steps[1].title} detail={steps[1].detail} />
              <GuidancePanel guide={currentGuide} />
              <div className="mt-7"><Field label="Choose an existing Scene"><select value={form.sceneId} onChange={(event) => { const selected = availableScenes.find((scene) => scene.id === event.target.value); setField("sceneId", event.target.value); if (selected) setField("scene", String(selected.title)); }} className="h-11 w-full rounded-md border border-white/10 bg-black/40 px-3 text-sm text-white"><option value="">Create or name a new Scene below</option>{availableScenes.map((scene) => <option key={scene.id} value={scene.id}>{String(scene.title)}{scene.city ? ` · ${scene.city}` : ""}</option>)}</select></Field></div>
              {!form.sceneId && <Field label="Name the Scene"><Input value={form.scene} onChange={(event) => setField("scene", event.target.value)} placeholder="e.g. Kingston Makers" className="border-white/10 bg-black/40 text-white" /></Field>}
              <div className="mt-6 rounded-2xl border border-primary/20 bg-[radial-gradient(circle_at_top_right,rgba(255,106,26,.15),transparent_45%),rgba(255,255,255,.025)] p-5"><p className="text-[9px] font-black uppercase tracking-[.18em] text-primary">Scene test</p><p className="mt-2 font-serif text-2xl font-bold">Can people recognize themselves in this world?</p><p className="mt-2 text-xs leading-5 text-white/45">The Scene should be larger than this activation. It should hold relationships, places, content, memory, and a credible next gathering.</p></div>
            </>}

            {step === 2 && <>
              <StepHeading eyebrow={`03 · ${steps[2].eyebrow}`} title={steps[2].title} detail={steps[2].detail} />
              <GuidancePanel guide={currentGuide} />
              <Field label="Moment name"><Input value={form.title} onChange={(event) => setField("title", event.target.value)} placeholder="e.g. Makers After Hours" className="border-white/10 bg-black/40 text-white" /></Field>
              <Field label="Place"><Input value={form.location} onChange={(event) => setField("location", event.target.value)} placeholder="Venue, neighborhood, or online" className="border-white/10 bg-black/40 text-white" /></Field>
              <Field label="What will people experience?"><Textarea value={form.description} onChange={(event) => setField("description", event.target.value)} placeholder="Describe the people, feeling, activity, and reason they will want to be there." className="min-h-32 border-white/10 bg-black/40 text-white" /></Field>
            </>}

            {step === 3 && <>
              <StepHeading eyebrow={`04 · ${steps[3].eyebrow}`} title={steps[3].title} detail={steps[3].detail} />
              <GuidancePanel guide={currentGuide} />
              <ChoiceGroup label="Content needed">{ACTIVATION_CONTENT_NEEDS.map(({ id, title, detail }) => <Choice key={id} active={form.contentNeeds.includes(id)} onClick={() => toggle("contentNeeds", id)}><Camera className="h-5 w-5" /><span><strong>{title}</strong><small>{detail}</small></span></Choice>)}</ChoiceGroup>
              <div className="mt-6 grid grid-cols-4 gap-2">{["Invite", "Before", "Live", "After"].map((phase, index) => <div key={phase} className="rounded-xl border border-white/10 bg-black/25 p-3 text-center"><span className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[9px] font-black text-primary">{index + 1}</span><p className="mt-2 text-[9px] font-bold text-white/55">{phase}</p></div>)}</div>
            </>}

            {step === 4 && <>
              <StepHeading eyebrow={`05 · ${steps[4].eyebrow}`} title={steps[4].title} detail={steps[4].detail} />
              <GuidancePanel guide={currentGuide} />
              <ChoiceGroup label="People and places needed">{ACTIVATION_COLLABORATORS.map(({ id, title, detail }) => {
                const Icon = collaboratorIcons[id];
                return <Choice key={id} active={form.collaborators.includes(id)} onClick={() => toggle("collaborators", id)}><Icon className="h-5 w-5" /><span><strong>{title}</strong><small>{detail}</small></span></Choice>;
              })}</ChoiceGroup>
            </>}

            {step === 5 && <>
              <StepHeading eyebrow={`06 · ${steps[5].eyebrow}`} title={steps[5].title} detail={steps[5].detail} />
              <GuidancePanel guide={currentGuide} />
              <ChoiceGroup label="What can participants leave with?">{ACTIVATION_PARTICIPANT_RETURNS.map((value) => <Choice key={value} compact active={form.participantReturns.includes(value)} onClick={() => toggle("participantReturns", value)}><Check className="h-4 w-4" /><span><strong>{value}</strong></span></Choice>)}</ChoiceGroup>
              <Field label="What will tell us it worked?"><Textarea value={form.whatCounts} onChange={(event) => setField("whatCounts", event.target.value)} placeholder={ACTIVATION_SUCCESS_LANGUAGE.whatCounts} className="min-h-28 border-white/10 bg-black/40 text-white" /></Field>
              <div className="mt-6 grid gap-4 sm:grid-cols-2"><Field label="Funding goal in Gems"><Input type="number" value={form.fundingRequest} onChange={(event) => setField("fundingRequest", event.target.value)} placeholder="500 Gems · US$500 value" className="border-white/10 bg-black/40 text-white" /></Field><Field label="What will the partner contribute?"><Input value={form.funderContribution} onChange={(event) => setField("funderContribution", event.target.value)} placeholder="Gems, venue, product, access, media…" className="border-white/10 bg-black/40 text-white" /></Field></div>
              <p className="mt-3 rounded-2xl border border-primary/20 bg-primary/10 p-4 text-xs leading-5 text-white/60">{ACTIVATION_SUCCESS_LANGUAGE.gemsFunding}</p>
              <Field label="Human return"><Textarea value={form.socialReturn} onChange={(event) => setField("socialReturn", event.target.value)} placeholder={`e.g. ${ACTIVATION_SUCCESS_LANGUAGE.humanReturn}`} className="min-h-24 border-white/10 bg-black/40 text-white" /></Field>
              <Field label="Commercial return"><Textarea value={form.commercialReturn} onChange={(event) => setField("commercialReturn", event.target.value)} placeholder={`e.g. ${ACTIVATION_SUCCESS_LANGUAGE.commercialReturn}`} className="min-h-24 border-white/10 bg-black/40 text-white" /></Field>
            </>}

            {step === 6 && <ActivationStory form={form} />}

            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-between">
              <Button variant="outline" className="border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white" onClick={() => step ? setStep(step - 1) : navigate(-1)}><ArrowLeft className="mr-2 h-4 w-4" />{step ? "Back" : "Cancel"}</Button>
              <div className="flex gap-3">{step === steps.length - 1 && <Button variant="outline" className="border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white" disabled={loading} onClick={() => save("draft")}><Save className="mr-2 h-4 w-4" />Save plan</Button>}<Button disabled={!canContinue || loading} onClick={() => step < steps.length - 1 ? setStep(step + 1) : save("sent")} className="flex-1 bg-primary font-black text-black hover:bg-primary/90 sm:flex-none">{step < steps.length - 1 ? "Continue" : "Open this activation"}<ArrowRight className="ml-2 h-4 w-4" /></Button></div>
            </div>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-primary/25 bg-primary/10 p-5"><p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">The shared return</p><p className="mt-3 font-serif text-2xl font-bold">{ACTIVATION_SUCCESS_LANGUAGE.sharedReturn}</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/35">Builder lens</p>
              <p className="mt-3 text-sm font-bold leading-5 text-white">{currentGuide.successQuestion}</p>
              <Summary icon={Users} label="Participant" value={currentGuide.participantLens} />
              <Summary icon={Building2} label="Partner" value={currentGuide.partnerLens} />
              <Summary icon={Camera} label="Content" value={currentGuide.contentLens} />
              <Summary icon={WalletCards} label="Gems" value={currentGuide.gemsLens} />
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"><p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/35">Your activation so far</p><Summary icon={HeartHandshake} label="Outcome" value={ACTIVATION_OUTCOMES.find((item) => item.id === form.outcome)?.title || "Choose the change"} /><Summary icon={Users} label="Scene" value={form.scene || "Choose the community"} /><Summary icon={CalendarDays} label="Moment" value={form.title || "Shape the gathering"} /><Summary icon={Camera} label="Content" value={form.contentNeeds.length ? `${form.contentNeeds.length} roles selected` : "Plan the story"} /><Summary icon={WalletCards} label="Value" value={form.participantReturns.length ? `${form.participantReturns.length} participant returns` : "Define what opens"} /></div>
          </aside>
        </section>
      </div>
    </main>
  );
}

function StepHeading({ eyebrow, title, detail }: { eyebrow: string; title: string; detail: string }) { return <div><p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">{eyebrow}</p><h2 className="mt-2 font-serif text-3xl font-bold sm:text-4xl">{title}</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">{detail}</p></div>; }
function GuidancePanel({ guide }: { guide: (typeof ACTIVATION_CREATION_GUIDANCE)[keyof typeof ACTIVATION_CREATION_GUIDANCE] }) { return <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/10 p-4"><div className="flex gap-3"><Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-primary" /><div><p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">Success lens</p><p className="mt-2 text-sm font-bold leading-5 text-white">{guide.successQuestion}</p><p className="mt-2 text-xs leading-5 text-white/55">{guide.sceneLens}</p><p className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3 text-xs leading-5 text-white/55"><span className="font-bold text-white/80">Avoid:</span> {guide.avoid}</p></div></div></div>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="mt-5 block space-y-2"><span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">{label}</span>{children}</label>; }
function ChoiceGroup({ label, children }: { label: string; children: React.ReactNode }) { return <div className="mt-6"><p className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-white/45">{label}</p><div className="grid gap-3 sm:grid-cols-2">{children}</div></div>; }
function Choice({ active, onClick, compact, children }: { active: boolean; onClick: () => void; compact?: boolean; children: React.ReactNode }) { return <button type="button" aria-pressed={active} onClick={onClick} className={`flex text-left ${compact ? "items-center" : "items-start"} gap-3 rounded-2xl border p-4 transition ${active ? "border-primary bg-primary/12 text-primary" : "border-white/10 bg-black/30 text-white hover:border-white/25"}`}>{children}</button>; }
function Summary({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) { return <div className="mt-4 flex gap-3 border-t border-white/8 pt-4"><Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><div><p className="text-[8px] font-black uppercase tracking-[0.16em] text-white/30">{label}</p><p className="mt-1 text-xs font-semibold text-white/75">{value}</p></div></div>; }
function ActivationStory({ form }: { form: BuilderForm }) {
  const outcome = ACTIVATION_OUTCOMES.find((item) => item.id === form.outcome)?.title || "A meaningful outcome";
  return <div>
    <StepHeading eyebrow="07 · Activation story" title="See the experience before you open the room." detail="This is the shared story collaborators, hosts, creators, venues, merchants, and funders should all be able to understand." />
    <div className="mt-7 overflow-hidden rounded-[2rem] border border-primary/25 bg-[radial-gradient(circle_at_85%_10%,rgba(255,106,26,.25),transparent_34%),#0b0b0a]">
      <div className="border-b border-white/10 p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-primary px-3 py-1 text-[9px] font-black uppercase tracking-[.16em] text-black">{form.scene}</span><span className="text-xs text-white/40">{form.location || "Place to be confirmed"}</span></div>
        <h3 className="mt-5 font-serif text-4xl font-bold leading-none sm:text-5xl">{form.title}</h3>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-white/60">{form.description}</p>
        <p className="mt-5 border-l-2 border-primary pl-4 text-sm font-bold leading-6 text-white">{outcome}: {form.outcomeDetail}</p>
      </div>
      <div className="grid gap-px bg-white/10 sm:grid-cols-3">
        <StoryPanel icon={Camera} label="The story travels" value={form.contentNeeds.map((item) => item.replaceAll("_", " ")).join(" · ")} />
        <StoryPanel icon={UserRoundPlus} label="The room comes alive" value={form.collaborators.map((item) => item.replaceAll("_", " ")).join(" · ")} />
        <StoryPanel icon={WalletCards} label="Value is secured" value={form.fundingRequest ? `${Number(form.fundingRequest).toLocaleString()} Gems · US$${Number(form.fundingRequest).toLocaleString()} value` : "Gem funding can be added as partners align."} />
      </div>
    </div>
    <div className="mt-5 grid gap-3 sm:grid-cols-2"><ReviewCard label="People leave with" value={form.participantReturns.join(" · ")} /><ReviewCard label="Partners help make possible" value={form.funderContribution || "Funding, place, product, access, media, or reach."} /><ReviewCard label="Human return" value={form.socialReturn} /><ReviewCard label="Commercial return" value={form.commercialReturn} /></div>
    <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 p-5"><p className="text-[9px] font-black uppercase tracking-[.18em] text-primary">After the Moment</p><p className="mt-2 text-sm leading-6 text-white/60">Promorang will bring this plan into the operating workspace, where you can invite people, assign content, secure Gems, open access, launch, and review what changed for the Scene.</p></div>
  </div>;
}
function StoryPanel({ icon: Icon, label, value }: { icon: typeof Camera; label: string; value: string }) { return <div className="bg-[#10100f] p-5"><Icon className="h-5 w-5 text-primary" /><p className="mt-4 text-[8px] font-black uppercase tracking-[.16em] text-white/35">{label}</p><p className="mt-2 text-xs font-bold capitalize leading-5 text-white/70">{value}</p></div>; }
function ReviewCard({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-white/10 bg-black/25 p-5"><p className="text-[8px] font-black uppercase tracking-[.16em] text-primary">{label}</p><p className="mt-2 text-sm leading-6 text-white/60">{value}</p></div>; }

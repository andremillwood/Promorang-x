import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Check,
  ChevronDown,
  CircleDollarSign,
  Compass,
  Gift,
  MapPin,
  MessageCircle,
  Route,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import type { DemandPlan, DemandPlanValue, DistributionChannel } from "@promorang/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  plan: DemandPlan;
  saving?: boolean;
  onBack: () => void;
  onChange: (plan: DemandPlan) => void;
  onSave: () => void;
};

const valueNames: Record<DemandPlanValue["type"], { name: string; note: string }> = {
  gems: { name: "Gems", note: "Usable funded value" },
  promopoints: { name: "PromoPoints", note: "Contribution and progress" },
  piece: { name: "Pieces", note: "A stake in what people help grow" },
  promokey: { name: "PromoKeys", note: "Access and return benefits" },
  memory: { name: "Memories", note: "A lasting participation record" },
  promoshare: { name: "PromoShare", note: "Shared campaign upside" },
};

const channelNames: Record<DistributionChannel, string> = {
  pulse: "Pulse",
  promopush: "PromoPush",
  creator: "Creators",
  community: "Communities",
  whatsapp: "WhatsApp",
  qr: "QR",
  email: "Email",
  referral: "Referrals",
};

const stages = ["Outcome", "People", "Experience", "Shared value", "Reach", "Impact"];

export function PromoPilotWorkspace({ plan, saving, onBack, onChange, onSave }: Props) {
  const [openSection, setOpenSection] = useState("outcome");

  const enabledValues = plan.sharedValue.filter((value) => value.enabled !== false);
  const enabledChannels = plan.distribution.filter((channel) => channel.enabled);
  const readiness = useMemo(() => {
    const missing: string[] = [];
    if (!plan.intent.businessName) missing.push("Choose the organization");
    if (!plan.intent.timeframe) missing.push("Set the timing");
    if (!plan.intent.location && ["bring_people", "drive_sales"].includes(plan.intent.goal)) missing.push("Set the place");
    if (!plan.people.participantLimit) missing.push("Set a participation target");
    const unfunded = enabledValues.some((value) => value.fundingRequired && (!value.amount || value.amount <= 0));
    if (unfunded) missing.push("Set funded value amounts");
    return { missing, ready: missing.length === 0 };
  }, [enabledValues, plan]);

  const patchIntent = (patch: Partial<DemandPlan["intent"]>) => onChange({ ...plan, intent: { ...plan.intent, ...patch } });
  const patchPeople = (patch: Partial<DemandPlan["people"]>) => onChange({ ...plan, people: { ...plan.people, ...patch } });

  const toggleValue = (index: number) => {
    const sharedValue = plan.sharedValue.map((value, valueIndex) => valueIndex === index ? { ...value, enabled: value.enabled === false } : value);
    onChange({ ...plan, sharedValue: sharedValue });
  };

  const changeValueAmount = (index: number, amount: number) => {
    const sharedValue = plan.sharedValue.map((value, valueIndex) => valueIndex === index ? { ...value, amount: Number.isFinite(amount) ? amount : 0 } : value);
    onChange({ ...plan, sharedValue });
  };

  const toggleChannel = (index: number) => {
    const distribution = plan.distribution.map((channel, channelIndex) => channelIndex === index ? { ...channel, enabled: !channel.enabled } : channel);
    onChange({ ...plan, distribution });
  };

  const sectionButton = (id: string, number: string, label: string, summary: string) => (
    <button
      type="button"
      onClick={() => setOpenSection(openSection === id ? "" : id)}
      aria-expanded={openSection === id}
      className="flex w-full items-center gap-4 border-t border-black/15 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d85b24]"
    >
      <span className="font-mono text-xs font-black text-[#d85b24]">{number}</span>
      <span className="min-w-0 flex-1"><strong className="block text-lg">{label}</strong><span className="mt-1 block truncate text-sm text-black/45">{summary}</span></span>
      <ChevronDown className={`h-5 w-5 transition-transform ${openSection === id ? "rotate-180" : ""}`} />
    </button>
  );

  return (
    <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-[#f2eee5] text-[#191816]">
      <div className="border-b border-black/15 bg-[#191816] text-white">
        <div className="mx-auto flex max-w-[1540px] items-center justify-between gap-4 px-5 py-4 sm:px-10 lg:px-16">
          <button type="button" onClick={onBack} className="flex min-h-11 items-center gap-2 text-sm font-bold text-white/65 hover:text-white"><ArrowLeft className="h-4 w-4" /> Change the outcome</button>
          <div className="flex items-center gap-3"><Sparkles className="h-4 w-4 text-orange-300" /><span className="text-xs font-black uppercase tracking-[.22em]">PromoPilot</span></div>
          <span className="rounded-full border border-white/20 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white/60">Draft · not live</span>
        </div>
      </div>

      <div className="mx-auto max-w-[1540px] px-5 py-8 sm:px-10 lg:px-16 lg:py-12">
        <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_410px]">
          <section>
            <header className="max-w-5xl">
              <p className="text-[11px] font-black uppercase tracking-[.26em] text-[#d85b24]">Your campaign flight path</p>
              <h1 className="mt-4 text-5xl font-black leading-[.93] tracking-[-.055em] sm:text-6xl">{plan.title}</h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-black/55">PromoPilot has shaped the first route. Make the decisions only you can make, then save it for funding and launch.</p>
            </header>

            <div className="mt-10 grid grid-cols-3 border-y border-black/15 sm:grid-cols-6">
              {stages.map((stage, index) => <div key={stage} className="relative border-r border-black/10 px-2 py-4 text-center last:border-r-0"><span className={`mx-auto mb-2 block h-2 w-2 rounded-full ${index < 3 ? "bg-[#d85b24]" : "bg-black/15"}`} /><span className="text-[9px] font-black uppercase tracking-wider text-black/45">{stage}</span></div>)}
            </div>

            <div className="mt-8">
              {sectionButton("outcome", "01", "What should happen?", plan.intent.statement)}
              {openSection === "outcome" && <div className="grid gap-5 pb-8 sm:grid-cols-2"><label className="text-xs font-black uppercase tracking-wider">Organization<Input value={plan.intent.businessName || ""} onChange={(event) => patchIntent({ businessName: event.target.value })} placeholder="Who is running this?" className="mt-2 bg-white" /></label><label className="text-xs font-black uppercase tracking-wider">Timing<Input value={plan.intent.timeframe || ""} onChange={(event) => patchIntent({ timeframe: event.target.value })} placeholder="When should it happen?" className="mt-2 bg-white" /></label><label className="text-xs font-black uppercase tracking-wider sm:col-span-2">The change you want<Textarea value={plan.intent.statement} onChange={(event) => patchIntent({ statement: event.target.value })} className="mt-2 min-h-24 bg-white" /></label></div>}

              {sectionButton("people", "02", "Who is it for?", plan.people.audience)}
              {openSection === "people" && <div className="grid gap-5 pb-8 sm:grid-cols-2"><label className="text-xs font-black uppercase tracking-wider">Audience<Input value={plan.people.audience} onChange={(event) => patchPeople({ audience: event.target.value })} className="mt-2 bg-white" /></label><label className="text-xs font-black uppercase tracking-wider">Participation target<Input type="number" min={1} value={plan.people.participantLimit || ""} onChange={(event) => patchPeople({ participantLimit: Number(event.target.value) || null })} className="mt-2 bg-white" /></label><label className="text-xs font-black uppercase tracking-wider sm:col-span-2">Place<Input value={plan.intent.location || ""} onChange={(event) => patchIntent({ location: event.target.value })} placeholder="Where will it happen?" className="mt-2 bg-white" /></label></div>}

              {sectionButton("experience", "03", "What will people experience?", plan.experience.actions.find((action) => action.required)?.label || plan.experience.invitation)}
              {openSection === "experience" && <div className="pb-8"><div className="bg-[#191816] p-6 text-white"><p className="text-xs font-black uppercase tracking-wider text-orange-300">The participation path</p><div className="mt-5 grid gap-4 sm:grid-cols-3">{plan.experience.actions.filter((action) => action.type !== "discover").slice(0, 3).map((action, index) => <div key={action.id} className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/25 text-xs">{index + 1}</span><div><p className="text-sm font-bold">{action.label}</p><p className="mt-1 text-xs text-white/45">{action.proof ? `Confirmed by ${action.proof.replace("_", " ")}` : "No proof required"}</p></div></div>)}</div></div></div>}

              {sectionButton("value", "04", "What will people keep?", enabledValues.map((value) => valueNames[value.type].name).join(", "))}
              {openSection === "value" && <div className="grid gap-3 pb-8 sm:grid-cols-2">{plan.sharedValue.map((value, index) => { const enabled = value.enabled !== false; return <article key={`${value.type}-${index}`} className={`border p-4 ${enabled ? "border-[#d85b24]/45 bg-orange-50" : "border-black/10 bg-white/35"}`}><button type="button" onClick={() => toggleValue(index)} aria-pressed={enabled} className="flex w-full items-start gap-3 text-left"><span className={`mt-1 flex h-5 w-5 items-center justify-center rounded-full border ${enabled ? "border-[#d85b24] bg-[#d85b24] text-white" : "border-black/25"}`}>{enabled && <Check className="h-3 w-3" />}</span><span><strong>{valueNames[value.type].name}</strong><span className="block text-xs text-black/45">{valueNames[value.type].note}</span></span></button>{enabled && (value.amount !== undefined || value.fundingRequired) && <label className="mt-4 block text-[10px] font-black uppercase tracking-wider">Amount per verified action<Input type="number" min={0} value={value.amount || ""} onChange={(event) => changeValueAmount(index, Number(event.target.value))} className="mt-2 bg-white" /></label>}</article>; })}</div>}

              {sectionButton("reach", "05", "How will people find it?", enabledChannels.map((channel) => channelNames[channel.channel]).join(", "))}
              {openSection === "reach" && <div className="grid gap-3 pb-8 sm:grid-cols-2">{plan.distribution.map((channel, index) => <button key={channel.channel} type="button" onClick={() => toggleChannel(index)} aria-pressed={channel.enabled} className={`flex min-h-24 items-start gap-3 border p-4 text-left ${channel.enabled ? "border-[#d85b24]/45 bg-orange-50" : "border-black/10 bg-white/35"}`}><span className={`mt-1 h-3 w-3 rounded-full ${channel.enabled ? "bg-[#d85b24]" : "bg-black/15"}`} /><span><strong>{channelNames[channel.channel]}</strong><span className="mt-1 block text-xs leading-5 text-black/45">{channel.reason}</span></span></button>)}</div>}

              {sectionButton("impact", "06", "How will we know?", plan.measurement.primaryOutcome)}
              {openSection === "impact" && <div className="grid gap-4 pb-8 sm:grid-cols-2"><div className="border border-black/15 bg-white/45 p-5"><BarChart3 className="h-5 w-5 text-[#d85b24]" /><p className="mt-5 text-xs font-black uppercase tracking-wider text-black/40">Primary impact</p><p className="mt-2 text-xl font-black">{plan.measurement.primaryOutcome}</p></div><div className="border border-black/15 bg-white/45 p-5"><Route className="h-5 w-5 text-[#d85b24]" /><p className="mt-5 text-xs font-black uppercase tracking-wider text-black/40">After participation</p><p className="mt-2 text-sm font-bold leading-6">Review → referral → loyalty follow-up → next invitation</p></div><p className="sm:col-span-2 text-xs leading-5 text-black/45">Forecast confidence: {plan.measurement.forecast.confidence}. {plan.measurement.forecast.basis}.</p></div>}
            </div>
          </section>

          <aside className="h-fit xl:sticky xl:top-6">
            <div className="border border-black/15 bg-[#faf7f0] p-6 sm:p-8">
              <div className={`flex h-11 w-11 items-center justify-center rounded-full ${readiness.ready ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>{readiness.ready ? <Check className="h-5 w-5" /> : <Compass className="h-5 w-5" />}</div>
              <p className="mt-6 text-[11px] font-black uppercase tracking-[.2em] text-[#d85b24]">PromoPilot readiness</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight">{readiness.ready ? "Ready to save." : `${readiness.missing.length} decisions remain.`}</h2>
              <p className="mt-3 text-sm leading-6 text-black/55">Saving creates an inactive campaign plan. Publishing, charges, messages, Pieces, and rewards always require a separate confirmation.</p>

              <div className="mt-6 border-y border-black/10 py-5">
                {readiness.missing.length ? readiness.missing.map((item) => <button key={item} type="button" onClick={() => setOpenSection(item.includes("organization") || item.includes("timing") ? "outcome" : item.includes("place") || item.includes("participation") ? "people" : "value")} className="flex w-full items-center gap-3 py-2 text-left text-sm text-black/60"><span className="h-4 w-4 rounded-full border border-black/20" />{item}<ArrowRight className="ml-auto h-3 w-3" /></button>) : <p className="flex items-center gap-3 text-sm font-bold text-emerald-800"><Check className="h-4 w-4" />Core decisions are complete</p>}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 text-center"><div className="bg-black/[.04] p-3"><p className="text-2xl font-black">{plan.people.participantLimit || "—"}</p><p className="text-[9px] font-black uppercase tracking-wider text-black/40">People</p></div><div className="bg-black/[.04] p-3"><p className="text-2xl font-black">{enabledChannels.length}</p><p className="text-[9px] font-black uppercase tracking-wider text-black/40">Channels</p></div></div>

              <Button onClick={onSave} disabled={saving} className="mt-6 h-14 w-full rounded-full bg-[#d85b24] text-base font-black text-white hover:bg-[#ba4618]">{saving ? "Saving PromoPilot plan…" : "Save campaign plan"}<ArrowRight className="ml-2 h-4 w-4" /></Button>
              <p aria-live="polite" className="mt-4 text-center text-xs leading-5 text-black/42">Nothing will be published or charged.</p>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-px bg-black/10 text-center"><div className="bg-[#191816] p-4 text-white"><Gift className="mx-auto h-4 w-4 text-orange-300" /><p className="mt-2 text-[9px] uppercase">Value</p></div><div className="bg-[#191816] p-4 text-white"><MessageCircle className="mx-auto h-4 w-4 text-orange-300" /><p className="mt-2 text-[9px] uppercase">Reach</p></div><div className="bg-[#191816] p-4 text-white"><ShieldCheck className="mx-auto h-4 w-4 text-orange-300" /><p className="mt-2 text-[9px] uppercase">Proof</p></div></div>
          </aside>
        </div>
      </div>
    </motion.main>
  );
}

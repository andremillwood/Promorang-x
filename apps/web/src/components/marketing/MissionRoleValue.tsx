import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { MISSION_ARCHETYPES, type MissionArchetype } from "@/lib/mission-archetypes";

const ROLE_SETS: Record<"brand" | "creator" | "merchant", Array<{ role: MissionArchetype; value: string }>> = {
  brand: [
    { role: "aura", value: "Authentic visual presence around the experience." },
    { role: "rally", value: "Qualified people brought into the Moment." },
    { role: "signal", value: "Distribution with an attributable source." },
    { role: "scout", value: "Early taste and local intelligence." },
  ],
  creator: [
    { role: "aura", value: "Turn your visual language into a prompt others can interpret." },
    { role: "remix", value: "Invite participation without demanding imitation." },
    { role: "signal", value: "Give your audience a useful story to move." },
    { role: "lore", value: "Build a record around the culture you help shape." },
  ],
  merchant: [
    { role: "aura", value: "Make your space worth capturing—with boundaries visible." },
    { role: "scout", value: "Invite trusted discovery and structured feedback." },
    { role: "rally", value: "Turn one visit into a small wave of arrivals." },
    { role: "lore", value: "Give regulars and newcomers a story worth returning to." },
  ],
};

export function MissionRoleValue({ audience }: { audience: keyof typeof ROLE_SETS }) {
  return (
    <section className="border-b border-border bg-zinc-950 py-16 text-white md:py-20">
      <div className="container px-6">
        <div className="mb-8 max-w-3xl">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">Mission roles</p>
          <h2 className="mt-3 text-3xl font-black uppercase leading-[0.9] tracking-[-0.05em] md:text-5xl">Give people a role—not another ad.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/50">Every Mission asks for one culturally legible kind of contribution. Participants choose how they naturally add value; you receive proof of what moved.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {ROLE_SETS[audience].map(({ role, value }) => {
            const item = MISSION_ARCHETYPES[role];
            const Icon = item.icon;
            return (
              <Link key={role} to={`/missions?role=${role}`} className="group rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-primary/40">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${item.tone}`}><Icon className="h-5 w-5" /></div>
                <p className="mt-6 text-[9px] font-black uppercase tracking-[0.18em] text-white/35">{item.verb}</p>
                <h3 className="mt-1 text-xl font-black">{item.label}</h3>
                <p className="mt-3 text-xs leading-5 text-white/50">{value}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-primary">See the participant view <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" /></span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}


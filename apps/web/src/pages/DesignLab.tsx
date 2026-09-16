import { ArrowUpRight, Compass, CreditCard, Home, LockKeyhole, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PromoCardFace } from "@/components/promorang/PromoCardObject";
import { CollectibleRelic, PaperReceipt, TicketPass } from "@/components/promorang/SignatureObjects";

const principles = [
  ["01", "ONE MOVE", "Every major surface gives one action visual authority. Secondary actions stay quiet."],
  ["02", "OBJECTS > CARDS", "Access, proof and memory should look like objects: cards, tickets, receipts and pieces."],
  ["03", "WORLD > DASHBOARD", "People, places, scenes and moments lead composition. Internal product taxonomy does not."],
  ["04", "UTILITY IS QUIET", "Controls and metadata support the experience instead of becoming the experience."],
] as const;

const tokens = [
  ["Canvas", "#0B0B0C", "World / background"],
  ["Raised", "#151516", "Utility / raised surface"],
  ["Paper", "#F6ECD8", "Proof / memory object"],
  ["Signal", "#FF5500", "Movement / primary action"],
  ["Amber", "#F6D48A", "Access / card value"],
  ["Violet", "#B5A2FF", "Collectible / kept object"],
] as const;

const nav = [
  [Home, "Today"],
  [Compass, "Discover"],
  [CreditCard, "Card"],
  [LockKeyhole, "Vault"],
  [UserRound, "You"],
] as const;

function ConsumerNav() {
  return (
    <nav className="grid grid-cols-5 border-t border-white/10 bg-black/95 px-2 pb-2 pt-3" aria-label="Consumer navigation specimen">
      {nav.map(([Icon, label], index) => (
        <button key={label} type="button" className={`flex min-h-12 flex-col items-center justify-center gap-1 text-[10px] font-bold ${index === 0 ? "text-primary" : "text-white/45"}`}>
          <Icon className="h-4 w-4" />
          {label}
        </button>
      ))}
    </nav>
  );
}

function LabSection({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-white/10 py-16 md:py-24">
      <div className="mb-10 flex flex-col gap-3 md:mb-14 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-primary">{eyebrow}</p>
          <h2 className="mt-3 max-w-3xl font-serif text-4xl font-bold leading-[0.95] tracking-[-0.04em] text-white md:text-6xl">{title}</h2>
        </div>
        <p className="max-w-sm text-sm leading-6 text-white/45">PROMORANG Design Lab · code is the source of truth.</p>
      </div>
      {children}
    </section>
  );
}

export default function DesignLab() {
  return (
    <div className="dark min-h-screen bg-[#0b0b0c] text-white selection:bg-primary selection:text-black">
      <main className="mx-auto max-w-[1500px] px-5 pb-24 pt-10 sm:px-8 lg:px-12">
        <header className="grid min-h-[72vh] content-between gap-16 pb-16 pt-10 md:grid-cols-[1.3fr_.7fr] md:pb-24">
          <div className="self-end">
            <p className="text-[10px] font-black uppercase tracking-[0.34em] text-primary">PROMORANG · Product Design System 01</p>
            <h1 className="mt-6 max-w-5xl font-serif text-[clamp(4.4rem,10vw,10rem)] font-bold leading-[0.74] tracking-[-0.07em] text-white">
              The city is the interface.
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-white/55 md:text-xl">
              Access, movement, discovery, proof and memory — expressed as a cultural consumer product, not a dashboard with nightlife features.
            </p>
          </div>
          <div className="self-end border-l border-primary/40 pl-6">
            <p className="font-serif text-2xl font-bold text-[#f6d48a]">Design constitution</p>
            <p className="mt-3 text-sm leading-6 text-white/50">Every production surface should be explainable using one of three visual families: World, Objects, Utility.</p>
          </div>
        </header>

        <LabSection eyebrow="01 · Laws" title="Four rules before components.">
          <div className="grid border-y border-white/10 md:grid-cols-2 xl:grid-cols-4">
            {principles.map(([number, title, copy]) => (
              <article key={title} className="min-h-64 border-b border-white/10 p-6 md:border-r xl:border-b-0">
                <p className="font-mono text-xs text-primary">{number}</p>
                <h3 className="mt-10 font-serif text-3xl font-bold leading-none">{title}</h3>
                <p className="mt-4 text-sm leading-6 text-white/45">{copy}</p>
              </article>
            ))}
          </div>
        </LabSection>

        <LabSection eyebrow="02 · Foundation" title="Signal, paper, ink and culture.">
          <div className="grid gap-px overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
            {tokens.map(([name, value, use]) => (
              <article key={name} className="bg-[#101011] p-5">
                <div className="h-36 rounded-[1.25rem] border border-white/10" style={{ backgroundColor: value }} />
                <div className="mt-4 flex items-start justify-between gap-3">
                  <div><p className="font-bold">{name}</p><p className="mt-1 text-xs text-white/40">{use}</p></div>
                  <code className="text-xs text-white/45">{value}</code>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-12 grid gap-8 border-t border-white/10 pt-10 lg:grid-cols-2">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Editorial</p>
              <p className="mt-4 font-serif text-6xl font-bold leading-[0.9] tracking-[-0.05em]">Tonight has an opening.</p>
              <p className="mt-5 text-sm text-white/40">Fraunces · moments, names, objects, emotional hierarchy.</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Utility</p>
              <p className="mt-4 max-w-xl text-2xl font-medium leading-9">Use your PromoCard at Sea Deck before 11:30 PM. The interface explains enough, then gets out of the way.</p>
              <p className="mt-5 text-sm text-white/40">DM Sans · navigation, instructions, metadata and control.</p>
            </div>
          </div>
        </LabSection>

        <LabSection eyebrow="03 · Objects" title="The interface should contain things worth recognizing.">
          <div className="grid gap-8 xl:grid-cols-[1.05fr_.95fr]">
            <div className="rounded-[2.25rem] border border-white/10 bg-[radial-gradient(circle_at_75%_0%,rgba(255,85,0,.16),transparent_35%),#111112] p-5 sm:p-8">
              <div className="mb-7 flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">Access object</p><h3 className="mt-2 font-serif text-3xl font-bold">PromoCard</h3></div><span className="text-xs text-white/35">real component</span></div>
              <PromoCardFace
                available="2-for-1 entry"
                limit="Valid tonight · Sea Deck"
                holder="Andre"
                places="AFTRHRS"
                action="USE THIS"
                sceneMark="KINGSTON AFTER DARK"
                crewMark="BARBICAN CREW"
                interactive={false}
                className="max-w-none"
              />
            </div>
            <div className="grid content-start gap-6 sm:grid-cols-2 xl:grid-cols-1">
              <TicketPass kicker="TONIGHT" title="AFTRHRS" detail="Sea Deck · Barbican · complimentary tequila slammer with paid entry." stub="AFT-0916" stubLabel="ACCESS" />
              <PaperReceipt heading="RETURN RECORDED" lines={[{ label: "Moment", value: "AFTRHRS" }, { label: "Place", value: "Sea Deck" }, { label: "Used", value: "2-for-1 entry", strong: true }, { label: "Time", value: "11:08 PM" }]} footer="Proof belongs in the Vault. It should feel kept, not logged." />
              <CollectibleRelic serial="PIECE · KAD-0042" title="The City Wakes" origin="Kept after a verified night in Barbican." perk="Marks your first Kingston After Dark return." scene="Kingston After Dark" place="Barbican" />
            </div>
          </div>
        </LabSection>

        <LabSection eyebrow="04 · Controls" title="Orange means movement, not decoration.">
          <div className="flex flex-wrap items-center gap-4 rounded-[2rem] border border-white/10 bg-white/[0.025] p-6 md:p-10">
            <Button size="lg" className="min-h-12 rounded-full px-7 font-black">Use this tonight <ArrowUpRight className="ml-2 h-4 w-4" /></Button>
            <Button size="lg" variant="outline" className="min-h-12 rounded-full border-white/15 bg-transparent px-7 text-white hover:bg-white/5">See details</Button>
            <Button variant="ghost" className="text-white/55 hover:bg-white/5 hover:text-white">Not now</Button>
          </div>
        </LabSection>

        <LabSection eyebrow="05 · Consumer architecture" title="Five destinations. No internal jargon.">
          <div className="grid gap-8 xl:grid-cols-[.75fr_1.25fr]">
            <div className="space-y-6">
              {[["TODAY", "What should I do now?"], ["DISCOVER", "What is worth my attention?"], ["CARD", "What can I access or use?"], ["VAULT", "What have I earned, kept or unlocked?"], ["YOU", "What is my relationship with this world?"]].map(([name, job], index) => (
                <div key={name} className="grid grid-cols-[44px_1fr] gap-4 border-b border-white/10 pb-5"><span className="font-mono text-xs text-primary">0{index + 1}</span><div><p className="font-black tracking-[0.12em]">{name}</p><p className="mt-1 text-sm text-white/45">{job}</p></div></div>
              ))}
            </div>

            <div className="mx-auto w-full max-w-[420px] overflow-hidden rounded-[2.6rem] border border-white/15 bg-black shadow-[0_30px_80px_rgba(0,0,0,.5)]">
              <div className="px-5 pb-7 pt-7">
                <div className="flex items-start justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">Tuesday · Kingston</p><h3 className="mt-3 font-serif text-[2.65rem] font-bold leading-[0.9] tracking-[-0.045em]">Tonight has an opening.</h3></div><div className="mt-1 h-8 w-8 rounded-full border border-white/15" /></div>
                <p className="mt-4 max-w-[20rem] text-sm leading-6 text-white/50">One move worth making, then everything else gets quieter.</p>
                <button type="button" className="mt-6 w-full overflow-hidden rounded-[1.65rem] border border-white/10 bg-[#141414] text-left">
                  <div className="h-44 bg-[radial-gradient(circle_at_72%_20%,rgba(255,85,0,.55),transparent_30%),linear-gradient(135deg,#2c1710,#0e0e0f_62%)] p-5">
                    <p className="text-[10px] font-black tracking-[0.22em] text-primary">YOUR MOVE</p>
                    <p className="mt-16 font-serif text-3xl font-bold">AFTRHRS</p>
                    <p className="mt-1 text-xs text-white/55">10 PM · Sea Deck · Barbican</p>
                  </div>
                  <div className="flex min-h-14 items-center justify-between px-5 text-sm font-black"><span>Open tonight</span><ArrowUpRight className="h-4 w-4 text-primary" /></div>
                </button>
                <div className="mt-7"><p className="mb-3 text-[10px] font-black uppercase tracking-[0.22em] text-white/35">On your card</p><PromoCardFace available="2-for-1 entry" limit="Valid tonight" holder="Andre" places="AFTRHRS" action="USE THIS" sceneMark="KAD" interactive={false} className="max-w-none" /></div>
                <div className="mt-7 border-t border-white/10 pt-6"><p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/35">Now & next</p><div className="mt-3 grid gap-3">{["Dubwise Wednesdays", "Late Plate · Barbican"].map((item, index) => <div key={item} className="flex items-center gap-3"><div className="h-12 w-12 rounded-xl bg-white/[0.06]" /><div><p className="font-serif text-lg font-bold">{item}</p><p className="text-xs text-white/35">{index ? "Food · 11:30 PM" : "Music · 9:00 PM"}</p></div></div>)}</div></div>
              </div>
              <ConsumerNav />
            </div>
          </div>
        </LabSection>
      </main>
    </div>
  );
}

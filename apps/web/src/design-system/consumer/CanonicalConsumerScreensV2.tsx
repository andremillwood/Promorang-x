import type { ReactNode } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  Compass,
  CreditCard,
  Gem,
  Home,
  LockKeyhole,
  MapPin,
  Radio,
  Search,
  Ticket,
  UserRound,
} from "lucide-react";
import { PromoCardFace } from "@/components/promorang/PromoCardObject";
import { CollectibleRelic, PaperReceipt, TicketPass } from "@/components/promorang/SignatureObjects";

const navItems = [
  [Home, "Today"],
  [Compass, "Discover"],
  [CreditCard, "Card"],
  [LockKeyhole, "Vault"],
  [UserRound, "You"],
] as const;

type Destination = (typeof navItems)[number][1];

function ConsumerNav({ active }: { active: Destination }) {
  return (
    <nav className="grid grid-cols-5 border-t border-white/10 bg-black/95 px-2 pb-2 pt-3" aria-label="Consumer navigation specimen">
      {navItems.map(([Icon, label]) => {
        const selected = label === active;
        return (
          <button key={label} type="button" aria-current={selected ? "page" : undefined} className={`flex min-h-12 flex-col items-center justify-center gap-1 text-[10px] font-bold ${selected ? "text-primary" : "text-white/38"}`}>
            <Icon className="h-4 w-4" />
            {label}
          </button>
        );
      })}
    </nav>
  );
}

function PhoneFrame({ active, children }: { active: Destination; children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-[830px] w-full max-w-[414px] flex-col overflow-hidden rounded-[2.65rem] border border-white/15 bg-black shadow-[0_32px_90px_rgba(0,0,0,.58)]">
      <div className="flex-1 overflow-hidden px-5 pb-8 pt-7">{children}</div>
      <ConsumerNav active={active} />
    </div>
  );
}

function ScreenHeader({ eyebrow, title, copy, action }: { eyebrow: string; title: string; copy?: string; action?: ReactNode }) {
  return (
    <header>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">{eyebrow}</p>
          <h3 className="mt-3 font-serif text-[2.55rem] font-bold leading-[0.88] tracking-[-0.05em] text-white">{title}</h3>
        </div>
        {action}
      </div>
      {copy ? <p className="mt-4 max-w-[21rem] text-sm leading-6 text-white/48">{copy}</p> : null}
    </header>
  );
}

function SectionLabel({ children, action }: { children: ReactNode; action?: string }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/35">{children}</p>
      {action ? <button type="button" className="text-xs font-bold text-primary">{action}</button> : null}
    </div>
  );
}

function WorldLine({ title, meta, live }: { title: string; meta: string; live?: boolean }) {
  return (
    <article className="grid grid-cols-[38px_1fr_auto] items-center gap-3 border-b border-white/10 py-3 last:border-b-0">
      <div className="relative h-9 w-9">
        <span className={`absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ${live ? "bg-emerald-300 shadow-[0_0_15px_rgba(110,231,183,.8)]" : "bg-primary"}`} />
        <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/10" />
      </div>
      <div className="min-w-0">
        <p className="truncate font-serif text-lg font-bold text-white">{title}</p>
        <p className="mt-0.5 text-xs text-white/38">{meta}</p>
      </div>
      <ArrowUpRight className="h-4 w-4 text-white/25" />
    </article>
  );
}

function TodayScreen() {
  return (
    <PhoneFrame active="Today">
      <ScreenHeader eyebrow="Tuesday · Kingston" title="Tonight has an opening." copy="One move first. The rest of the city becomes context." action={<div className="mt-1 h-8 w-8 rounded-full border border-white/15" />} />

      <section className="relative -mx-5 mt-6 min-h-[248px] overflow-hidden border-y border-white/10 bg-[#17100c] px-5 py-5">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,85,0,.18)_1px,transparent_1px),linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px)] bg-[size:44px_44px]" />
        <div className="absolute right-[-38px] top-[-34px] h-48 w-48 rounded-full bg-primary/30 blur-3xl" />
        <div className="relative flex h-full min-h-[208px] flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-primary"><Radio className="h-3 w-3" />Your move</span>
            <span className="font-mono text-[9px] text-white/35">18.0179°N · 76.8099°W</span>
          </div>
          <div>
            <p className="font-serif text-[3.25rem] font-bold leading-[0.82] tracking-[-0.055em] text-white">AFTRHRS</p>
            <div className="mt-4 flex items-center gap-3 text-xs text-white/55"><span>10 PM</span><span className="h-px w-8 bg-primary" /><span>Sea Deck</span><span>Barbican</span></div>
          </div>
          <button type="button" className="mt-5 flex min-h-12 items-center justify-between border-t border-white/15 pt-4 text-left text-sm font-black text-white"><span>Open tonight</span><ArrowRight className="h-4 w-4 text-primary" /></button>
        </div>
      </section>

      <div className="mt-7"><SectionLabel>On your card</SectionLabel><PromoCardFace available="2-for-1 entry" limit="Valid tonight" holder="Andre" places="AFTRHRS" action="USE THIS" sceneMark="KAD" interactive={false} className="max-w-none" /></div>

      <section className="mt-7 border-t border-white/10 pt-6">
        <SectionLabel action="See calendar">Now & next</SectionLabel>
        <WorldLine title="Dubwise Wednesdays" meta="Music · 9:00 PM · Kingston" live />
        <WorldLine title="Late Plate · Barbican" meta="Food · 11:30 PM" />
      </section>
    </PhoneFrame>
  );
}

function CardScreen() {
  return (
    <PhoneFrame active="Card">
      <ScreenHeader eyebrow="Your access" title="Your PromoCard." copy="The object should do the explaining. Supporting utility stays beneath it." action={<CreditCard className="mt-1 h-5 w-5 text-[#f6d48a]" />} />
      <div className="mt-6"><PromoCardFace available="2-for-1 entry" limit="Valid tonight · Sea Deck" holder="Andre" places="AFTRHRS" action="USE THIS" sceneMark="KINGSTON AFTER DARK" crewMark="BARBICAN CREW" interactive={false} className="max-w-none" /></div>
      <button type="button" className="mt-4 flex min-h-13 w-full items-center justify-between rounded-full bg-primary px-5 text-sm font-black text-black"><span>Show this tonight</span><ArrowRight className="h-4 w-4" /></button>

      <section className="mt-8 border-t border-white/10 pt-6">
        <SectionLabel>Works here tonight</SectionLabel>
        <div className="grid grid-cols-[1fr_auto] gap-4 py-2">
          <div><p className="font-serif text-2xl font-bold">Sea Deck</p><p className="mt-1 text-xs leading-5 text-white/42">20 Barbican Road · door validation · until close</p></div>
          <MapPin className="mt-1 h-5 w-5 text-primary" />
        </div>
      </section>

      <section className="mt-7 border-t border-white/10 pt-6">
        <SectionLabel action="Open Discover">Other openings nearby</SectionLabel>
        <WorldLine title="Complimentary wings" meta="Sea Deck · 0.4 km" />
        <WorldLine title="Late-night coffee" meta="Barbican · 0.8 km" />
      </section>

      <section className="mt-7 border-t border-white/10 pt-6">
        <SectionLabel>What changed</SectionLabel>
        <div className="grid grid-cols-[44px_1fr] gap-3"><div className="grid h-11 w-11 place-items-center rounded-full border border-[#f6d48a]/25 text-[#f6d48a]">A</div><div><p className="font-serif text-lg font-bold">First Kingston After Dark return.</p><p className="mt-1 text-xs leading-5 text-white/42">A verified use added a mark to your card.</p></div></div>
      </section>
    </PhoneFrame>
  );
}

function VaultShelf({ title, copy, children }: { title: string; copy: string; children: ReactNode }) {
  return <section className="mt-7 border-t border-white/10 pt-6 first:mt-6 first:border-t-0 first:pt-0"><div className="mb-4"><p className="font-serif text-2xl font-bold text-white">{title}</p><p className="mt-1 text-xs leading-5 text-white/38">{copy}</p></div>{children}</section>;
}

function VaultScreen() {
  return (
    <PhoneFrame active="Vault">
      <ScreenHeader eyebrow="What stays with you" title="The Vault." copy="Access, proof, things kept, and usable value each keep their own material language." action={<LockKeyhole className="mt-1 h-5 w-5 text-violet-200" />} />
      <VaultShelf title="Access" copy="Things you can still use."><TicketPass kicker="TONIGHT" title="AFTRHRS" detail="Sea Deck · Barbican · physical access retained on your account." stub="AFT-0916" stubLabel="ACCESS" /></VaultShelf>
      <VaultShelf title="Proof" copy="Things PROMORANG can verify happened."><PaperReceipt heading="RETURN RECORDED" lines={[{ label: "Moment", value: "AFTRHRS" },{ label: "Place", value: "Sea Deck" },{ label: "Used", value: "2-for-1 entry", strong: true },{ label: "Time", value: "11:08 PM" }]} footer="Proof should feel kept, not buried in activity history." /></VaultShelf>
      <VaultShelf title="Kept" copy="Identity, provenance and cultural memory."><CollectibleRelic serial="PIECE · KAD-0042" title="The City Wakes" origin="Kept after a verified night in Barbican." perk="Marks your first Kingston After Dark return." scene="Kingston After Dark" place="Barbican" /></VaultShelf>
      <VaultShelf title="Value" copy="Useful balances stay legible without becoming the personality of the Vault."><div className="grid grid-cols-2 gap-3"><div className="border-l-2 border-cyan-300/60 bg-cyan-300/[0.05] p-4"><Gem className="h-4 w-4 text-cyan-300" /><p className="mt-4 text-2xl font-black">18</p><p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-white/35">Gems</p></div><div className="border-l-2 border-violet-200/60 bg-violet-200/[0.05] p-4"><Ticket className="h-4 w-4 text-violet-200" /><p className="mt-4 text-2xl font-black">7</p><p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-white/35">Draw tickets</p></div></div></VaultShelf>
    </PhoneFrame>
  );
}

function DiscoverScreen() {
  return (
    <PhoneFrame active="Discover">
      <ScreenHeader eyebrow="Kingston · Tuesday" title="Find what moves you." copy="The city leads. Search and filters only help you steer." action={<Search className="mt-1 h-5 w-5 text-white/55" />} />

      <section className="relative -mx-5 mt-6 min-h-[270px] overflow-hidden border-y border-white/10 bg-[#101011] px-5 py-5">
        <div className="absolute inset-0 opacity-80 bg-[radial-gradient(circle_at_72%_18%,rgba(255,85,0,.32),transparent_28%),linear-gradient(120deg,transparent_0_38%,rgba(255,255,255,.04)_38%_39%,transparent_39%_58%,rgba(255,255,255,.04)_58%_59%,transparent_59%)]" />
        <div className="relative flex min-h-[230px] flex-col justify-between">
          <div className="flex items-start justify-between"><span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-300">Live city signal</span><Bookmark className="h-4 w-4 text-white/50" /></div>
          <div><p className="font-serif text-[2.8rem] font-bold leading-[0.84] tracking-[-0.05em]">Barbican is moving.</p><p className="mt-4 max-w-[17rem] text-xs leading-5 text-white/50">House at Sea Deck. Food moving late. Two benefits within walking distance.</p></div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/45"><MapPin className="h-3 w-3 text-primary" />Sea Deck <span className="h-px w-8 bg-primary/70" />Oasis <span className="h-px w-8 bg-white/20" />Dulce</div>
        </div>
      </section>

      <section className="mt-7"><SectionLabel action="View all">Happening now</SectionLabel><WorldLine title="AFTRHRS" meta="House · Sea Deck · live now" live /><WorldLine title="Late Plate" meta="Food · Barbican · until 1 AM" /></section>
      <section className="mt-7 border-t border-white/10 pt-6"><SectionLabel>Worth crossing town for</SectionLabel><div className="space-y-5"><div className="border-l-2 border-primary pl-4"><p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">Culture</p><p className="mt-1 font-serif text-2xl font-bold">Dub Club</p><p className="mt-1 text-xs text-white/40">Sunday · skyline · sound system</p></div><div className="border-l-2 border-[#f6d48a] pl-4"><p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#f6d48a]">Food</p><p className="mt-1 font-serif text-2xl font-bold">Late Plate</p><p className="mt-1 text-xs text-white/40">Tonight · Barbican · after-hours kitchen</p></div></div></section>
      <section className="mt-7 border-t border-white/10 pt-6"><SectionLabel action="Map">Near you</SectionLabel><WorldLine title="Sea Deck" meta="0.4 km · 2 live benefits" live /><WorldLine title="Oasis" meta="1.2 km · tomorrow" /><WorldLine title="Dulce Lounge" meta="1.4 km · Thursday" /></section>
    </PhoneFrame>
  );
}

const screenNotes = [
  ["TODAY", "World first: time, place and one move. Fewer dark containers."],
  ["CARD", "The PromoCard explains itself; utility no longer repeats the benefit."],
  ["VAULT", "Objects retain distinct materials instead of collapsing into dashboard cards."],
  ["DISCOVER", "City signal and spatial context replace the generic filter + card-feed pattern."],
] as const;

export function CanonicalConsumerScreensV2() {
  return (
    <div>
      <div className="mb-10 grid gap-px overflow-hidden rounded-[1.7rem] border border-white/10 bg-white/10 md:grid-cols-2 xl:grid-cols-4">{screenNotes.map(([name,note],index)=><article key={name} className="bg-[#101011] p-5"><p className="font-mono text-xs text-primary">0{index+1}</p><p className="mt-7 font-black tracking-[0.12em]">{name}</p><p className="mt-2 text-xs leading-5 text-white/42">{note}</p></article>)}</div>
      <div className="grid gap-10 xl:grid-cols-2 2xl:grid-cols-4"><div><p className="mb-4 text-center text-[10px] font-black uppercase tracking-[0.22em] text-white/35">Today</p><TodayScreen /></div><div><p className="mb-4 text-center text-[10px] font-black uppercase tracking-[0.22em] text-white/35">Card</p><CardScreen /></div><div><p className="mb-4 text-center text-[10px] font-black uppercase tracking-[0.22em] text-white/35">Vault</p><VaultScreen /></div><div><p className="mb-4 text-center text-[10px] font-black uppercase tracking-[0.22em] text-white/35">Discover</p><DiscoverScreen /></div></div>
    </div>
  );
}

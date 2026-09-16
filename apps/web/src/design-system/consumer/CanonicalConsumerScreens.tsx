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
          <button
            key={label}
            type="button"
            aria-current={selected ? "page" : undefined}
            className={`flex min-h-12 flex-col items-center justify-center gap-1 text-[10px] font-bold ${selected ? "text-primary" : "text-white/40"}`}
          >
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
      <div className="flex-1 px-5 pb-8 pt-7">{children}</div>
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
          <h3 className="mt-3 font-serif text-[2.55rem] font-bold leading-[0.9] tracking-[-0.045em] text-white">{title}</h3>
        </div>
        {action}
      </div>
      {copy ? <p className="mt-4 max-w-[21rem] text-sm leading-6 text-white/48">{copy}</p> : null}
    </header>
  );
}

function MiniMoment({ title, meta, live }: { title: string; meta: string; live?: boolean }) {
  return (
    <article className="group flex items-center gap-3 border-b border-white/10 py-3 last:border-b-0">
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[1rem] border border-white/10 bg-[radial-gradient(circle_at_70%_20%,rgba(255,85,0,.45),transparent_34%),linear-gradient(145deg,#28150e,#101011_65%)]">
        {live ? <span className="absolute left-2 top-2 h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,.8)]" /> : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-serif text-lg font-bold text-white">{title}</p>
        <p className="mt-0.5 text-xs text-white/38">{meta}</p>
      </div>
      <ArrowUpRight className="h-4 w-4 text-white/25" />
    </article>
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

function TodayScreen() {
  return (
    <PhoneFrame active="Today">
      <ScreenHeader
        eyebrow="Tuesday · Kingston"
        title="Tonight has an opening."
        copy="PROMORANG should answer one question first: what is worth doing now?"
        action={<div className="mt-1 h-8 w-8 rounded-full border border-white/15 bg-white/[0.025]" />}
      />

      <button type="button" className="mt-6 w-full overflow-hidden rounded-[1.7rem] border border-white/10 bg-[#141414] text-left shadow-[0_18px_50px_rgba(0,0,0,.35)]">
        <div className="relative h-48 overflow-hidden bg-[radial-gradient(circle_at_78%_18%,rgba(255,85,0,.65),transparent_30%),linear-gradient(145deg,#35180d,#121213_64%)] p-5">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-black/35 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.19em] text-primary backdrop-blur">
            <Radio className="h-3 w-3" /> Your move
          </span>
          <div className="absolute inset-x-5 bottom-5">
            <p className="font-serif text-4xl font-bold leading-none text-white">AFTRHRS</p>
            <p className="mt-2 text-xs text-white/55">10 PM · Sea Deck · Barbican</p>
          </div>
        </div>
        <div className="flex min-h-14 items-center justify-between px-5 text-sm font-black text-white">
          <span>Open tonight</span>
          <ArrowUpRight className="h-4 w-4 text-primary" />
        </div>
      </button>

      <div className="mt-7">
        <SectionLabel>On your card</SectionLabel>
        <PromoCardFace
          available="2-for-1 entry"
          limit="Valid tonight"
          holder="Andre"
          places="AFTRHRS"
          action="USE THIS"
          sceneMark="KAD"
          interactive={false}
          className="max-w-none"
        />
      </div>

      <section className="mt-7 border-t border-white/10 pt-6">
        <SectionLabel action="See calendar">Now & next</SectionLabel>
        <MiniMoment title="Dubwise Wednesdays" meta="Music · 9:00 PM · Kingston" live />
        <MiniMoment title="Late Plate · Barbican" meta="Food · 11:30 PM" />
      </section>
    </PhoneFrame>
  );
}

function CardScreen() {
  return (
    <PhoneFrame active="Card">
      <ScreenHeader
        eyebrow="Your access"
        title="Your PromoCard."
        copy="The card leads. Everything beneath it explains where it works, what is next, and what changed."
        action={<CreditCard className="mt-1 h-5 w-5 text-[#f6d48a]" />}
      />

      <div className="mt-6">
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

      <button type="button" className="mt-4 flex min-h-13 w-full items-center justify-between rounded-full bg-primary px-5 text-sm font-black text-black shadow-[0_0_28px_rgba(255,85,0,.22)]">
        <span>Show this tonight</span>
        <ArrowRight className="h-4 w-4" />
      </button>

      <section className="mt-7 border-t border-white/10 pt-6">
        <SectionLabel>Use now</SectionLabel>
        <article className="rounded-[1.45rem] border border-[#f6d48a]/20 bg-[#f6d48a]/[0.06] p-4">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#f6d48a]">Sea Deck · tonight</p>
          <p className="mt-1 font-serif text-xl font-bold text-white">2-for-1 entry</p>
          <p className="mt-2 text-xs leading-5 text-white/42">Show the PromoCard at the door. It only becomes used after merchant validation.</p>
        </article>
      </section>

      <section className="mt-6">
        <SectionLabel action="Open Discover">Near you</SectionLabel>
        <MiniMoment title="Complimentary wings" meta="Sea Deck · 0.4 km" />
        <MiniMoment title="Late-night coffee" meta="Barbican · 0.8 km" />
      </section>

      <section className="mt-6">
        <SectionLabel>What changed</SectionLabel>
        <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.03] p-4">
          <p className="font-serif text-lg font-bold text-white">Your last return unlocked a new mark.</p>
          <p className="mt-1 text-xs leading-5 text-white/42">Kingston After Dark · first verified return.</p>
        </div>
      </section>
    </PhoneFrame>
  );
}

function VaultShelf({ title, copy, children }: { title: string; copy: string; children: ReactNode }) {
  return (
    <section className="mt-7 border-t border-white/10 pt-6 first:mt-6 first:border-t-0 first:pt-0">
      <div className="mb-4">
        <p className="font-serif text-2xl font-bold text-white">{title}</p>
        <p className="mt-1 text-xs leading-5 text-white/38">{copy}</p>
      </div>
      {children}
    </section>
  );
}

function VaultScreen() {
  return (
    <PhoneFrame active="Vault">
      <ScreenHeader
        eyebrow="What stays with you"
        title="The Vault."
        copy="Not a balance dashboard. A record of access, proof, things kept, and usable value."
        action={<LockKeyhole className="mt-1 h-5 w-5 text-violet-200" />}
      />

      <VaultShelf title="Access" copy="Things you can still use.">
        <TicketPass kicker="TONIGHT" title="AFTRHRS" detail="Sea Deck · Barbican · physical access retained on your account." stub="AFT-0916" stubLabel="ACCESS" />
      </VaultShelf>

      <VaultShelf title="Proof" copy="Things PROMORANG can verify happened.">
        <PaperReceipt
          heading="RETURN RECORDED"
          lines={[
            { label: "Moment", value: "AFTRHRS" },
            { label: "Place", value: "Sea Deck" },
            { label: "Used", value: "2-for-1 entry", strong: true },
            { label: "Time", value: "11:08 PM" },
          ]}
          footer="Proof should feel kept, not buried in activity history."
        />
      </VaultShelf>

      <VaultShelf title="Kept" copy="Identity, provenance and cultural memory.">
        <CollectibleRelic
          serial="PIECE · KAD-0042"
          title="The City Wakes"
          origin="Kept after a verified night in Barbican."
          perk="Marks your first Kingston After Dark return."
          scene="Kingston After Dark"
          place="Barbican"
        />
      </VaultShelf>

      <VaultShelf title="Value" copy="Useful balances stay legible, but they do not dominate the Vault.">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.035] p-4">
            <Gem className="h-4 w-4 text-cyan-300" />
            <p className="mt-4 text-2xl font-black text-white">18</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-white/35">Gems</p>
          </div>
          <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.035] p-4">
            <Ticket className="h-4 w-4 text-violet-200" />
            <p className="mt-4 text-2xl font-black text-white">7</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-white/35">Draw tickets</p>
          </div>
        </div>
      </VaultShelf>
    </PhoneFrame>
  );
}

function EditorialDiscovery({ kicker, title, meta, tall }: { kicker: string; title: string; meta: string; tall?: boolean }) {
  return (
    <article className={`relative overflow-hidden rounded-[1.55rem] border border-white/10 bg-[#151516] ${tall ? "min-h-64" : "min-h-44"}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_74%_16%,rgba(255,85,0,.5),transparent_28%),linear-gradient(155deg,#24130d,#111112_60%)]" />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-5 pt-16">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">{kicker}</p>
        <p className="mt-1 font-serif text-2xl font-bold leading-[0.95] text-white">{title}</p>
        <p className="mt-2 text-xs text-white/45">{meta}</p>
      </div>
      <Bookmark className="absolute right-4 top-4 h-4 w-4 text-white/60" />
    </article>
  );
}

function DiscoverScreen() {
  return (
    <PhoneFrame active="Discover">
      <ScreenHeader
        eyebrow="Kingston · Tuesday"
        title="Find what moves you."
        copy="Discovery is editorial and contextual: what is live, nearby, culturally relevant, or worth crossing town for."
        action={<Search className="mt-1 h-5 w-5 text-white/55" />}
      />

      <div className="mt-5 flex gap-2 overflow-hidden">
        {["Tonight", "Food", "Music", "Perks"].map((label, index) => (
          <button key={label} type="button" className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-bold ${index === 0 ? "border-primary bg-primary text-black" : "border-white/12 bg-white/[0.025] text-white/55"}`}>
            {label}
          </button>
        ))}
      </div>

      <section className="mt-7">
        <SectionLabel action="View all">Happening now</SectionLabel>
        <EditorialDiscovery kicker="Live · Barbican" title="AFTRHRS" meta="House · Sea Deck · until late" tall />
      </section>

      <section className="mt-7 border-t border-white/10 pt-6">
        <SectionLabel>Worth crossing town for</SectionLabel>
        <div className="grid grid-cols-2 gap-3">
          <EditorialDiscovery kicker="Culture" title="Dub Club" meta="Sunday · Skyline" />
          <EditorialDiscovery kicker="Food" title="Late Plate" meta="Tonight · Barbican" />
        </div>
      </section>

      <section className="mt-7 border-t border-white/10 pt-6">
        <SectionLabel action="Map">Near you</SectionLabel>
        <MiniMoment title="Sea Deck" meta="0.4 km · 2 live benefits" live />
        <MiniMoment title="Oasis" meta="1.2 km · moment tomorrow" />
        <MiniMoment title="Dulce Lounge" meta="1.4 km · Thursday" />
      </section>

      <section className="mt-7 rounded-[1.5rem] border border-primary/20 bg-primary/[0.07] p-4">
        <div className="flex items-start gap-3">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div>
            <p className="font-serif text-xl font-bold text-white">Your city should feel alive.</p>
            <p className="mt-1 text-xs leading-5 text-white/42">Maps, categories and filters are supporting tools—not the first impression.</p>
          </div>
        </div>
      </section>
    </PhoneFrame>
  );
}

const screenNotes = [
  ["TODAY", "One current move → your card → now & next. No dashboard summary."],
  ["CARD", "The physical object owns the screen. Utility sits beneath it."],
  ["VAULT", "Access / Proof / Kept / Value replace economics-first tab architecture."],
  ["DISCOVER", "Editorial hierarchy first; search, map and filters support discovery."],
] as const;

export function CanonicalConsumerScreens() {
  return (
    <div>
      <div className="mb-10 grid gap-px overflow-hidden rounded-[1.7rem] border border-white/10 bg-white/10 md:grid-cols-2 xl:grid-cols-4">
        {screenNotes.map(([name, note], index) => (
          <article key={name} className="bg-[#101011] p-5">
            <p className="font-mono text-xs text-primary">0{index + 1}</p>
            <p className="mt-7 font-black tracking-[0.12em] text-white">{name}</p>
            <p className="mt-2 text-xs leading-5 text-white/42">{note}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-10 xl:grid-cols-2 2xl:grid-cols-4">
        <div>
          <p className="mb-4 text-center text-[10px] font-black uppercase tracking-[0.22em] text-white/35">Today</p>
          <TodayScreen />
        </div>
        <div>
          <p className="mb-4 text-center text-[10px] font-black uppercase tracking-[0.22em] text-white/35">Card</p>
          <CardScreen />
        </div>
        <div>
          <p className="mb-4 text-center text-[10px] font-black uppercase tracking-[0.22em] text-white/35">Vault</p>
          <VaultScreen />
        </div>
        <div>
          <p className="mb-4 text-center text-[10px] font-black uppercase tracking-[0.22em] text-white/35">Discover</p>
          <DiscoverScreen />
        </div>
      </div>
    </div>
  );
}

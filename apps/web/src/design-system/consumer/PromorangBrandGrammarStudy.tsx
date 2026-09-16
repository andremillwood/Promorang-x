import { useMemo, useState } from "react";
import {
  Archive,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  CircleDot,
  Compass,
  CreditCard,
  Footprints,
  Home,
  LockKeyhole,
  MapPin,
  Navigation,
  Orbit,
  Radio,
  Route,
  Search,
  ShieldCheck,
  Sparkles,
  Stamp,
  TicketCheck,
  Undo2,
  UserRound,
} from "lucide-react";
import { PromorangMark } from "@/components/promorang/PromorangMark";
import { CollectibleRelic, PaperReceipt, TicketPass } from "@/components/promorang/SignatureObjects";

const stock = {
  food: "https://images.pexels.com/photos/9219285/pexels-photo-9219285.jpeg?auto=compress&dpr=1&h=1200&w=1600",
  auto: "https://images.pexels.com/photos/7144200/pexels-photo-7144200.jpeg?auto=compress&dpr=1&h=1000&w=1500",
  beauty: "https://images.pexels.com/photos/10600178/pexels-photo-10600178.jpeg?auto=compress&dpr=1&h=900&w=1400",
  community: "https://images.pexels.com/photos/18999145/pexels-photo-18999145/free-photo-of-people-sitting-in-meeting-in-office.jpeg?auto=compress&dpr=1&h=900&w=1400",
  digital: "https://images.pexels.com/photos/5083606/pexels-photo-5083606.jpeg?auto=compress&dpr=1&h=900&w=1400",
  world: "https://images.pexels.com/photos/2868242/pexels-photo-2868242.jpeg?auto=compress&dpr=1&h=1000&w=1600",
} as const;

const palette = [
  ["Obsidian", "#0B0B0C", "Night · focus"],
  ["Clay", "#7A2E17", "Warmth · people"],
  ["Ochre", "#FF6A00", "Action · movement"],
  ["Sand", "#EADCC6", "Proof · objects"],
  ["Gold", "#F6C453", "Value · access"],
  ["Water", "#4CC6F0", "Information"],
  ["Leaf", "#22C55E", "Live · verified"],
] as const;

const navItems = [
  [Home, "Today"],
  [Compass, "Discover"],
  [CreditCard, "Card"],
  [LockKeyhole, "Vault"],
  [UserRound, "You"],
] as const;

const brandMarks = [
  { name: "Move", Icon: Footprints, copy: "Opportunity enters your path." },
  { name: "Explore", Icon: Route, copy: "People discover, cross, try and act." },
  { name: "Return", Icon: Undo2, copy: "Value comes back with proof." },
  { name: "Proof", Icon: Stamp, copy: "A verified mark of what happened." },
  { name: "Kept", Icon: Archive, copy: "The useful or meaningful thing remains." },
] as const;

const cardStates = ["Ready", "Showing", "Validating", "Used"] as const;
type CardState = (typeof cardStates)[number];

function ConsumerNav({ active }: { active: string }) {
  return (
    <nav className="grid grid-cols-5 border-t border-white/10 bg-[#080809]/95 px-2 pb-2 pt-3" aria-label="Consumer navigation specimen">
      {navItems.map(([Icon, label]) => (
        <button key={label} type="button" className={`flex min-h-12 flex-col items-center justify-center gap-1 text-[11px] font-bold ${active === label ? "text-[#ff6a00]" : "text-white/52"}`}>
          <Icon className="h-4 w-4" />
          {label}
        </button>
      ))}
    </nav>
  );
}

function Phone({ active, children }: { active: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-[870px] w-full max-w-[414px] flex-col overflow-hidden rounded-[2.65rem] border border-[#ff6a00]/35 bg-[#09090a] shadow-[0_32px_90px_rgba(0,0,0,.62)]">
      <div className="flex-1 overflow-hidden">{children}</div>
      <ConsumerNav active={active} />
    </div>
  );
}

function ReturnMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`grid place-items-center rounded-full border border-[#ff6a00]/35 bg-[#ff6a00]/10 text-[#ff6a00] ${compact ? "h-8 w-8" : "h-12 w-12"}`}>
      <Undo2 className={compact ? "h-4 w-4" : "h-6 w-6"} strokeWidth={1.8} />
    </span>
  );
}

function MarkChip({ name, Icon, active, onClick }: { name: string; Icon: React.ElementType; active?: boolean; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold transition ${active ? "border-[#ff6a00]/50 bg-[#ff6a00]/12 text-[#ffb06b]" : "border-white/10 bg-white/[0.025] text-white/58"}`}>
      <Icon className="h-3.5 w-3.5" />
      {name}
    </button>
  );
}

function TodayBrandStudy() {
  return (
    <Phone active="Today">
      <section className="relative min-h-[590px] overflow-hidden">
        <img src={stock.food} alt="Restaurant lunch placeholder" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/5 to-black" />

        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-5 pt-7">
          <div>
            <div className="flex items-center gap-2">
              <PromorangMark size={24} className="h-6 w-6" />
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-white/90">Kingston · 12:18 PM</p>
            </div>
            <p className="mt-1 pl-8 text-xs text-white/68">Liguanea · 8 min away</p>
          </div>
          <ReturnMark compact />
        </div>

        <div className="absolute inset-x-0 bottom-0 p-5 pb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#ff6a00] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-black">42 min left</span>
            <span className="rounded-full bg-black/58 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-white/86 backdrop-blur">Food & Taste</span>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-white/82">
            <span>Broken Plate</span><CheckCircle2 className="h-4 w-4 text-[#4cc6f0]" /><span className="text-white/45">Verified issuer</span>
          </div>
          <h3 className="mt-2 max-w-[340px] font-serif text-[2.65rem] font-bold leading-[0.9] tracking-[-0.05em] text-white">Lunch worth leaving the office for.</h3>
          <p className="mt-3 text-xl font-black text-[#f6c453]">20% off the chef's lunch menu</p>

          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[11px] font-semibold text-white/78">
            <span>★ 4.8</span><span className="inline-flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" />212 verified uses</span><span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />0.7 km</span>
          </div>
          <button type="button" className="mt-5 flex min-h-13 w-full items-center justify-between rounded-full bg-[#f6c453] px-5 text-sm font-black text-black shadow-[0_10px_30px_rgba(246,196,83,.16)]">
            <span>Use PromoCard</span><ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      <section className="px-5 py-5">
        <div className="flex items-start gap-3">
          <ReturnMark compact />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#ff8a33]">Why this returned to you</p>
            <p className="mt-1 text-sm font-semibold text-white/88">You've used 2 lunch benefits nearby.</p>
            <p className="mt-1 text-xs leading-5 text-white/48">PROMORANG learns from movement, not from an abstract profile quiz.</p>
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-white/58">
          <span className="inline-flex items-center gap-1.5"><Radio className="h-3.5 w-3.5 text-[#22c55e]" />Open until 3 PM</span>
          <span className="inline-flex items-center gap-1.5"><Navigation className="h-3.5 w-3.5" />Directions</span>
        </div>
      </section>
    </Phone>
  );
}

function DiscoverBrandStudy() {
  return (
    <Phone active="Discover">
      <div className="px-5 pb-5 pt-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#ff6a00]">For you · Kingston</p>
            <h3 className="mt-2 font-serif text-[2.4rem] font-bold leading-[0.9] tracking-[-0.05em]">Real opportunities. Near you.</h3>
          </div>
          <button type="button" className="grid h-10 w-10 place-items-center rounded-full border border-white/12" aria-label="Search"><Search className="h-4 w-4" /></button>
        </div>
        <div className="mt-5 flex gap-2 overflow-hidden">
          {["For you", "Nearby", "Trending", "Saved"].map((label, index) => (
            <button key={label} type="button" className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-bold ${index === 0 ? "bg-[#eadcc6] text-black" : "border border-white/12 text-white/65"}`}>{label}</button>
          ))}
        </div>
      </div>

      <article className="relative min-h-[300px] overflow-hidden border-y border-white/8">
        <img src={stock.auto} alt="Automotive placeholder" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/34 to-black/5" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#ff8a33]">Move · Automotive</p>
          <div className="mt-2 flex items-center gap-2 text-xs font-bold"><span>Flash Motors</span><CheckCircle2 className="h-4 w-4 text-[#4cc6f0]" /></div>
          <h4 className="mt-1 font-serif text-[2.2rem] font-bold leading-[0.92] tracking-[-0.04em]">Drive this today.</h4>
          <p className="mt-2 text-sm font-bold text-[#f6c453]">Priority Geely test-drive access</p>
          <div className="mt-3 flex items-center gap-4 text-xs text-white/65"><span>3 slots left</span><span>2.1 km</span><span>Today</span></div>
        </div>
      </article>

      <section className="px-5 py-5">
        <p className="text-[11px] font-black uppercase tracking-[0.14em] text-white/42">Tracks near you</p>
        {[
          [stock.beauty, "Barbican beauty partner", "An appointment just opened.", "1.1 km · Complimentary add-on", "Return"],
          [stock.community, "New Kingston workshop", "A room is forming around this.", "Saturday · Reserved seat", "Explore"],
          [stock.digital, "Creator drop", "Something useful just unlocked.", "Anywhere · 48 hours", "Kept"],
        ].map(([image, merchant, title, meta, mark]) => (
          <article key={title} className="grid grid-cols-[92px_1fr_auto] items-center gap-3 border-b border-white/10 py-4 last:border-b-0">
            <img src={image} alt="" className="h-[74px] w-[92px] rounded-xl object-cover" />
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-white/58">{merchant}</p>
              <p className="mt-1 line-clamp-2 text-[15px] font-bold leading-5 text-white">{title}</p>
              <p className="mt-1 text-xs text-white/46">{meta}</p>
            </div>
            <div className="flex flex-col items-center gap-2"><Bookmark className="h-4 w-4 text-white/35" /><span className="text-[9px] font-black uppercase tracking-[0.12em] text-[#ff8a33]">{mark}</span></div>
          </article>
        ))}
      </section>

      <section className="mx-5 mb-5 rounded-[1.35rem] border border-[#ff6a00]/20 bg-[#7a2e17]/12 p-4">
        <div className="flex items-start gap-3"><ReturnMark compact /><div><p className="text-sm font-bold">People you move with are saving this.</p><p className="mt-1 text-xs leading-5 text-white/50">3 people in your circle saved the workshop. Movement becomes context.</p></div></div>
      </section>
    </Phone>
  );
}

function PromoCardBrandStudy() {
  const [state, setState] = useState<CardState>("Ready");
  const stateMeta = useMemo(() => {
    if (state === "Showing") return { status: "Credential open", tone: "text-[#4cc6f0]", detail: "Merchant can scan now." };
    if (state === "Validating") return { status: "Validation in progress", tone: "text-[#f6c453]", detail: "Waiting for merchant confirmation." };
    if (state === "Used") return { status: "Used · proof kept", tone: "text-[#22c55e]", detail: "Receipt has returned to your Vault." };
    return { status: "Ready to use", tone: "text-[#22c55e]", detail: "Merchant validation required." };
  }, [state]);

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2">
        {cardStates.map((item) => <button key={item} type="button" onClick={() => setState(item)} className={`rounded-full border px-3.5 py-2 text-xs font-bold ${state === item ? "border-[#ff6a00]/50 bg-[#ff6a00]/12 text-[#ffb06b]" : "border-white/10 text-white/55"}`}>{item}</button>)}
      </div>

      <article className="overflow-hidden rounded-[2rem] border border-[#d49a35]/55 bg-[#09090a] shadow-[0_28px_80px_rgba(0,0,0,.55)]">
        <div className="grid gap-0 lg:grid-cols-[1.1fr_.9fr]">
          <div className="relative min-h-[410px] p-6 sm:p-8">
            <div className="absolute inset-y-0 right-0 w-px bg-[#d49a35]/20" />
            <div className="flex items-start justify-between gap-5">
              <div className="flex items-start gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-xl border border-[#d49a35]/35 bg-black"><PromorangMark size={40} className="h-10 w-10" /></span>
                <div><p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#ff6a00]">PROMORANG · PROMOCARD</p><p className="mt-1 text-sm font-bold text-white">Broken Plate <CheckCircle2 className="ml-1 inline h-4 w-4 text-[#4cc6f0]" /></p><p className="mt-1 text-xs text-white/38">Verified issuer</p></div>
              </div>
              <ReturnMark />
            </div>

            <div className="mt-16">
              <p className="text-xs font-semibold text-white/45">USE THIS</p>
              <h3 className="mt-1 font-serif text-5xl font-bold leading-[0.9] tracking-[-0.045em] text-[#f6c453]">20% off lunch</h3>
              <p className="mt-3 text-sm font-semibold text-white/72">Chef's lunch menu · Liguanea</p>
            </div>

            <div className="mt-9 flex flex-wrap gap-2">
              <span className="rounded-full border border-[#d49a35]/30 bg-[#d49a35]/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.13em] text-[#f6c453]">Food & Taste</span>
              <span className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-bold text-white/58">PC-004218</span>
            </div>
          </div>

          <div className="flex min-h-[410px] flex-col justify-between p-6 sm:p-8">
            <div>
              <p className={`text-[11px] font-black uppercase tracking-[0.14em] ${stateMeta.tone}`}>{stateMeta.status}</p>
              <p className="mt-2 text-xs leading-5 text-white/45">{stateMeta.detail}</p>
              <dl className="mt-8 grid grid-cols-2 gap-x-5 gap-y-5 text-xs">
                <div><dt className="text-white/35">VALID</dt><dd className="mt-1 font-bold text-white">Today · 12–3 PM</dd></div>
                <div><dt className="text-white/35">USES</dt><dd className="mt-1 font-bold text-white">1 remaining</dd></div>
                <div><dt className="text-white/35">ISSUED TO</dt><dd className="mt-1 font-bold text-white">Andre</dd></div>
                <div><dt className="text-white/35">VALIDATION</dt><dd className="mt-1 font-bold text-white">Merchant required</dd></div>
              </dl>
            </div>
            <button type="button" onClick={() => setState(state === "Ready" ? "Showing" : state === "Showing" ? "Validating" : state === "Validating" ? "Used" : "Ready")} className="mt-8 flex min-h-12 w-full items-center justify-between rounded-full bg-[#eadcc6] px-5 text-sm font-black text-black"><span>{state === "Ready" ? "Show credential" : state === "Showing" ? "Validate use" : state === "Validating" ? "Confirm merchant" : "View proof"}</span><ArrowRight className="h-4 w-4" /></button>
          </div>
        </div>
      </article>
    </div>
  );
}

function BrandElements() {
  const [selected, setSelected] = useState("Return");
  const current = brandMarks.find((mark) => mark.name === selected) ?? brandMarks[0];
  return (
    <div className="grid gap-8 xl:grid-cols-[1.05fr_.95fr]">
      <section className="border border-white/10 bg-[#0d0d0e] p-6 sm:p-8">
        <div className="grid gap-7 lg:grid-cols-[.72fr_1fr]">
          <div className="flex min-h-[300px] flex-col justify-between border-r border-white/10 pr-6">
            <div><p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#ff6a00]">The P</p><div className="mt-6 flex items-center gap-5"><PromorangMark size={96} className="h-24 w-24" /><Undo2 className="h-20 w-20 text-[#ff6a00]" strokeWidth={1.15} /></div></div>
            <p className="max-w-sm font-serif text-3xl font-bold leading-tight">Person + movement + return.</p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/38">Marks</p>
            <div className="mt-5 flex flex-wrap gap-2">{brandMarks.map(({ name, Icon }) => <MarkChip key={name} name={name} Icon={Icon} active={selected === name} onClick={() => setSelected(name)} />)}</div>
            <div className="mt-10 flex items-start gap-4"><span className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-[#ff6a00]/35 bg-[#ff6a00]/10 text-[#ff6a00]"><current.Icon className="h-6 w-6" /></span><div><p className="font-serif text-2xl font-bold">{current.name}</p><p className="mt-2 text-sm leading-6 text-white/52">{current.copy}</p></div></div>
          </div>
        </div>
      </section>

      <section className="border border-white/10 bg-[#0d0d0e] p-6 sm:p-8">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#ff6a00]">Earth · city · signal</p>
        <div className="mt-7 grid grid-cols-4 gap-5 sm:grid-cols-7">
          {palette.map(([name, color, role]) => <div key={name}><span className="block aspect-square rounded-full border border-white/10" style={{ backgroundColor: color }} /><p className="mt-2 text-xs font-bold text-white">{name}</p><p className="mt-1 text-[10px] leading-4 text-white/34">{role}</p></div>)}
        </div>
        <div className="mt-10 border-t border-white/10 pt-6"><p className="font-serif text-3xl font-bold">Rooted, modern, kinetic.</p><p className="mt-3 max-w-xl text-sm leading-6 text-white/48">The visual language uses path, return, earth and mark-making as original PROMORANG principles. It deliberately avoids copying culturally specific Indigenous artworks or sacred motifs.</p></div>
      </section>
    </div>
  );
}

function ObjectFamily() {
  return (
    <div className="grid gap-6 xl:grid-cols-4">
      <div className="xl:col-span-2"><PromoCardBrandStudy /></div>
      <div className="space-y-5"><TicketPass kicker="SATURDAY · 2 PM" title="A ROOM IS FORMING" detail="New Kingston · reserved workshop access." stub="MOVE-0216" stubLabel="ACCESS" /><PaperReceipt heading="RETURN RECORDED" lines={[{ label: "Issuer", value: "Broken Plate" }, { label: "Used", value: "20% off lunch", strong: true }, { label: "Place", value: "Liguanea" }, { label: "Proof", value: "Verified" }]} footer="What happened returns as proof." /></div>
      <div className="space-y-5"><CollectibleRelic serial="KEPT · 0042" title="A Moment Kept" origin="Kingston · returned through verified movement." perk="A memory is meaningful when it carries provenance." scene="Food & Taste" place="Liguanea" verifiedDate="Today" /><div className="rounded-[1.8rem] border border-[#d49a35]/30 bg-[#111112] p-5"><div className="flex items-center justify-between"><span className="grid h-11 w-11 place-items-center rounded-xl border border-[#ff6a00]/30 bg-black"><PromorangMark size={34} className="h-8 w-8" /></span><CircleDot className="h-6 w-6 text-[#ff6a00]" /></div><p className="mt-9 text-[10px] font-black uppercase tracking-[0.18em] text-[#ff8a33]">PROMOKEY</p><p className="mt-2 font-serif text-2xl font-bold">Creator Drop</p><p className="mt-2 text-sm leading-6 text-white/48">A compact access object for digital or gated opportunities.</p></div></div>
    </div>
  );
}

function WorldTreatment() {
  return (
    <section className="relative min-h-[420px] overflow-hidden border border-white/10">
      <img src={stock.world} alt="Landscape placeholder" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-black/12" />
      <div className="relative z-10 flex min-h-[420px] max-w-2xl flex-col justify-between p-8 sm:p-10">
        <div><p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#ff6a00]">World treatment</p><h3 className="mt-4 font-serif text-5xl font-bold leading-[0.92] tracking-[-0.05em]">Same city. A richer way to move through it.</h3></div>
        <div className="flex items-center gap-4"><ReturnMark /><div><p className="text-sm font-bold text-white">Real places. Real people. Real opportunity.</p><p className="mt-1 text-xs leading-5 text-white/48">PROMORANG adds movement and return—not a decorative theme layer.</p></div></div>
      </div>
    </section>
  );
}

export function PromorangBrandGrammarStudy() {
  return (
    <section className="border-t border-white/10 pt-20">
      <div className="grid gap-8 lg:grid-cols-[1fr_.58fr] lg:items-end">
        <div><p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ff6a00]">10 · PROMORANG brand grammar</p><h2 className="mt-4 max-w-5xl font-serif text-5xl font-bold leading-[0.88] tracking-[-0.06em] md:text-7xl">Movement that comes back with value.</h2></div>
        <div className="border-l border-[#ff6a00]/35 pl-5"><p className="font-serif text-2xl font-bold text-[#f6c453]">P · Return · Track · Mark · Keep</p><p className="mt-3 text-sm leading-6 text-white/48">The selected direction turns PROMORANG's identity into repeated product behavior: opportunity enters, people move, value returns, proof remains.</p></div>
      </div>

      <div className="mt-14"><BrandElements /></div>

      <div className="mt-16 grid gap-10 xl:grid-cols-2"><div><p className="mb-4 text-center text-[10px] font-black uppercase tracking-[0.22em] text-white/35">Today · branded movement</p><TodayBrandStudy /></div><div><p className="mb-4 text-center text-[10px] font-black uppercase tracking-[0.22em] text-white/35">Discover · tracks & opportunities</p><DiscoverBrandStudy /></div></div>

      <div className="mt-20 border-t border-white/10 pt-16"><div className="mb-10 max-w-3xl"><p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#ff6a00]">Object family</p><h3 className="mt-3 font-serif text-4xl font-bold tracking-[-0.04em]">Different contexts. One recognizable language.</h3><p className="mt-4 text-sm leading-6 text-white/48">PromoCard grants access; tickets open a Moment; receipts prove what happened; relics keep meaning; PromoKeys unlock compact gated experiences.</p></div><ObjectFamily /></div>

      <div className="mt-20"><WorldTreatment /></div>

      <div className="mt-16 grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-5">
        {brandMarks.map(({ name, Icon, copy }, index) => <article key={name} className="bg-[#0d0d0e] p-5"><div className="flex items-center justify-between"><span className="font-mono text-xs text-[#ff6a00]">0{index + 1}</span><Icon className="h-5 w-5 text-[#ff8a33]" /></div><p className="mt-8 font-serif text-2xl font-bold">{name}</p><p className="mt-2 text-xs leading-5 text-white/48">{copy}</p></article>)}
      </div>

      <p className="mt-8 text-xs leading-5 text-white/34">Brand rule: the P and return language should behave like Nike's swoosh or Spotify's wave system—recognizable through repetition, not pasted everywhere. Production imagery and merchant marks replace placeholders when available.</p>
    </section>
  );
}

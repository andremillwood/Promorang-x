import { useMemo, useState } from "react";
import {
  ArrowRight,
  Bookmark,
  CheckCircle2,
  Compass,
  CreditCard,
  Home,
  LockKeyhole,
  MapPin,
  Navigation,
  Radio,
  Search,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { PromorangMark } from "@/components/promorang/PromorangMark";

const stock = {
  food: "https://images.pexels.com/photos/9219285/pexels-photo-9219285.jpeg?auto=compress&dpr=1&h=1200&w=1600",
  auto: "https://images.pexels.com/photos/7144200/pexels-photo-7144200.jpeg?auto=compress&dpr=1&h=1000&w=1500",
  beauty: "https://images.pexels.com/photos/10600178/pexels-photo-10600178.jpeg?auto=compress&dpr=1&h=900&w=1400",
  community: "https://images.pexels.com/photos/18999145/pexels-photo-18999145/free-photo-of-people-sitting-in-meeting-in-office.jpeg?auto=compress&dpr=1&h=900&w=1400",
  digital: "https://images.pexels.com/photos/5083606/pexels-photo-5083606.jpeg?auto=compress&dpr=1&h=900&w=1400",
  kingston: "https://images.unsplash.com/photo-1579578160888-5f4ef4425b4b?auto=format&fit=crop&fm=jpg&q=78&w=2400",
} as const;

const navItems = [
  [Home, "Today"],
  [Compass, "Discover"],
  [CreditCard, "Card"],
  [LockKeyhole, "Vault"],
  [UserRound, "You"],
] as const;

const cardStates = ["Ready", "Showing", "Validating", "Used"] as const;
type CardState = (typeof cardStates)[number];
type MarkKind = "move" | "explore" | "return" | "proof" | "kept";

const markCopy: Record<MarkKind, { name: string; copy: string }> = {
  move: { name: "Move", copy: "Opportunity enters your path." },
  explore: { name: "Explore", copy: "You cross into something new." },
  return: { name: "Return", copy: "Value comes back with proof." },
  proof: { name: "Proof", copy: "A verified mark of what happened." },
  kept: { name: "Kept", copy: "The useful or meaningful thing remains." },
};

function BrandMark({ kind, size = 44, className = "" }: { kind: MarkKind; size?: number; className?: string }) {
  const common = { width: size, height: size, viewBox: "0 0 64 64", fill: "none", className, "aria-hidden": true } as const;

  if (kind === "move") {
    return (
      <svg {...common}>
        <path d="M12 43C19 24 35 14 52 18" stroke="#FF6A00" strokeWidth="5" strokeLinecap="round" />
        <path d="M44 11L54 18L46 28" stroke="#F6C453" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="43" r="4" fill="#7A2E17" />
      </svg>
    );
  }

  if (kind === "explore") {
    return (
      <svg {...common}>
        <path d="M10 44C18 22 30 46 39 26C44 15 51 18 55 11" stroke="#FF6A00" strokeWidth="4" strokeLinecap="round" strokeDasharray="1 9" />
        <circle cx="10" cy="44" r="4" fill="#F6C453" />
        <circle cx="39" cy="26" r="4" fill="#7A2E17" />
        <circle cx="55" cy="11" r="4" fill="#FF6A00" />
      </svg>
    );
  }

  if (kind === "return") {
    return (
      <svg {...common}>
        <path d="M48 19C39 10 22 13 16 26C11 37 17 49 29 50C39 51 47 44 48 35" stroke="#C65F1A" strokeWidth="6" strokeLinecap="round" />
        <path d="M12 24L17 13L28 17" stroke="#F6C453" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (kind === "proof") {
    return (
      <svg {...common}>
        <circle cx="32" cy="32" r="22" stroke="#FF6A00" strokeWidth="4" />
        <circle cx="32" cy="32" r="10" stroke="#F6C453" strokeWidth="3" />
        <circle cx="32" cy="32" r="3.5" fill="#FF6A00" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <rect x="12" y="12" width="40" height="40" rx="12" stroke="#F6C453" strokeWidth="3.5" />
      <circle cx="32" cy="32" r="11" fill="#7A2E17" stroke="#FF6A00" strokeWidth="3" />
      <circle cx="32" cy="32" r="3.5" fill="#EADCC6" />
    </svg>
  );
}

function ConsumerNav({ active }: { active: string }) {
  return (
    <nav className="grid grid-cols-5 border-t border-white/10 bg-[#080809]/95 px-2 pb-2 pt-3">
      {navItems.map(([Icon, label]) => (
        <button key={label} type="button" className={`flex min-h-12 flex-col items-center justify-center gap-1 text-[11px] font-bold ${active === label ? "text-[#ff6a00]" : "text-white/55"}`}>
          <Icon className="h-4 w-4" />
          {label}
        </button>
      ))}
    </nav>
  );
}

function Phone({ active, children }: { active: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-[870px] w-full max-w-[414px] flex-col overflow-hidden rounded-[2.65rem] border border-[#ff6a00]/28 bg-[#09090a] shadow-[0_32px_90px_rgba(0,0,0,.62)]">
      <div className="flex-1 overflow-hidden">{children}</div>
      <ConsumerNav active={active} />
    </div>
  );
}

function TodayFinal() {
  return (
    <Phone active="Today">
      <section className="relative min-h-[600px] overflow-hidden">
        <img src={stock.food} alt="Restaurant lunch placeholder" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/18 via-black/5 to-black" />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-5 pt-7">
          <div>
            <div className="flex items-center gap-2">
              <PromorangMark size={24} className="h-6 w-6" />
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-white/90">Kingston · 12:18 PM</p>
            </div>
            <p className="mt-1 pl-8 text-xs text-white/66">Liguanea · 8 min away</p>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-5 pb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#ff6a00] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-black">42 min left</span>
            <span className="rounded-full bg-black/58 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-white/86 backdrop-blur">Food & Taste</span>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-white/82"><span>Broken Plate</span><CheckCircle2 className="h-4 w-4 text-[#4cc6f0]" /><span className="text-white/45">Verified issuer</span></div>
          <h3 className="mt-2 max-w-[340px] font-serif text-[2.65rem] font-bold leading-[0.9] tracking-[-0.05em] text-white">Lunch worth leaving the office for.</h3>
          <p className="mt-3 text-xl font-black text-[#f6c453]">20% off the chef's lunch menu</p>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[11px] font-semibold text-white/78"><span>★ 4.8</span><span className="inline-flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" />212 verified uses</span><span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />0.7 km</span></div>
          <button type="button" className="mt-5 flex min-h-13 w-full items-center justify-between rounded-full bg-[#f6c453] px-5 text-sm font-black text-black"><span>Use PromoCard</span><ArrowRight className="h-4 w-4" /></button>
        </div>
      </section>

      <section className="px-5 py-5">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center"><BrandMark kind="return" size={40} /></div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#ff8a33]">Why this returned to you</p>
            <p className="mt-1 text-sm font-semibold text-white/88">You've used 2 lunch benefits nearby.</p>
            <p className="mt-1 text-xs leading-5 text-white/48">Movement creates the next recommendation.</p>
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-white/58"><span className="inline-flex items-center gap-1.5"><Radio className="h-3.5 w-3.5 text-[#22c55e]" />Open until 3 PM</span><span className="inline-flex items-center gap-1.5"><Navigation className="h-3.5 w-3.5" />Directions</span></div>
      </section>
    </Phone>
  );
}

function DiscoverFinal() {
  const rows: Array<[string, string, string, string, MarkKind]> = [
    [stock.beauty, "Barbican beauty partner", "An appointment just opened.", "1.1 km · Complimentary add-on", "return"],
    [stock.community, "New Kingston workshop", "A room is forming around this.", "Saturday · Reserved seat", "explore"],
    [stock.digital, "Creator drop", "Something useful just unlocked.", "Anywhere · 48 hours", "kept"],
  ];

  return (
    <Phone active="Discover">
      <div className="px-5 pb-5 pt-7">
        <div className="flex items-start justify-between gap-4"><div><p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#ff6a00]">For you · Kingston</p><h3 className="mt-2 font-serif text-[2.4rem] font-bold leading-[0.9] tracking-[-0.05em]">Real opportunities. Near you.</h3></div><button type="button" className="grid h-10 w-10 place-items-center rounded-full border border-white/12" aria-label="Search"><Search className="h-4 w-4" /></button></div>
        <div className="mt-5 flex gap-2 overflow-hidden">{["For you", "Nearby", "Trending", "Saved"].map((label, index) => <button key={label} type="button" className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-bold ${index === 0 ? "bg-[#eadcc6] text-black" : "border border-white/12 text-white/65"}`}>{label}</button>)}</div>
      </div>

      <article className="relative min-h-[300px] overflow-hidden border-y border-white/8">
        <img src={stock.auto} alt="Automotive placeholder" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/34 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5"><p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#ff8a33]">Move · Automotive</p><div className="mt-2 flex items-center gap-2 text-xs font-bold"><span>Flash Motors</span><CheckCircle2 className="h-4 w-4 text-[#4cc6f0]" /></div><h4 className="mt-1 font-serif text-[2.2rem] font-bold leading-[0.92]">Drive this today.</h4><p className="mt-2 text-sm font-bold text-[#f6c453]">Priority Geely test-drive access</p><div className="mt-3 flex items-center gap-4 text-xs text-white/65"><span>3 slots left</span><span>2.1 km</span><span>Today</span></div></div>
      </article>

      <section className="px-5 py-5">
        <p className="text-[11px] font-black uppercase tracking-[0.14em] text-white/42">Tracks near you</p>
        {rows.map(([image, merchant, title, meta, kind]) => (
          <article key={title} className="grid grid-cols-[92px_1fr_auto] items-center gap-3 border-b border-white/10 py-4 last:border-b-0">
            <img src={image} alt="" className="h-[74px] w-[92px] rounded-xl object-cover" />
            <div className="min-w-0"><p className="truncate text-xs font-bold text-white/58">{merchant}</p><p className="mt-1 line-clamp-2 text-[15px] font-bold leading-5 text-white">{title}</p><p className="mt-1 text-xs text-white/46">{meta}</p></div>
            <div className="flex flex-col items-center gap-1"><Bookmark className="h-4 w-4 text-white/30" /><BrandMark kind={kind} size={30} /><span className="text-[9px] font-black uppercase tracking-[0.12em] text-[#ff8a33]">{markCopy[kind].name}</span></div>
          </article>
        ))}
      </section>

      <section className="mx-5 mb-5 rounded-[1.35rem] border border-[#ff6a00]/18 bg-[#7a2e17]/10 p-4"><div className="flex items-start gap-3"><BrandMark kind="explore" size={38} /><div><p className="text-sm font-bold">People you move with are saving this.</p><p className="mt-1 text-xs leading-5 text-white/50">3 people in your circle saved the workshop.</p></div></div></section>
    </Phone>
  );
}

function PromoCardFinal() {
  const [state, setState] = useState<CardState>("Ready");
  const stateMeta = useMemo(() => {
    if (state === "Showing") return ["Credential open", "Merchant can scan now.", "#4cc6f0"] as const;
    if (state === "Validating") return ["Validation in progress", "Waiting for merchant confirmation.", "#f6c453"] as const;
    if (state === "Used") return ["Used · proof kept", "Receipt returned to Vault.", "#22c55e"] as const;
    return ["Ready to use", "Merchant validation required.", "#22c55e"] as const;
  }, [state]);

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2">{cardStates.map((item) => <button key={item} type="button" onClick={() => setState(item)} className={`rounded-full border px-3.5 py-2 text-xs font-bold ${state === item ? "border-[#ff6a00]/50 bg-[#ff6a00]/12 text-[#ffb06b]" : "border-white/10 text-white/55"}`}>{item}</button>)}</div>
      <article className="relative overflow-hidden rounded-[2rem] border border-[#d49a35]/55 bg-[radial-gradient(circle_at_83%_18%,rgba(122,46,23,.38),transparent_30%),linear-gradient(115deg,#080809_0%,#0b0b0c_56%,#1a0f0a_100%)] shadow-[0_28px_80px_rgba(0,0,0,.6)]">
        <div className="pointer-events-none absolute inset-0 opacity-[.12]" style={{ backgroundImage: "repeating-linear-gradient(115deg,transparent 0 18px,rgba(246,196,83,.12) 19px 20px,transparent 21px 40px)" }} />
        <div className="grid lg:grid-cols-[1.1fr_.9fr]">
          <div className="relative min-h-[410px] p-7 sm:p-8">
            <div className="flex items-start justify-between gap-5"><div className="flex items-start gap-3"><span className="grid h-12 w-12 place-items-center rounded-xl border border-[#d49a35]/35 bg-black"><PromorangMark size={40} className="h-10 w-10" /></span><div><p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#ff6a00]">PROMORANG · PROMOCARD</p><p className="mt-1 text-sm font-bold text-white">Broken Plate <CheckCircle2 className="ml-1 inline h-4 w-4 text-[#4cc6f0]" /></p><p className="mt-1 text-xs text-white/38">Verified issuer</p></div></div><BrandMark kind="proof" size={42} /></div>
            <div className="mt-16"><p className="text-xs font-semibold text-white/45">USE THIS</p><h3 className="mt-1 font-serif text-5xl font-bold leading-[0.9] tracking-[-0.045em] text-[#f6c453]">20% off lunch</h3><p className="mt-3 text-sm font-semibold text-white/72">Chef's lunch menu · Liguanea</p></div>
            <div className="mt-9 flex flex-wrap gap-2"><span className="rounded-full border border-[#d49a35]/30 bg-[#d49a35]/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.13em] text-[#f6c453]">Food & Taste</span><span className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-bold text-white/58">PC-004218</span></div>
          </div>
          <div className="relative flex min-h-[410px] flex-col justify-between border-l border-[#d49a35]/16 p-7 sm:p-8"><div className="absolute right-5 top-5 opacity-15"><BrandMark kind="return" size={96} /></div><div className="relative"><p className="text-[11px] font-black uppercase tracking-[0.14em]" style={{ color: stateMeta[2] }}>{stateMeta[0]}</p><p className="mt-2 text-xs leading-5 text-white/45">{stateMeta[1]}</p><dl className="mt-8 grid grid-cols-2 gap-5 text-xs"><div><dt className="text-white/35">VALID</dt><dd className="mt-1 font-bold">Today · 12–3 PM</dd></div><div><dt className="text-white/35">USES</dt><dd className="mt-1 font-bold">1 remaining</dd></div><div><dt className="text-white/35">ISSUED TO</dt><dd className="mt-1 font-bold">Andre</dd></div><div><dt className="text-white/35">VALIDATION</dt><dd className="mt-1 font-bold">Merchant required</dd></div></dl></div><button type="button" onClick={() => setState(state === "Ready" ? "Showing" : state === "Showing" ? "Validating" : state === "Validating" ? "Used" : "Ready")} className="relative mt-8 flex min-h-12 items-center justify-between rounded-full bg-[#eadcc6] px-5 text-sm font-black text-black"><span>{state === "Ready" ? "Show credential" : state === "Showing" ? "Validate use" : state === "Validating" ? "Confirm merchant" : "View proof"}</span><ArrowRight className="h-4 w-4" /></button></div>
        </div>
      </article>
    </div>
  );
}

function MaterialObjects() {
  return (
    <div className="grid gap-6 xl:grid-cols-4">
      <div className="xl:col-span-2"><PromoCardFinal /></div>
      <div className="space-y-5">
        <article className="relative overflow-hidden rounded-[1.5rem] bg-[#eadcc6] p-5 text-[#1c130d] shadow-[0_20px_55px_rgba(0,0,0,.28)]"><div className="absolute right-8 top-0 h-full border-l border-dashed border-[#7a2e17]/30" /><p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#a7441f]">Saturday · 2 PM</p><p className="mt-2 font-serif text-2xl font-bold">A ROOM IS FORMING</p><p className="mt-2 max-w-[75%] text-sm">New Kingston · reserved workshop access.</p><div className="mt-8 flex items-center justify-between"><BrandMark kind="move" size={34} /><span className="font-mono text-xs">MOVE-0216</span></div></article>
        <article className="relative overflow-hidden bg-[#fff9ec] p-5 text-[#1a120c] shadow-[0_18px_40px_rgba(0,0,0,.25)]" style={{ backgroundImage: "repeating-linear-gradient(0deg,transparent 0 19px,rgba(122,46,23,.07) 20px)" }}><p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-[#7a2e17]/60">PROMORANG</p><p className="mt-2 text-center font-serif text-xl font-bold">RETURN RECORDED</p><div className="mt-5 space-y-2 border-y border-dashed border-[#7a2e17]/25 py-4 font-mono text-[11px]"><div className="flex justify-between"><span>Issuer</span><span>Broken Plate</span></div><div className="flex justify-between"><span>Used</span><strong>20% off lunch</strong></div><div className="flex justify-between"><span>Place</span><span>Liguanea</span></div><div className="flex justify-between"><span>Proof</span><span>Verified</span></div></div><div className="mt-4 flex items-center justify-center"><BrandMark kind="proof" size={34} /></div></article>
      </div>
      <div className="space-y-5">
        <article className="relative overflow-hidden rounded-[1.8rem] border border-[#8b65a4]/40 bg-[radial-gradient(circle_at_85%_15%,rgba(181,162,255,.15),transparent_32%),#17121d] p-5 shadow-[inset_0_0_30px_rgba(181,162,255,.06)]"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#b5a2ff]/70">KEPT · 0042</p><p className="mt-4 font-serif text-2xl font-bold">A Moment Kept</p><p className="mt-2 text-sm text-white/50">Kingston · returned through verified movement.</p><div className="mt-8 flex items-center justify-between border-t border-white/10 pt-4"><span className="text-xs text-white/45">Food & Taste · Today</span><BrandMark kind="kept" size={34} /></div></article>
        <article className="relative overflow-hidden rounded-[1.8rem] border border-[#d49a35]/30 bg-[#111112] p-5"><div className="flex items-center justify-between"><span className="grid h-11 w-11 place-items-center rounded-xl border border-[#ff6a00]/30 bg-black"><PromorangMark size={34} className="h-8 w-8" /></span><BrandMark kind="move" size={34} /></div><p className="mt-9 text-[10px] font-black uppercase tracking-[0.18em] text-[#ff8a33]">PROMOKEY</p><p className="mt-2 font-serif text-2xl font-bold">Creator Drop</p><p className="mt-2 text-sm leading-6 text-white/48">Compact gated access. Small object, clear use.</p></article>
      </div>
    </div>
  );
}

function WorldFinal() {
  return (
    <section className="relative min-h-[440px] overflow-hidden border border-white/10">
      <img src={stock.kingston} alt="Aerial view of Kingston, Jamaica placeholder" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/58 to-black/12" />
      <div className="relative z-10 flex min-h-[440px] max-w-3xl flex-col justify-between p-8 sm:p-10">
        <div><p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#ff6a00]">Kingston · world treatment</p><h3 className="mt-4 max-w-2xl font-serif text-5xl font-bold leading-[0.92] tracking-[-0.05em]">Same city. A richer way to move through it.</h3></div>
        <div className="flex max-w-xl items-start gap-4"><BrandMark kind="explore" size={48} /><div><p className="text-sm font-bold">Real place. Real movement. Real return.</p><p className="mt-1 text-xs leading-5 text-white/50">The mark appears once because it means something: this surface is about moving through Kingston, not decorating it.</p></div></div>
      </div>
    </section>
  );
}

function MotionGrammar() {
  const sequence: MarkKind[] = ["move", "explore", "return", "proof", "kept"];
  return (
    <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-5">
      {sequence.map((kind, index) => (
        <article key={kind} className="bg-[#0d0d0e] p-5"><div className="flex items-center justify-between"><span className="font-mono text-xs text-[#ff6a00]">0{index + 1}</span><BrandMark kind={kind} size={38} /></div><p className="mt-7 font-serif text-2xl font-bold">{markCopy[kind].name}</p><p className="mt-2 text-xs leading-5 text-white/48">{markCopy[kind].copy}</p></article>
      ))}
    </div>
  );
}

export function PromorangBrandGrammarFinal() {
  return (
    <section className="border-t border-white/10 pt-20">
      <div className="grid gap-8 lg:grid-cols-[1fr_.58fr] lg:items-end">
        <div><p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ff6a00]">11 · PROMORANG brand grammar · final discipline pass</p><h2 className="mt-4 max-w-5xl font-serif text-5xl font-bold leading-[0.88] tracking-[-0.06em] md:text-7xl">Recognizable because it means something.</h2></div>
        <div className="border-l border-[#ff6a00]/35 pl-5"><p className="font-serif text-2xl font-bold text-[#f6c453]">Utility familiar. Brand meaning proprietary.</p><p className="mt-3 text-sm leading-6 text-white/48">Five marks now have five jobs. The return arc is no longer wallpaper. Kingston replaces generic world imagery. Objects gain material identity without losing clarity.</p></div>
      </div>

      <div className="mt-14 grid gap-6 lg:grid-cols-5">
        {(Object.keys(markCopy) as MarkKind[]).map((kind) => <article key={kind} className="border border-white/10 bg-[#0d0d0e] p-5"><BrandMark kind={kind} size={52} /><p className="mt-5 font-serif text-2xl font-bold">{markCopy[kind].name}</p><p className="mt-2 text-xs leading-5 text-white/48">{markCopy[kind].copy}</p></article>)}
      </div>

      <div className="mt-16 grid gap-10 xl:grid-cols-2"><div><p className="mb-4 text-center text-[10px] font-black uppercase tracking-[0.22em] text-white/35">Today · restrained brand signal</p><TodayFinal /></div><div><p className="mb-4 text-center text-[10px] font-black uppercase tracking-[0.22em] text-white/35">Discover · semantic marks</p><DiscoverFinal /></div></div>

      <div className="mt-20 border-t border-white/10 pt-16"><div className="mb-10 max-w-3xl"><p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#ff6a00]">Object family · material differentiation</p><h3 className="mt-3 font-serif text-4xl font-bold tracking-[-0.04em]">Access, proof and memory should feel different in the hand.</h3><p className="mt-4 text-sm leading-6 text-white/48">PromoCard is a credential; Ticket is tearable access; Receipt is returned proof; Relic is kept memory; PromoKey is compact gated access.</p></div><MaterialObjects /></div>

      <div className="mt-20"><WorldFinal /></div>

      <div className="mt-16"><MotionGrammar /></div>

      <div className="mt-10 grid gap-4 border border-white/10 bg-[#0d0d0e] p-6 md:grid-cols-4">
        <div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#ff6a00]">Rule 01</p><p className="mt-2 text-sm font-bold">One major brand gesture per viewport.</p></div>
        <div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#ff6a00]">Rule 02</p><p className="mt-2 text-sm font-bold">Marks must carry product meaning, not decoration.</p></div>
        <div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#ff6a00]">Rule 03</p><p className="mt-2 text-sm font-bold">World imagery must be contextually true.</p></div>
        <div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#ff6a00]">Rule 04</p><p className="mt-2 text-sm font-bold">Object material follows object purpose.</p></div>
      </div>
    </section>
  );
}

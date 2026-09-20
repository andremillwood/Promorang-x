import {
  ArrowRight,
  Bookmark,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Compass,
  CreditCard,
  Heart,
  Home,
  LockKeyhole,
  MapPin,
  Navigation,
  Radio,
  Search,
  ShieldCheck,
  Star,
  TicketCheck,
  UserRound,
  UsersRound,
} from "lucide-react";

const stock = {
  food: "https://images.pexels.com/photos/9219285/pexels-photo-9219285.jpeg?auto=compress&dpr=1&h=1000&w=1600",
  auto: "https://images.pexels.com/photos/7144200/pexels-photo-7144200.jpeg?auto=compress&dpr=1&h=900&w=1400",
  beauty: "https://images.pexels.com/photos/10600178/pexels-photo-10600178.jpeg?auto=compress&dpr=1&h=900&w=1400",
  community: "https://images.pexels.com/photos/18999145/pexels-photo-18999145/free-photo-of-people-sitting-in-meeting-in-office.jpeg?auto=compress&dpr=1&h=900&w=1400",
  digital: "https://images.pexels.com/photos/5083606/pexels-photo-5083606.jpeg?auto=compress&dpr=1&h=900&w=1400",
} as const;

const nav = [
  [Home, "Today"],
  [Compass, "Discover"],
  [CreditCard, "Card"],
  [LockKeyhole, "Vault"],
  [UserRound, "You"],
] as const;

function ConsumerNav({ active }: { active: string }) {
  return (
    <nav className="grid grid-cols-5 border-t border-white/10 bg-[#080809]/95 px-2 pb-2 pt-3" aria-label="Consumer navigation specimen">
      {nav.map(([Icon, label]) => (
        <button
          key={label}
          type="button"
          className={`flex min-h-12 flex-col items-center justify-center gap-1 text-[11px] font-bold ${active === label ? "text-primary" : "text-white/55"}`}
        >
          <Icon className="h-4 w-4" />
          {label}
        </button>
      ))}
    </nav>
  );
}

function Phone({ active, children }: { active: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-[860px] w-full max-w-[414px] flex-col overflow-hidden rounded-[2.65rem] border border-white/15 bg-[#09090a] shadow-[0_32px_90px_rgba(0,0,0,.58)]">
      <div className="flex-1 overflow-hidden">{children}</div>
      <ConsumerNav active={active} />
    </div>
  );
}

function TrustRow() {
  return (
    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[11px] font-semibold text-white/78">
      <span className="inline-flex items-center gap-1.5"><Star className="h-3.5 w-3.5 fill-current" />4.8</span>
      <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" />212 verified uses</span>
      <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />0.7 km</span>
    </div>
  );
}

function TodayMature() {
  return (
    <Phone active="Today">
      <section className="relative min-h-[575px] overflow-hidden">
        <img src={stock.food} alt="Restaurant lunch placeholder" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/5 to-black" />

        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-5 pt-7">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-white/90">Kingston · 12:18 PM</p>
            <p className="mt-1 text-xs font-medium text-white/70">Liguanea · 8 min away</p>
          </div>
          <button type="button" className="grid h-10 w-10 place-items-center rounded-full bg-black/45 text-white backdrop-blur-md" aria-label="Open profile">
            <UserRound className="h-4 w-4" />
          </button>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-5 pb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-black">42 min left</span>
            <span className="rounded-full bg-black/55 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-white/85 backdrop-blur">Recommended for you</span>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-white/82">
            <span>Broken Plate</span>
            <CheckCircle2 className="h-4 w-4 text-sky-300" />
            <span className="text-white/45">Liguanea</span>
          </div>

          <h3 className="mt-2 max-w-[340px] font-serif text-[2.65rem] font-bold leading-[0.9] tracking-[-0.05em] text-white">Lunch worth leaving the office for.</h3>
          <p className="mt-3 text-xl font-black text-[#f6d48a]">20% off the chef's lunch menu</p>
          <TrustRow />

          <button type="button" className="mt-5 flex min-h-13 w-full items-center justify-between rounded-full bg-white px-5 text-sm font-black text-black">
            <span>Use PromoCard</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      <section className="px-5 py-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-white/45">Why this surfaced</p>
            <p className="mt-1 text-sm font-semibold text-white/86">You've used 2 lunch benefits nearby.</p>
          </div>
          <button type="button" className="text-xs font-bold text-primary">Tune</button>
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-white/55">
          <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" />Valid 12–3 PM</span>
          <span className="inline-flex items-center gap-1.5"><Navigation className="h-3.5 w-3.5" />Directions</span>
        </div>
      </section>
    </Phone>
  );
}

function HeroDiscovery() {
  return (
    <article className="relative min-h-[300px] overflow-hidden">
      <img src={stock.auto} alt="Automotive placeholder" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/5" />
      <button type="button" className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-black/45 backdrop-blur" aria-label="Save">
        <Bookmark className="h-4 w-4" />
      </button>
      <div className="absolute inset-x-0 bottom-0 p-5">
        <div className="flex items-center gap-2 text-[11px] font-bold text-white/82">
          <span>Flash Motors</span><CheckCircle2 className="h-4 w-4 text-sky-300" /><span className="text-primary">AUTOMOTIVE</span>
        </div>
        <h4 className="mt-2 font-serif text-[2.2rem] font-bold leading-[0.92] tracking-[-0.04em]">Drive this today.</h4>
        <p className="mt-2 text-sm font-bold text-[#f6d48a]">Priority Geely test-drive access</p>
        <div className="mt-3 flex items-center gap-4 text-xs font-medium text-white/68">
          <span>3 slots left</span><span>2.1 km</span><span>Today</span>
        </div>
      </div>
    </article>
  );
}

function CompactDiscoveryRow({ image, merchant, title, meta, saved }: { image: string; merchant: string; title: string; meta: string; saved?: boolean }) {
  return (
    <article className="grid grid-cols-[104px_1fr_auto] items-center gap-3 border-b border-white/10 py-4 last:border-b-0">
      <img src={image} alt="" className="h-[82px] w-[104px] rounded-xl object-cover" />
      <div className="min-w-0">
        <p className="truncate text-xs font-bold text-white/62">{merchant}</p>
        <p className="mt-1 line-clamp-2 text-[15px] font-bold leading-5 text-white">{title}</p>
        <p className="mt-1 text-xs text-white/48">{meta}</p>
      </div>
      <Bookmark className={`h-4 w-4 ${saved ? "fill-primary text-primary" : "text-white/35"}`} />
    </article>
  );
}

function DiscoverMature() {
  return (
    <Phone active="Discover">
      <div className="px-5 pb-5 pt-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-primary">For you · Kingston</p>
            <h3 className="mt-2 font-serif text-[2.45rem] font-bold leading-[0.9] tracking-[-0.05em]">Worth your attention.</h3>
          </div>
          <button type="button" className="grid h-10 w-10 place-items-center rounded-full border border-white/10" aria-label="Search"><Search className="h-4 w-4" /></button>
        </div>
        <div className="mt-5 flex gap-2 overflow-hidden">
          {["For you", "Nearby", "Today", "Saved"].map((label, index) => (
            <button key={label} type="button" className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-bold ${index === 0 ? "bg-white text-black" : "border border-white/12 text-white/65"}`}>{label}</button>
          ))}
        </div>
      </div>

      <HeroDiscovery />

      <section className="px-5 py-5">
        <div className="mb-1 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-white/40">Near you now</p>
            <p className="mt-1 text-sm font-semibold">3 useful openings within 2 km</p>
          </div>
          <button type="button" className="text-xs font-bold text-primary">Map</button>
        </div>
        <CompactDiscoveryRow image={stock.beauty} merchant="Barbican beauty partner" title="An appointment just opened." meta="1.1 km · Complimentary add-on" />
        <CompactDiscoveryRow image={stock.community} merchant="New Kingston workshop" title="A room is forming around this." meta="Saturday · Reserved seat" saved />
      </section>

      <section className="mx-5 mb-5 rounded-[1.35rem] border border-white/10 bg-white/[0.035] p-4">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/12 text-primary"><UsersRound className="h-4 w-4" /></div>
          <div>
            <p className="text-sm font-bold">People you move with are saving this.</p>
            <p className="mt-1 text-xs leading-5 text-white/50">3 people in your Kingston After Dark circle saved the workshop.</p>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 px-5 py-4">
        <div className="flex items-center justify-between text-xs font-semibold text-white/58">
          <span className="inline-flex items-center gap-1.5"><Radio className="h-3.5 w-3.5 text-emerald-300" />12 live opportunities</span>
          <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />Kingston</span>
        </div>
      </section>
    </Phone>
  );
}

function CredentialStudy() {
  return (
    <div className="overflow-hidden rounded-[2.1rem] border border-[#d6b25a]/45 bg-[radial-gradient(circle_at_90%_10%,rgba(255,85,0,.22),transparent_32%),linear-gradient(145deg,#111112,#050506)] p-6 shadow-[0_28px_70px_rgba(0,0,0,.5)]">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">PROMORANG · PROMOCARD</p>
          <div className="mt-3 flex items-center gap-2 text-sm font-bold text-white">
            <span>Broken Plate</span>
            <CheckCircle2 className="h-4 w-4 text-sky-300" />
            <span className="text-white/40">ISSUER</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-300">READY TO USE</p>
          <p className="mt-2 font-mono text-xs text-white/45">PC-004218</p>
        </div>
      </div>

      <div className="mt-14 grid gap-7 lg:grid-cols-[1fr_.72fr] lg:items-end">
        <div>
          <p className="text-xs font-semibold text-white/48">USE THIS</p>
          <h3 className="mt-1 font-serif text-5xl font-bold leading-[0.9] tracking-[-0.04em] text-[#f6d48a]">20% off lunch</h3>
          <p className="mt-3 text-sm font-semibold text-white/72">Chef's lunch menu · Liguanea</p>
        </div>
        <dl className="grid grid-cols-2 gap-x-5 gap-y-4 text-xs">
          <div><dt className="text-white/35">VALID</dt><dd className="mt-1 font-bold text-white">Today · 12–3 PM</dd></div>
          <div><dt className="text-white/35">USES</dt><dd className="mt-1 font-bold text-white">1 remaining</dd></div>
          <div><dt className="text-white/35">STATUS</dt><dd className="mt-1 inline-flex items-center gap-1.5 font-bold text-emerald-300"><TicketCheck className="h-3.5 w-3.5" />Active</dd></div>
          <div><dt className="text-white/35">ISSUED TO</dt><dd className="mt-1 font-bold text-white">Andre</dd></div>
        </dl>
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-[#d6b25a]/30 bg-[#d6b25a]/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.13em] text-[#f6d48a]">Food & Taste</span>
          <span className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-bold text-white/55">Merchant validated</span>
        </div>
        <button type="button" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-black text-black">Show credential <ArrowRight className="h-4 w-4" /></button>
      </div>
    </div>
  );
}

export function WorldClassConsumerStudyV2() {
  return (
    <section className="border-t border-white/10 pt-20">
      <div className="grid gap-8 lg:grid-cols-[1fr_.58fr] lg:items-end">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">09 · Consumer maturity study</p>
          <h2 className="mt-4 max-w-5xl font-serif text-5xl font-bold leading-[0.88] tracking-[-0.055em] md:text-7xl">Quieter. Smarter. More trustworthy.</h2>
        </div>
        <p className="border-l border-primary/35 pl-5 text-sm leading-6 text-white/55">
          One editorial moment owns the screen. Secondary opportunities use quieter sans-serif hierarchy. Trust, issuer, availability, proximity and social context carry the maturity—not more decoration.
        </p>
      </div>

      <div className="mt-14 grid gap-10 xl:grid-cols-2">
        <div>
          <p className="mb-4 text-center text-[10px] font-black uppercase tracking-[0.22em] text-white/38">Today · mature hierarchy</p>
          <TodayMature />
        </div>
        <div>
          <p className="mb-4 text-center text-[10px] font-black uppercase tracking-[0.22em] text-white/38">Discover · varied formats</p>
          <DiscoverMature />
        </div>
      </div>

      <div className="mt-16 border-t border-white/10 pt-12">
        <div className="grid gap-8 xl:grid-cols-[.7fr_1.3fr] xl:items-center">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">PromoCard credential v2</p>
            <h3 className="mt-3 font-serif text-4xl font-bold tracking-[-0.045em]">Premium should also mean legible.</h3>
            <p className="mt-4 text-sm leading-6 text-white/50">The credential keeps the dark premium object language, but gains issuer identity, status, serial, validity, remaining uses and a clearer merchant-verification state.</p>
          </div>
          <CredentialStudy />
        </div>
      </div>

      <div className="mt-14 grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-2 xl:grid-cols-5">
        {[
          ["01", "Editorial restraint", "One serif hero. Secondary content gets quieter typography."],
          ["02", "Content variety", "Hero, compact row, social signal and live-state modules are intentionally different."],
          ["03", "Trust", "Verified issuer, ratings, verified use, availability and terms are visible before action."],
          ["04", "Context", "Distance, time, saved state and people-you-move-with make the feed feel alive."],
          ["05", "Accessible utility", "Metadata is larger and higher contrast than earlier studies."],
        ].map(([num, title, copy]) => (
          <article key={num} className="bg-[#0d0d0e] p-5">
            <p className="font-mono text-xs text-primary">{num}</p>
            <p className="mt-5 text-sm font-black text-white">{title}</p>
            <p className="mt-2 text-xs leading-5 text-white/52">{copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

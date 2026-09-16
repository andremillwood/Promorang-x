import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import {
  ArrowRight,
  Bookmark,
  CalendarDays,
  Compass,
  CreditCard,
  Home,
  LockKeyhole,
  MapPin,
  Search,
  UserRound,
} from "lucide-react";
import SEO from "@/components/SEO";
import { PromoCardFace, PaperReceipt, TicketPass, CollectibleRelic } from "@/components/promorang/SignatureObjects";
import { PromorangMark } from "@/components/promorang/PromorangMark";
import { PromorangSemanticMark, type PromorangSemanticMarkKind } from "@/components/promorang/PromorangSemanticMark";

type Surface = "today" | "discover" | "card" | "vault" | "you";

type CardState = "ready" | "showing" | "validating" | "used";

const surfaces: Surface[] = ["today", "discover", "card", "vault", "you"];

const stock = {
  food: "https://images.pexels.com/photos/9219285/pexels-photo-9219285.jpeg?auto=compress&dpr=1&h=1000&w=1600",
  auto: "https://images.pexels.com/photos/7144200/pexels-photo-7144200.jpeg?auto=compress&dpr=1&h=900&w=1400",
  beauty: "https://images.pexels.com/photos/10600178/pexels-photo-10600178.jpeg?auto=compress&dpr=1&h=900&w=1400",
  community: "https://images.pexels.com/photos/18999145/pexels-photo-18999145/free-photo-of-people-sitting-in-meeting-in-office.jpeg?auto=compress&dpr=1&h=900&w=1400",
  digital: "https://images.pexels.com/photos/5083606/pexels-photo-5083606.jpeg?auto=compress&dpr=1&h=900&w=1400",
} as const;

const navItems: Array<[Surface, typeof Home, string]> = [
  ["today", Home, "Today"],
  ["discover", Compass, "Discover"],
  ["card", CreditCard, "Card"],
  ["vault", LockKeyhole, "Vault"],
  ["you", UserRound, "You"],
];

const discoverRows = [
  {
    title: "An appointment just opened.",
    issuer: "Barbican beauty partner",
    detail: "1.1 km · Complimentary treatment add-on",
    image: stock.beauty,
    mark: "return" as PromorangSemanticMarkKind,
  },
  {
    title: "A room is forming around this.",
    issuer: "New Kingston workshop",
    detail: "Saturday · 2 PM · Reserved seat",
    image: stock.community,
    mark: "explore" as PromorangSemanticMarkKind,
  },
  {
    title: "Something useful just unlocked.",
    issuer: "Creator drop",
    detail: "Anywhere · Available for 48 hours",
    image: stock.digital,
    mark: "kept" as PromorangSemanticMarkKind,
  },
];

function ReviewBadge() {
  return (
    <div className="fixed right-3 top-3 z-50 rounded-full border border-[#ff6a00]/35 bg-[#0b0b0c]/92 px-3 py-2 text-[9px] font-black uppercase tracking-[.16em] text-[#ff9a4d] shadow-xl backdrop-blur">
      Review data · illustrative
    </div>
  );
}

function ParticipantNav({ active }: { active: Surface }) {
  return (
    <nav className="sticky bottom-0 z-30 grid grid-cols-5 border-t border-white/10 bg-[#080809]/95 px-2 pb-[max(.55rem,env(safe-area-inset-bottom))] pt-2.5 backdrop-blur-xl">
      {navItems.map(([key, Icon, label]) => (
        <Link
          key={key}
          to={`/${key}`}
          className={`flex min-h-12 flex-col items-center justify-center gap-1 text-[11px] font-bold ${active === key ? "text-[#ff6a00]" : "text-white/55"}`}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
          {label}
        </Link>
      ))}
    </nav>
  );
}

function Shell({ active, children }: { active: Surface; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#080809] text-white selection:bg-[#ff6a00] selection:text-black">
      <ReviewBadge />
      <div className="mx-auto flex min-h-screen w-full max-w-[520px] flex-col border-x border-white/[0.06] bg-[#09090a] shadow-[0_0_90px_rgba(0,0,0,.6)]">
        <main className="flex-1">{children}</main>
        <ParticipantNav active={active} />
      </div>
    </div>
  );
}

function SurfaceHeader({ kicker, title, action }: { kicker: string; title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 pb-5 pt-7">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[.2em] text-[#ff6a00]">{kicker}</p>
        <h1 className="mt-2 font-serif text-[2.45rem] font-bold leading-[.9] tracking-[-.045em]">{title}</h1>
      </div>
      {action}
    </div>
  );
}

function MarkLabel({ kind, children }: { kind: PromorangSemanticMarkKind; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[.14em] text-[#ff9a4d]">
      <PromorangSemanticMark kind={kind} size={20} />
      {children}
    </span>
  );
}

function ReviewAction({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <button
      type="button"
      className={`flex min-h-12 w-full items-center justify-between rounded-full px-5 text-sm font-black ${light ? "bg-[#eadcc6] text-black" : "bg-[#f6c453] text-black"}`}
      onClick={() => undefined}
    >
      <span>{children}</span>
      <ArrowRight className="h-4 w-4" />
    </button>
  );
}

function TodaySurface() {
  return (
    <Shell active="today">
      <SEO title="Today — PROMORANG Review" description="Illustrative participant review surface." />
      <section className="relative min-h-[640px] overflow-hidden">
        <img src={stock.food} alt="Illustrative restaurant lunch" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/8 to-[#09090a]" />

        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-5 pt-7">
          <div className="flex items-start gap-2.5">
            <PromorangMark size={28} className="h-7 w-7 shrink-0" />
            <div>
              <p className="text-[11px] font-black uppercase tracking-[.16em] text-white/92">Kingston · 12:18 PM</p>
              <p className="mt-1 text-xs text-white/58">Liguanea · 8 min away</p>
            </div>
          </div>
          <Link to="/you" className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-black/25 backdrop-blur" aria-label="Open profile">
            <UserRound className="h-4 w-4" />
          </Link>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-5 pb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#ff6a00] px-3 py-1.5 text-[10px] font-black uppercase tracking-[.14em] text-black">42 min left</span>
            <span className="rounded-full bg-black/55 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.14em] text-white/85 backdrop-blur">Food & Taste</span>
          </div>
          <p className="mt-4 text-xs font-bold text-white/72">Broken Plate · Verified issuer</p>
          <h1 className="mt-2 max-w-[430px] font-serif text-[2.8rem] font-bold leading-[.88] tracking-[-.05em]">Lunch worth leaving the office for.</h1>
          <p className="mt-3 text-xl font-black text-[#f6c453]">20% off the chef&apos;s lunch menu</p>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-white/65">
            <span>★ 4.8</span>
            <span>212 verified uses</span>
            <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />0.7 km</span>
          </div>
          <div className="mt-5"><ReviewAction>Use PromoCard</ReviewAction></div>
        </div>
      </section>

      <section className="border-y border-white/10 px-5 py-5">
        <div className="flex items-start gap-3">
          <PromorangSemanticMark kind="return" size={42} className="shrink-0" />
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.16em] text-[#ff9a4d]">Why this returned to you</p>
            <p className="mt-1 font-serif text-xl font-bold">You&apos;ve used 2 lunch benefits nearby.</p>
            <p className="mt-1 text-xs leading-5 text-white/46">Movement creates the next recommendation.</p>
          </div>
        </div>
      </section>

      <section className="space-y-4 px-5 py-6">
        <div className="flex items-end justify-between gap-3">
          <div><p className="text-[10px] font-black uppercase tracking-[.18em] text-white/38">Your access</p><h2 className="mt-1 font-serif text-2xl font-bold">PromoCard</h2></div>
          <Link to="/card" className="text-xs font-black text-[#ff9a4d]">Open card</Link>
        </div>
        <PromoCardFace
          available="20% off lunch"
          limit="Chef's lunch menu · Liguanea"
          holder="Andre"
          places="Broken Plate · until 3 PM"
          action="Show credential"
          sceneMark="FOOD & TASTE"
          interactive={false}
        />
      </section>
    </Shell>
  );
}

function DiscoverSurface() {
  return (
    <Shell active="discover">
      <SEO title="Discover — PROMORANG Review" description="Illustrative discovery review surface." />
      <SurfaceHeader
        kicker="For you · Kingston"
        title="Real opportunities. Near you."
        action={<button type="button" className="grid h-10 w-10 place-items-center rounded-full border border-white/12" aria-label="Search"><Search className="h-4 w-4" /></button>}
      />
      <div className="flex gap-2 overflow-x-auto px-5 pb-5 [scrollbar-width:none]">
        <span className="shrink-0 rounded-full bg-[#eadcc6] px-3.5 py-2 text-xs font-bold text-black">For you</span>
        {['Nearby', 'Trending', 'Saved'].map((label) => <button key={label} type="button" className="shrink-0 rounded-full border border-white/12 px-3.5 py-2 text-xs font-bold text-white/65">{label}</button>)}
      </div>

      <section className="relative min-h-[360px] overflow-hidden border-y border-white/10">
        <img src={stock.auto} alt="Illustrative automotive opportunity" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <MarkLabel kind="move">Automotive</MarkLabel>
          <p className="mt-2 text-xs font-bold text-white/65">Flash Motors · Verified issuer</p>
          <h2 className="mt-1 font-serif text-[2.3rem] font-bold leading-[.92] tracking-[-.04em]">Drive this today.</h2>
          <p className="mt-2 text-sm font-semibold text-[#f6c453]">Priority Geely test-drive access</p>
          <div className="mt-3 flex gap-3 text-xs text-white/55"><span>3 slots left</span><span>2.1 km</span><span>Today</span></div>
        </div>
      </section>

      <section className="px-5 py-5">
        <p className="text-[10px] font-black uppercase tracking-[.16em] text-white/38">Tracks near you</p>
        <div className="mt-2 divide-y divide-white/10">
          {discoverRows.map((item) => (
            <button key={item.title} type="button" className="grid w-full grid-cols-[72px_1fr_auto] items-center gap-3 py-4 text-left">
              <img src={item.image} alt="" className="h-[62px] w-[72px] rounded-xl object-cover" />
              <div className="min-w-0"><p className="text-xs font-bold text-white/48">{item.issuer}</p><p className="mt-1 text-sm font-bold">{item.title}</p><p className="mt-1 text-xs text-white/42">{item.detail}</p></div>
              <PromorangSemanticMark kind={item.mark} size={28} />
            </button>
          ))}
        </div>
      </section>

      <section className="border-t border-white/10 px-5 py-5">
        <div className="rounded-[1.5rem] border border-[#7a2e17]/50 bg-[#7a2e17]/10 p-4">
          <div className="flex gap-3"><PromorangSemanticMark kind="explore" size={34} /><div><p className="text-sm font-bold">People you move with are saving this.</p><p className="mt-1 text-xs leading-5 text-white/42">3 people in your Kingston circle saved the workshop.</p></div></div>
        </div>
      </section>
    </Shell>
  );
}

function CardSurface() {
  const [state, setState] = useState<CardState>("ready");
  const stateCopy: Record<CardState, { title: string; detail: string; mark: PromorangSemanticMarkKind }> = {
    ready: { title: "READY TO USE", detail: "Merchant validation required.", mark: "move" },
    showing: { title: "CREDENTIAL SHOWING", detail: "Present this access object to the merchant.", mark: "move" },
    validating: { title: "VALIDATING", detail: "Merchant confirmation is in progress.", mark: "return" },
    used: { title: "USED · PROOF KEPT", detail: "The action has returned as verified proof.", mark: "proof" },
  };
  const current = stateCopy[state];

  return (
    <Shell active="card">
      <SEO title="PromoCard — PROMORANG Review" description="Illustrative credential review surface." />
      <SurfaceHeader kicker="Your access" title="PromoCard." />
      <div className="space-y-5 px-5 pb-7">
        <div className="flex gap-2 overflow-x-auto [scrollbar-width:none]">
          {(["ready", "showing", "validating", "used"] as CardState[]).map((key) => (
            <button key={key} type="button" onClick={() => setState(key)} className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-bold capitalize ${state === key ? "border-[#ff6a00]/60 bg-[#ff6a00]/10 text-[#ff9a4d]" : "border-white/10 text-white/45"}`}>{key}</button>
          ))}
        </div>

        <PromoCardFace
          available="20% off lunch"
          limit="Chef's lunch menu · Liguanea"
          holder="Andre"
          places="Broken Plate · today 12–3 PM"
          action={state === "used" ? "View proof" : "Show credential"}
          sceneMark="FOOD & TASTE"
          interactive={false}
        />

        <section className="rounded-[1.7rem] border border-[#d49a35]/25 bg-[radial-gradient(circle_at_100%_0%,rgba(122,46,23,.2),transparent_40%),#0d0d0e] p-5">
          <div className="flex items-start justify-between gap-3">
            <div><MarkLabel kind={current.mark}>{current.title}</MarkLabel><h2 className="mt-3 font-serif text-2xl font-bold">20% off lunch</h2></div>
            <PromorangSemanticMark kind={current.mark} size={38} />
          </div>
          <p className="mt-2 text-sm leading-6 text-white/55">{current.detail}</p>
          <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-white/10 pt-4 text-xs">
            <div><dt className="text-white/35">ISSUER</dt><dd className="mt-1 font-bold">Broken Plate</dd></div>
            <div><dt className="text-white/35">STATUS</dt><dd className="mt-1 font-bold">{current.title}</dd></div>
            <div><dt className="text-white/35">VALID</dt><dd className="mt-1 font-bold">Today · 12–3 PM</dd></div>
            <div><dt className="text-white/35">USES</dt><dd className="mt-1 font-bold">1 remaining</dd></div>
          </dl>
          <div className="mt-5"><ReviewAction light>{state === "used" ? "View proof" : "Show credential"}</ReviewAction></div>
        </section>
      </div>
    </Shell>
  );
}

function VaultSurface() {
  return (
    <Shell active="vault">
      <SEO title="Vault — PROMORANG Review" description="Illustrative Vault review surface." />
      <SurfaceHeader kicker="What stays with you" title="The Vault." />
      <div className="space-y-8 px-5 pb-8">
        <section>
          <div className="flex items-center gap-2"><PromorangSemanticMark kind="move" size={30} /><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#ff9a4d]">Access</p><p className="text-sm text-white/45">Things you can still use.</p></div></div>
          <div className="mt-4"><TicketPass kicker="SATURDAY · 2 PM" title="A ROOM IS FORMING" detail="New Kingston · reserved workshop access." stub="MOVE–0216" stubLabel="ACCESS" /></div>
        </section>

        <section>
          <div className="flex items-center gap-2"><PromorangSemanticMark kind="proof" size={30} /><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#ff9a4d]">Proof</p><p className="text-sm text-white/45">Verified things that happened.</p></div></div>
          <div className="mt-4"><PaperReceipt heading="RETURN RECORDED" lines={[{ label: "Issuer", value: "Broken Plate" }, { label: "Used", value: "20% off lunch", strong: true }, { label: "Place", value: "Liguanea" }, { label: "Proof", value: "Verified" }]} footer="What happened returns as proof." /></div>
        </section>

        <section>
          <div className="flex items-center gap-2"><PromorangSemanticMark kind="kept" size={30} /><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#ff9a4d]">Kept</p><p className="text-sm text-white/45">Meaningful things that remain.</p></div></div>
          <div className="mt-4"><CollectibleRelic serial="0042" title="A Moment Kept" origin="Kingston · returned through verified movement." perk="A memory is meaningful when it carries provenance." scene="FOOD & TASTE" place="Liguanea" verifiedDate="Today" /></div>
        </section>

        <section>
          <div className="flex items-center gap-2"><PromorangSemanticMark kind="return" size={30} /><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#ff9a4d]">Value</p><p className="text-sm text-white/45">Usable balances and possibility.</p></div></div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[['Points', '1,840', '#ff9a4d'], ['Tickets', '4', '#f6c453'], ['Gems', '12', '#4cc6f0']].map(([label, value, color]) => <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.025] p-4"><p className="text-[10px] font-black uppercase tracking-[.12em] text-white/38">{label}</p><p className="mt-2 text-xl font-black" style={{ color }}>{value}</p></div>)}
          </div>
        </section>
      </div>
    </Shell>
  );
}

function YouSurface() {
  return (
    <Shell active="you">
      <SEO title="You — PROMORANG Review" description="Illustrative participant identity review surface." />
      <div className="px-5 pb-7 pt-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl border border-[#d49a35]/30 bg-[radial-gradient(circle_at_80%_20%,rgba(122,46,23,.35),transparent_60%),#0d0d0e]"><PromorangMark size={46} className="h-11 w-11" /></div>
            <div><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#ff9a4d]">Your PROMORANG</p><h1 className="mt-1 font-serif text-3xl font-bold">Andre</h1><p className="mt-1 text-xs text-white/45">Participant · Kingston</p></div>
          </div>
          <span className="text-xs font-black text-white/35">Review</span>
        </div>

        <div className="mt-7 border-l border-[#ff6a00]/35 pl-4"><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#ff9a4d]">Identity</p><p className="mt-2 font-serif text-2xl font-bold">Moving through Kingston with access that leaves proof.</p></div>

        <section className="mt-8">
          <div className="flex items-center gap-2"><PromorangSemanticMark kind="explore" size={30} /><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#ff9a4d]">Belonging</p><p className="text-sm text-white/45">Scenes and rooms you move through.</p></div></div>
          <div className="mt-4 flex flex-wrap gap-2">{['Food & Taste', 'Move Jamaica', 'Kingston After Dark'].map((name) => <span key={name} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-bold">{name}</span>)}</div>
        </section>

        <section className="mt-8">
          <div className="flex items-center gap-2"><PromorangSemanticMark kind="proof" size={30} /><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#ff9a4d]">Participation</p><p className="text-sm text-white/45">Quiet proof, not vanity metrics.</p></div></div>
          <div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-2xl border border-white/10 p-4"><p className="text-[10px] font-black uppercase tracking-[.12em] text-white/35">Claimed</p><p className="mt-2 text-2xl font-black">8</p></div><div className="rounded-2xl border border-white/10 p-4"><p className="text-[10px] font-black uppercase tracking-[.12em] text-white/35">Used</p><p className="mt-2 text-2xl font-black">5</p></div></div>
        </section>

        <section className="mt-8 rounded-[1.6rem] border border-[#7a2e17]/45 bg-[#7a2e17]/10 p-5"><MarkLabel kind="return">Latest return</MarkLabel><p className="mt-3 font-serif text-2xl font-bold">Lunch use verified at Broken Plate.</p></section>

        <div className="mt-8 grid gap-2">{['Public profile', 'Following', 'Saved'].map((label, index) => <button key={label} type="button" className={`flex min-h-12 items-center justify-between ${index === 0 ? 'border-t' : ''} border-b border-white/10 text-sm font-bold`}>{label}{label === 'Saved' ? <Bookmark className="h-4 w-4 text-white/35" /> : <ArrowRight className="h-4 w-4 text-white/35" />}</button>)}</div>
      </div>
    </Shell>
  );
}

export default function ParticipantExperienceReviewV1() {
  const params = useParams();
  const surface = String(params.surface || "today").toLowerCase() as Surface;

  if (!surfaces.includes(surface)) return <Navigate to="/today" replace />;
  if (surface === "today") return <TodaySurface />;
  if (surface === "discover") return <DiscoverSurface />;
  if (surface === "card") return <CardSurface />;
  if (surface === "vault") return <VaultSurface />;
  return <YouSurface />;
}

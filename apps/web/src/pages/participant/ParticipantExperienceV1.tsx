import { useMemo } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import {
  ArrowRight,
  Bookmark,
  Compass,
  CreditCard,
  Home,
  LockKeyhole,
  MapPin,
  Search,
  UserRound,
} from "lucide-react";
import { firstGivenName, resolvePromoCardFace } from "@promorang/shared";
import SEO from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { useMarket } from "@/contexts/MarketContext";
import {
  useExperienceHome,
  useMyPromoCard,
  useNearbyBenefits,
  useWhatHappened,
} from "@/hooks/usePeopleExperience";
import { useCanonicalMomentFeed } from "@/hooks/useCanonicalMomentFeed";
import { usePromoShareRail } from "@/hooks/usePromoShareRail";
import { PromoCardFace, PaperReceipt, TicketPass, CollectibleRelic } from "@/components/promorang/SignatureObjects";
import { PromorangMark } from "@/components/promorang/PromorangMark";
import { PromorangSemanticMark, type PromorangSemanticMarkKind } from "@/components/promorang/PromorangSemanticMark";

type Surface = "today" | "discover" | "card" | "vault" | "you";

const surfaces: Surface[] = ["today", "discover", "card", "vault", "you"];

const navItems: Array<[Surface, typeof Home, string]> = [
  ["today", Home, "Today"],
  ["discover", Compass, "Discover"],
  ["card", CreditCard, "Card"],
  ["vault", LockKeyhole, "Vault"],
  ["you", UserRound, "You"],
];

function imageFor(value: any) {
  return value?.image_url || value?.imageUrl || value?.image || value?.media?.[0]?.url || value?.fulfillmentData?.image || null;
}

function hrefForBenefit(value: any) {
  if (value?.href) return value.href;
  if (value?.dropSlug) return `/drop/${value.dropSlug}`;
  return "/card";
}

function formatJamaicaDate(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString("en-JM", {
    timeZone: "America/Jamaica",
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function ParticipantNav({ active }: { active: Surface }) {
  return (
    <nav className="sticky bottom-0 z-30 grid grid-cols-5 border-t border-white/10 bg-[#080809]/95 px-2 pb-[max(.55rem,env(safe-area-inset-bottom))] pt-2.5 backdrop-blur-xl lg:rounded-b-[2rem]">
      {navItems.map(([key, Icon, label]) => (
        <Link key={key} to={`/${key}`} className={`flex min-h-12 flex-col items-center justify-center gap-1 text-[11px] font-bold ${active === key ? "text-[#ff6a00]" : "text-white/55"}`}>
          <Icon className="h-4 w-4" aria-hidden="true" />{label}
        </Link>
      ))}
    </nav>
  );
}

function RailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="border-b border-white/10 pb-6"><p className="text-[10px] font-black uppercase tracking-[.17em] text-[#ff9a4d]">{title}</p><div className="mt-4">{children}</div></section>;
}

function DesktopContextRail({ active, model }: { active: Surface; model: ReturnType<typeof useParticipantModel> }) {
  const benefits = model.nearby.data || [];
  const moments = model.momentFeed.data?.moments || [];
  const access = model.card.data?.benefits || model.card.data?.perks || [];
  const proof = model.card.data?.used || [];
  const communities = model.home.data?.communities || [];

  return (
    <aside className="sticky top-8 hidden max-h-[calc(100vh-4rem)] overflow-y-auto rounded-[2rem] border border-white/[0.07] bg-[#0b0b0c] p-6 text-white shadow-[0_28px_80px_rgba(0,0,0,.45)] lg:block">
      <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[.2em] text-[#ff6a00]">PROMORANG · WORLD</p><h2 className="mt-2 font-serif text-3xl font-bold leading-[.95]">{model.cityName} around you.</h2></div><PromorangMark size={34} /></div>

      {active === "today" ? <div className="mt-6 space-y-6"><RailSection title="Around you now"><div className="space-y-4">{benefits.slice(0, 3).map((item: any, index: number) => <div key={item.id || item.title || index} className="grid grid-cols-[52px_1fr] gap-3"><div className="h-12 w-[52px] overflow-hidden rounded-xl bg-white/[0.04]">{imageFor(item) ? <img src={imageFor(item)} alt="" className="h-full w-full object-cover" /> : null}</div><div><p className="text-sm font-bold">{item.title}</p><p className="mt-1 text-xs text-white/42">{item.detail || item.issuer?.name || "Available nearby"}</p></div></div>)}</div></RailSection><RailSection title="Moments"><div className="space-y-3">{moments.slice(0, 2).map((moment: any) => <div key={moment.id}><p className="text-sm font-bold">{moment.title}</p><p className="mt-1 text-xs text-white/42">{moment.venue_name || moment.location || formatJamaicaDate(moment.starts_at)}</p></div>)}</div></RailSection></div> : null}

      {active === "discover" ? <div className="mt-6 space-y-6"><RailSection title="Nearby"><p className="text-3xl font-black text-[#f6c453]">{benefits.length}</p><p className="mt-1 text-xs text-white/42">verified opportunities currently available</p></RailSection><RailSection title="Now & next"><div className="space-y-3">{moments.slice(0, 3).map((moment: any) => <div key={moment.id}><p className="text-sm font-bold">{moment.title}</p><p className="mt-1 text-xs text-white/42">{moment.venue_name || moment.location || formatJamaicaDate(moment.starts_at)}</p></div>)}</div></RailSection></div> : null}

      {active === "card" ? <div className="mt-6 space-y-6"><RailSection title="On your card"><div className="space-y-4">{access.slice(0, 4).map((item: any, index: number) => <div key={item.id || item.title || index}><p className="text-sm font-bold">{item.title}</p><p className="mt-1 text-xs text-white/42">{item.detail || item.issuer?.name || "PROMORANG access"}</p></div>)}</div></RailSection><RailSection title="Recent proof"><p className="text-sm font-bold">{proof[0]?.title || "No verified use yet"}</p><p className="mt-1 text-xs text-white/42">{proof[0] ? "Returned through merchant validation" : "Proof appears after validated use."}</p></RailSection></div> : null}

      {active === "vault" ? <div className="mt-6 space-y-6"><RailSection title="Latest additions"><div className="space-y-4">{proof.slice(0, 2).map((item: any, index: number) => <div key={item.id || item.title || index} className="flex gap-3"><PromorangSemanticMark kind="proof" size={28} /><div><p className="text-sm font-bold">{item.title || "Verified use"}</p><p className="mt-1 text-xs text-white/42">{item.place || item.location || "Recorded"}</p></div></div>)}</div></RailSection><RailSection title="Value"><div className="grid grid-cols-3 gap-2 text-center"><div><p className="text-xl font-black text-[#ff9a4d]">{model.balances.promoPoints}</p><p className="text-[10px] text-white/35">Points</p></div><div><p className="text-xl font-black text-[#f6c453]">{model.balances.promoShareTickets}</p><p className="text-[10px] text-white/35">Tickets</p></div><div><p className="text-xl font-black text-[#4cc6f0]">{model.balances.gems}</p><p className="text-[10px] text-white/35">Gems</p></div></div></RailSection></div> : null}

      {active === "you" ? <div className="mt-6 space-y-6"><RailSection title="Scenes"><div className="flex flex-wrap gap-2">{communities.slice(0, 8).map((community: any, index: number) => <span key={community.id || community.slug || index} className="rounded-full border border-white/10 px-3 py-2 text-xs font-bold text-white/65">{community.title || community.name || "Scene"}</span>)}</div></RailSection><RailSection title="Latest return"><p className="font-serif text-xl font-bold">{model.home.data?.world?.latestReturn?.heading || "No return recorded yet"}</p></RailSection></div> : null}
    </aside>
  );
}

function Shell({ active, model, children }: { active: Surface; model: ReturnType<typeof useParticipantModel>; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#080809] text-white selection:bg-[#ff6a00] selection:text-black">
      <div className="mx-auto w-full max-w-[1180px] lg:grid lg:grid-cols-[minmax(0,620px)_340px] lg:gap-8 lg:px-6 xl:grid-cols-[minmax(0,660px)_380px]">
        <div className="mx-auto flex min-h-screen w-full max-w-[520px] flex-col border-x border-white/[0.06] bg-[#09090a] shadow-[0_0_90px_rgba(0,0,0,.6)] lg:my-8 lg:min-h-[calc(100vh-4rem)] lg:max-w-none lg:overflow-hidden lg:rounded-[2rem] lg:border">
          <main className="flex-1">{children}</main><ParticipantNav active={active} />
        </div>
        <DesktopContextRail active={active} model={model} />
      </div>
    </div>
  );
}

function QuietState({ title, copy, action }: { title: string; copy: string; action?: React.ReactNode }) {
  return <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.025] p-5"><h2 className="font-serif text-2xl font-bold">{title}</h2><p className="mt-2 text-sm leading-6 text-white/50">{copy}</p>{action ? <div className="mt-4">{action}</div> : null}</div>;
}

function LoadingBlock({ className = "h-48" }: { className?: string }) {
  return <div className={`${className} animate-pulse rounded-[1.6rem] border border-white/10 bg-white/[0.035]`} />;
}

function SurfaceHeader({ kicker, title, action }: { kicker: string; title: string; action?: React.ReactNode }) {
  return <div className="flex items-start justify-between gap-4 px-5 pb-5 pt-7 sm:px-6"><div><p className="text-[10px] font-black uppercase tracking-[.2em] text-[#ff6a00]">{kicker}</p><h1 className="mt-2 font-serif text-[2.45rem] font-bold leading-[.9] tracking-[-.045em] sm:text-[2.8rem]">{title}</h1></div>{action}</div>;
}

function MarkLabel({ kind, children }: { kind: PromorangSemanticMarkKind; children: React.ReactNode }) {
  return <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[.14em] text-[#ff9a4d]"><PromorangSemanticMark kind={kind} size={20} />{children}</span>;
}

function TodaySurface({ model }: { model: ReturnType<typeof useParticipantModel> }) {
  const { home, card, momentFeed, givenName, cityName } = model;
  const world = home.data?.world;
  const currentMove = world?.currentMove || null;
  const moments = momentFeed.data?.moments || [];
  const moveHref = String(currentMove?.href || "");
  const matchedMoment = moments.find((moment: any) => moveHref && (moveHref.includes(String(moment.id)) || (moment.slug && moveHref.includes(String(moment.slug))))) || moments[0] || null;
  const heroImage = matchedMoment ? imageFor(matchedMoment) : null;
  const heroTitle = currentMove?.title || currentMove?.label || matchedMoment?.title || (card.data?.useThis?.title ? `Use ${card.data.useThis.title}` : "See what is worth doing now.");
  const heroDetail = currentMove?.detail || currentMove?.description || matchedMoment?.description || card.data?.useThis?.detail || null;
  const heroHref = currentMove?.href || (matchedMoment ? `/moments/${matchedMoment.slug || matchedMoment.id}` : "/discover");
  const timeLine = matchedMoment ? formatJamaicaDate(matchedMoment.starts_at) : null;
  const placeLine = matchedMoment?.venue_name || matchedMoment?.location || null;
  const latestReturn = world?.latestReturn?.heading || world?.latestMemory?.title || null;
  const access = card.data?.nearby || card.data?.benefits || card.data?.perks || [];

  return (
    <Shell active="today" model={model}>
      <SEO title="Today — PROMORANG" description="Your current PROMORANG move." />
      <section className={`relative overflow-hidden ${heroImage ? "min-h-[620px]" : "min-h-[520px]"} lg:min-h-[680px]`}>{heroImage ? <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover" /> : null}<div className={`absolute inset-0 ${heroImage ? "bg-gradient-to-b from-black/20 via-black/20 to-[#09090a]" : "bg-[radial-gradient(circle_at_75%_15%,rgba(122,46,23,.35),transparent_35%),linear-gradient(160deg,#15100d,#09090a_55%)]"}`} /><div className="absolute inset-x-0 top-0 flex items-start justify-between p-5 pt-7 sm:p-6"><div className="flex items-start gap-2.5"><PromorangMark size={28} className="h-7 w-7 shrink-0" /><div><p className="text-[11px] font-black uppercase tracking-[.16em] text-white/92">{cityName} · Today</p><p className="mt-1 text-xs text-white/58">For {givenName === "there" ? "you" : givenName}</p></div></div><Link to="/you" className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-black/25 backdrop-blur" aria-label="Open profile"><UserRound className="h-4 w-4" /></Link></div><div className="absolute inset-x-0 bottom-0 p-5 pb-6 sm:p-6"><MarkLabel kind="move">Your move</MarkLabel>{placeLine ? <p className="mt-3 text-xs font-bold text-white/72">{placeLine}</p> : null}<h1 className="mt-2 max-w-[470px] font-serif text-[2.8rem] font-bold leading-[.88] tracking-[-.05em] sm:text-[3.25rem]">{heroTitle}</h1>{heroDetail ? <p className="mt-3 max-w-md text-sm leading-6 text-white/68">{heroDetail}</p> : null}<div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-white/58">{timeLine ? <span>{timeLine}</span> : null}{placeLine ? <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{placeLine}</span> : null}</div><a href={heroHref} className="mt-5 flex min-h-12 w-full items-center justify-between rounded-full bg-[#f6c453] px-5 text-sm font-black text-black"><span>{currentMove?.label || "Open this"}</span><ArrowRight className="h-4 w-4" /></a></div></section>
      {latestReturn ? <section className="border-y border-white/10 px-5 py-5 sm:px-6"><div className="flex items-start gap-3"><PromorangSemanticMark kind="return" size={42} className="shrink-0" /><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#ff9a4d]">What returned</p><p className="mt-1 font-serif text-xl font-bold">{latestReturn}</p><p className="mt-1 text-xs leading-5 text-white/46">PROMORANG keeps the consequence visible after the action.</p></div></div></section> : null}
      <section className="space-y-4 px-5 py-6 sm:px-6"><div className="flex items-end justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-white/38">Your PromoCard</p><h2 className="mt-1 font-serif text-2xl font-bold">{access.length ? `${access.length} things ready` : "Your access"}</h2></div><Link to="/card" className="text-xs font-black text-[#ff9a4d]">Open card</Link></div>{card.isLoading ? <LoadingBlock className="h-44" /> : access.length ? <div className="divide-y divide-white/10 rounded-[1.5rem] border border-white/10 px-4">{access.slice(0, 3).map((item: any, index: number) => <a key={item.id || item.title || index} href={hrefForBenefit(item)} className="flex items-center gap-3 py-4"><PromorangSemanticMark kind="move" size={30} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{item.title}</p><p className="mt-1 truncate text-xs text-white/42">{item.detail || item.issuer?.name || "PROMORANG access"}</p></div><ArrowRight className="h-4 w-4 text-white/30" /></a>)}</div> : card.data ? <PromoCardFace model={model.cardFace} interactive={false} /> : <QuietState title="Your PromoCard is ready to be filled" copy="Discover something useful and take it onto your card." action={<Link to="/discover" className="text-sm font-black text-[#ff9a4d]">Explore opportunities →</Link>} />}</section>
    </Shell>
  );
}

function DiscoverSurface({ model }: { model: ReturnType<typeof useParticipantModel> }) {
  const benefits = model.nearby.data || [];
  const moments = model.momentFeed.data?.moments || [];
  const lead = benefits[0] || null;
  const rest = benefits.slice(1, 4);
  return (
    <Shell active="discover" model={model}>
      <SEO title="Discover — PROMORANG" description="Useful opportunities around you." />
      <SurfaceHeader kicker={`For you · ${model.cityName}`} title="Real opportunities. Near you." action={<a href="/search" className="grid h-10 w-10 place-items-center rounded-full border border-white/12" aria-label="Search"><Search className="h-4 w-4" /></a>} />
      <div className="flex gap-2 overflow-x-auto px-5 pb-5 sm:px-6 [scrollbar-width:none]"><span className="shrink-0 rounded-full bg-[#eadcc6] px-3.5 py-2 text-xs font-bold text-black">For you</span><a href="/discover?tab=perks" className="shrink-0 rounded-full border border-white/12 px-3.5 py-2 text-xs font-bold text-white/65">Nearby</a><a href="/discover?view=map" className="shrink-0 rounded-full border border-white/12 px-3.5 py-2 text-xs font-bold text-white/65">Map</a><a href="/saved" className="shrink-0 rounded-full border border-white/12 px-3.5 py-2 text-xs font-bold text-white/65">Saved</a></div>
      {model.nearby.isLoading ? <div className="px-5 sm:px-6"><LoadingBlock className="h-[360px]" /></div> : lead ? <a href={hrefForBenefit(lead)} className="relative block min-h-[380px] overflow-hidden border-y border-white/10">{imageFor(lead) ? <img src={imageFor(lead)} alt="" className="absolute inset-0 h-full w-full object-cover" /> : null}<div className={`absolute inset-0 ${imageFor(lead) ? "bg-gradient-to-t from-black via-black/45 to-black/15" : "bg-[radial-gradient(circle_at_80%_20%,rgba(122,46,23,.35),transparent_35%),#111112]"}`} /><div className="absolute inset-x-0 bottom-0 p-5 sm:p-6"><MarkLabel kind="move">Opportunity</MarkLabel><p className="mt-2 text-xs font-bold text-white/65">{lead.issuer?.name || lead.issuer_name || "PROMORANG partner"}</p><h2 className="mt-1 font-serif text-[2.3rem] font-bold leading-[.92] tracking-[-.04em] sm:text-[2.65rem]">{lead.title}</h2>{lead.detail ? <p className="mt-2 text-sm font-semibold text-[#f6c453]">{lead.detail}</p> : null}<div className="mt-3 flex flex-wrap gap-3 text-xs text-white/55">{lead.expiresAt ? <span>Until {new Date(lead.expiresAt).toLocaleDateString("en-JM")}</span> : null}{lead.availableQuantity != null ? <span>{lead.availableQuantity} available</span> : null}{lead.availability ? <span>{String(lead.availability)}</span> : null}</div></div></a> : <div className="px-5 sm:px-6"><QuietState title="Nothing nearby is verified yet" copy="PROMORANG will not invent availability. Open the wider discovery surface to browse moments, places and other live opportunities." action={<a href="/discover" className="text-sm font-black text-[#ff9a4d]">Open full Discover →</a>} /></div>}
      <section className="px-5 py-5 sm:px-6"><p className="text-[10px] font-black uppercase tracking-[.16em] text-white/38">Tracks near you</p><div className="mt-2 divide-y divide-white/10">{rest.map((benefit: any, index: number) => <a key={benefit.id || benefit.title || index} href={hrefForBenefit(benefit)} className="grid grid-cols-[72px_1fr_auto] items-center gap-3 py-4"><div className="h-[62px] w-[72px] overflow-hidden rounded-xl bg-white/[0.04]">{imageFor(benefit) ? <img src={imageFor(benefit)} alt="" className="h-full w-full object-cover" /> : null}</div><div className="min-w-0"><p className="text-xs font-bold text-white/48">{benefit.issuer?.name || benefit.issuer_name || "PROMORANG partner"}</p><p className="mt-1 truncate text-sm font-bold">{benefit.title}</p><p className="mt-1 truncate text-xs text-white/42">{benefit.detail || benefit.availability || "Open opportunity"}</p></div><PromorangSemanticMark kind="explore" size={28} /></a>)}</div></section>
      {moments.length ? <section className="border-t border-white/10 px-5 py-5 sm:px-6"><div className="flex items-end justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-white/38">Now & next</p><h2 className="mt-1 font-serif text-2xl font-bold">Moments</h2></div><a href="/discover/moments" className="text-xs font-black text-[#ff9a4d]">See all</a></div><div className="mt-3 space-y-3">{moments.slice(0, 3).map((moment: any) => <a key={moment.id} href={`/moments/${moment.slug || moment.id}`} className="grid grid-cols-[74px_1fr] gap-3 rounded-[1.25rem] border border-white/10 p-3"><div className="h-[68px] overflow-hidden rounded-xl bg-white/[0.04]">{imageFor(moment) ? <img src={imageFor(moment)} alt="" className="h-full w-full object-cover" /> : null}</div><div className="min-w-0 self-center"><p className="truncate font-bold">{moment.title}</p><p className="mt-1 truncate text-xs text-white/46">{moment.venue_name || moment.location || formatJamaicaDate(moment.starts_at)}</p></div></a>)}</div></section> : null}
    </Shell>
  );
}

function CardSurface({ model }: { model: ReturnType<typeof useParticipantModel> }) {
  const useThis = model.card.data?.useThis || null;
  const nearby = model.card.data?.nearby || [];
  const access = model.card.data?.benefits || model.card.data?.perks || nearby;
  const proof = model.card.data?.used || [];
  return (
    <Shell active="card" model={model}>
      <SEO title="PromoCard — PROMORANG" description="Your live PROMORANG credential." />
      <SurfaceHeader kicker="Your access" title="PromoCard." />
      <div className="space-y-7 px-5 pb-8 sm:px-6">{model.card.isLoading ? <LoadingBlock className="h-60" /> : model.card.data ? <PromoCardFace model={model.cardFace} /> : <QuietState title="Your card could not load" copy="Try the existing card flow while this new participant surface remains in preview." action={<a href="/card" className="text-sm font-black text-[#ff9a4d]">Open current PromoCard →</a>} />}{useThis ? <section className="rounded-[1.7rem] border border-[#d49a35]/25 bg-[radial-gradient(circle_at_100%_0%,rgba(122,46,23,.2),transparent_40%),#0d0d0e] p-5"><div className="flex items-start justify-between gap-3"><div><MarkLabel kind="move">Use now</MarkLabel><h2 className="mt-3 font-serif text-2xl font-bold">{useThis.title}</h2></div><PromorangSemanticMark kind={useThis.redemption?.recorded ? "proof" : "move"} size={38} /></div>{useThis.detail ? <p className="mt-2 text-sm leading-6 text-white/55">{useThis.detail}</p> : null}<dl className="mt-4 grid grid-cols-2 gap-4 border-t border-white/10 pt-4 text-xs"><div><dt className="text-white/35">ISSUER</dt><dd className="mt-1 font-bold">{useThis.issuer?.name || "PROMORANG partner"}</dd></div><div><dt className="text-white/35">STATUS</dt><dd className="mt-1 font-bold">{useThis.redemption?.recorded ? "Used · proof kept" : useThis.status || "Ready"}</dd></div><div><dt className="text-white/35">VALID</dt><dd className="mt-1 font-bold">{useThis.expiresAt ? `Until ${new Date(useThis.expiresAt).toLocaleDateString("en-JM")}` : "While available"}</dd></div><div><dt className="text-white/35">USES</dt><dd className="mt-1 font-bold">{useThis.availableQuantity == null ? "See terms" : `${useThis.availableQuantity} available`}</dd></div></dl><a href="/card" className="mt-5 flex min-h-12 items-center justify-between rounded-full bg-[#eadcc6] px-5 text-sm font-black text-black"><span>{useThis.redemption?.recorded ? "View proof" : "Show / use credential"}</span><ArrowRight className="h-4 w-4" /></a></section> : null}
        <section><div className="flex items-end justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-white/38">Also on your card</p><h2 className="mt-1 font-serif text-2xl font-bold">Useful next</h2></div><Link to="/discover" className="text-xs font-black text-[#ff9a4d]">Discover</Link></div><div className="mt-3 divide-y divide-white/10 rounded-[1.5rem] border border-white/10 px-4">{access.length ? access.slice(0, 4).map((benefit: any, index: number) => <a href={hrefForBenefit(benefit)} key={benefit.id || index} className="flex items-center gap-3 py-4"><PromorangSemanticMark kind="move" size={30} /><div className="min-w-0 flex-1"><p className="text-sm font-bold">{benefit.title}</p><p className="mt-1 text-xs text-white/44">{benefit.issuer?.name || benefit.detail || "Available"}</p></div><ArrowRight className="h-4 w-4 text-white/35" /></a>) : <p className="py-5 text-sm text-white/45">No other access is attached to your card yet.</p>}</div></section>
        {proof[0] ? <section><div className="flex items-center gap-2"><PromorangSemanticMark kind="proof" size={30} /><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#ff9a4d]">Recent return</p><p className="text-sm text-white/45">What happened came back as proof.</p></div></div><div className="mt-4"><PaperReceipt heading="RETURN RECORDED" lines={[{ label: "Issuer", value: proof[0].issuer?.name || "PROMORANG partner" }, { label: "Used", value: proof[0].title || "Benefit used", strong: true }, { label: "Place", value: proof[0].place || proof[0].location || "Recorded" }, { label: "Proof", value: "Verified" }]} footer="What happened returns as proof." /></div></section> : null}
      </div>
    </Shell>
  );
}

function VaultSurface({ model }: { model: ReturnType<typeof useParticipantModel> }) {
  const access = model.card.data?.benefits || model.card.data?.perks || [];
  const proof = model.card.data?.used || [];
  const memory = model.home.data?.world?.latestMemory || null;
  return (
    <Shell active="vault" model={model}>
      <SEO title="Vault — PROMORANG" description="Access, proof, kept things and usable value." />
      <SurfaceHeader kicker="What stays with you" title="The Vault." />
      <div className="space-y-8 px-5 pb-8 sm:px-6"><section><div className="flex items-center gap-2"><PromorangSemanticMark kind="move" size={30} /><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#ff9a4d]">Access</p><p className="text-sm text-white/45">Things you can still use.</p></div></div><div className="mt-4 space-y-3">{model.card.isLoading ? <LoadingBlock className="h-28" /> : access.length ? access.slice(0, 2).map((benefit: any, index: number) => <TicketPass key={benefit.id || index} kicker={benefit.expiresAt ? `VALID · ${new Date(benefit.expiresAt).toLocaleDateString("en-JM")}` : "ACCESS"} title={benefit.title} detail={benefit.detail || benefit.issuer?.name || "PROMORANG access"} stub={benefit.redemptionCode || benefit.redemption?.code || "CARD"} stubLabel="ACCESS" />) : <QuietState title="No active access yet" copy="When you take a usable opportunity, it will live here until it is used or expires." />}</div></section><section><div className="flex items-center gap-2"><PromorangSemanticMark kind="proof" size={30} /><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#ff9a4d]">Proof</p><p className="text-sm text-white/45">Verified things that happened.</p></div></div><div className="mt-4">{proof[0] ? <PaperReceipt heading="RETURN RECORDED" lines={[{ label: "Issuer", value: proof[0].issuer?.name || "PROMORANG partner" }, { label: "Used", value: proof[0].title || "Benefit used", strong: true }, { label: "Place", value: proof[0].place || proof[0].location || "Recorded" }, { label: "Proof", value: "Verified" }]} footer="What happened returns as proof." /> : <QuietState title="No verified proof yet" copy="After a merchant validates a use, the result belongs here rather than disappearing into activity history." />}</div></section><section><div className="flex items-center gap-2"><PromorangSemanticMark kind="kept" size={30} /><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#ff9a4d]">Kept</p><p className="text-sm text-white/45">Meaningful things that remain.</p></div></div><div className="mt-4">{memory ? <CollectibleRelic serial={memory.serial || memory.id || "KEPT"} title={memory.title || "A Moment Kept"} origin={memory.origin || model.home.data?.world?.identity?.line || "PROMORANG"} perk={memory.perk || memory.description || "Returned through verified movement."} scene={memory.scene || model.home.data?.world?.promoCard?.sceneMark || "PROMORANG"} place={memory.place || memory.location || "Kingston"} verifiedDate={memory.issuedAt ? new Date(memory.issuedAt).toLocaleDateString("en-JM") : "Kept"} /> : <QuietState title="Nothing kept yet" copy="Relics, memories and retained pieces appear here when an experience leaves something worth keeping." />}</div></section><section><div className="flex items-center gap-2"><PromorangSemanticMark kind="return" size={30} /><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#ff9a4d]">Value</p><p className="text-sm text-white/45">Usable balances and possibility.</p></div></div><div className="mt-4 grid grid-cols-3 gap-2"><div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4"><p className="text-[10px] font-black uppercase tracking-[.12em] text-white/38">Points</p><p className="mt-2 text-xl font-black text-[#ff9a4d]">{model.balances.promoPoints}</p></div><div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4"><p className="text-[10px] font-black uppercase tracking-[.12em] text-white/38">Tickets</p><p className="mt-2 text-xl font-black text-[#f6c453]">{model.balances.promoShareTickets}</p></div><div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4"><p className="text-[10px] font-black uppercase tracking-[.12em] text-white/38">Gems</p><p className="mt-2 text-xl font-black text-[#4cc6f0]">{model.balances.gems}</p></div></div><a href="/vault" className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-black text-[#ff9a4d]">Open full Vault economics <ArrowRight className="h-4 w-4" /></a></section>{proof.length > 1 ? <section className="border-t border-white/10 pt-6"><p className="text-[10px] font-black uppercase tracking-[.16em] text-white/38">Recent archive</p><div className="mt-4 space-y-4">{proof.slice(0, 4).map((item: any, index: number) => <div key={item.id || index} className="flex gap-3"><PromorangSemanticMark kind="proof" size={30} /><div><p className="text-sm font-bold">{item.title || "Verified use"}</p><p className="mt-1 text-xs text-white/42">{item.place || item.location || "Recorded"}</p></div></div>)}</div></section> : null}</div>
    </Shell>
  );
}

function YouSurface({ model }: { model: ReturnType<typeof useParticipantModel> }) {
  const world = model.home.data?.world;
  const communities = model.home.data?.communities || [];
  const proof = model.card.data?.used || [];
  const latestReturn = world?.latestReturn?.heading || null;
  const used = Number(model.home.data?.happened?.buckets?.used || 0);
  const claimed = Number(model.home.data?.happened?.buckets?.claimed || 0);
  const trail = [
    latestReturn ? { kind: "return" as PromorangSemanticMarkKind, label: "RETURN", title: latestReturn, detail: "Latest verified return" } : null,
    proof[0] ? { kind: "proof" as PromorangSemanticMarkKind, label: "PROOF", title: proof[0].title || "Verified use", detail: proof[0].place || proof[0].location || "Recorded" } : null,
    world?.latestMemory ? { kind: "kept" as PromorangSemanticMarkKind, label: "KEPT", title: world.latestMemory.title || "A Moment Kept", detail: world.latestMemory.place || world.latestMemory.location || "PROMORANG" } : null,
  ].filter(Boolean) as Array<{ kind: PromorangSemanticMarkKind; label: string; title: string; detail: string }>;

  return (
    <Shell active="you" model={model}>
      <SEO title="You — PROMORANG" description="Your identity, belonging and proof on PROMORANG." />
      <div className="px-5 pb-7 pt-8 sm:px-6"><div className="flex items-start justify-between gap-4"><div className="flex items-center gap-4"><div className="grid h-16 w-16 place-items-center rounded-2xl border border-[#d49a35]/30 bg-[radial-gradient(circle_at_80%_20%,rgba(122,46,23,.35),transparent_60%),#0d0d0e]"><PromorangMark size={46} className="h-11 w-11" /></div><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#ff9a4d]">Your PROMORANG</p><h1 className="mt-1 font-serif text-3xl font-bold">{model.givenName}</h1><p className="mt-1 text-xs text-white/45">{model.profile?.username ? `@${model.profile.username}` : model.profile?.display_name || model.profile?.full_name || "Participant"}</p></div></div><a href="/dashboard/settings" className="text-xs font-black text-white/45">Settings</a></div>{world?.identity?.line ? <div className="mt-7 border-l border-[#ff6a00]/35 pl-4"><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#ff9a4d]">Identity</p><p className="mt-2 font-serif text-2xl font-bold">{world.identity.line}</p></div> : null}<section className="mt-8"><div className="flex items-center gap-2"><PromorangSemanticMark kind="explore" size={30} /><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#ff9a4d]">Belonging</p><p className="text-sm text-white/45">Scenes and rooms you move through.</p></div></div><div className="mt-4 flex flex-wrap gap-2">{communities.length ? communities.slice(0, 8).map((community: any, index: number) => <span key={community.id || community.slug || index} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-bold">{community.title || community.name || "Scene"}</span>) : <p className="text-sm text-white/45">No joined scenes yet.</p>}</div></section><section className="mt-8"><div className="flex items-center gap-2"><PromorangSemanticMark kind="proof" size={30} /><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#ff9a4d]">Participation</p><p className="text-sm text-white/45">Quiet proof, not vanity metrics.</p></div></div><div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-2xl border border-white/10 p-4"><p className="text-[10px] font-black uppercase tracking-[.12em] text-white/35">Claimed</p><p className="mt-2 text-2xl font-black">{claimed}</p></div><div className="rounded-2xl border border-white/10 p-4"><p className="text-[10px] font-black uppercase tracking-[.12em] text-white/35">Used</p><p className="mt-2 text-2xl font-black">{used}</p></div></div></section>{trail.length ? <section className="mt-8"><div className="flex items-end justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-white/38">Your trail</p><h2 className="mt-1 font-serif text-2xl font-bold">Movement that remains.</h2></div><PromorangSemanticMark kind="return" size={34} /></div><div className="relative mt-5 space-y-6 before:absolute before:bottom-5 before:left-[15px] before:top-5 before:w-px before:bg-white/10">{trail.map((item) => <div key={`${item.label}-${item.title}`} className="relative flex gap-4"><div className="z-10 rounded-full bg-[#09090a]"><PromorangSemanticMark kind={item.kind} size={32} /></div><div className="pb-1"><p className="text-[9px] font-black uppercase tracking-[.15em] text-[#ff9a4d]">{item.label}</p><p className="mt-1 text-sm font-bold">{item.title}</p><p className="mt-1 text-xs text-white/42">{item.detail}</p></div></div>)}</div></section> : null}{latestReturn ? <section className="mt-8 rounded-[1.6rem] border border-[#7a2e17]/45 bg-[#7a2e17]/10 p-5"><MarkLabel kind="return">Latest return</MarkLabel><p className="mt-3 font-serif text-2xl font-bold">{latestReturn}</p></section> : null}{model.happened.isError ? <p className="mt-6 text-xs text-white/35">Detailed participation history is temporarily unavailable; no substitute data is shown.</p> : null}<div className="mt-8 grid gap-2"><a href="/profile" className="flex min-h-12 items-center justify-between border-t border-white/10 text-sm font-bold">Open public profile <ArrowRight className="h-4 w-4 text-white/35" /></a><a href="/dashboard/following" className="flex min-h-12 items-center justify-between border-t border-white/10 text-sm font-bold">Following <ArrowRight className="h-4 w-4 text-white/35" /></a><a href="/dashboard/saved" className="flex min-h-12 items-center justify-between border-y border-white/10 text-sm font-bold">Saved <Bookmark className="h-4 w-4 text-white/35" /></a></div></div>
    </Shell>
  );
}

function useParticipantModel() {
  const { user, profile } = useAuth();
  const { city } = useMarket();
  const home = useExperienceHome();
  const card = useMyPromoCard();
  const nearby = useNearbyBenefits();
  const happened = useWhatHappened();
  const momentFeed = useCanonicalMomentFeed();
  const { balances } = usePromoShareRail();
  const givenName = firstGivenName({ displayName: home.data?.givenName || home.data?.name, fullName: profile?.full_name || profile?.display_name || user?.user_metadata?.full_name || user?.user_metadata?.name, username: profile?.username || user?.user_metadata?.user_name || user?.user_metadata?.preferred_username, email: user?.email, fallback: "there" });
  const cardFace = useMemo(() => resolvePromoCardFace({ holder: givenName === "there" ? "Your card" : givenName, useThis: card.data?.useThis, nearbyCount: card.data?.nearby?.length || 0, nextBenefitTitle: card.data?.nextBenefit?.title, latestReturn: home.data?.world?.latestReturn?.heading, latestReturnAt: home.data?.world?.latestMemory?.issuedAt ? new Date(home.data.world.latestMemory.issuedAt).toLocaleDateString("en-JM") : undefined, sceneMark: home.data?.world?.promoCard?.sceneMark, crewMark: home.data?.world?.promoCard?.crewMark, recordedUse: Boolean(card.data?.useThis?.redemption?.recorded) }), [card.data, givenName, home.data]);
  return { user, profile, givenName, cityName: city?.name || "Kingston", home, card, nearby, happened, momentFeed, balances, cardFace };
}

export default function ParticipantExperienceV1() {
  const params = useParams();
  const surface = String(params.surface || "today").toLowerCase() as Surface;
  const model = useParticipantModel();
  if (!surfaces.includes(surface)) return <Navigate to="/today" replace />;
  if (surface === "today") return <TodaySurface model={model} />;
  if (surface === "discover") return <DiscoverSurface model={model} />;
  if (surface === "card") return <CardSurface model={model} />;
  if (surface === "vault") return <VaultSurface model={model} />;
  return <YouSurface model={model} />;
}

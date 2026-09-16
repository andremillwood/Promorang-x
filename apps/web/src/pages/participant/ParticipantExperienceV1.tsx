import { useMemo } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import {
  ArrowRight,
  Bookmark,
  CalendarDays,
  CheckCircle2,
  Compass,
  CreditCard,
  Home,
  LockKeyhole,
  MapPin,
  Navigation,
  Search,
  ShieldCheck,
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

function ParticipantNav({ active }: { active: Surface }) {
  return (
    <nav className="sticky bottom-0 z-30 grid grid-cols-5 border-t border-white/10 bg-[#080809]/95 px-2 pb-[max(.55rem,env(safe-area-inset-bottom))] pt-2.5 backdrop-blur-xl">
      {navItems.map(([key, Icon, label]) => (
        <Link
          key={key}
          to={`/next/${key}`}
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
      <div className="mx-auto flex min-h-screen w-full max-w-[520px] flex-col border-x border-white/[0.06] bg-[#09090a] shadow-[0_0_90px_rgba(0,0,0,.6)]">
        <main className="flex-1">{children}</main>
        <ParticipantNav active={active} />
      </div>
    </div>
  );
}

function QuietState({ title, copy, action }: { title: string; copy: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.025] p-5">
      <h2 className="font-serif text-2xl font-bold">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-white/50">{copy}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

function LoadingBlock({ className = "h-48" }: { className?: string }) {
  return <div className={`${className} animate-pulse rounded-[1.6rem] border border-white/10 bg-white/[0.035]`} />;
}

function imageFor(value: any) {
  return value?.image_url || value?.imageUrl || value?.image || value?.media?.[0]?.url || value?.fulfillmentData?.image || null;
}

function hrefForBenefit(value: any) {
  return value?.href || value?.dropSlug ? (value?.href || `/drop/${value.dropSlug}`) : "/card";
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

function TodaySurface({ model }: { model: ReturnType<typeof useParticipantModel> }) {
  const { home, card, momentFeed, cardFace, givenName, cityName } = model;
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

  return (
    <Shell active="today">
      <SEO title="Today — PROMORANG" description="Your current PROMORANG move." />
      <section className={`relative overflow-hidden ${heroImage ? "min-h-[620px]" : "min-h-[520px]"}`}>
        {heroImage ? <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover" /> : null}
        <div className={`absolute inset-0 ${heroImage ? "bg-gradient-to-b from-black/20 via-black/20 to-[#09090a]" : "bg-[radial-gradient(circle_at_75%_15%,rgba(122,46,23,.35),transparent_35%),linear-gradient(160deg,#15100d,#09090a_55%)]"}`} />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-5 pt-7">
          <div className="flex items-start gap-2.5">
            <PromorangMark size={28} className="h-7 w-7 shrink-0" />
            <div>
              <p className="text-[11px] font-black uppercase tracking-[.16em] text-white/92">{cityName} · Today</p>
              <p className="mt-1 text-xs text-white/58">For {givenName === "there" ? "you" : givenName}</p>
            </div>
          </div>
          <Link to="/next/you" className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-black/25 backdrop-blur" aria-label="Open profile"><UserRound className="h-4 w-4" /></Link>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-5 pb-6">
          <MarkLabel kind="move">Your move</MarkLabel>
          {placeLine ? <p className="mt-3 text-xs font-bold text-white/72">{placeLine}</p> : null}
          <h1 className="mt-2 max-w-[430px] font-serif text-[2.8rem] font-bold leading-[.88] tracking-[-.05em]">{heroTitle}</h1>
          {heroDetail ? <p className="mt-3 max-w-md text-sm leading-6 text-white/68">{heroDetail}</p> : null}
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-white/58">
            {timeLine ? <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />{timeLine}</span> : null}
            {placeLine ? <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{placeLine}</span> : null}
          </div>
          <Link to={heroHref} className="mt-5 flex min-h-12 w-full items-center justify-between rounded-full bg-[#f6c453] px-5 text-sm font-black text-black">
            <span>{currentMove?.label || "Open this"}</span><ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {latestReturn ? (
        <section className="border-y border-white/10 px-5 py-5">
          <div className="flex items-start gap-3">
            <PromorangSemanticMark kind="return" size={42} className="shrink-0" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.16em] text-[#ff9a4d]">What returned</p>
              <p className="mt-1 font-serif text-xl font-bold">{latestReturn}</p>
              <p className="mt-1 text-xs leading-5 text-white/46">PROMORANG keeps the consequence visible after the action.</p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="space-y-4 px-5 py-6">
        <div className="flex items-end justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-white/38">Your access</p><h2 className="mt-1 font-serif text-2xl font-bold">PromoCard</h2></div><Link to="/next/card" className="text-xs font-black text-[#ff9a4d]">Open card</Link></div>
        {card.isLoading ? <LoadingBlock className="h-56" /> : card.data ? <PromoCardFace model={cardFace} interactive={false} /> : <QuietState title="Your PromoCard is ready to be filled" copy="Discover something useful and take it onto your card." action={<Link to="/next/discover" className="text-sm font-black text-[#ff9a4d]">Explore opportunities →</Link>} />}
      </section>
    </Shell>
  );
}

function DiscoverSurface({ model }: { model: ReturnType<typeof useParticipantModel> }) {
  const { nearby, momentFeed, cityName } = model;
  const benefits = nearby.data || [];
  const moments = momentFeed.data?.moments || [];
  const lead = benefits[0] || null;
  const rest = benefits.slice(1, 4);
  const leadImage = imageFor(lead);

  return (
    <Shell active="discover">
      <SEO title="Discover — PROMORANG" description="Useful opportunities around you." />
      <SurfaceHeader
        kicker={`For you · ${cityName}`}
        title="Real opportunities. Near you."
        action={<Link to="/search" className="grid h-10 w-10 place-items-center rounded-full border border-white/12" aria-label="Search"><Search className="h-4 w-4" /></Link>}
      />
      <div className="flex gap-2 overflow-x-auto px-5 pb-5 [scrollbar-width:none]">
        <span className="shrink-0 rounded-full bg-[#eadcc6] px-3.5 py-2 text-xs font-bold text-black">For you</span>
        <Link to="/discover?tab=perks" className="shrink-0 rounded-full border border-white/12 px-3.5 py-2 text-xs font-bold text-white/65">Nearby</Link>
        <Link to="/discover/moments" className="shrink-0 rounded-full border border-white/12 px-3.5 py-2 text-xs font-bold text-white/65">Moments</Link>
        <Link to="/saved" className="shrink-0 rounded-full border border-white/12 px-3.5 py-2 text-xs font-bold text-white/65">Saved</Link>
      </div>

      {nearby.isLoading ? <div className="px-5"><LoadingBlock className="h-[360px]" /></div> : lead ? (
        <Link to={hrefForBenefit(lead)} className="relative block min-h-[360px] overflow-hidden border-y border-white/10">
          {leadImage ? <img src={leadImage} alt="" className="absolute inset-0 h-full w-full object-cover" /> : null}
          <div className={`absolute inset-0 ${leadImage ? "bg-gradient-to-t from-black via-black/45 to-black/15" : "bg-[radial-gradient(circle_at_80%_20%,rgba(122,46,23,.35),transparent_35%),#111112]"}`} />
          <div className="absolute inset-x-0 bottom-0 p-5">
            <MarkLabel kind="move">Opportunity</MarkLabel>
            <p className="mt-2 text-xs font-bold text-white/65">{lead.issuer?.name || lead.issuer_name || "PROMORANG partner"}</p>
            <h2 className="mt-1 font-serif text-[2.3rem] font-bold leading-[.92] tracking-[-.04em]">{lead.title}</h2>
            {lead.detail ? <p className="mt-2 text-sm font-semibold text-[#f6c453]">{lead.detail}</p> : null}
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-white/55">
              {lead.expiresAt ? <span>Until {new Date(lead.expiresAt).toLocaleDateString("en-JM")}</span> : null}
              {lead.availableQuantity != null ? <span>{lead.availableQuantity} available</span> : null}
              {lead.availability ? <span>{String(lead.availability)}</span> : null}
            </div>
          </div>
        </Link>
      ) : <div className="px-5"><QuietState title="Nothing nearby is verified yet" copy="PROMORANG will not invent availability. Open the wider discovery surface to browse moments, places and other live opportunities." action={<Link to="/discover" className="text-sm font-black text-[#ff9a4d]">Open full Discover →</Link>} /></div>}

      <section className="px-5 py-5">
        <p className="text-[10px] font-black uppercase tracking-[.16em] text-white/38">Tracks near you</p>
        <div className="mt-2 divide-y divide-white/10">
          {rest.map((benefit: any, index: number) => (
            <Link key={benefit.id || benefit.title || index} to={hrefForBenefit(benefit)} className="grid grid-cols-[72px_1fr_auto] items-center gap-3 py-4">
              <div className="h-[62px] w-[72px] overflow-hidden rounded-xl bg-white/[0.04]">{imageFor(benefit) ? <img src={imageFor(benefit)} alt="" className="h-full w-full object-cover" /> : null}</div>
              <div className="min-w-0"><p className="text-xs font-bold text-white/48">{benefit.issuer?.name || benefit.issuer_name || "PROMORANG partner"}</p><p className="mt-1 truncate text-sm font-bold">{benefit.title}</p><p className="mt-1 truncate text-xs text-white/42">{benefit.detail || benefit.availability || "Open opportunity"}</p></div>
              <PromorangSemanticMark kind="explore" size={28} />
            </Link>
          ))}
        </div>
      </section>

      {moments.length ? (
        <section className="border-t border-white/10 px-5 py-5">
          <div className="flex items-end justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-white/38">Now & next</p><h2 className="mt-1 font-serif text-2xl font-bold">Moments</h2></div><Link to="/discover/moments" className="text-xs font-black text-[#ff9a4d]">See all</Link></div>
          <div className="mt-3 space-y-3">{moments.slice(0, 3).map((moment: any) => <Link key={moment.id} to={`/moments/${moment.slug || moment.id}`} className="grid grid-cols-[74px_1fr] gap-3 rounded-[1.25rem] border border-white/10 p-3"><div className="h-[68px] overflow-hidden rounded-xl bg-white/[0.04]">{imageFor(moment) ? <img src={imageFor(moment)} alt="" className="h-full w-full object-cover" /> : null}</div><div className="min-w-0 self-center"><p className="truncate font-bold">{moment.title}</p><p className="mt-1 truncate text-xs text-white/46">{moment.venue_name || moment.location || formatJamaicaDate(moment.starts_at)}</p></div></Link>)}</div>
        </section>
      ) : null}
    </Shell>
  );
}

function CardSurface({ model }: { model: ReturnType<typeof useParticipantModel> }) {
  const { card, cardFace } = model;
  const useThis = card.data?.useThis || null;
  const nearby = card.data?.nearby || [];

  return (
    <Shell active="card">
      <SEO title="PromoCard — PROMORANG" description="Your live PROMORANG credential." />
      <SurfaceHeader kicker="Your access" title="PromoCard." />
      <div className="space-y-5 px-5 pb-7">
        {card.isLoading ? <LoadingBlock className="h-60" /> : card.data ? <PromoCardFace model={cardFace} /> : <QuietState title="Your card could not load" copy="Try the existing card flow while this new participant surface remains in preview." action={<Link to="/card" className="text-sm font-black text-[#ff9a4d]">Open current PromoCard →</Link>} />}

        {useThis ? (
          <section className="rounded-[1.7rem] border border-[#d49a35]/25 bg-[radial-gradient(circle_at_100%_0%,rgba(122,46,23,.2),transparent_40%),#0d0d0e] p-5">
            <div className="flex items-start justify-between gap-3"><div><MarkLabel kind="move">Use now</MarkLabel><h2 className="mt-3 font-serif text-2xl font-bold">{useThis.title}</h2></div><PromorangSemanticMark kind={useThis.redemption?.recorded ? "proof" : "move"} size={38} /></div>
            {useThis.detail ? <p className="mt-2 text-sm leading-6 text-white/55">{useThis.detail}</p> : null}
            <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-white/10 pt-4 text-xs"><div><dt className="text-white/35">ISSUER</dt><dd className="mt-1 font-bold">{useThis.issuer?.name || "PROMORANG partner"}</dd></div><div><dt className="text-white/35">STATUS</dt><dd className="mt-1 font-bold">{useThis.redemption?.recorded ? "Used · proof kept" : useThis.status || "Ready"}</dd></div><div><dt className="text-white/35">VALID</dt><dd className="mt-1 font-bold">{useThis.expiresAt ? `Until ${new Date(useThis.expiresAt).toLocaleDateString("en-JM")}` : "While available"}</dd></div><div><dt className="text-white/35">USES</dt><dd className="mt-1 font-bold">{useThis.availableQuantity == null ? "See terms" : `${useThis.availableQuantity} available`}</dd></div></dl>
            <Link to="/card" className="mt-5 flex min-h-12 items-center justify-between rounded-full bg-[#eadcc6] px-5 text-sm font-black text-black"><span>{useThis.redemption?.recorded ? "View proof" : "Show / use credential"}</span><ArrowRight className="h-4 w-4" /></Link>
          </section>
        ) : null}

        {nearby.length ? <section><div className="flex items-end justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-white/38">Near your card</p><h2 className="mt-1 font-serif text-2xl font-bold">Useful next</h2></div><Link to="/next/discover" className="text-xs font-black text-[#ff9a4d]">Discover</Link></div><div className="mt-3 divide-y divide-white/10">{nearby.slice(0, 3).map((benefit: any, index: number) => <Link to={hrefForBenefit(benefit)} key={benefit.id || index} className="flex items-center justify-between gap-3 py-4"><div><p className="text-sm font-bold">{benefit.title}</p><p className="mt-1 text-xs text-white/44">{benefit.issuer?.name || benefit.detail || "Available nearby"}</p></div><ArrowRight className="h-4 w-4 text-white/35" /></Link>)}</div></section> : null}
      </div>
    </Shell>
  );
}

function VaultSurface({ model }: { model: ReturnType<typeof useParticipantModel> }) {
  const { card, home, balances } = model;
  const access = card.data?.benefits || card.data?.perks || [];
  const proof = card.data?.used || [];
  const memory = home.data?.world?.latestMemory || null;
  const firstProof = proof[0] || null;

  return (
    <Shell active="vault">
      <SEO title="Vault — PROMORANG" description="Access, proof, kept things and usable value." />
      <SurfaceHeader kicker="What stays with you" title="The Vault." />
      <div className="space-y-8 px-5 pb-8">
        <section>
          <div className="flex items-center gap-2"><PromorangSemanticMark kind="move" size={30} /><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#ff9a4d]">Access</p><p className="text-sm text-white/45">Things you can still use.</p></div></div>
          <div className="mt-4 space-y-3">{card.isLoading ? <LoadingBlock className="h-28" /> : access.length ? access.slice(0, 2).map((benefit: any, index: number) => <TicketPass key={benefit.id || index} kicker={benefit.expiresAt ? `VALID · ${new Date(benefit.expiresAt).toLocaleDateString("en-JM")}` : "ACCESS"} title={benefit.title} detail={benefit.detail || benefit.issuer?.name || "PROMORANG access"} stub={benefit.redemptionCode || benefit.redemption?.code || "CARD"} stubLabel="ACCESS" />) : <QuietState title="No active access yet" copy="When you take a usable opportunity, it will live here until it is used or expires." />}</div>
        </section>

        <section>
          <div className="flex items-center gap-2"><PromorangSemanticMark kind="proof" size={30} /><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#ff9a4d]">Proof</p><p className="text-sm text-white/45">Verified things that happened.</p></div></div>
          <div className="mt-4">{firstProof ? <PaperReceipt heading="RETURN RECORDED" lines={[{ label: "Issuer", value: firstProof.issuer?.name || "PROMORANG partner" }, { label: "Used", value: firstProof.title || "Benefit used", strong: true }, { label: "Place", value: firstProof.place || firstProof.location || "Recorded" }, { label: "Proof", value: "Verified" }]} footer="What happened returns as proof." /> : <QuietState title="No verified proof yet" copy="After a merchant validates a use, the result belongs here rather than disappearing into activity history." />}</div>
        </section>

        <section>
          <div className="flex items-center gap-2"><PromorangSemanticMark kind="kept" size={30} /><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#ff9a4d]">Kept</p><p className="text-sm text-white/45">Meaningful things that remain.</p></div></div>
          <div className="mt-4">{memory ? <CollectibleRelic serial={memory.serial || memory.id || "KEPT"} title={memory.title || "A Moment Kept"} origin={memory.origin || home.data?.world?.identity?.line || "PROMORANG"} perk={memory.perk || memory.description || "Returned through verified movement."} scene={memory.scene || home.data?.world?.promoCard?.sceneMark || "PROMORANG"} place={memory.place || memory.location || "Kingston"} verifiedDate={memory.issuedAt ? new Date(memory.issuedAt).toLocaleDateString("en-JM") : "Kept"} /> : <QuietState title="Nothing kept yet" copy="Relics, memories and retained pieces appear here when an experience leaves something worth keeping." />}</div>
        </section>

        <section>
          <div className="flex items-center gap-2"><PromorangSemanticMark kind="return" size={30} /><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#ff9a4d]">Value</p><p className="text-sm text-white/45">Usable balances and possibility.</p></div></div>
          <div className="mt-4 grid grid-cols-3 gap-2"><div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4"><p className="text-[10px] font-black uppercase tracking-[.12em] text-white/38">Points</p><p className="mt-2 text-xl font-black text-[#ff9a4d]">{balances.promoPoints}</p></div><div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4"><p className="text-[10px] font-black uppercase tracking-[.12em] text-white/38">Tickets</p><p className="mt-2 text-xl font-black text-[#f6c453]">{balances.promoShareTickets}</p></div><div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4"><p className="text-[10px] font-black uppercase tracking-[.12em] text-white/38">Gems</p><p className="mt-2 text-xl font-black text-[#4cc6f0]">{balances.gems}</p></div></div>
          <Link to="/vault" className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-black text-[#ff9a4d]">Open full Vault economics <ArrowRight className="h-4 w-4" /></Link>
        </section>
      </div>
    </Shell>
  );
}

function YouSurface({ model }: { model: ReturnType<typeof useParticipantModel> }) {
  const { profile, givenName, home, happened } = model;
  const world = home.data?.world;
  const communities = home.data?.communities || [];
  const latestReturn = world?.latestReturn?.heading || null;
  const used = Number(home.data?.happened?.buckets?.used || 0);
  const claimed = Number(home.data?.happened?.buckets?.claimed || 0);

  return (
    <Shell active="you">
      <SEO title="You — PROMORANG" description="Your identity, belonging and proof on PROMORANG." />
      <div className="px-5 pb-7 pt-8">
        <div className="flex items-start justify-between gap-4"><div className="flex items-center gap-4"><div className="grid h-16 w-16 place-items-center rounded-2xl border border-[#d49a35]/30 bg-[radial-gradient(circle_at_80%_20%,rgba(122,46,23,.35),transparent_60%),#0d0d0e]"><PromorangMark size={46} className="h-11 w-11" /></div><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#ff9a4d]">Your PROMORANG</p><h1 className="mt-1 font-serif text-3xl font-bold">{givenName}</h1><p className="mt-1 text-xs text-white/45">{profile?.username ? `@${profile.username}` : profile?.display_name || profile?.full_name || "Participant"}</p></div></div><Link to="/dashboard/settings" className="text-xs font-black text-white/45">Settings</Link></div>

        {world?.identity?.line ? <div className="mt-7 border-l border-[#ff6a00]/35 pl-4"><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#ff9a4d]">Identity</p><p className="mt-2 font-serif text-2xl font-bold">{world.identity.line}</p></div> : null}

        <section className="mt-8"><div className="flex items-center gap-2"><PromorangSemanticMark kind="explore" size={30} /><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#ff9a4d]">Belonging</p><p className="text-sm text-white/45">Scenes and rooms you move through.</p></div></div><div className="mt-4 flex flex-wrap gap-2">{communities.length ? communities.slice(0, 8).map((community: any, index: number) => <span key={community.id || community.slug || index} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-bold">{community.title || community.name || "Scene"}</span>) : <p className="text-sm text-white/45">No joined scenes yet.</p>}</div></section>

        <section className="mt-8"><div className="flex items-center gap-2"><PromorangSemanticMark kind="proof" size={30} /><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#ff9a4d]">Participation</p><p className="text-sm text-white/45">Quiet proof, not vanity metrics.</p></div></div><div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-2xl border border-white/10 p-4"><p className="text-[10px] font-black uppercase tracking-[.12em] text-white/35">Claimed</p><p className="mt-2 text-2xl font-black">{claimed}</p></div><div className="rounded-2xl border border-white/10 p-4"><p className="text-[10px] font-black uppercase tracking-[.12em] text-white/35">Used</p><p className="mt-2 text-2xl font-black">{used}</p></div></div></section>

        {latestReturn ? <section className="mt-8 rounded-[1.6rem] border border-[#7a2e17]/45 bg-[#7a2e17]/10 p-5"><MarkLabel kind="return">Latest return</MarkLabel><p className="mt-3 font-serif text-2xl font-bold">{latestReturn}</p></section> : null}

        {happened.isError ? <p className="mt-6 text-xs text-white/35">Detailed participation history is temporarily unavailable; no substitute data is shown.</p> : null}
        <div className="mt-8 grid gap-2"><Link to="/profile" className="flex min-h-12 items-center justify-between border-t border-white/10 text-sm font-bold">Open public profile <ArrowRight className="h-4 w-4 text-white/35" /></Link><Link to="/dashboard/following" className="flex min-h-12 items-center justify-between border-t border-white/10 text-sm font-bold">Following <ArrowRight className="h-4 w-4 text-white/35" /></Link><Link to="/dashboard/saved" className="flex min-h-12 items-center justify-between border-y border-white/10 text-sm font-bold">Saved <Bookmark className="h-4 w-4 text-white/35" /></Link></div>
      </div>
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

  const givenName = firstGivenName({
    displayName: home.data?.givenName || home.data?.name,
    fullName: profile?.full_name || profile?.display_name || user?.user_metadata?.full_name || user?.user_metadata?.name,
    username: profile?.username || user?.user_metadata?.user_name || user?.user_metadata?.preferred_username,
    email: user?.email,
    fallback: "there",
  });

  const cardFace = useMemo(() => resolvePromoCardFace({
    holder: givenName === "there" ? "Your card" : givenName,
    useThis: card.data?.useThis,
    nearbyCount: card.data?.nearby?.length || 0,
    nextBenefitTitle: card.data?.nextBenefit?.title,
    latestReturn: home.data?.world?.latestReturn?.heading,
    latestReturnAt: home.data?.world?.latestMemory?.issuedAt ? new Date(home.data.world.latestMemory.issuedAt).toLocaleDateString("en-JM") : undefined,
    sceneMark: home.data?.world?.promoCard?.sceneMark,
    crewMark: home.data?.world?.promoCard?.crewMark,
    recordedUse: Boolean(card.data?.useThis?.redemption?.recorded),
  }), [card.data, givenName, home.data]);

  return {
    user,
    profile,
    givenName,
    cityName: city?.name || "Kingston",
    home,
    card,
    nearby,
    happened,
    momentFeed,
    balances,
    cardFace,
  };
}

export default function ParticipantExperienceV1() {
  const params = useParams();
  const surface = String(params.surface || "today").toLowerCase() as Surface;
  const model = useParticipantModel();

  if (!surfaces.includes(surface)) return <Navigate to="/next/today" replace />;

  if (surface === "today") return <TodaySurface model={model} />;
  if (surface === "discover") return <DiscoverSurface model={model} />;
  if (surface === "card") return <CardSurface model={model} />;
  if (surface === "vault") return <VaultSurface model={model} />;
  return <YouSurface model={model} />;
}

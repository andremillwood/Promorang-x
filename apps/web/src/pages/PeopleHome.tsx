import { ArrowRight } from "lucide-react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import {
  firstGivenName,
  getStakeholderLens,
  homeGreeting,
  presentWorldRunTitle,
  resolvePromoCardFace,
  resolveStakeholderHomeMove,
} from "@promorang/shared";
import { useAuth } from "@/contexts/AuthContext";
import { useExperienceHome } from "@/hooks/usePeopleExperience";
import { useExperiencePath } from "@/hooks/useExperiencePath";
import { ExperienceShell, ExperienceLoading, QuietEmpty } from "@/components/people/ExperienceShell";
import { StakeholderLoopTrail, StakeholderPutInPass, StakeholderSetupPlaybook } from "@/components/people/StakeholderLoop";
import { PaperReceipt, PromoCardFace, TicketPass } from "@/components/promorang/SignatureObjects";
import { ConsequenceReceipt } from "@/components/promorang/ConsequenceReceipt";
import { DiscoveryDemandInbox } from "@/components/discovery/DiscoveryDemandInbox";
import { resolveDemandRole } from "@/lib/discovery-demand";
import { LiveLoopActions } from "@/components/promocard/LiveLoopActions";

const money = (value: number) => {
  if (!value) return "J$0";
  return `J$${Math.round(value).toLocaleString()}`;
};

const PREVIEW_ROLES = ["participant", "creator", "host", "merchant", "brand"] as const;

export default function PeopleHome() {
  const { user, profile, activeRole, roles } = useAuth();
  const workspaceRoles = (roles || []).filter((role) => ["host", "creator", "merchant", "brand", "agency", "admin"].includes(role));
  const home = useExperienceHome();
  const to = useExperiencePath();
  const location = useLocation();
  const [params] = useSearchParams();
  const previewRole = params.get("role");
  const data = home.data;
  const world = data?.world;
  const givenName = firstGivenName({
    displayName: data?.givenName || data?.name,
    fullName: profile?.full_name || profile?.display_name || user?.user_metadata?.full_name || user?.user_metadata?.name,
    username: profile?.username || user?.user_metadata?.user_name || user?.user_metadata?.preferred_username,
    email: user?.email,
    fallback: "there",
  });
  const role = data?.role || (["creator", "host", "promoter", "merchant", "brand"].includes(String(activeRole)) ? "contributor" : "member");
  const lensRole = previewRole || activeRole || role;
  const lens = getStakeholderLens(lensRole);
  const isMemberWorkspace = lens.role === "participant";
  const isPreview = location.pathname.startsWith("/app-preview");
  const greeting = homeGreeting(givenName);
  const description = lens.promise;
  const perksGiven = Number(data?.outcomes?.ledger?.perksGiven || 0);
  const nextMove = resolveStakeholderHomeMove(lensRole, {
    perksGiven,
    communities: data?.communities?.length || 0,
    cardPerks: Number(data?.outcomes?.ledger?.cardPerks || data?.card?.perks?.length || 0),
    hasInventory: Boolean(data?.outcomes?.suppliesInventory),
  });
  const hasMovement = Boolean(
    Number(data?.people || 0) ||
    Number(data?.happening || 0) ||
    Number(data?.earned || 0) ||
    perksGiven ||
    Number(data?.outcomes?.ledger?.perksClaimed || 0),
  );
  const ticker = role === "operator" && Number(data?.happening || 0)
    ? `${data?.happening || 0} showed up this week`
    : Number(data?.peopleThisMonth || 0)
      ? `+${data.peopleThisMonth} people this month`
      : lens.ticker;

  if (home.isLoading) {
    return (
      <ExperienceShell title={greeting} seoTitle="Home" description={description}>
        <ExperienceLoading label="Getting your perks and communities ready…" />
      </ExperienceShell>
    );
  }

  if (!data && home.isError) {
    return (
      <ExperienceShell title="Your home" eyebrow="PROMORANG">
        <QuietEmpty
          title="Couldn’t load your home"
          copy="Try again to see your perks, community and activity."
          action={
            <button
              type="button"
              disabled={home.isFetching}
              onClick={() => void home.refetch()}
              className="min-h-11 text-sm font-bold text-primary disabled:opacity-50"
            >
              {home.isFetching ? "Trying again…" : "Try again"}
            </button>
          }
        />
      </ExperienceShell>
    );
  }

  return (
    <ExperienceShell
      title={greeting}
      seoTitle="Home"
      description={description}
      hero={(
        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/50 px-5 pb-5 pt-6 shadow-[0_0_40px_rgba(255,85,0,0.16)] backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_88%_0%,rgba(255,85,0,.24),transparent_46%)]" />
          <div className="relative">
            <p className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              {ticker}
            </p>
            <h1 className="mt-4 font-serif text-[2.55rem] font-bold leading-[0.9] tracking-tight sm:text-5xl">{greeting}</h1>
            <p className="mt-3 max-w-md text-sm leading-6 text-white/60">{description}</p>
            <Link to={to("/card")} aria-label="Open your PromoCard" className="experience-interactive group mx-auto mt-6 block max-w-md rounded-[22px]">
              <PromoCardFace
                className="max-w-none"
                interactive={false}
                model={resolvePromoCardFace({
                  holder: givenName === "there" ? "Your card" : givenName,
                  useThis: data?.card?.useThis,
                  nearbyCount: data?.card?.nearby?.length || 0,
                  nextBenefitTitle: data?.card?.nextBenefit?.title,
                  latestReturn: world?.latestReturn?.heading,
                  latestReturnAt: world?.latestMemory?.issuedAt
                    ? new Date(world.latestMemory.issuedAt).toLocaleDateString()
                    : undefined,
                  sceneMark: world?.promoCard?.sceneMark,
                  crewMark: world?.promoCard?.crewMark,
                  recordedUse: Boolean(data?.card?.useThis?.redemption?.recorded),
                })}
              />
              <span className="mt-3 flex min-h-11 items-center justify-between px-1 text-sm font-semibold text-amber-200">
                Open your PromoCard <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
              <p className="mt-2 px-1 text-xs leading-5 text-white/45">{lens.promoCard.meaning}</p>
            </Link>
            <Link
              to={to(nextMove.href)}
              className="experience-interactive mt-5 flex min-h-12 items-center justify-center rounded-full bg-primary px-5 text-sm font-black text-black shadow-[0_0_24px_rgba(255,85,0,0.28)]"
            >
              {nextMove.label}
            </Link>
          </div>
        </section>
      )}
    >
      {isPreview ? (
        <nav aria-label="Preview this home as another role" className="flex flex-wrap gap-2">
          {PREVIEW_ROLES.map((item) => (
            <Link
              key={item}
              to={`/app-preview?role=${item}`}
              className={`rounded-full border px-3 py-2 text-[11px] font-black uppercase tracking-[0.14em] ${
                lens.role === item ? "border-primary bg-primary text-black" : "border-white/15 text-white/60"
              }`}
            >
              {item}
            </Link>
          ))}
        </nav>
      ) : null}
      <StakeholderLoopTrail role={lensRole} />
      <StakeholderSetupPlaybook role={lensRole} />
      {hasMovement ? (
        <PaperReceipt
          heading="What’s in play"
          lines={
            isMemberWorkspace
              ? [
                  { label: "On your card", value: String(data?.outcomes?.ledger?.cardPerks || data?.card?.perks?.length || 0) },
                  { label: "Rooms", value: String(data?.communities?.length || 0) },
                  { label: "Claimed", value: String(data?.happened?.buckets?.claimed || 0) },
                  { label: "Used", value: String(data?.happened?.buckets?.used || 0), strong: true },
                ]
              : [
                  { label: "People", value: String(data?.people || 0) },
                  { label: "Verified activity", value: money(Number(data?.earned || 0)) },
                  { label: "Given", value: String(perksGiven) },
                  { label: "On PromoCards now", value: String(data?.outcomes?.ledger?.perksClaimed || 0), strong: true },
                ]
          }
          footer={role === "operator"
            ? `${data?.happening || 0} ${data?.happening === 1 ? "person showed up" : "people showed up"} this week.`
            : "Numbers stay quiet until someone actually does something."}
        />
      ) : null}

      {workspaceRoles.length ? (
        <section className="rounded-[1.75rem] border border-primary/25 bg-primary/10 p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">You also operate here</p>
          <h2 className="mt-2 font-serif text-2xl font-bold">This is the member home, not your host desk.</h2>
          <p className="mt-2 text-sm leading-6 text-white/60">
            PromoCard, people, and tonight’s rooms live here. Hosting, creator work, merchant demand, and brand activations open in the workspace.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/dashboard?view=studio" className="inline-flex min-h-11 items-center rounded-xl bg-primary px-4 text-sm font-black text-black">
              Open {activeRole === "admin" ? "studio" : `${activeRole} workspace`}
            </Link>
            {workspaceRoles.includes("admin") ? (
              <Link to="/admin?tab=command" className="inline-flex min-h-11 items-center rounded-xl border border-white/15 px-4 text-sm font-bold text-white">
                Admin command
              </Link>
            ) : null}
            <Link to="/propose/new?from=home&role=host" className="inline-flex min-h-11 items-center rounded-xl border border-white/15 px-4 text-sm font-bold text-white">
              Continue an activation
            </Link>
          </div>
        </section>
      ) : null}

      <LiveLoopActions role={String(activeRole || role)} title="Make it live" />

      {!isMemberWorkspace ? (
        <section className="grid gap-3">
          <StakeholderPutInPass role={lensRole} />
          <Link to={to(lens.world.href)} className="block">
            <TicketPass kicker="The world" title="See the Scene" detail={lens.world.meaning} stub="WORLD" stubLabel="Open" />
          </Link>
          <Link to={to(lens.activity.href)} className="block">
            <TicketPass kicker="Activity" title={lens.activity.href === "/happened" ? "What happened" : "Recent activity"} detail={lens.activity.meaning} stub="DID" stubLabel="Open" />
          </Link>
        </section>
      ) : (
        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold">For you</h2>
          {world?.currentMove ? (
            <Link to={to(world.currentMove.href || "/discover")} className="block">
              <TicketPass
                kicker={world.currentMove.eyebrow || "Tonight"}
                title={world.currentMove.title}
                detail={
                  [world.identity?.line, world.currentMove.why || world.slice?.currentLine || "Show up and the Scene can return something useful."]
                    .filter(Boolean)
                    .join(" · ")
                }
                stub="GO"
                stubLabel="Live"
                imageUrl={world.currentMove.imageUrl}
                imageAlt={world.currentMove.imageAlt || world.currentMove.title}
              />
            </Link>
          ) : (
            <Link to="/discover?tab=perks" className="block">
              <TicketPass
                kicker="What’s happening"
                title="Browse live perks"
                detail="These are offers businesses already put up. Pick one for your card. You do not have to join a crew or answer a poll first."
                stub="GO"
                stubLabel="Live"
              />
            </Link>
          )}
          {world?.crew ? (
            <Link to={to("/crews")} className="block">
              <TicketPass
                kicker="Who you move with"
                title={world.crew.name}
                detail={`${world.crew.size} people · ${presentWorldRunTitle(world.crew.runTitle)}`}
                stub="CREW"
                stubLabel="Open"
              />
            </Link>
          ) : null}
          {world?.crew && world?.guild ? (
            <Link to={to("/guilds")} className="block">
              <TicketPass
                kicker="Who coordinates the Scene"
                title={world.guild.name}
                detail={`${world.guild.crewCount} Crews · ${world.guild.line || "Scene federation"}`}
                stub="GUILD"
                stubLabel="Open"
              />
            </Link>
          ) : null}
        </section>
      )}

      {isMemberWorkspace && world?.latestReturn ? (
        <section className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Latest Return</p>
          <ConsequenceReceipt receipt={world.latestReturn} />
        </section>
      ) : null}

      {!isMemberWorkspace && lens.putIn.href !== "/stock" && (data?.outcomes?.suppliesInventory || ["merchant", "brand"].includes(String(activeRole))) ? (
        <Link to={to("/stock")} className="block">
          <TicketPass
            kicker="Inventory"
            title="Put something up"
            detail="Other people move it. You see claimed and used."
            stub="STOCK"
            stubLabel="Open"
          />
        </Link>
      ) : null}

      {!isMemberWorkspace ? (
        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold">What they asked</h2>
          <DiscoveryDemandInbox role={resolveDemandRole(activeRole)} variant="peek" />
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold">Perks you can give</h2>
            <Link to={to("/give")} className="text-sm text-primary">See all</Link>
          </div>
          {data?.perks?.length ? (
            <div className="grid gap-3">
              {data.perks.slice(0, 3).map((perk: { id: string; source?: string; title: string; remaining?: number }) => (
                <Link key={perk.id} to={to("/give")} className="block">
                  <TicketPass
                    kicker={perk.source === "yours" ? "Yours" : "Available"}
                    title={perk.title}
                    detail={perk.remaining != null ? `${perk.remaining} remaining` : "Ready to drop"}
                    stub="DROP"
                    stubLabel="Perk"
                  />
                </Link>
              ))}
            </div>
          ) : (
            <QuietEmpty title="Nothing to give yet" copy="When a merchant or brand opens inventory, it will show up here." action={<Link to={to("/give")} className="text-sm font-bold text-primary">Make a perk</Link>} />
          )}
        </section>
      ) : null}

      {data?.opportunityItems?.length ? (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold">Opportunities</h2>
            <Link to={to("/earn")} className="text-sm text-primary">Earn</Link>
          </div>
          {data.opportunityItems.slice(0, 2).map((item: { id: string; title: string; youEarn?: string }) => (
            <Link key={item.id} to={to("/earn")} className="block">
              <TicketPass kicker="Earn" title={item.title} detail={item.youEarn} stub="TAKE" stubLabel="Open" />
            </Link>
          ))}
        </section>
      ) : null}

      {!data?.communities?.length ? (
        isMemberWorkspace ? null : (
        <Link to={to("/start")} className="block">
          <TicketPass
            kicker="First room"
            title="Bring your people together"
            detail="Start a community and give people a reason to join."
            stub="ROOM"
            stubLabel="Open"
          />
        </Link>
        )
      ) : (
        <Link to={`/scenes/${data.communities[0].slug}`} className="block">
          <TicketPass
            kicker="Your community"
            title={data.communities[0].title}
            detail="The room you already have. Keep it moving."
            stub="IN"
            stubLabel="Room"
          />
        </Link>
      )}

      {!isMemberWorkspace ? (
        <Link to="/dashboard?view=studio" className="block text-center text-xs text-white/30">
          Open the older studio tools
        </Link>
      ) : null}
    </ExperienceShell>
  );
}

import { ArrowRight, Compass, CreditCard, Users } from "lucide-react";
import { Link } from "react-router-dom";
import {
  firstGivenName,
  homeGreeting,
  resolveHomeNextMove,
} from "@promorang/shared";
import { useAuth } from "@/contexts/AuthContext";
import { useExperienceHome } from "@/hooks/usePeopleExperience";
import { useExperiencePath } from "@/hooks/useExperiencePath";
import { ExperienceShell, ExperienceLoading, QuietEmpty } from "@/components/people/ExperienceShell";
import { PaperReceipt, PromoCardFace, TicketPass } from "@/components/promorang/SignatureObjects";
import { LiveLoopActions } from "@/components/promocard/LiveLoopActions";
import { DiscoveryDemandInbox } from "@/components/discovery/DiscoveryDemandInbox";
import { resolveDemandRole } from "@/lib/discovery-demand";

const money = (value: number) => {
  if (!value) return "J$0";
  return `J$${Math.round(value).toLocaleString()}`;
};

export default function PeopleHome() {
  const { user, profile, activeRole } = useAuth();
  const home = useExperienceHome();
  const to = useExperiencePath();
  const data = home.data;
  const givenName = firstGivenName({
    displayName: data?.givenName || data?.name,
    fullName: profile?.full_name || profile?.display_name || user?.user_metadata?.full_name || user?.user_metadata?.name,
    username: profile?.username || user?.user_metadata?.user_name || user?.user_metadata?.preferred_username,
    email: user?.email,
    fallback: "there",
  });
  const role = data?.role || (["creator", "host", "promoter", "merchant", "brand"].includes(String(activeRole)) ? "contributor" : "member");
  const greeting = homeGreeting(givenName);
  const description = role === "member"
    ? "See what’s happening, keep your perks, and join the rooms that feel like yours."
    : "Build your people. Give them value. Move them to action.";
  const perksGiven = Number(data?.outcomes?.ledger?.perksGiven || 0);
  const nextMove = resolveHomeNextMove({
    role,
    people: Number(data?.people || 0),
    perksGiven,
    communities: data?.communities?.length || 0,
    cardPerks: Number(data?.outcomes?.ledger?.cardPerks || data?.card?.perks?.length || 0),
  });
  const gems = Number(data?.wallet?.gems || 0);
  const points = Number(data?.wallet?.points || 0);
  const keys = Number(data?.wallet?.promokeys || 0);
  const hasMovement = Boolean(
    Number(data?.people || 0) ||
    Number(data?.happening || 0) ||
    Number(data?.earned || 0) ||
    perksGiven ||
    Number(data?.outcomes?.ledger?.perksClaimed || 0),
  );
  const ticker = role === "operator"
    ? `${data?.happening || 0} showed up this week`
    : Number(data?.peopleThisMonth || 0)
      ? `+${data.peopleThisMonth} people this month`
      : role === "member"
        ? "Your card is ready"
        : "Your people are waiting";

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
                variant={data?.card?.useThis ? "spending" : "membership"}
                className="max-w-none"
                holder={givenName === "there" ? "Your card" : givenName}
                available={data?.card?.useThis ? "Ready to use" : data?.card?.nearby?.length ? "Available nearby" : gems ? `${gems.toLocaleString()} Gems` : `${points.toLocaleString()} pts`}
                limit={data?.card?.useThis?.title || data?.card?.nextBenefit?.title || `${keys} keys`}
                places={data?.card?.useThis?.issuer?.name || data?.communities?.[0]?.title || "Your perks live here"}
                action={data?.card?.useThis ? "Use this" : data?.card?.nearby?.length ? "Available nearby" : "Get your next benefit"}
              />
              <span className="mt-3 flex min-h-11 items-center justify-between px-1 text-sm font-semibold text-amber-200">
                Open your PromoCard <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
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
      <nav aria-label="Your next stop" className="grid grid-cols-3 gap-2 sm:gap-3">
        {[
          { href: "/discover", label: "Discover", icon: Compass },
          { href: "/card", label: "My card", icon: CreditCard },
          { href: "/people", label: "My people", icon: Users },
        ].map(({ href, label, icon: Icon }) => (
          <Link key={href} to={to(href)} className="experience-interactive flex min-h-20 flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-2 text-sm font-semibold text-white/80 hover:border-amber-200/30 hover:bg-white/[0.08] hover:text-white">
            <Icon aria-hidden="true" className="h-5 w-5 text-amber-200" />{label}
          </Link>
        ))}
      </nav>
      {hasMovement ? (
        <PaperReceipt
          heading="What’s in play"
          lines={
            role === "member"
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

      <LiveLoopActions role={String(activeRole || role)} title="Make it live" />

      {role !== "member" ? (
        <section className="grid gap-3">
          {[
            { href: "/give", label: "Give something", detail: "Put a perk on your people’s PromoCards.", stub: "GIVE", stubLabel: "Perk" },
            { href: "/demand", label: "Open what they asked", detail: "Named asks and finds from Discover. Claim the one that is yours.", stub: "ASK", stubLabel: "Inbox" },
            { href: "/create", label: "Create something", detail: "Ask them to go, try, answer or show up.", stub: "MAKE", stubLabel: "Move" },
          ].map((action) => (
            <Link key={action.href} to={to(action.href)} className="block">
              <TicketPass kicker="Next move" title={action.label} detail={action.detail} stub={action.stub} stubLabel={action.stubLabel} />
            </Link>
          ))}
        </section>
      ) : (
        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold">For you</h2>
          <Link to="/discover?tab=discoveries" className="block">
            <TicketPass
              kicker="What’s happening"
              title="Find your next good thing"
              detail="Explore local spots, nights out, and perks worth claiming. What Discover opens lands on your PromoCard."
              stub="GO"
              stubLabel="Live"
            />
          </Link>
        </section>
      )}

      {role !== "member" && (data?.outcomes?.suppliesInventory || ["merchant", "brand"].includes(String(activeRole))) ? (
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

      {role !== "member" ? (
        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold">What they asked</h2>
          <DiscoveryDemandInbox role={resolveDemandRole(activeRole)} variant="peek" />
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold">Perks you can give</h2>
            <Link to={to("/give")} className="text-sm text-primary">See all</Link>
          </div>
          {data?.perks?.length ? (
            <div className="grid gap-3">
              {data.perks.slice(0, 3).map((perk: any) => (
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
          {data.opportunityItems.slice(0, 2).map((item: any) => (
            <Link key={item.id} to={to("/earn")} className="block">
              <TicketPass kicker="Earn" title={item.title} detail={item.youEarn} stub="TAKE" stubLabel="Open" />
            </Link>
          ))}
        </section>
      ) : null}

      {!data?.communities?.length ? (
        <Link to={role === "member" ? "/scenes" : to("/start")} className="block">
          <TicketPass
            kicker="First room"
            title={role === "member" ? "Find your people" : "Bring your people together"}
            detail={role === "member" ? "Join a community around the things you love." : "Start a community and give people a reason to join."}
            stub="ROOM"
            stubLabel="Open"
          />
        </Link>
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

      {role !== "member" ? (
        <Link to="/dashboard?view=studio" className="block text-center text-xs text-white/30">
          Open the older studio tools
        </Link>
      ) : null}
    </ExperienceShell>
  );
}

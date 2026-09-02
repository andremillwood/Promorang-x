import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useExperienceHome } from "@/hooks/usePeopleExperience";
import { useExperiencePath } from "@/hooks/useExperiencePath";
import { ExperienceShell, QuietEmpty, StatPile } from "@/components/people/ExperienceShell";
import { PaperReceipt, PromoCardFace, TicketPass } from "@/components/promorang/SignatureObjects";

const money = (value: number) => {
  if (!value) return "J$0";
  return `J$${Math.round(value).toLocaleString()}`;
};

export default function PeopleHome() {
  const { user, profile, activeRole } = useAuth();
  const home = useExperienceHome();
  const to = useExperiencePath();
  const data = home.data;
  const name = data?.name || profile?.full_name?.split(" ")[0] || user?.user_metadata?.full_name?.split(" ")[0] || "You";
  const role = data?.role || (["creator", "host", "promoter", "merchant", "brand"].includes(String(activeRole)) ? "contributor" : "member");
  const communityName = data?.communities?.[0]?.title || name;

  if (home.isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#0D0D0E] text-white">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </main>
    );
  }

  const emptyHome = !data && home.isError;

  return (
    <ExperienceShell
      eyebrow={role === "operator" ? "Your community" : role === "contributor" ? "Your people" : "PROMORANG"}
      title={communityName}
      description={
        role === "member"
          ? "See what’s happening, keep your perks, and join the rooms that feel like yours."
          : "Build your people. Give them value. Move them to action."
      }
    >
      {emptyHome ? (
        <p className="rounded-[1.3rem] border border-white/10 px-4 py-3 text-sm text-white/45">
          Your numbers will appear here once this community starts moving. Nothing is invented.
        </p>
      ) : null}

      <section className="grid grid-cols-2 gap-3">
        {(data?.outcomes?.cards || [
          { key: "people", label: "People", value: data?.people || 0, hint: data?.peopleThisMonth ? `+${data.peopleThisMonth} this month` : "Invite the first ones" },
          { key: "earned", label: "Earned", value: Number(data?.earned || 0), hint: "From verified activity" },
        ]).slice(0, 4).map((card: any) => (
          <StatPile
            key={card.key}
            label={card.label}
            value={card.key === "earned" ? money(Number(card.value || 0)) : card.value}
            hint={card.hint}
          />
        ))}
      </section>

      {role === "operator" ? (
        <section className="rounded-[1.5rem] border border-primary/30 bg-primary/10 px-4 py-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">This week</p>
          <p className="mt-2 font-serif text-xl font-bold">
            {data?.happening || 0} {data?.happening === 1 ? "person showed up" : "people showed up"}
          </p>
          <p className="mt-1 text-sm text-white/55">
            {[
              data?.happened?.buckets?.went ? `${data.happened.buckets.went} went` : null,
              data?.happened?.buckets?.claimed ? `${data.happened.buckets.claimed} claimed` : null,
              data?.happened?.buckets?.brought ? `${data.happened.buckets.brought} brought friends` : null,
            ].filter(Boolean).join(" · ") || "Nothing verified yet. Give something or ask them to show up."}
          </p>
        </section>
      ) : null}

      <section className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] px-3 py-4">
          <p className="font-serif text-2xl font-bold">{data?.happening || 0}</p>
          <p className="mt-1 text-[11px] uppercase tracking-widest text-white/45">happening</p>
        </div>
        <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] px-3 py-4">
          <p className="font-serif text-2xl font-bold">{data?.perksAvailable || 0}</p>
          <p className="mt-1 text-[11px] uppercase tracking-widest text-white/45">perks</p>
        </div>
        <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] px-3 py-4">
          <p className="font-serif text-2xl font-bold">{data?.opportunities || 0}</p>
          <p className="mt-1 text-[11px] uppercase tracking-widest text-white/45">to earn</p>
        </div>
      </section>

      <section className="grid gap-3">
        <Link to={to("/give")} className="block">
          <TicketPass
            kicker="Give"
            title="Drop a perk"
            detail="Put something on their PromoCards. They claim it — no download first."
            stub="DROP"
          />
        </Link>
        <Link to={to("/create")} className="block">
          <TicketPass
            kicker="Create"
            title="Ask them to do something"
            detail="Go, try, answer or show up. You stay in this language."
            stub="DO"
          />
        </Link>
        <Link to={to("/people")} className="block">
          <TicketPass
            kicker="People"
            title="Invite someone"
            detail="Credit follows the people you actually moved."
            stub="IN"
          />
        </Link>
        <Link to={to("/happened")} className="block">
          <PaperReceipt
            heading="What happened"
            lines={[
              { label: "Showed up", value: String(data?.happening || 0) },
              { label: "Claimed", value: String(data?.happened?.buckets?.claimed || 0) },
              { label: "Earned", value: money(Number(data?.earned || 0)), strong: true },
            ]}
            footer="Verified movement only. Nothing invented."
          />
        </Link>
      </section>

      {role === "member" ? (
        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold">For you</h2>
          <Link to={to("/card")} className="block">
            <PromoCardFace
              holder={name}
              available={`${Number(data?.wallet?.points || 0).toLocaleString()} pts`}
              limit={`${Number(data?.wallet?.promokeys || 0)} keys`}
              places="Your perks live here"
            />
          </Link>
          <Link to="/discover" className="block rounded-[1.6rem] border border-white/10 bg-white/[0.04] px-5 py-5">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">What’s happening</p>
            <p className="mt-2 font-serif text-2xl font-bold">Find a night, a meal, a room.</p>
          </Link>
        </section>
      ) : (
        <section className="space-y-3">
          {data?.outcomes?.suppliesInventory || ["merchant", "brand"].includes(String(activeRole)) ? (
            <Link to={to("/stock")} className="block rounded-[1.7rem] bg-primary px-5 py-5 text-black">
              <p className="text-[10px] font-black uppercase tracking-[0.22em]">Inventory</p>
              <p className="mt-1 font-serif text-2xl font-bold">Put something up</p>
              <p className="mt-1 text-sm">Other people move it. You see claimed and used.</p>
            </Link>
          ) : null}
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold">Perks you can give</h2>
            <Link to={to("/give")} className="text-sm text-primary">See all</Link>
          </div>
          {data?.perks?.length ? (
            <div className="grid gap-3">
              {data.perks.slice(0, 3).map((perk: any) => (
                <Link key={perk.id} to={to("/give")} className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] px-4 py-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{perk.source === "yours" ? "Yours" : "Available"}</p>
                  <p className="mt-1 font-serif text-xl font-bold">{perk.title}</p>
                  {perk.remaining != null ? <p className="mt-1 text-xs text-white/50">{perk.remaining} remaining</p> : null}
                </Link>
              ))}
            </div>
          ) : (
            <QuietEmpty
              kicker="Perks"
              stub="0"
              title="Nothing to give yet"
              copy="Make a simple perk, or wait until a place puts inventory up."
              action={<Link to={to("/give")} className="block min-h-12 rounded-full bg-primary text-center text-sm font-black leading-[3rem] text-black">Make a perk</Link>}
            />
          )}
        </section>
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl font-bold">Opportunities</h2>
          <Link to={to("/earn")} className="text-sm text-primary">Earn</Link>
        </div>
        {data?.opportunityItems?.length ? (
          data.opportunityItems.slice(0, 2).map((item: any) => (
            <Link key={item.id} to={to("/earn")} className="block rounded-[1.5rem] border border-white/10 bg-white/[0.04] px-4 py-4">
              <p className="font-serif text-xl font-bold">{item.title}</p>
              <p className="mt-1 text-sm text-white/50">{item.youEarn}</p>
            </Link>
          ))
        ) : (
          <QuietEmpty
            kicker="Earn"
            stub="0"
            title="No live opportunities"
            copy="When a place wants your people, the job lands here. You can put something up yourself."
            action={<Link to={to("/stock")} className="block min-h-12 rounded-full bg-primary text-center text-sm font-black leading-[3rem] text-black">Put something up</Link>}
          />
        )}
      </section>

      {!data?.communities?.length ? (
        <Link to={to("/start")} className="block rounded-[1.7rem] bg-primary px-5 py-5 text-black">
          <p className="text-[10px] font-black uppercase tracking-[0.22em]">First move</p>
          <p className="mt-1 font-serif text-2xl font-bold">Start a community — or join one.</p>
        </Link>
      ) : (
        <Link to={`/scenes/${data.communities[0].slug}`} className="block rounded-[1.6rem] border border-white/10 px-5 py-5">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">Your community</p>
          <p className="mt-1 font-serif text-2xl font-bold">{data.communities[0].title}</p>
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

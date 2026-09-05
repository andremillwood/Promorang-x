import { useState } from "react";
import { Link } from "react-router-dom";
import { Gift, Plus, QrCode } from "lucide-react";
import {
  DISCOVER_LENSES,
  getCurrentMove,
  humanActionLabel,
  presentPromoCard,
} from "@promorang/shared";
import { useAuth } from "@/contexts/AuthContext";
import { useExperienceHome } from "@/hooks/usePeopleExperience";
import { useExperiencePath } from "@/hooks/useExperiencePath";
import { discoverPathHref } from "@/lib/discovery-path";
import { ExperienceShell, QuietEmpty, StatPile } from "@/components/people/ExperienceShell";
import { PromoCardFace } from "@/components/promorang/SignatureObjects";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const money = (value: number) => {
  if (!value) return "J$0";
  return `J$${Math.round(value).toLocaleString()}`;
};

function destinationFor(destination: string) {
  if (destination === "discover") return "/discover";
  if (destination === "create") return "/create";
  if (destination === "progress") return "/happened";
  if (destination === "vault") return "/card";
  return "/dashboard";
}

export default function PeopleHome() {
  const { user, profile, activeRole } = useAuth();
  const home = useExperienceHome();
  const to = useExperiencePath();
  const [usingCard, setUsingCard] = useState(false);
  const data = home.data;
  const name = data?.name || profile?.full_name?.split(" ")[0] || user?.user_metadata?.full_name?.split(" ")[0] || "You";
  const role = data?.role || (["creator", "host", "promoter", "merchant", "brand"].includes(String(activeRole)) ? "contributor" : "member");
  const communityName = data?.communities?.[0]?.title || name;
  const cardView = presentPromoCard(data?.card, name);
  const currentMove = getCurrentMove({
    hasDiscovered: Boolean(data?.communities?.length || data?.opportunityItems?.length),
    hasJoinedMoment: Boolean(data?.happened?.buckets?.went),
    hasArrived: Boolean(data?.happened?.buckets?.went || data?.happened?.buckets?.claimed),
    hasContribution: Boolean(data?.happened?.buckets?.shared || data?.perks?.length),
    hasUnlockedValue: Number(data?.wallet?.points || 0) > 0 || Number(data?.wallet?.promokeys || 0) > 0,
    hasSavedMemory: Number(data?.card?.perks?.length || data?.wallet?.points || 0) > 0,
  });
  const happened = data?.happened;
  const buckets = happened?.buckets || {};

  if (home.isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#0D0D0E] text-white">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </main>
    );
  }

  if (!data && home.isError) {
    return (
      <ExperienceShell title="Today" eyebrow="PROMORANG">
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
      eyebrow={role === "operator" ? "Your community" : role === "contributor" ? "Your people" : "Today"}
      title={communityName}
      description={
        role === "member"
          ? "Your PromoCard is the thing you hold. Discover what’s next, then use it when you get there."
          : "Give value that lands on people’s PromoCards. Your card is how you spend and recharge too."
      }
    >
      <PromoCardFace
        holder={cardView.holder}
        available={cardView.available}
        limit={cardView.limit}
        places={cardView.places}
        tier={cardView.tier}
        cardNumber={cardView.cardNumber}
        onUse={() => setUsingCard(true)}
      />

      <Link
        to={to(destinationFor(currentMove.destination))}
        className="block rounded-[1.5rem] border border-primary/30 bg-[#17100C] px-4 py-4"
      >
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">Your current move</p>
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-primary">{currentMove.step.label}</p>
        </div>
        <p className="mt-2 font-serif text-2xl font-bold">{currentMove.title}</p>
        <p className="mt-1 text-sm leading-6 text-white/55">{currentMove.body}</p>
        <span className="mt-4 inline-flex rounded-full bg-primary px-4 py-2 text-sm font-black text-black">
          {currentMove.ctaLabel}
        </span>
      </Link>

      {role !== "member" ? (
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
      ) : null}

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

      {role !== "member" ? (
        <section className="grid gap-3">
          {[
            { href: "/give", label: "Give something", copy: "Put a perk on your people’s PromoCards.", icon: Gift },
            { href: "/create", label: "Create something", copy: "Ask them to go, try, answer or show up.", icon: Plus },
          ].map((action) => (
            <Link
              key={action.href}
              to={to(action.href)}
              className="flex min-h-[88px] items-center gap-4 rounded-[1.7rem] border border-white/10 bg-gradient-to-r from-white/[0.07] to-transparent px-5 py-4"
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-black">
                <action.icon className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-serif text-2xl font-bold leading-none">{action.label}</span>
                <span className="mt-1 block text-sm text-white/55">{action.copy}</span>
              </span>
            </Link>
          ))}
        </section>
      ) : null}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl font-bold">What’s happening</h2>
          <Link to="/discover" className="text-sm font-bold text-primary">See all</Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {DISCOVER_LENSES.map((item) => (
            <Link
              key={item.id}
              to={discoverPathHref(null, item.id)}
              className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-bold"
            >
              {item.label}
            </Link>
          ))}
        </div>
        <Link to="/discover?tab=discoveries" className="block rounded-[1.6rem] border border-white/10 bg-white/[0.04] px-5 py-5">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">Discover</p>
          <p className="mt-2 font-serif text-2xl font-bold">Name what you want. Then we show the matching next step.</p>
        </Link>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl font-bold">What happened</h2>
          <Link to={to("/happened")} className="text-sm font-bold text-primary">All results</Link>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[
            ["Went", buckets.went],
            ["Claimed", buckets.claimed],
            ["Used", buckets.used],
            ["Brought", buckets.brought],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] px-3 py-3">
              <p className="font-serif text-2xl font-bold">{Number(value || 0)}</p>
              <p className="mt-1 text-[11px] text-white/45">{label}</p>
            </div>
          ))}
        </div>
        {happened?.recent?.length ? (
          <div className="space-y-2">
            {happened.recent.slice(0, 3).map((row: any) => (
              <p key={row.id} className="rounded-[1.2rem] border border-white/10 px-4 py-3 text-sm text-white/70">
                {row.actorName || "Someone"} {humanActionLabel(row.action_type)}
              </p>
            ))}
          </div>
        ) : (
          <p className="text-sm text-white/45">When people claim, show up or answer, it will read like a story here.</p>
        )}
      </section>

      {role !== "member" && (data?.outcomes?.suppliesInventory || ["merchant", "brand"].includes(String(activeRole))) ? (
        <Link to={to("/stock")} className="block rounded-[1.7rem] bg-primary px-5 py-5 text-black">
          <p className="text-[10px] font-black uppercase tracking-[0.22em]">Inventory</p>
          <p className="mt-1 font-serif text-2xl font-bold">Put something up</p>
          <p className="mt-1 text-sm">Other people move it. You see claimed and used.</p>
        </Link>
      ) : null}

      {role !== "member" ? (
        <section className="space-y-3">
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
            <QuietEmpty title="Nothing to give yet" copy="When a merchant or brand opens inventory, it will show up here." action={<Link to={to("/give")} className="text-sm font-bold text-primary">Make a perk</Link>} />
          )}
        </section>
      ) : null}

      {data?.opportunityItems?.length ? (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold">Opportunities</h2>
            <Link to={to("/earn")} className="text-sm font-bold text-primary">Earn</Link>
          </div>
          {data.opportunityItems.slice(0, 2).map((item: any) => (
            <Link key={item.id} to={to("/earn")} className="block rounded-[1.5rem] border border-white/10 bg-white/[0.04] px-4 py-4">
              <p className="font-serif text-xl font-bold">{item.title}</p>
              <p className="mt-1 text-sm text-white/50">{item.youEarn}</p>
            </Link>
          ))}
        </section>
      ) : null}

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

      <Dialog open={usingCard} onOpenChange={setUsingCard}>
        <DialogContent className="border-zinc-800 bg-zinc-950 text-white max-w-sm text-center">
          <DialogHeader>
            <DialogTitle className="text-center">Present to cashier</DialogTitle>
            <DialogDescription className="text-center text-zinc-400">
              Show this code at a participating checkout to apply eligible PromoCard value. Pay any remainder normally.
            </DialogDescription>
          </DialogHeader>
          <div className="my-4 flex flex-col items-center rounded-2xl bg-white p-6">
            <QrCode className="h-40 w-40 text-black" />
            <p className="mt-2 font-mono text-xs font-bold tracking-wider text-zinc-600">{cardView.useCode}</p>
          </div>
          <p className="text-sm font-bold text-amber-200">Available: {cardView.available}</p>
          <p className="text-xs text-zinc-400">{cardView.holder}</p>
          <Button onClick={() => setUsingCard(false)} variant="outline" className="mt-4 w-full border-zinc-800">
            Done
          </Button>
        </DialogContent>
      </Dialog>
    </ExperienceShell>
  );
}

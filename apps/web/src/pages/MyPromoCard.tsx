import { Link } from "react-router-dom";
import { firstGivenName } from "@promorang/shared";
import { MapPin, Sparkles, Ticket } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMyPromoCard } from "@/hooks/usePeopleExperience";
import { ExperienceShell, QuietEmpty } from "@/components/people/ExperienceShell";
import { PromoCardFace } from "@/components/promorang/SignatureObjects";
import { PromoCardActions } from "@/components/promocard/PromoCardActions";

function BenefitTicket({ perk, action }: { perk: any; action?: string }) {
  const usable = perk.fulfillmentState === "claimed";
  return (
    <article className="rounded-[1.4rem] border border-white/10 px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">{perk.issuer?.name || "Participating business"}</p>
          <p className="mt-1 font-serif text-xl font-bold">{perk.title}</p>
        </div>
        <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white/50">
          {perk.fulfillmentState || perk.status || "Claimed"}
        </span>
      </div>
      {perk.detail ? <p className="mt-1 text-sm text-white/50">{perk.detail}</p> : null}
      <dl className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-white/45">
        <div>
          <dt className="uppercase tracking-widest">Eligibility</dt>
          <dd className="mt-0.5 text-white/70">{perk.eligibility?.who || "Claimed members"}</dd>
        </div>
        <div>
          <dt className="uppercase tracking-widest">Remaining</dt>
          <dd className="mt-0.5 text-white/70">{perk.availableQuantity == null ? "Open" : perk.availableQuantity}</dd>
        </div>
        <div>
          <dt className="uppercase tracking-widest">Expires</dt>
          <dd className="mt-0.5 text-white/70">{perk.expiresAt ? new Date(perk.expiresAt).toLocaleDateString() : "While supplies last"}</dd>
        </div>
        <div>
          <dt className="uppercase tracking-widest">Redemption</dt>
          <dd className="mt-0.5 text-white/70">{perk.redemption?.recorded ? "Recorded" : "Waiting on the merchant"}</dd>
        </div>
      </dl>
      {usable && perk.redemptionCode ? (
        <div className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-3">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">{action || "Use this"}</p>
          <code className="mt-1 block text-xl font-black tracking-[0.16em] text-white">{perk.redemptionCode}</code>
          <p className="mt-2 text-xs text-white/55">Show this to the merchant. Nothing is used until they validate it.</p>
        </div>
      ) : null}
      {perk.sharedBy?.name ? <p className="mt-2 text-xs text-white/40">Shared by {perk.sharedBy.name}</p> : null}
    </article>
  );
}

export default function MyPromoCard() {
  const { user, profile } = useAuth();
  const card = useMyPromoCard();
  const data = card.data;
  const holder = firstGivenName({
    displayName: data?.givenName || data?.name,
    fullName: profile?.full_name || profile?.display_name || user?.user_metadata?.full_name,
    username: profile?.username,
    email: user?.email,
    fallback: "there",
  });
  const useThis = data?.useThis || data?.benefits?.find((item: any) => !item.redemption?.recorded) || data?.perks?.[0] || null;
  const nearby = data?.nearby || [];
  const nextBenefit = data?.nextBenefit || nearby[0] || null;

  return (
    <ExperienceShell
      eyebrow="PromoCard"
      title="Use what’s on the card"
      description="A merchant supplied it. An ambassador shared it. You claim it. The merchant validates it. That is the only completion."
      backTo="/dashboard"
    >
      <PromoCardFace
        holder={holder === "there" ? "Your card" : holder}
        available={useThis ? "Ready to use" : nearby.length ? "Available nearby" : "Get your next benefit"}
        limit={useThis?.title || nextBenefit?.title || "No live perk yet"}
        places={useThis?.issuer?.name || `${nearby.length || 0} participating places`}
        action={useThis ? "Use this" : nearby.length ? "Available nearby" : "Get your next benefit"}
      />

      <PromoCardActions
        useThis={useThis}
        nearbyCount={nearby.length}
        nextBenefit={nextBenefit}
      />

      <section id="use-this">
        <h2 className="flex items-center gap-2 font-serif text-2xl font-bold"><Ticket className="h-5 w-5 text-primary" /> Use this</h2>
        {useThis ? (
          <div className="mt-3"><BenefitTicket perk={useThis} action="Use this" /></div>
        ) : (
          <div className="mt-3">
            <QuietEmpty title="Nothing to use yet" copy="Claim a benefit an ambassador shared, then show it at the merchant." />
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-serif text-2xl font-bold"><MapPin className="h-5 w-5 text-primary" /> Available nearby</h2>
          <Link to="/discover" className="text-sm font-bold text-primary">See more</Link>
        </div>
        {nearby.length ? (
          <div className="mt-3 space-y-2">
            {nearby.map((perk: any) => (
              <Link key={perk.id} to={perk.dropSlug ? `/drop/${perk.dropSlug}` : perk.href || "/discover"} className="block rounded-[1.4rem] border border-white/10 px-4 py-4">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">{perk.issuer?.name}</p>
                <p className="mt-1 font-serif text-xl font-bold">{perk.title}</p>
                <p className="mt-1 text-sm text-white/50">
                  {perk.availableQuantity == null ? "Open quantity" : `${perk.availableQuantity} left`}
                  {perk.expiresAt ? ` · until ${new Date(perk.expiresAt).toLocaleDateString()}` : ""}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <Link to="/discover" className="mt-3 block rounded-[1.4rem] border border-white/10 px-4 py-4 text-sm text-white/60">
            No participating businesses are sharing a live benefit right now. Discover what’s happening.
          </Link>
        )}
      </section>

      <section>
        <h2 className="flex items-center gap-2 font-serif text-2xl font-bold"><Sparkles className="h-5 w-5 text-primary" /> Get your next benefit</h2>
        {nextBenefit ? (
          <article className="mt-3 rounded-[1.4rem] border border-primary/30 bg-primary/10 px-4 py-4">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">{nextBenefit.issuer?.name || "Next visit"}</p>
            <p className="mt-1 font-serif text-2xl font-bold">{nextBenefit.title}</p>
            <p className="mt-2 text-sm text-white/60">After this one is validated, come back for this. That is the reason to stay in PROMORANG.</p>
            <Link to="/discover" className="mt-4 inline-flex min-h-11 items-center text-sm font-black text-primary">Find it nearby</Link>
          </article>
        ) : (
          <p className="mt-3 text-sm text-white/50">Use a live perk first. The next benefit appears after a merchant records it.</p>
        )}
      </section>

      <section className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] px-4 py-4">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Points and membership</p>
        <p className="mt-2 font-serif text-3xl font-bold">{Number(data?.points || 0).toLocaleString()} PromoPoints</p>
        <p className="mt-1 text-sm text-white/55">{Number(data?.keys || 0)} PromoKeys · earned only after verified use</p>
        {data?.repeatUse ? (
          <dl className="mt-4 grid grid-cols-2 gap-3 text-xs text-white/50">
            <div><dt>First redemptions</dt><dd className="text-white">{data.repeatUse.firstRedemptions}</dd></div>
            <div><dt>Second uses</dt><dd className="text-white">{data.repeatUse.secondUses}</dd></div>
            <div><dt>Referred users who redeemed</dt><dd className="text-white">{data.repeatUse.referredUsersWhoRedeem}</dd></div>
            <div><dt>Contributor rewards</dt><dd className="text-white">{data.repeatUse.contributorRewards?.pointsAwarded || 0} pts</dd></div>
          </dl>
        ) : null}
      </section>

      <section>
        <h2 className="font-serif text-2xl font-bold">On the card</h2>
        {data?.perks?.length ? (
          <div className="mt-3 space-y-2">
            {data.perks.map((perk: any) => <BenefitTicket key={perk.id} perk={perk} />)}
          </div>
        ) : (
          <div className="mt-3">
            <QuietEmpty title="No perks yet" copy="When someone drops something for you, it lands here." />
          </div>
        )}
      </section>

      <section>
        <h2 className="font-serif text-2xl font-bold">Memberships</h2>
        {data?.memberships?.length ? (
          <div className="mt-3 space-y-2">
            {data.memberships.map((item: any) => (
              <Link key={item.id} to={item.slug ? `/scenes/${item.slug}` : "/scenes"} className="block rounded-[1.4rem] border border-white/10 px-4 py-4">
                <p className="font-serif text-xl font-bold">{item.title}</p>
                <p className="text-xs uppercase tracking-widest text-white/40">{item.role}</p>
              </Link>
            ))}
          </div>
        ) : (
          <Link to="/scenes" className="mt-3 block text-sm font-bold text-primary">Find a community</Link>
        )}
      </section>
    </ExperienceShell>
  );
}

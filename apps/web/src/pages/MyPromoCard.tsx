import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useMyPromoCard } from "@/hooks/usePeopleExperience";
import { ExperienceShell, QuietEmpty } from "@/components/people/ExperienceShell";
import { DigitalWalletPass3D } from "@/components/wallet/DigitalWalletPass3D";

export default function MyPromoCard() {
  const { user, profile } = useAuth();
  const card = useMyPromoCard();
  const data = card.data;
  const holder =
    data?.name ||
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    "Member";

  return (
    <ExperienceShell
      eyebrow="PromoCard"
      title="Your perks live here"
      description="Identity, access, keys, points and claimed drops — one card."
      backTo="/dashboard"
    >
      <div className="flex justify-center">
        <DigitalWalletPass3D
          displayName={holder}
          userEmail={user?.email}
          userId={user?.id}
          points={Number(data?.points || 0)}
          promoKeys={Number(data?.keys || 0)}
          gems={Number(data?.gems || 0)}
        />
      </div>

      <section>
        <h2 className="font-serif text-2xl font-bold">Active</h2>
        {data?.perks?.length ? (
          <div className="mt-3 space-y-2">
            {data.perks.map((perk: any) => (
              <article key={perk.id} className="rounded-[1.4rem] border border-white/10 px-4 py-4">
                <p className="font-serif text-xl font-bold">{perk.title}</p>
                {perk.detail ? <p className="mt-1 text-sm text-white/50">{perk.detail}</p> : null}
                {perk.redemptionCode ? (
                  <div className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">Show this code to redeem</p>
                    <code className="mt-1 block text-xl font-black tracking-[0.16em] text-white">{perk.redemptionCode}</code>
                  </div>
                ) : (
                  <p className="mt-3 text-xs font-bold uppercase tracking-widest text-white/40">{perk.status || "Claimed"}</p>
                )}
                {perk.expiresAt ? <p className="mt-2 text-xs text-white/40">Expires {new Date(perk.expiresAt).toLocaleDateString()}</p> : null}
              </article>
            ))}
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

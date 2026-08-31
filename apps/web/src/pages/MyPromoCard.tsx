import { Link } from "react-router-dom";
import { useMyPromoCard } from "@/hooks/usePeopleExperience";
import { ExperienceShell, QuietEmpty } from "@/components/people/ExperienceShell";
import { PromoCardFace } from "@/components/promorang/SignatureObjects";

export default function MyPromoCard() {
  const card = useMyPromoCard();
  const data = card.data;

  return (
    <ExperienceShell
      eyebrow="PromoCard"
      title="Your perks live here"
      description="Identity, access, keys, points and claimed drops — one card."
      backTo="/dashboard"
    >
      <PromoCardFace
        holder={data?.name || "Member"}
        available={`${Number(data?.points || 0).toLocaleString()} pts`}
        limit={`${Number(data?.keys || 0)} keys`}
        places="Active"
      />

      <section className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] px-4 py-4">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">On the card</p>
        <p className="mt-2 font-serif text-3xl font-bold">{Number(data?.points || 0).toLocaleString()} PromoPoints</p>
        <p className="mt-1 text-sm text-white/55">{Number(data?.keys || 0)} PromoKeys</p>
      </section>

      <section>
        <h2 className="font-serif text-2xl font-bold">Active</h2>
        {data?.perks?.length ? (
          <div className="mt-3 space-y-2">
            {data.perks.map((perk: any) => (
              <article key={perk.id} className="rounded-[1.4rem] border border-white/10 px-4 py-4">
                <p className="font-serif text-xl font-bold">{perk.title}</p>
                {perk.detail ? <p className="mt-1 text-sm text-white/50">{perk.detail}</p> : null}
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

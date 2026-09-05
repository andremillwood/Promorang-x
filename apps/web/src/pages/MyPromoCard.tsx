import { issuanceFromPromoCardPerk, type PromoCardPerk } from "@promorang/shared";
import { useMyPromoCard } from "@/hooks/usePeopleExperience";
import { ExperienceShell, QuietEmpty } from "@/components/people/ExperienceShell";
import { PromoCardFace } from "@/components/promorang/SignatureObjects";
import { OfferIssuancePass } from "@/components/offers/OfferIssuancePass";
import type { OfferIssuance } from "@/hooks/useOffers";
import { Link } from "react-router-dom";

export default function MyPromoCard() {
  const card = useMyPromoCard();
  const data = card.data;
  const perks = (data?.perks || []) as PromoCardPerk[];
  const livePerks = perks.filter((perk) => perk.status !== "redeemed");
  const received = perks.filter((perk) => perk.status === "redeemed");

  return (
    <ExperienceShell
      eyebrow="PromoCard"
      title="Your perks live here"
      description="Identity, access, keys, points and claimed drops — one card. Show a pass, receive value, wait for a handoff, or leave a delivery address."
      backTo="/dashboard"
    >
      <PromoCardFace
        holder={data?.name || "Member"}
        available={`${Number(data?.points || 0).toLocaleString()} pts`}
        limit={`${Number(data?.keys || 0)} keys`}
        places={`${livePerks.length} ready`}
      />

      <section className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] px-4 py-4">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">On the card</p>
        <p className="mt-2 font-serif text-3xl font-bold">{Number(data?.points || 0).toLocaleString()} PromoPoints</p>
        <p className="mt-1 text-sm text-white/55">{Number(data?.keys || 0)} PromoKeys{data?.gems ? ` · ${Number(data.gems).toLocaleString()} Gems` : ""}</p>
      </section>

      <section>
        <h2 className="font-serif text-2xl font-bold">Active on this card</h2>
        {livePerks.length ? (
          <div className="mt-3 space-y-4">
            {livePerks.map((perk) => {
              const issuance = issuanceFromPromoCardPerk(perk);
              if (!issuance) {
                return (
                  <article key={perk.id} className="rounded-[1.4rem] border border-white/10 px-4 py-4">
                    <p className="font-serif text-xl font-bold">{perk.title}</p>
                    {perk.detail ? <p className="mt-1 text-sm text-white/50">{perk.detail}</p> : null}
                    <p className="mt-3 text-xs font-bold uppercase tracking-widest text-white/40">{perk.status || "Claimed"}</p>
                  </article>
                );
              }
              return <OfferIssuancePass key={perk.id} issuance={issuance as OfferIssuance} />;
            })}
          </div>
        ) : (
          <div className="mt-3">
            <QuietEmpty title="No perks yet" copy="When someone drops something for you, it lands here and follows the same QR, automatic, manual, or shipping journey." />
          </div>
        )}
      </section>

      {received.length ? (
        <section>
          <h2 className="font-serif text-2xl font-bold">Already used</h2>
          <div className="mt-3 space-y-4">
            {received.map((perk) => {
              const issuance = issuanceFromPromoCardPerk(perk);
              return issuance
                ? <OfferIssuancePass key={perk.id} issuance={issuance as OfferIssuance} />
                : <p key={perk.id} className="text-sm text-white/50">{perk.title}</p>;
            })}
          </div>
        </section>
      ) : null}

      <section>
        <h2 className="font-serif text-2xl font-bold">Memberships</h2>
        {data?.memberships?.length ? (
          <div className="mt-3 space-y-2">
            {data.memberships.map((item: { id: string; slug?: string; title: string; role: string }) => (
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

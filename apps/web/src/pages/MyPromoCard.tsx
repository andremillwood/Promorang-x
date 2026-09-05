import { Link } from "react-router-dom";
import { useMyPromoCard } from "@/hooks/usePeopleExperience";
import { useExperiencePath } from "@/hooks/useExperiencePath";
import { ExperienceShell, QuietEmpty } from "@/components/people/ExperienceShell";
import { PromoCardFace } from "@/components/promorang/SignatureObjects";
import { readLocalCardUnlocks } from "@/lib/discovery-card";

export default function MyPromoCard() {
  const card = useMyPromoCard();
  const to = useExperiencePath();
  const data = card.data;
  const localUnlocks = readLocalCardUnlocks();
  const remotePerks = data?.perks || [];
  const remoteTitles = new Set(remotePerks.map((perk: any) => String(perk.title || "").toLowerCase()));
  const discoverPerks = localUnlocks
    .filter((unlock) => !remoteTitles.has(unlock.perkTitle.toLowerCase()))
    .map((unlock) => ({
      id: unlock.id,
      title: unlock.perkTitle,
      detail: unlock.pollQuestion,
      status: unlock.status === "used" ? "used" : "claimed",
      redemptionCode: unlock.redemptionCode,
      expiresAt: null,
      fromDiscover: true,
      source: unlock.source,
    }));
  const perks = [...discoverPerks, ...remotePerks];

  return (
    <ExperienceShell
      eyebrow="PromoCard"
      title="Your perks live here"
      description="Answer Discover, keep the unlock, show it at a night or a counter."
      backTo="/dashboard"
    >
      <PromoCardFace
        holder={data?.name || "Member"}
        available={`${Number(data?.points || 0).toLocaleString()} pts`}
        limit={`${Number(data?.keys || 0)} keys`}
        places={perks[0]?.title || "Your perks live here"}
      />

      <section className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] px-4 py-4">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">On the card</p>
        <p className="mt-2 font-serif text-3xl font-bold">{perks.length} {perks.length === 1 ? "perk" : "perks"}</p>
        <p className="mt-1 text-sm text-white/55">{Number(data?.keys || 0)} PromoKeys · {Number(data?.points || 0).toLocaleString()} PromoPoints</p>
      </section>

      <section>
        <h2 className="font-serif text-2xl font-bold">Active</h2>
        {perks.length ? (
          <div className="mt-3 space-y-2">
            {perks.map((perk: any) => (
              <article key={perk.id} className="rounded-[1.4rem] border border-white/10 px-4 py-4">
                {perk.source === "finder" || String(perk.id || "").startsWith("unlock:found:") ? (
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-300">Finder&apos;s slip</p>
                ) : perk.fromDiscover ? (
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-300">From Discover</p>
                ) : null}
                <p className="font-serif text-xl font-bold">{perk.title}</p>
                {perk.detail ? <p className="mt-1 text-sm text-white/50">{perk.detail}</p> : null}
                {perk.redemptionCode ? (
                  <div className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">Show this at the door or the counter</p>
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
            <QuietEmpty
              title="Nothing on the card yet"
              copy="Answer one Discover question. What opens lands here."
              action={<Link to="/discover" className="text-sm font-bold text-primary">Name what you want</Link>}
            />
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
          <Link to={to("/discover")} className="mt-3 block text-sm font-bold text-primary">Find a community by naming what you want</Link>
        )}
      </section>
    </ExperienceShell>
  );
}

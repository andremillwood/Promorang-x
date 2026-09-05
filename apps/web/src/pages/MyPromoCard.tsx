import { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, QrCode, ShieldCheck } from "lucide-react";
import { PEOPLE_EXPERIENCE_CHROME, PROMOCARD_LOOP, PROMOCARD_RECHARGE_ACTIONS, presentPromoCard } from "@promorang/shared";
import { useMyPromoCard } from "@/hooks/usePeopleExperience";
import { ExperienceShell, QuietEmpty } from "@/components/people/ExperienceShell";
import { PromoCardFace } from "@/components/promorang/SignatureObjects";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function MyPromoCard() {
  const card = useMyPromoCard();
  const data = card.data;
  const view = presentPromoCard(data, data?.name || "Member");
  const [using, setUsing] = useState(false);

  return (
    <ExperienceShell
      eyebrow="PromoCard"
      title="Spend less. Do more."
      description="PromoCard is how members spend promotional value at participating places — then recharge it by showing up."
    >
      <div className="flex gap-3 rounded-2xl border-l-2 border-emerald-300/60 bg-white/[0.03] px-4 py-3">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
        <div>
          <p className="text-sm font-bold">Not a loan. No cash repayment.</p>
          <p className="mt-1 text-xs leading-5 text-white/55">
            Each place sets its own offer and minimum. Eligible value is shown before checkout.
          </p>
        </div>
      </div>

      <PromoCardFace
        holder={view.holder}
        available={view.available}
        limit={view.limit}
        places={view.places}
        tier={view.tier}
        cardNumber={view.cardNumber}
        onUse={() => setUsing(true)}
      />

      {!view.isLive ? (
        <p className="rounded-2xl border border-amber-300/25 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
          Your live spendable balance appears when the card is issued. Points, keys and claimed drops already live here.
        </p>
      ) : null}

      <section className="grid grid-cols-3 gap-3">
        <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] px-3 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/40">On the card</p>
          <p className="mt-1 font-serif text-2xl font-bold">{view.points.toLocaleString()}</p>
          <p className="text-xs text-white/45">PromoPoints</p>
        </div>
        <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] px-3 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/40">Keys</p>
          <p className="mt-1 font-serif text-2xl font-bold">{view.keys}</p>
          <p className="text-xs text-white/45">PromoKeys</p>
        </div>
        <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] px-3 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/40">Cycle</p>
          <p className="mt-1 font-serif text-2xl font-bold">{view.cycleDaysRemaining ?? "—"}</p>
          <p className="text-xs text-white/45">{view.cycleDaysRemaining != null ? "days left" : "Open cycle"}</p>
        </div>
      </section>

      <section>
        <h2 className="font-serif text-2xl font-bold">One simple loop</h2>
        <div className="mt-4 space-y-5">
          {PROMOCARD_LOOP.map((item) => (
            <div key={item.step} className="grid grid-cols-[2.75rem_1fr] gap-3 border-b border-white/10 pb-5 last:border-0">
              <div className="grid h-11 w-11 place-items-center rounded-full border border-primary/35 bg-primary/10 text-xs font-black text-primary">
                {item.step}
              </div>
              <div>
                <p className="text-base font-black">{item.title}</p>
                <p className="mt-1 text-sm leading-6 text-white/55">{item.copy}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-serif text-2xl font-bold">Use it nearby</h2>
          <Link to="/discover" className="text-sm font-bold text-primary">Discover</Link>
        </div>
        <Link to="/discover" className="mt-3 flex items-center gap-3 rounded-[1.4rem] border border-white/10 px-4 py-4">
          <MapPin className="h-5 w-5 text-primary" />
          <div>
            <p className="font-serif text-xl font-bold">Find a participating place</p>
            <p className="text-sm text-white/50">See the offer before you go, then apply the card.</p>
          </div>
        </Link>
      </section>

      <section>
        <h2 className="font-serif text-2xl font-bold">Ways to recharge</h2>
        <div className="mt-3 space-y-2">
          {PROMOCARD_RECHARGE_ACTIONS.map((action) => (
            <Link key={action.id} to={action.webHref} className="flex items-center justify-between gap-3 rounded-[1.4rem] border border-white/10 px-4 py-4">
              <div>
                <p className="font-bold">{action.title}</p>
                <p className="mt-1 text-sm text-white/50">{action.copy}</p>
              </div>
              <span className="shrink-0 text-sm font-black text-emerald-300">{action.reward}</span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-serif text-2xl font-bold">Active perks</h2>
        {data?.perks?.length ? (
          <div className="mt-3 space-y-2">
            {data.perks.map((perk: any) => (
              <article key={perk.id} className="rounded-[1.4rem] border border-white/10 px-4 py-4">
                <p className="font-serif text-xl font-bold">{perk.title}</p>
                {perk.detail ? <p className="mt-1 text-sm text-white/50">{perk.detail}</p> : null}
                {perk.redemptionCode ? (
                  <button type="button" onClick={() => setUsing(true)} className="mt-4 w-full rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-3 text-left">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">Show this code to redeem</p>
                    <code className="mt-1 block text-xl font-black tracking-[0.16em] text-white">{perk.redemptionCode}</code>
                  </button>
                ) : (
                  <p className="mt-3 text-xs font-bold uppercase tracking-widest text-white/40">{perk.status || "Claimed"}</p>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-3">
            <QuietEmpty title="No perks yet" copy="When someone drops something for you, it lands on this card." />
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

      <Link to="/vault" className="block rounded-[1.4rem] border border-white/10 px-4 py-4 text-sm text-white/55">
        Memories stay in Vault. Receipts, photos and what you kept after a visit.
      </Link>

      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/25">
        {PEOPLE_EXPERIENCE_CHROME.card.purpose}
      </p>

      <Dialog open={using} onOpenChange={setUsing}>
        <DialogContent className="border-zinc-800 bg-zinc-950 text-white max-w-sm text-center">
          <DialogHeader>
            <DialogTitle className="text-center">Present to cashier</DialogTitle>
            <DialogDescription className="text-center text-zinc-400">
              Show this code at a participating checkout to apply eligible PromoCard value. Pay any remainder normally.
            </DialogDescription>
          </DialogHeader>
          <div className="my-4 flex flex-col items-center rounded-2xl bg-white p-6">
            <QrCode className="h-40 w-40 text-black" />
            <p className="mt-2 font-mono text-xs font-bold tracking-wider text-zinc-600">{view.useCode}</p>
          </div>
          <p className="text-sm font-bold text-amber-200">Available: {view.available}</p>
          <p className="text-xs text-zinc-400">{view.holder}</p>
          <p className="mt-2 text-[11px] text-zinc-500">Not a loan. No cash repayment. Offer and minimum spend are shown before checkout.</p>
          <Button onClick={() => setUsing(false)} variant="outline" className="mt-4 w-full border-zinc-800">
            Done
          </Button>
        </DialogContent>
      </Dialog>
    </ExperienceShell>
  );
}

import { useState } from "react";
import { Link } from "react-router-dom";
import { useMyPromoCard } from "@/hooks/usePeopleExperience";
import { useClaimIssuance } from "@/hooks/useOffers";
import { useToast } from "@/hooks/use-toast";
import { ExperienceShell, QuietEmpty } from "@/components/people/ExperienceShell";
import { PromoCardSummary } from "@/components/promocard/PromoCardSummary";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { canPresentPerk, perkSection, type CardPerk } from "@/lib/promocard/benefits";

const sections = [
  { id: "ready", title: "Ready to use" },
  { id: "pending", title: "Next steps" },
  { id: "history", title: "Past benefits" },
] as const;

function dateLabel(value: string) {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toLocaleString() : "Check with the issuer";
}

export default function MyPromoCard() {
  const card = useMyPromoCard();
  const claim = useClaimIssuance();
  const { toast } = useToast();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const data = card.data;
  const perks: CardPerk[] = data?.perks || [];
  const selected = perks.find((perk) => perk.id === selectedId && canPresentPerk(perk));

  const activate = async (id: string) => {
    try {
      await claim.mutateAsync(id);
      toast({ title: "Perk claimed", description: "Check its next step on your card." });
    } catch (error) {
      toast({ title: "Could not claim this perk", description: (error as Error).message, variant: "destructive" });
    }
  };

  if (card.isLoading) {
    return <ExperienceShell eyebrow="PromoCard" title="Your benefits"><p role="status">Loading your card…</p></ExperienceShell>;
  }
  if (card.isError) {
    return (
      <ExperienceShell eyebrow="PromoCard" title="Your benefits">
        <QuietEmpty title="Couldn’t load your card" copy="Try again to see your current benefits."
          action={<Button disabled={card.isFetching} onClick={() => void card.refetch()}>Try again</Button>} />
      </ExperienceShell>
    );
  }

  return (
    <ExperienceShell eyebrow="PromoCard" title="Use something good" description="Your offers, access and community benefits in one place." backTo="/dashboard">
      <PromoCardSummary holder={data?.name || "Member"} perks={perks} />
      <Link to="/offers" className="block rounded-2xl bg-primary px-5 py-4 text-center font-bold text-black">Find your next benefit</Link>
      {!perks.length ? (
        <QuietEmpty title="Choose your first perk" copy="Browse available offers, or open a perk link someone shared with you. Claimed benefits appear here." />
      ) : null}

      {sections.map((section) => {
        const items = perks.filter((perk) => perkSection(perk) === section.id);
        if (!items.length) return null;
        return (
          <section key={section.id}>
            <h2 className="font-serif text-2xl font-bold">{section.title}</h2>
            <div className="mt-3 space-y-3">
              {items.map((perk) => (
                <article key={perk.id} className="rounded-2xl border border-white/10 p-4">
                  <h3 className="font-serif text-xl font-bold">{perk.title}</h3>
                  {perk.issuerName ? <p className="mt-1 text-xs text-white/50">Issued by {perk.issuerName}</p> : null}
                  {perk.detail ? <p className="mt-2 text-sm text-white/60">{perk.detail}</p> : null}
                  {perk.terms ? <p className="mt-3 whitespace-pre-line text-sm text-white/75"><strong>Terms: </strong>{perk.terms}</p> : null}
                  {perk.expiresAt ? <p className="mt-2 text-xs text-white/50">Expires: {dateLabel(perk.expiresAt)}</p> : null}
                  {perk.redeemedAt ? <p className="mt-2 text-xs text-white/50">Used: {dateLabel(perk.redeemedAt)}</p> : null}
                  {section.id === "ready" ? (
                    <Button className="mt-4" onClick={() => setSelectedId(perk.id)}>Show redemption code</Button>
                  ) : section.id === "pending" ? (
                    <div className="mt-4">
                      {perk.status === "issued" ? (
                        <Button disabled={claim.isPending} onClick={() => void activate(perk.id)}>Claim this perk</Button>
                      ) : (
                        <p className="text-sm text-white/60">{perk.fulfillmentType === "shipping" ? "Delivery pending. Check with the issuer for the next step." : "This perk needs confirmation from its issuer before you can use it."}</p>
                      )}
                    </div>
                  ) : (
                    <p className="mt-3 text-xs font-bold uppercase tracking-wider text-white/45">{["issued", "claimed", "fulfillment_pending"].includes(perk.status) ? "Expired" : perk.status}</p>
                  )}
                </article>
              ))}
            </div>
          </section>
        );
      })}

      <section>
        <h2 className="font-serif text-2xl font-bold">Your communities</h2>
        {data?.memberships?.length ? data.memberships.map((item) => (
          <Link key={item.id} to={item.slug ? `/scenes/${item.slug}` : "/scenes"} className="mt-3 block rounded-2xl border border-white/10 p-4">
            <p className="font-serif text-xl font-bold">{item.title}</p>
            <p className="mt-1 text-xs text-white/50">{item.role}</p>
          </Link>
        )) : <Link to="/scenes" className="mt-3 block font-bold text-primary">Find a community</Link>}
      </section>
      <Link to="/wallet" className="block text-sm text-white/60">View points, keys and Gems in your wallet</Link>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => { if (!open) setSelectedId(null); }}>
        <DialogContent className="border-zinc-800 bg-zinc-950 text-white">
          <DialogHeader>
            <DialogTitle>{selected?.title}</DialogTitle>
            <DialogDescription>Show this code to {selected?.issuerName || "the business or host that issued this benefit"}.</DialogDescription>
          </DialogHeader>
          <code className="my-4 block break-all rounded-2xl bg-white p-5 text-center font-mono text-2xl font-bold text-black">{selected?.redemptionCode}</code>
          {selected?.terms ? <p className="whitespace-pre-line text-sm text-white/70">{selected.terms}</p> : null}
          {selected?.expiresAt ? <p className="text-xs text-white/50">Expires: {dateLabel(selected.expiresAt)}</p> : null}
          <Button onClick={() => setSelectedId(null)}>Done</Button>
        </DialogContent>
      </Dialog>
    </ExperienceShell>
  );
}

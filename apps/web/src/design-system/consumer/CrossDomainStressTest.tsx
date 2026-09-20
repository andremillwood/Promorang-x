import { ArrowRight, CarFront, ChefHat, Globe2, Scissors, UsersRound } from "lucide-react";
import { PromoCardFace } from "@/components/promorang/PromoCardObject";
import { PaperReceipt, TicketPass } from "@/components/promorang/SignatureObjects";

const scenarios = [
  {
    category: "FOOD",
    title: "Lunch worth leaving the office for.",
    place: "Liguanea",
    move: "Try the chef's lunch menu",
    benefit: "20% off lunch",
    detail: "Valid today · 12–3 PM",
    Icon: ChefHat,
  },
  {
    category: "AUTOMOTIVE",
    title: "Take the car out of the ad.",
    place: "Kingston",
    move: "Book a Geely test drive",
    benefit: "Priority test-drive slot",
    detail: "Flash Motors · this week",
    Icon: CarFront,
  },
  {
    category: "BEAUTY",
    title: "Your next appointment has an opening.",
    place: "Barbican",
    move: "Claim the treatment window",
    benefit: "Complimentary add-on",
    detail: "Valid on first booking",
    Icon: Scissors,
  },
  {
    category: "COMMUNITY",
    title: "A room is forming around this.",
    place: "New Kingston",
    move: "Join the workshop",
    benefit: "Reserved seat",
    detail: "Saturday · 2 PM",
    Icon: UsersRound,
  },
  {
    category: "DIGITAL",
    title: "Something useful just unlocked online.",
    place: "Anywhere",
    move: "Open the creator drop",
    benefit: "Subscriber-only download",
    detail: "Available for 48 hours",
    Icon: Globe2,
  },
] as const;

export function CrossDomainStressTest() {
  return (
    <section className="border-t border-white/10 pt-20">
      <div className="grid gap-8 lg:grid-cols-[1fr_.55fr] lg:items-end">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">07 · Category stress test</p>
          <h2 className="mt-4 max-w-4xl font-serif text-5xl font-bold leading-[0.9] tracking-[-0.055em] md:text-7xl">If nightlife disappears, does PROMORANG remain?</h2>
        </div>
        <p className="border-l border-primary/35 pl-5 text-sm leading-6 text-white/48">
          The system passes only if the same object language, one-move hierarchy, proof and access semantics work across unrelated markets without becoming a different product every time.
        </p>
      </div>

      <div className="mt-12 grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-2 xl:grid-cols-5">
        {scenarios.map(({ category, title, place, move, benefit, detail, Icon }) => (
          <article key={category} className="flex min-h-[330px] flex-col bg-[#0d0d0e] p-5">
            <div className="flex items-start justify-between gap-4">
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-primary">{category}</p>
              <Icon className="h-4 w-4 text-white/45" />
            </div>
            <p className="mt-8 font-serif text-3xl font-bold leading-[0.94] tracking-[-0.035em]">{title}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.16em] text-white/35">{place}</p>
            <div className="mt-auto border-t border-white/10 pt-5">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Your move</p>
              <p className="mt-2 text-sm font-bold">{move}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-[#f6d48a]"><span>{benefit}</span><ArrowRight className="h-3.5 w-3.5" /></div>
              <p className="mt-1 text-[11px] text-white/30">{detail}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-14 grid gap-8 xl:grid-cols-[1.1fr_.9fr]">
        <div>
          <p className="mb-4 text-[10px] font-black uppercase tracking-[0.22em] text-white/35">Same object · different market</p>
          <PromoCardFace
            available="Priority test-drive slot"
            limit="Flash Motors · this week"
            holder="Andre"
            places="GEELY TEST DRIVE"
            action="BOOK THIS"
            sceneMark="MOVE JAMAICA"
            interactive={false}
            className="max-w-none"
          />
          <p className="mt-4 text-sm leading-6 text-white/45">PromoCard remains access. Only the benefit, issuer and context change.</p>
        </div>
        <div className="grid gap-5">
          <TicketPass kicker="SATURDAY · 2 PM" title="WORKSHOP SEAT" detail="New Kingston · reserved community session." stub="WKS-0216" stubLabel="SEAT" />
          <PaperReceipt
            heading="USE VERIFIED"
            lines={[
              { label: "Merchant", value: "Lunch partner" },
              { label: "Benefit", value: "20% off lunch", strong: true },
              { label: "Place", value: "Liguanea" },
              { label: "Used", value: "1:14 PM" },
            ]}
            footer="Proof works the same whether the action was a party, lunch, test drive, booking or digital unlock."
          />
        </div>
      </div>
    </section>
  );
}

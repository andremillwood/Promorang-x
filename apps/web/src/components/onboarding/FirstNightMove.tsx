import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Store, Users } from "lucide-react";
import { openingHref, type OpeningPathChoice } from "@promorang/shared";
import { TicketPass, PlainEnglish } from "@/components/promorang/SignatureObjects";
import { useAuth } from "@/contexts/AuthContext";
import { useOpeningMove, writeOpeningPathChoice } from "@/hooks/useOpeningMove";

export function FirstNightMove() {
  const { claimRole } = useAuth();
  const { show, move, loading } = useOpeningMove();
  const navigate = useNavigate();

  if (loading || !show) return null;

  const choose = async (choice: OpeningPathChoice) => {
    writeOpeningPathChoice(choice);
    if (choice === "place") {
      await claimRole("host");
      return;
    }
    navigate(openingHref("discover"));
  };

  if (move.path === "choose_path") {
    return (
      <section className="border-b border-white/10 bg-black px-5 py-10 text-white md:px-8">
        <div className="mx-auto max-w-xl">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{move.eyebrow}</p>
          <h1 className="mt-3 font-serif text-[2.15rem] font-black leading-[0.98] tracking-[-0.04em] md:text-5xl">
            {move.headline}
          </h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-white/65 md:text-base">{move.body}</p>
          <div className="mt-4">
            <PlainEnglish>{move.plainEnglish}</PlainEnglish>
          </div>
          <div className="mt-6 grid gap-3">
            <button
              type="button"
              onClick={() => void choose("place")}
              className="flex min-h-16 items-center justify-between gap-3 rounded-2xl border border-primary/35 bg-primary/10 px-4 py-4 text-left active:scale-[0.99]"
            >
              <span className="flex items-start gap-3">
                <Store className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <span>
                  <span className="block text-base font-black">I have a place</span>
                  <span className="mt-1 block text-sm leading-5 text-white/60">A bar, restaurant, venue, or night people should show up to.</span>
                </span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-primary" />
            </button>
            <button
              type="button"
              onClick={() => void choose("out")}
              className="flex min-h-16 items-center justify-between gap-3 rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-4 text-left active:scale-[0.99]"
            >
              <span className="flex items-start gap-3">
                <Users className="mt-0.5 h-5 w-5 shrink-0 text-white/70" />
                <span>
                  <span className="block text-base font-black">I am going out</span>
                  <span className="mt-1 block text-sm leading-5 text-white/60">Find a night, a room, or a crowd worth showing up for.</span>
                </span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-white/50" />
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="border-b border-white/10 bg-black px-5 py-10 text-white md:px-8">
      <div className="mx-auto max-w-xl">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{move.eyebrow}</p>
        <h1 className="mt-3 font-serif text-[2.15rem] font-black leading-[0.98] tracking-[-0.04em] md:text-5xl">
          {move.headline}
        </h1>
        <p className="mt-4 max-w-md text-sm leading-6 text-white/65 md:text-base">{move.body}</p>
        <div className="mt-4">
          <PlainEnglish>{move.plainEnglish}</PlainEnglish>
        </div>
        <Link
          to={openingHref(move.destination)}
          className="mt-6 flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-black text-black active:scale-[0.98]"
        >
          {move.ctaLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
        <div className="mt-6">
          <TicketPass
            kicker={move.eyebrow}
            title={move.ticketTitle}
            detail={move.ticketDetail}
            stub={move.ticketStub}
            stubLabel={move.ctaLabel}
          />
        </div>
        <ol className="mt-8 space-y-4">
          {move.steps.map((step) => (
            <li key={step.label} className="grid grid-cols-[2.5rem_1fr] gap-3">
              <span className="font-mono text-[11px] font-bold tracking-[0.14em] text-primary">{step.label}</span>
              <div>
                <p className="text-sm font-black">{step.title}</p>
                <p className="mt-1 text-sm leading-6 text-white/55">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

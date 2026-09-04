import { Link } from "react-router-dom";
import { useWhatHappened } from "@/hooks/usePeopleExperience";
import { useAuth } from "@/contexts/AuthContext";
import { formatPayoutDate, nextWeeklyPayoutAt } from "@/lib/payout-calendar";

type WeekStoryStripProps = {
  roleLabel?: string;
  payoutAt?: string | null;
};

export function WeekStoryStrip({ roleLabel = "This week", payoutAt }: WeekStoryStripProps) {
  const { user } = useAuth();
  const happened = useWhatHappened();
  const data = happened.data;
  const buckets = data?.buckets || {};
  const showedUp = Number(buckets.went || 0);
  const claimed = Number(buckets.claimed || 0);
  const brought = Number(buckets.brought || 0);
  const parts = [
    showedUp ? `${showedUp} ${showedUp === 1 ? "person showed up" : "people showed up"}` : null,
    claimed ? `${claimed} claimed a perk` : null,
    brought ? `${brought} brought friends` : null,
  ].filter(Boolean);
  const story = parts.length
    ? parts.join(" · ")
    : user
      ? "Quiet so far. The week reads as a story once someone claims, arrives, or brings a friend."
      : "This week starts when people show up.";
  const payday = formatPayoutDate(payoutAt || nextWeeklyPayoutAt());

  return (
    <section className="rounded-[1.6rem] border border-amber-400/25 bg-gradient-to-r from-amber-950/40 via-black to-black px-4 py-4 sm:px-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">{roleLabel}</p>
          <p className="mt-1.5 max-w-2xl font-serif text-xl font-bold leading-snug text-white sm:text-2xl">{story}</p>
          <p className="mt-1 text-xs text-white/50">Next payout lands {payday}. That is the payoff — not a chart wall.</p>
        </div>
        <Link
          to="/progress"
          className="shrink-0 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-bold text-amber-100 hover:bg-white/10"
        >
          Open the week
        </Link>
      </div>
    </section>
  );
}

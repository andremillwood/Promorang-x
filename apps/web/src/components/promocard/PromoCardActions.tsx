import { Link } from "react-router-dom";
import { MapPin, Sparkles, Ticket } from "lucide-react";

type PromoCardActionsProps = {
  useThis?: { title?: string; redemption?: { code?: string | null } } | null;
  nearbyCount?: number;
  nextBenefit?: { title?: string } | null;
  onUseThis?: () => void;
};

export function PromoCardActions({ useThis, nearbyCount = 0, nextBenefit, onUseThis }: PromoCardActionsProps) {
  return (
    <nav aria-label="PromoCard actions" className="grid gap-2 sm:grid-cols-3">
      {onUseThis ? (
        <button type="button" onClick={onUseThis} className="rounded-2xl bg-primary px-4 py-4 text-left text-black">
          <Ticket className="h-4 w-4" />
          <p className="mt-2 text-sm font-black">Use this</p>
          <p className="mt-1 text-xs text-black/70">{useThis?.title || "Flip the card at the door"}</p>
        </button>
      ) : (
      <a
        href="#use-this"
        className="rounded-2xl bg-primary px-4 py-4 text-black"
      >
        <Ticket className="h-4 w-4" />
        <p className="mt-2 text-sm font-black">Use this</p>
        <p className="mt-1 text-xs text-black/70">{useThis?.title || "Claim a live perk first"}</p>
      </a>
      )}
      <Link to="/discover" className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4">
        <MapPin className="h-4 w-4 text-amber-300" />
        <p className="mt-2 text-sm font-black">Available nearby</p>
        <p className="mt-1 text-xs text-white/50">{nearbyCount ? `${nearbyCount} participating now` : "See participating places"}</p>
      </Link>
      <Link to={nextBenefit ? "/discover" : "/give"} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4">
        <Sparkles className="h-4 w-4 text-amber-300" />
        <p className="mt-2 text-sm font-black">Get your next benefit</p>
        <p className="mt-1 text-xs text-white/50">{nextBenefit?.title || "After a merchant validates this one"}</p>
      </Link>
    </nav>
  );
}

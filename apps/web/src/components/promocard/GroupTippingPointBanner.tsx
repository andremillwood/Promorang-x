import { Link } from "react-router-dom";
import { MapPin, Sparkles } from "lucide-react";

export const GroupTippingPointBanner: React.FC = () => {
  return (
    <section className="rounded-2xl border border-white/10 bg-zinc-950 p-5 text-white">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-300">Live inventory only</p>
      <h3 className="mt-2 font-serif text-2xl font-bold">No simulated group unlocks</h3>
      <p className="mt-2 text-sm leading-6 text-white/60">
        Joining a localStorage drop does not put money on a PromoCard. Claim a benefit a merchant actually supplied, then have them validate it.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link to="/discover" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-black text-black">
          <MapPin className="h-4 w-4" />
          Available nearby
        </Link>
        <Link to="/card" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/15 px-4 text-sm font-bold">
          <Sparkles className="h-4 w-4" />
          Get your next benefit
        </Link>
      </div>
    </section>
  );
};

import { Link } from "react-router-dom";
import { MapPin, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useHappeningNow, useMySocialPlans } from "@/hooks/usePeopleMoments";
import { originTypeLabel } from "@promorang/shared";

export function PeopleMomentRail() {
  const { user } = useAuth();
  const happening = useHappeningNow();
  const plans = useMySocialPlans(Boolean(user));
  const moments = happening.data || [];
  const myPlans = plans.data || [];

  return (
    <section className="container px-6 py-8">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#FF5500]">Happening now</p>
          <h2 className="mt-1 text-3xl font-black uppercase tracking-[-0.05em]">
            People are already out
          </h2>
        </div>
        <Link
          to="/create/moment"
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#FF5500] px-4 text-sm font-black"
        >
          <Plus className="h-4 w-4" /> Start a Moment
        </Link>
      </div>

      {!!myPlans.length && (
        <div className="mb-4 overflow-x-auto">
          <div className="flex gap-3">
            {myPlans.slice(0, 4).map((plan) => (
              <Link
                key={String(plan.id)}
                to={`/plans/${plan.id}`}
                className="min-w-[220px] rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3"
              >
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#FF5500]">Your Plan</p>
                <p className="mt-1 font-bold">{String(plan.title)}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-flow-col auto-cols-[78%] gap-3 overflow-x-auto pb-2 md:auto-cols-[32%] lg:grid-flow-row lg:grid-cols-3 lg:overflow-visible">
        {moments.slice(0, 6).map((moment) => (
          <Link
            key={String(moment.id)}
            to={`/moments/${moment.id}`}
            className="rounded-3xl border border-white/10 bg-white/[0.04] p-3 transition hover:border-[#FF5500]/50"
          >
            {moment.image_url ? (
              <img src={String(moment.image_url)} alt="" className="mb-3 h-36 w-full rounded-2xl object-cover" />
            ) : (
              <div className="mb-3 flex h-36 items-end rounded-2xl bg-gradient-to-br from-[#FF5500]/30 to-black p-3">
                <span className="text-xs font-black uppercase">{originTypeLabel(String(moment.origin_type || "community"))}</span>
              </div>
            )}
            <p className="text-lg font-black leading-tight">{String(moment.title)}</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-white/55">
              <MapPin className="h-3 w-3 text-[#FF5500]" />
              {String(moment.venue_name || moment.location || "Somewhere nearby")}
            </p>
          </Link>
        ))}
        {!moments.length && (
          <Link
            to="/create/moment?when=now"
            className="rounded-3xl border border-dashed border-white/15 px-5 py-8 text-sm text-white/55"
          >
            Nobody posted yet. If you're already out, start the Moment.
          </Link>
        )}
      </div>
    </section>
  );
}

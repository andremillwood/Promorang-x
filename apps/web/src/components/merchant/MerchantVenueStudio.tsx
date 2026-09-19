import { Link } from "react-router-dom";
import { Building, ExternalLink, MapPin, Plus, Sparkles, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMerchantVenues } from "@/hooks/useVenues";

export function MerchantVenueStudio({
  onOpenMoments,
}: {
  onOpenMoments?: () => void;
}) {
  const { data: venues = [], isLoading, error } = useMerchantVenues();

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-emerald-500/25 bg-[linear-gradient(135deg,rgba(16,185,129,.10),rgba(0,0,0,.86))] p-5 sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.2em] text-emerald-300">
              <Store className="h-4 w-4" />
              Merchant · Places
            </div>
            <h2 className="mt-3 text-2xl font-black text-white sm:text-3xl">Operate the places you actually own or manage.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">
              Venue identity, operating status and capacity come from recorded place data. PROMORANG does not invent occupancy,
              ratings or live Moment counts when those records do not exist.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild className="rounded-xl bg-emerald-500 font-black text-black hover:bg-emerald-400">
              <Link to="/dashboard/venues/add"><Plus className="mr-2 h-4 w-4" />Add location</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl border-white/10 bg-white/[.03] text-white">
              <Link to="/create/moment"><Sparkles className="mr-2 h-4 w-4 text-amber-300" />Create on-site Moment</Link>
            </Button>
          </div>
        </div>
      </section>

      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {[0, 1].map((item) => <div key={item} className="h-56 animate-pulse rounded-3xl border border-white/10 bg-white/[.025]" />)}
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-red-500/20 bg-red-500/[.05] p-6 text-sm text-red-200">
          Places could not be loaded. No sample venues have been substituted.
        </div>
      ) : venues.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/12 bg-white/[.02] p-9 text-center">
          <Building className="mx-auto h-9 w-9 text-white/25" />
          <h3 className="mt-4 text-xl font-black text-white">No managed places recorded yet.</h3>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-white/45">
            Add the first real location before PROMORANG can attach offers, Moments or on-site operations to it.
          </p>
          <Button asChild className="mt-5 rounded-xl bg-emerald-500 font-black text-black hover:bg-emerald-400">
            <Link to="/dashboard/venues/add">Add your first location</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {venues.map((venue: any) => {
            const capacity = Number(venue.capacity);
            const hasCapacity = Number.isFinite(capacity) && capacity > 0;
            const rating = Number(venue.rating);
            const hasRating = Number.isFinite(rating) && rating > 0;
            const location = venue.address || venue.location || venue.city || "Location not recorded";

            return (
              <article key={venue.id} className="overflow-hidden rounded-3xl border border-white/10 bg-[#0e1015]">
                {venue.image_url ? (
                  <div className="h-44 overflow-hidden bg-black">
                    <img src={venue.image_url} alt={venue.name || "Merchant venue"} className="h-full w-full object-cover opacity-70" />
                  </div>
                ) : (
                  <div className="grid h-32 place-items-center bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,.16),transparent_45%),#0b0c0d]">
                    <Store className="h-8 w-8 text-emerald-300/45" />
                  </div>
                )}

                <div className="space-y-5 p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[.14em] ${venue.is_active ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300" : "border-white/10 bg-white/[.03] text-white/40"}`}>
                          {venue.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <h3 className="mt-3 text-xl font-black text-white">{venue.name || "Unnamed place"}</h3>
                      <p className="mt-2 flex items-start gap-2 text-xs leading-5 text-white/45">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300" />
                        {location}
                      </p>
                    </div>
                  </div>

                  <dl className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/8 bg-white/[.025] p-4">
                      <dt className="text-[9px] font-black uppercase tracking-[.14em] text-white/30">Capacity</dt>
                      <dd className="mt-2 text-lg font-black text-white">{hasCapacity ? capacity.toLocaleString() : "Not recorded"}</dd>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-white/[.025] p-4">
                      <dt className="text-[9px] font-black uppercase tracking-[.14em] text-white/30">Rating</dt>
                      <dd className="mt-2 text-lg font-black text-white">{hasRating ? rating.toFixed(1) : "Not recorded"}</dd>
                    </div>
                  </dl>

                  <div className="flex flex-wrap gap-2 border-t border-white/8 pt-4">
                    {onOpenMoments ? (
                      <Button type="button" variant="outline" onClick={onOpenMoments} className="rounded-xl border-white/10 bg-white/[.03] text-white">
                        Open Moment tools
                      </Button>
                    ) : null}
                    <Button asChild variant="outline" className="rounded-xl border-white/10 bg-white/[.03] text-white">
                      <Link to="/discover/venues"><ExternalLink className="mr-2 h-4 w-4" />Browse public places</Link>
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MerchantVenueStudio;

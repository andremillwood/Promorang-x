import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Clock, ExternalLink, MapPin, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHostedMoments } from "@/hooks/useMoments";

function formatDate(value?: string | null) {
  if (!value) return "Time not recorded";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Time not recorded"
    : date.toLocaleString([], { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function HostMomentsStagingConsole() {
  const { data: moments = [], isLoading, isError } = useHostedMoments();

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-amber-500/25 bg-[linear-gradient(135deg,rgba(245,158,11,.10),rgba(0,0,0,.88))] p-5 sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.2em] text-amber-300">
              <Calendar className="h-4 w-4" />
              Host · Moments
            </div>
            <h2 className="mt-3 text-2xl font-black text-white sm:text-3xl">Operate the Moments you actually host.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">
              RSVP intent, verified arrival, capacity and reward configuration remain separate. PROMORANG does not substitute curated
              Moments or invent attendance when your hosted inventory is empty.
            </p>
          </div>
          <Button asChild className="rounded-xl bg-amber-400 font-black text-black hover:bg-amber-300">
            <Link to="/create/moment"><Plus className="mr-2 h-4 w-4" />Create a Moment</Link>
          </Button>
        </div>
      </section>

      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {[0, 1].map((item) => <div key={item} className="h-64 animate-pulse rounded-3xl border border-white/10 bg-white/[.025]" />)}
        </div>
      ) : isError ? (
        <div className="rounded-3xl border border-red-500/20 bg-red-500/[.05] p-6 text-sm text-red-200">
          Hosted Moments could not be loaded. No curated or demo Moment has been substituted.
        </div>
      ) : moments.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/12 bg-white/[.02] p-9 text-center">
          <Calendar className="mx-auto h-9 w-9 text-amber-300/35" />
          <h3 className="mt-4 text-xl font-black text-white">No hosted Moments recorded yet.</h3>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-white/45">
            Create the first real Moment before PROMORANG shows stage operations, arrivals, proof or results.
          </p>
          <Button asChild className="mt-5 rounded-xl bg-amber-400 font-black text-black hover:bg-amber-300">
            <Link to="/create/moment">Create your first Moment</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {moments.map((moment: any) => {
            const capacity = Number(moment.capacity);
            const hasCapacity = Number.isFinite(capacity) && capacity > 0;
            const participantCount = Number(moment.participant_count);
            const hasParticipantCount = Number.isFinite(participantCount) && participantCount >= 0;
            const occupancy = hasCapacity && hasParticipantCount
              ? Math.min(100, Math.max(0, Math.round((participantCount / capacity) * 100)))
              : null;
            const hasReward = typeof moment.reward === "string" && moment.reward.trim().length > 0;

            return (
              <article key={moment.id} className="overflow-hidden rounded-3xl border border-white/10 bg-[#0e1015]">
                {moment.image_url ? (
                  <div className="relative h-44 overflow-hidden bg-black">
                    <img src={moment.image_url} alt={moment.title || "Hosted Moment"} className="h-full w-full object-cover opacity-70" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0e1015] via-black/30 to-transparent" />
                  </div>
                ) : null}

                <div className="space-y-5 p-5 sm:p-6">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[.14em]">
                      <span className={`rounded-full border px-2.5 py-1 ${moment.is_active ? "border-amber-400/25 bg-amber-400/10 text-amber-300" : "border-white/10 bg-white/[.03] text-white/40"}`}>
                        {moment.is_active ? "Active" : "Scheduled / inactive"}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-white/35"><Clock className="h-3.5 w-3.5" />{formatDate(moment.starts_at)}</span>
                    </div>
                    <h3 className="mt-3 text-xl font-black text-white">{moment.title || "Untitled Moment"}</h3>
                    <p className="mt-2 flex items-start gap-2 text-xs leading-5 text-white/45">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300" />
                      {moment.venue_name || moment.location || "Location not recorded"}
                    </p>
                    {moment.description ? <p className="mt-3 line-clamp-3 text-xs leading-5 text-white/50">{moment.description}</p> : null}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/8 bg-white/[.025] p-4">
                      <p className="text-[9px] font-black uppercase tracking-[.14em] text-white/30">RSVP / participant record</p>
                      <p className="mt-2 text-lg font-black text-white">{hasParticipantCount ? participantCount.toLocaleString() : "Not recorded"}</p>
                      <p className="mt-1 text-[10px] leading-4 text-white/30">Not the same as verified attendance.</p>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-white/[.025] p-4">
                      <p className="text-[9px] font-black uppercase tracking-[.14em] text-white/30">Capacity</p>
                      <p className="mt-2 text-lg font-black text-white">{hasCapacity ? capacity.toLocaleString() : "Not recorded"}</p>
                      {occupancy !== null ? <p className="mt-1 text-[10px] leading-4 text-white/30">{occupancy}% of recorded capacity by participant count.</p> : null}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                    <p className="text-[9px] font-black uppercase tracking-[.14em] text-white/30">Configured participant value</p>
                    <p className="mt-2 text-sm font-black text-white">{hasReward ? moment.reward : "No reward recorded"}</p>
                    <p className="mt-1 text-[10px] leading-4 text-white/30">Configured value does not imply issuance or settlement.</p>
                  </div>

                  <div className="flex flex-wrap gap-2 border-t border-white/8 pt-4">
                    <Button asChild variant="outline" className="rounded-xl border-white/10 bg-white/[.03] text-white">
                      <Link to={`/moments/${moment.id}`}><ExternalLink className="mr-2 h-4 w-4" />Public record</Link>
                    </Button>
                    <Button asChild className="rounded-xl bg-amber-400 font-black text-black hover:bg-amber-300">
                      <Link to={`/dashboard/moments/${moment.id}`}>Moment controls<ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                    <Button asChild variant="ghost" className="text-white/55 hover:text-white">
                      <Link to={`/host/moments/${moment.id}/guests`}><Users className="mr-2 h-4 w-4" />Door Board</Link>
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

export default HostMomentsStagingConsole;

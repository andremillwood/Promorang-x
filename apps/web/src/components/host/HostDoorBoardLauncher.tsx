import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, MapPin, Radio, TicketCheck } from "lucide-react";
import { useHostedMoments } from "@/hooks/useMoments";
import { Button } from "@/components/ui/button";

function formatMomentTime(value?: string | null) {
  if (!value) return "Time pending";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Time pending";
  return date.toLocaleString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function HostDoorBoardLauncher() {
  const { data: moments = [], isLoading, isError } = useHostedMoments();
  const ordered = [...moments].sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
  const now = Date.now();
  const relevant = ordered
    .filter((moment) => moment.is_active || new Date(moment.starts_at).getTime() >= now - 12 * 60 * 60 * 1000)
    .slice(0, 6);

  if (isLoading) {
    return (
      <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">Door Board</p>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {[0, 1].map((item) => <div key={item} className="h-36 animate-pulse rounded-2xl bg-white/[0.04]" />)}
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="rounded-3xl border border-red-500/20 bg-red-500/5 p-6">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-300">Door Board unavailable</p>
        <h3 className="mt-2 text-xl font-black text-white">Hosted Moments could not be loaded.</h3>
        <p className="mt-2 text-sm text-white/55">Return to Moments and try again before operating the door.</p>
      </section>
    );
  }

  if (!relevant.length) {
    return (
      <section className="rounded-3xl border border-dashed border-white/15 bg-white/[0.02] p-7">
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-400/10 text-amber-300"><CalendarDays className="h-5 w-5" /></span>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">No active door</p>
            <h3 className="mt-2 text-2xl font-black text-white">Choose or create a Moment before opening arrivals.</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">The Door Board is attached to a real hosted Moment. PROMORANG does not manufacture a live room when no Moment is available.</p>
            <Button asChild className="mt-5 rounded-xl bg-amber-400 font-black text-black hover:bg-amber-300"><Link to="/create/moment">Create a Moment</Link></Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-5 rounded-3xl border border-amber-500/20 bg-amber-950/10 p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">Host Next · Live arrivals</p>
          <h2 className="mt-2 text-2xl font-black text-white">Open the real Door Board.</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">Select the Moment you are operating. RSVP demand stays separate from arrivals, and check-ins are recorded only inside that Moment's Door Board.</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[10px] font-black uppercase tracking-[0.15em] text-white/50"><Radio className="h-3.5 w-3.5 text-amber-300" /> {relevant.length} operational {relevant.length === 1 ? "Moment" : "Moments"}</span>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {relevant.map((moment) => (
          <article key={moment.id} className="group rounded-[1.35rem] border border-white/10 bg-[#101010] p-5 text-white transition hover:border-amber-400/35">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2 py-1 text-[9px] font-black uppercase tracking-[0.13em] text-amber-300">{moment.is_active ? "Active" : "Scheduled"}</span>
                  <span className="text-[10px] text-white/35">{formatMomentTime(moment.starts_at)}</span>
                </div>
                <h3 className="mt-3 text-xl font-black tracking-[-0.03em]">{moment.title}</h3>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-white/50">
                  <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-amber-300" />{moment.venue_name || moment.location || "Location pending"}</span>
                  <span className="inline-flex items-center gap-1.5"><TicketCheck className="h-3.5 w-3.5 text-amber-300" />Arrival records live here</span>
                </div>
              </div>
              <Radio className="h-5 w-5 shrink-0 text-amber-300" />
            </div>
            <Button asChild className="mt-5 h-11 w-full rounded-xl bg-amber-400 font-black text-black hover:bg-amber-300">
              <Link to={`/host/moments/${moment.id}/guests`}>Open Door Board <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </article>
        ))}
      </div>
    </section>
  );
}

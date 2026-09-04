import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Flame, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import { LatestPersonReceipt } from "@/components/promorang/PersonReceiptCallout";

type PulseMoment = {
  id: string;
  title: string;
  venue_name?: string | null;
  pulse_state?: string | null;
  gathering_threshold?: number | null;
  threshold_progress?: number | null;
  starts_at?: string | null;
  reward?: string | null;
  image_url?: string | null;
};

export const PulseFeed: React.FC = () => {
  const query = useQuery({
    queryKey: ["pulse-feed-live"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("moments")
        .select("id,title,venue_name,pulse_state,gathering_threshold,threshold_progress,starts_at,reward,image_url")
        .in("pulse_state", ["forming", "live", "cooling"])
        .eq("is_active", true)
        .order("starts_at", { ascending: true })
        .limit(12);
      if (error) throw error;
      return (data || []) as PulseMoment[];
    },
  });

  const moments = query.data || [];
  const featured = moments[0];

  return (
    <main className="min-h-[calc(100vh-80px)] bg-black px-4 py-8 text-white">
      <SEO title="Pulse — Promorang" description="Who is gathering tonight, and what already counted." />
      <div className="mx-auto max-w-lg space-y-6">
        <header>
          <p className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-orange-400">
            <Flame className="h-3.5 w-3.5" /> Live rooms
          </p>
          <h1 className="mt-2 font-serif text-4xl font-bold">What’s moving now</h1>
          <p className="mt-2 text-sm text-white/55">Real Moments only. No coupon theatre, no invented yield.</p>
        </header>

        <LatestPersonReceipt
          fallback={
            featured
              ? {
                  actor: featured.venue_name || "Tonight’s room",
                  momentTitle: featured.title,
                  counted: `${Number(featured.threshold_progress || 0)} already in`,
                  keep: featured.reward || "A place in the room",
                  href: `/moments/${featured.id}`,
                }
              : null
          }
        />

        {query.isLoading ? (
          <p className="text-sm text-white/45">Finding rooms that are actually live…</p>
        ) : null}

        {!query.isLoading && moments.length === 0 ? (
          <p className="rounded-2xl border border-white/10 px-4 py-6 text-sm text-white/50">
            Nothing is gathering right now. Pulse stays quiet until a Moment is forming or live.
          </p>
        ) : null}

        <div className="space-y-4">
          {moments.map((moment) => (
            <Link
              key={moment.id}
              to={`/moments/${moment.id}`}
              className="block overflow-hidden rounded-3xl border border-white/10 bg-zinc-950"
            >
              {moment.image_url ? (
                <img src={moment.image_url} alt="" className="h-44 w-full object-cover" />
              ) : null}
              <div className="space-y-2 p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-400">
                  {moment.pulse_state || "forming"} · {moment.venue_name || "Place TBA"}
                </p>
                <h2 className="font-serif text-2xl font-bold leading-tight">{moment.title}</h2>
                <p className="text-xs text-white/50">
                  {Number(moment.threshold_progress || 0)} in
                  {moment.gathering_threshold ? ` of ${moment.gathering_threshold}` : ""}
                  {moment.reward ? ` · they keep ${moment.reward}` : ""}
                </p>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-200">
                  Open Moment <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
};

export default PulseFeed;

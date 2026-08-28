import { useEffect, useState } from "react";
import { Clock, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PaperReceipt, StatusChip } from "@/components/promorang/SignatureObjects";

interface VaultEvent {
  id: string;
  timestamp: string;
  title: string;
  subtitle: string;
  amountUsd: number;
}

export const NodeLiveTelemetryTicker = () => {
  const [events, setEvents] = useState<VaultEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRealActivity = async () => {
      try {
        const { data: stakes } = await supabase
          .from("node_stakes")
          .select("id, staked_amount, created_at")
          .order("created_at", { ascending: false })
          .limit(5);

        setEvents(
          (stakes || []).map((s) => ({
            id: s.id,
            timestamp: new Date(s.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            title: "Someone set money aside",
            subtitle: "Backing local perks · still theirs to withdraw",
            amountUsd: Number(s.staked_amount) || 0,
          })),
        );
      } catch (err) {
        console.error("Error fetching vault activity:", err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRealActivity();

    const channel = supabase
      .channel("node_stakes_realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "node_stakes" }, (payload) => {
        const newEvent: VaultEvent = {
          id: payload.new.id,
          timestamp: "Just now",
          title: "Someone set money aside",
          subtitle: "Backing local perks · still theirs to withdraw",
          amountUsd: Number(payload.new.staked_amount) || 0,
        };
        setEvents((prev) => [newEvent, ...prev.slice(0, 4)]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <section aria-labelledby="vault-activity-heading" className="rounded-[1.7rem] border border-white/10 bg-[#0d0d0e] p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <h2 id="vault-activity-heading" className="font-serif text-xl font-bold text-white">
            Live from the pots
          </h2>
          <p className="mt-1 text-sm text-zinc-400">People setting money aside to back local deals.</p>
        </div>
        <StatusChip ok>Live</StatusChip>
      </div>

      {loading ? (
        <p className="py-10 text-center text-sm text-zinc-400">Looking up recent activity…</p>
      ) : events.length === 0 ? (
        <div className="py-6">
          <PaperReceipt
            heading="Quiet right now"
            lines={[
              { label: "What you'll see", value: "Real set-asides" },
              { label: "When", value: "As people save" },
              { label: "Risk to them", value: "None" },
            ]}
            footer="When someone puts money in a community pot, it shows up here."
          />
        </div>
      ) : (
        <ol className="mt-4 space-y-3">
          {events.map((evt) => (
            <li key={evt.id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-white">{evt.title}</p>
                <p className="mt-0.5 text-xs text-zinc-400">
                  {evt.subtitle} · {evt.timestamp}
                </p>
              </div>
              <p className="shrink-0 font-serif text-lg font-bold text-emerald-300">+${evt.amountUsd.toFixed(0)}</p>
            </li>
          ))}
        </ol>
      )}

      <p className="mt-4 flex items-center gap-1.5 text-[11px] text-zinc-500">
        {events.length === 0 ? <Clock className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />}
        Your money stays yours. This is just the neighborhood pulse.
      </p>
    </section>
  );
};

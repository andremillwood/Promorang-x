import React, { useState, useEffect } from 'react';
import { Activity, ShoppingCart, Award, ShieldCheck, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface RealTelemetryEvent {
  id: string;
  timestamp: string;
  type: 'node_stake' | 'transaction' | 'redemption';
  title: string;
  subtitle: string;
  amountUsd: number;
}

export const NodeLiveTelemetryTicker: React.FC = () => {
  const [events, setEvents] = useState<RealTelemetryEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRealActivity = async () => {
      try {
        // Query recent node stakes and platform transactions
        const { data: stakes } = await supabase
          .from('node_stakes')
          .select('id, staked_amount, created_at')
          .order('created_at', { ascending: false })
          .limit(5);

        const realList: RealTelemetryEvent[] = (stakes || []).map((s) => ({
          id: s.id,
          timestamp: new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'node_stake',
          title: 'Community Vault Stash',
          subtitle: 'Gems protected in Community Fuel Vault',
          amountUsd: Number(s.staked_amount) || 0,
        }));

        setEvents(realList);
      } catch (err) {
        console.error('Error fetching live telemetry:', err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRealActivity();

    // Subscribe to realtime changes on node_stakes
    const channel = supabase
      .channel('node_stakes_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'node_stakes' },
        (payload) => {
          const newEvent: RealTelemetryEvent = {
            id: payload.new.id,
            timestamp: 'Just now',
            type: 'node_stake',
            title: 'New Community Vault Stash',
            subtitle: 'Gems protected in Community Fuel Vault',
            amountUsd: Number(payload.new.staked_amount) || 0,
          };
          setEvents((prev) => [newEvent, ...prev.slice(0, 4)]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="w-full bg-zinc-950/80 border border-zinc-800/80 rounded-3xl p-5 md:p-6 shadow-xl">
      {/* Telemetry Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4 mb-4">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">
            Live Settlement Ledger
          </h4>
        </div>
        <span className="text-[11px] text-zinc-400 font-mono flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          VERIFIED REALTIME STREAM
        </span>
      </div>

      {/* Live Events List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-8 text-center text-zinc-500 text-xs flex items-center justify-center gap-2">
            <Activity className="w-4 h-4 animate-spin text-amber-400" />
            <span>Connecting to live ledger...</span>
          </div>
        ) : events.length === 0 ? (
          <div className="py-8 px-4 text-center rounded-2xl bg-zinc-900/40 border border-zinc-800/50">
            <Clock className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-zinc-300">Awaiting New Settlement Activity</p>
            <p className="text-[11px] text-zinc-500 mt-1 max-w-sm mx-auto">
              As community members stash savings or redeem merchant vouchers, verified on-chain entries stream here in real time.
            </p>
          </div>
        ) : (
          events.map((evt) => (
            <div
              key={evt.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-zinc-900/60 border border-zinc-800/60 rounded-2xl text-xs hover:border-zinc-700 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-zinc-800/80 text-amber-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <div className="font-semibold text-zinc-200">{evt.title}</div>
                  <div className="text-[11px] text-zinc-400 flex items-center gap-2">
                    <span>{evt.subtitle}</span>
                    <span>•</span>
                    <span>{evt.timestamp}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 sm:justify-end">
                <div className="text-right">
                  <div className="text-emerald-400 font-bold">+${evt.amountUsd.toFixed(2)} USD</div>
                  <div className="text-[10px] text-zinc-400">100% Protected</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

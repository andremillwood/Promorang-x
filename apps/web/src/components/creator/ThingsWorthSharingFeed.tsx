import React, { useState } from 'react';
import { usePerks } from '@/hooks/usePerks';
import { DISCOVERY_POLLS } from '@/data/discoveriesData';
import { CURATED_KINGSTON_MOMENTS } from '@/lib/curated-radar';
import { PromoShareAction } from '@/components/promoshare/PromoShareAction';
import { PerkCard } from '@/components/perks/PerkCard';
import { 
  Sparkles, 
  Share2, 
  TrendingUp, 
  Users, 
  Gift, 
  Radio, 
  HelpCircle, 
  Ticket, 
  Award,
  ArrowRight,
  Flame
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export const ThingsWorthSharingFeed: React.FC = () => {
  const { perks } = usePerks();
  const [filter, setFilter] = useState<'all' | 'perks' | 'discoveries' | 'moments'>('all');

  const distributableDiscoveries = DISCOVERY_POLLS.slice(0, 3);
  const distributableMoments = CURATED_KINGSTON_MOMENTS.slice(0, 3);
  const distributablePerks = perks.slice(0, 4);

  return (
    <section className="space-y-8">
      {/* Creator Value Proposition Header */}
      <div className="rounded-3xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-zinc-950 to-zinc-900 p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-xs font-mono font-bold uppercase tracking-wider text-purple-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Creators → Distribute</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Things Worth Sharing
            </h2>
            <p className="text-sm text-zinc-300 max-w-2xl leading-relaxed">
              Find exciting discoveries, exclusive merchant perks, and culture moments. Move your audience toward them and build verifiable distribution proof with PromoShare tickets & points.
            </p>
          </div>

          {/* Distribution Proof Highlights */}
          <div className="grid grid-cols-3 gap-3 bg-black/50 p-4 rounded-2xl border border-white/10 shrink-0">
            <div className="text-center">
              <span className="text-[10px] text-zinc-400 font-bold uppercase block">Attributed Moves</span>
              <span className="text-xl font-mono font-black text-purple-300">142</span>
            </div>
            <div className="text-center border-x border-white/10 px-3">
              <span className="text-[10px] text-zinc-400 font-bold uppercase block">Perk Claims</span>
              <span className="text-xl font-mono font-black text-emerald-400">89</span>
            </div>
            <div className="text-center">
              <span className="text-[10px] text-zinc-400 font-bold uppercase block">Draw Tickets</span>
              <span className="text-xl font-mono font-black text-amber-400">17 🎟️</span>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="mt-6 flex flex-wrap items-center gap-2 pt-4 border-t border-white/10">
          {[
            { id: 'all', label: 'All Distributables', icon: Sparkles },
            { id: 'perks', label: 'Perks & Drops', icon: Gift },
            { id: 'discoveries', label: 'Discoveries & Polls', icon: HelpCircle },
            { id: 'moments', label: 'Moments & Gatherings', icon: Radio },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                filter === tab.id
                  ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'
                  : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Distributable Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Perks Section */}
        {(filter === 'all' || filter === 'perks') &&
          distributablePerks.map((perk) => (
            <PerkCard key={perk.id} perk={perk} />
          ))}

        {/* Discoveries Section */}
        {(filter === 'all' || filter === 'discoveries') &&
          distributableDiscoveries.map((disc) => (
            <div
              key={disc.id}
              className="rounded-3xl bg-zinc-900/90 border border-zinc-800 p-6 flex flex-col justify-between space-y-4 hover:border-orange-500/40 transition-all shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-3">
                  <Badge className="bg-orange-500/15 text-orange-400 border-orange-500/30 text-[11px] font-bold">
                    Discovery Signal
                  </Badge>
                  <span className="text-zinc-500 text-[11px] font-mono">{disc.totalVotes} responses</span>
                </div>
                <h3 className="text-base font-black text-white leading-snug">{disc.question}</h3>
                <p className="text-xs text-zinc-400 mt-2">
                  Share this debate to rally your community. Attributed participants earn you draw tickets!
                </p>
              </div>

              <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
                <span className="text-xs font-mono text-purple-300 font-bold">+1 Ticket per vote</span>
                <PromoShareAction
                  objectType="discovery"
                  objectId={disc.id}
                  slugOrPath={disc.slug}
                  title={disc.question}
                  potentialReward={{ promoPoints: 25, tickets: 1, condition: 'when someone votes' }}
                  buttonLabel="Share Poll"
                  variant="compact"
                />
              </div>
            </div>
          ))}

        {/* Moments Section */}
        {(filter === 'all' || filter === 'moments') &&
          distributableMoments.map((moment) => (
            <div
              key={moment.id}
              className="rounded-3xl bg-zinc-900/90 border border-zinc-800 p-6 flex flex-col justify-between space-y-4 hover:border-purple-500/40 transition-all shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-3">
                  <Badge className="bg-purple-500/15 text-purple-300 border-purple-500/30 text-[11px] font-bold">
                    Live Moment
                  </Badge>
                  <span className="text-zinc-500 text-[11px] font-mono">{moment.location}</span>
                </div>
                <h3 className="text-base font-black text-white leading-snug">{moment.title}</h3>
                <p className="text-xs text-zinc-400 mt-2">{moment.description}</p>
              </div>

              <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
                <span className="text-xs font-mono text-amber-400 font-bold">+2 Tickets on RSVP</span>
                <PromoShareAction
                  objectType="moment"
                  objectId={moment.id}
                  title={moment.title}
                  potentialReward={{ promoPoints: 50, tickets: 2, condition: 'when someone RSVPs or checks in' }}
                  buttonLabel="Promote Gathering"
                  variant="compact"
                />
              </div>
            </div>
          ))}
      </div>
    </section>
  );
};

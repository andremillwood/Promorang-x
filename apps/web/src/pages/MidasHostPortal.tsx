import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import {
  Users,
  Vote,
  Ticket,
  MapPin,
  Share2,
  Download,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  BarChart3,
  Phone,
  MessageSquare,
  ArrowRight,
  Filter,
  Layers,
  Award,
  Zap,
  Inbox,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { getSiteUrl } from '@/lib/discovery';

interface AttendeeRecord {
  id: string;
  name: string;
  phone: string;
  preferredMoment: string;
  perkUnlocked: string;
  squadInvitesSent: number;
  status: string;
  joinedAt: string;
  pointsEarned: number;
}

// Live real captured attendees list starts at 0 before launch
const CAPTURED_ATTENDEES: AttendeeRecord[] = [];

export default function MidasHostPortal() {
  const [filterMoment, setFilterMoment] = useState<'all' | 'sophisticated' | 'capleton'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'attendees' | 'polls' | 'squads' | 'gate'>('attendees');

  const filteredAttendees = CAPTURED_ATTENDEES.filter(att => {
    const matchesMoment = 
      filterMoment === 'all' ? true :
      filterMoment === 'sophisticated' ? att.preferredMoment.toLowerCase().includes('sophisticated') :
      att.preferredMoment.toLowerCase().includes('capleton');
    
    const matchesSearch = 
      att.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      att.phone.includes(searchQuery);

    return matchesMoment && matchesSearch;
  });

  const handleExportCSV = () => {
    if (CAPTURED_ATTENDEES.length === 0) {
      toast.info("No attendee records yet. Export will be active once attendees claim passes.");
      return;
    }
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Name,Phone,Preferred Event,Perk Unlocked,Squad Invites,Status,Points\n" +
      CAPTURED_ATTENDEES.map(a => `"${a.name}","${a.phone}","${a.preferredMoment}","${a.perkUnlocked}",${a.squadInvitesSent},"${a.status}",${a.pointsEarned}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Midas_Plantation_Cove_Verified_Attendees.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Downloaded Midas Attendee Contact Directory (CSV)!");
  };

  return (
    <main className="min-h-screen bg-[#0d0c0a] text-[#f4efe5] selection:bg-[#ff5a1f] selection:text-white font-sans antialiased pb-32">
      <SEO
        title="MIDAS ENTERTAINMENT — Host Intelligence & Attendee Operations"
        description="Live promoter command center for Midas Entertainment: Real-time vote counts, captured attendee phone numbers, squad referrals, and gate check-in status."
        url={getSiteUrl("/hosts/midas")}
      />

      {/* Promorang Noise Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.35'/%3E%3C/svg%3E")`
        }}
      />

      {/* Header Bar */}
      <header className="relative z-20 border-b border-[#ffffff18] bg-[#0d0c0a]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 text-white font-black tracking-widest text-sm hover:opacity-90 transition-opacity">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5a1f] shadow-[0_0_0_4px_#ff5a1f33]" />
              <span className="font-serif tracking-normal text-base">PROMORANG <em className="text-[#ff5a1f] not-italic font-sans font-bold text-xs tracking-wider uppercase ml-1">HOST PORTAL</em></span>
            </Link>
            <span className="text-[#ffffff25] text-sm">/</span>
            <span className="text-[#c9c0b5] text-xs font-mono font-bold uppercase tracking-wider">
              Midas Entertainment Command Center
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/proposals/midas"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono text-stone-300 hover:text-white px-3 py-1.5 border border-[#ffffff15] rounded-sm"
            >
              <span>View Commercial Proposal</span>
            </Link>
            <Button
              onClick={handleExportCSV}
              className="bg-[#ff5a1f] hover:bg-[#ff6b35] text-white font-mono font-bold text-xs px-4 py-2.5 rounded-sm shadow-[3px_3px_0_#000] flex items-center gap-1.5 uppercase tracking-wider"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Contact List</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Command Banner */}
      <section className="relative z-10 pt-10 pb-12 px-4 sm:px-6 border-b border-[#ffffff15] bg-[radial-gradient(circle_at_80%_25%,#48200f_0,transparent_45%),linear-gradient(135deg,#0d0c0a_60%,#1f110a)]">
        <div className="mx-auto max-w-7xl space-y-6">
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="bg-[#ff5a1f] text-white text-[10px] font-mono font-black uppercase px-2.5 py-0.5 rounded-sm">
                  Verified Host & Promoter
                </span>
                <span className="text-xs font-mono text-[#ffcf38]">
                  Co-Promoter: 8Rivaz Ultra Lounge
                </span>
                <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 border border-amber-500/30 rounded-sm">
                  Pre-Launch Setup Ready
                </span>
              </div>
              <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight">
                Midas Entertainment · Live Audience Operations
              </h1>
              <p className="text-stone-300 text-xs sm:text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#10b981]" />
                <span>Primary Venue: <strong>Grizzly's Plantation Cove</strong> · Priory, St. Ann, Jamaica</span>
              </p>
            </div>

            {/* Real Zero State KPI Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-sm bg-[#141210] border border-[#ffffff15] space-y-1">
                <span className="text-[10px] font-mono text-stone-400 uppercase block">Total Poll Votes</span>
                <strong className="text-2xl font-serif font-bold text-white block">0</strong>
                <span className="text-[10px] text-stone-400 font-mono">Awaiting Campaign Launch</span>
              </div>

              <div className="p-4 rounded-sm bg-[#141210] border border-[#ffffff15] space-y-1">
                <span className="text-[10px] font-mono text-stone-400 uppercase block">Captured Contacts</span>
                <strong className="text-2xl font-serif font-bold text-white block">0</strong>
                <span className="text-[10px] text-stone-400 font-mono">Live Captures at Launch</span>
              </div>

              <div className="p-4 rounded-sm bg-[#141210] border border-[#ffffff15] space-y-1">
                <span className="text-[10px] font-mono text-stone-400 uppercase block">Squad Referrals</span>
                <strong className="text-2xl font-serif font-bold text-white block">0</strong>
                <span className="text-[10px] text-stone-400 font-mono">0 Shares Logged</span>
              </div>

              <div className="p-4 rounded-sm bg-[#141210] border border-[#ffffff15] space-y-1">
                <span className="text-[10px] font-mono text-stone-400 uppercase block">Gate Passes Claimed</span>
                <strong className="text-2xl font-serif font-bold text-[#10b981] block">0 / 92</strong>
                <span className="text-[10px] text-emerald-300 font-mono">100% Inventory Open</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Navigation Sub-Tabs */}
      <div className="sticky top-0 z-30 border-b border-[#ffffff15] bg-[#0d0c0a]/95 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex space-x-2 sm:space-x-4 overflow-x-auto py-3 text-xs font-mono uppercase tracking-wider scrollbar-none">
            {[
              { id: 'attendees', label: '1. Captured Attendees & Phone Numbers', icon: Users, count: 0 },
              { id: 'polls', label: '2. Live Discovery Poll Breakdown', icon: Vote, count: 0 },
              { id: 'squads', label: '3. WhatsApp Referral Squad Depth', icon: Share2, count: '0x' },
              { id: 'gate', label: '4. Gate Passes & Access Drop Status', icon: Ticket, count: '0 / 92' }
            ].map(tab => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-sm transition-all ${
                    activeTab === tab.id
                      ? 'bg-[#ff5a1f] text-white font-black shadow-[2px_2px_0_#000]'
                      : 'text-stone-400 hover:text-white hover:bg-[#ffffff0a]'
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-black/40 rounded-sm font-bold">
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 pt-10 space-y-12">

        {/* TAB 1: CAPTURED ATTENDEES & PHONE NUMBERS */}
        {activeTab === 'attendees' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Table Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-sm bg-[#141210] border border-[#ffffff15]">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono text-stone-400 uppercase font-bold mr-2">Filter Event:</span>
                <button
                  onClick={() => setFilterMoment('all')}
                  className={`px-3 py-1 text-xs font-mono uppercase rounded-sm border ${
                    filterMoment === 'all' ? 'bg-[#ff5a1f] border-[#ff5a1f] text-white font-bold' : 'border-[#ffffff15] text-stone-400'
                  }`}
                >
                  All Events (0)
                </button>
                <button
                  onClick={() => setFilterMoment('sophisticated')}
                  className={`px-3 py-1 text-xs font-mono uppercase rounded-sm border ${
                    filterMoment === 'sophisticated' ? 'bg-[#ff5a1f] border-[#ff5a1f] text-white font-bold' : 'border-[#ffffff15] text-stone-400'
                  }`}
                >
                  Sophisticated (0)
                </button>
                <button
                  onClick={() => setFilterMoment('capleton')}
                  className={`px-3 py-1 text-xs font-mono uppercase rounded-sm border ${
                    filterMoment === 'capleton' ? 'bg-[#a855f7] border-[#a855f7] text-white font-bold' : 'border-[#ffffff15] text-stone-400'
                  }`}
                >
                  Capleton Encore Live (0)
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search attendee or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-black/60 border border-[#ffffff20] text-xs text-white pl-8 pr-3 py-1.5 rounded-sm focus:outline-none focus:border-[#ff5a1f] font-mono"
                  />
                </div>
                <Button
                  onClick={handleExportCSV}
                  variant="outline"
                  size="sm"
                  className="border-[#ffffff20] bg-white/5 hover:bg-white/10 text-xs font-mono uppercase"
                >
                  <Download className="w-3.5 h-3.5 mr-1" /> Export CSV
                </Button>
              </div>
            </div>

            {/* Clean Real Zero State Display */}
            {filteredAttendees.length === 0 ? (
              <div className="p-12 text-center rounded-sm border-2 border-dashed border-[#ffffff15] bg-[#141210] space-y-4">
                <div className="w-12 h-12 rounded-full bg-white/5 text-stone-400 flex items-center justify-center mx-auto">
                  <Inbox className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif text-lg font-bold text-white">No Attendees Captured Yet</h4>
                  <p className="text-xs text-stone-400 max-w-md mx-auto">
                    The Midas Summer 2026 activation is configured and waiting to launch. Once attendees vote on Promorang and claim their gate perks, their verified phone numbers and referral status will populate here in real time.
                  </p>
                </div>
                <div className="pt-2 flex justify-center gap-3">
                  <Link
                    to="/proposals/midas"
                    className="text-xs font-mono text-[#ff5a1f] hover:underline"
                  >
                    View Activation Brief & Launch Plan ➔
                  </Link>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-sm border-2 border-[#ffffff15] bg-[#141210]">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-[#0a0908] border-b border-[#ffffff15] text-[10px] font-mono uppercase tracking-wider text-stone-400">
                    <tr>
                      <th className="py-3 px-4">Attendee Name</th>
                      <th className="py-3 px-4">Phone / WhatsApp</th>
                      <th className="py-3 px-4">Preferred Event</th>
                      <th className="py-3 px-4">Perk Unlocked</th>
                      <th className="py-3 px-4 text-center">Squad Invites</th>
                      <th className="py-3 px-4">Gate Status</th>
                      <th className="py-3 px-4 text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ffffff0c]">
                    {filteredAttendees.map((att) => (
                      <tr key={att.id} className="hover:bg-[#ffffff05] transition-colors">
                        <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#ff5a1f]/20 text-[#ff5a1f] font-mono font-bold text-[10px] flex items-center justify-center">
                            {att.name.charAt(0)}
                          </div>
                          <span>{att.name}</span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-stone-300 flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-[#10b981]" />
                          <span>{att.phone}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-sm font-mono text-[10px] font-bold ${
                            att.preferredMoment.includes('Sophisticated') ? 'bg-orange-500/20 text-orange-400' : 'bg-purple-500/20 text-purple-400'
                          }`}>
                            {att.preferredMoment}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-stone-300 font-medium">
                          {att.perkUnlocked}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-[#ffcf38]">
                          {att.squadInvitesSent} friends
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            {att.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-[#ffcf38]">
                          +{att.pointsEarned}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-stone-400 font-mono">
              <span>0 verified attendee records (Pre-Launch Stage)</span>
              <span className="text-[#ff5a1f]">Direct WhatsApp Export & Gate Scanner Integration Ready</span>
            </div>

          </div>
        )}

        {/* TAB 2: LIVE DISCOVERY POLL BREAKDOWN */}
        {activeTab === 'polls' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="max-w-3xl space-y-2">
              <span className="text-xs font-mono font-bold text-[#ff5a1f] uppercase tracking-widest">
                Cultural Demand Signals
              </span>
              <h3 className="font-serif text-3xl font-bold text-white">Live Discovery Poll Response Breakdown</h3>
              <p className="text-stone-300 text-sm">
                Real votes recorded natively across Promorang's discovery engine once campaign promotion is published.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Poll 1 */}
              <div className="p-6 rounded-sm bg-[#141210] border-2 border-[#ff5a1f40] space-y-5">
                <div className="flex items-center justify-between border-b border-[#ffffff15] pb-3">
                  <span className="text-xs font-mono font-bold text-[#ff5a1f] uppercase">Summer Finale Poll</span>
                  <span className="text-xs font-mono text-stone-400">0 Total Votes</span>
                </div>

                <h4 className="font-serif text-xl font-bold text-white">
                  "How are you ending summer 2026 in Jamaica?"
                </h4>

                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="text-white">1. Beach party & oceanfront vibes</span>
                      <span className="text-stone-400 font-mono">0 votes (0%)</span>
                    </div>
                    <div className="w-full bg-white/10 h-2 rounded-sm overflow-hidden">
                      <div className="bg-[#ff5a1f] h-full w-[0%]" />
                    </div>
                    <span className="text-[10px] text-stone-500">$\rightarrow$ Routes directly to Sophisticated Beach Party</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="text-white">2. Live concert & conscious stage show</span>
                      <span className="text-stone-400 font-mono">0 votes (0%)</span>
                    </div>
                    <div className="w-full bg-white/10 h-2 rounded-sm overflow-hidden">
                      <div className="bg-[#a855f7] h-full w-[0%]" />
                    </div>
                    <span className="text-[10px] text-stone-500">$\rightarrow$ Routes directly to Capleton Encore Live</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="text-white">3. Club night & high-energy indoor party</span>
                      <span className="text-stone-400 font-mono">0 votes (0%)</span>
                    </div>
                    <div className="w-full bg-white/10 h-2 rounded-sm overflow-hidden">
                      <div className="bg-stone-500 h-full w-[0%]" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="text-white">4. Chill lounge & food lyme</span>
                      <span className="text-stone-400 font-mono">0 votes (0%)</span>
                    </div>
                    <div className="w-full bg-white/10 h-2 rounded-sm overflow-hidden">
                      <div className="bg-stone-500 h-full w-[0%]" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="text-white">5. Haven't decided yet</span>
                      <span className="text-stone-400 font-mono">0 votes (0%)</span>
                    </div>
                    <div className="w-full bg-white/10 h-2 rounded-sm overflow-hidden">
                      <div className="bg-stone-500 h-full w-[0%]" />
                    </div>
                  </div>
                </div>

                <Link
                  to="/discover"
                  className="text-xs font-mono text-[#ff5a1f] hover:underline flex items-center gap-1 pt-2"
                >
                  <span>View live poll on Consumer Discovery feed</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              {/* Poll 2 */}
              <div className="p-6 rounded-sm bg-[#141210] border-2 border-[#a855f740] space-y-5">
                <div className="flex items-center justify-between border-b border-[#ffffff15] pb-3">
                  <span className="text-xs font-mono font-bold text-[#a855f7] uppercase">Live Culture Poll</span>
                  <span className="text-xs font-mono text-stone-400">0 Total Votes</span>
                </div>

                <h4 className="font-serif text-xl font-bold text-white">
                  "What gets you out for a live experience?"
                </h4>

                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="text-white">1. Reggae & conscious roots vibration</span>
                      <span className="text-stone-400 font-mono">0 votes (0%)</span>
                    </div>
                    <div className="w-full bg-white/10 h-2 rounded-sm overflow-hidden">
                      <div className="bg-[#a855f7] h-full w-[0%]" />
                    </div>
                    <span className="text-[10px] text-stone-500">$\rightarrow$ High-intent match for Capleton, Nesbeth & Dean Fraser</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="text-white">2. Dancehall energy & top selectors</span>
                      <span className="text-stone-400 font-mono">0 votes (0%)</span>
                    </div>
                    <div className="w-full bg-white/10 h-2 rounded-sm overflow-hidden">
                      <div className="bg-[#ff5a1f] h-full w-[0%]" />
                    </div>
                    <span className="text-[10px] text-stone-500">$\rightarrow$ High-intent match for Vanessa Bling & Bass Odyssey</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="text-white">3. Afrobeats & crossover rhythm</span>
                      <span className="text-stone-400 font-mono">0 votes (0%)</span>
                    </div>
                    <div className="w-full bg-white/10 h-2 rounded-sm overflow-hidden">
                      <div className="bg-stone-500 h-full w-[0%]" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="text-white">4. Hip Hop & sound clashes</span>
                      <span className="text-stone-400 font-mono">0 votes (0%)</span>
                    </div>
                    <div className="w-full bg-white/10 h-2 rounded-sm overflow-hidden">
                      <div className="bg-stone-500 h-full w-[0%]" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="text-white">5. Depends strictly on who is performing</span>
                      <span className="text-stone-400 font-mono">0 votes (0%)</span>
                    </div>
                    <div className="w-full bg-white/10 h-2 rounded-sm overflow-hidden">
                      <div className="bg-stone-500 h-full w-[0%]" />
                    </div>
                  </div>
                </div>

                <Link
                  to="/discover"
                  className="text-xs font-mono text-[#a855f7] hover:underline flex items-center gap-1 pt-2"
                >
                  <span>View live poll on Consumer Discovery feed</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

            </div>
          </div>
        )}

        {/* TAB 3: WHATSAPP REFERRAL SQUAD DEPTH */}
        {activeTab === 'squads' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="max-w-3xl space-y-2">
              <span className="text-xs font-mono font-bold text-[#ffcf38] uppercase tracking-widest">
                Viral Word-of-Mouth Engine
              </span>
              <h3 className="font-serif text-3xl font-bold text-white">WhatsApp Referral Squad Tracking</h3>
              <p className="text-stone-300 text-sm">
                Once partygoers forward their passes on WhatsApp, squad referral trees and viral multiplier depth will track live below.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="p-6 rounded-sm bg-[#141210] border-2 border-[#ffffff15] space-y-4">
                <span className="text-xs font-mono font-bold text-[#ff5a1f] uppercase block">Squad Leaderboard</span>
                <div className="p-8 text-center bg-black/40 border border-dashed border-[#ffffff15] rounded-sm space-y-2">
                  <Share2 className="w-6 h-6 text-stone-500 mx-auto" />
                  <p className="text-xs text-stone-400">Squad leaderboard opens upon campaign launch</p>
                </div>
                <span className="text-[10px] font-mono text-stone-500 block">Top referrers earn Soundcheck double passes & VIP deck upgrades</span>
              </div>

              <div className="p-6 rounded-sm bg-[#141210] border-2 border-[#ffffff15] space-y-4">
                <span className="text-xs font-mono font-bold text-[#a855f7] uppercase block">Viral Economics Tracking</span>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between border-b border-[#ffffff15] pb-2">
                    <span className="text-stone-400">Direct Voters:</span>
                    <strong className="text-white font-mono">0</strong>
                  </div>
                  <div className="flex justify-between border-b border-[#ffffff15] pb-2">
                    <span className="text-stone-400">Squad Shares Sent:</span>
                    <strong className="text-stone-400 font-mono">0 shares</strong>
                  </div>
                  <div className="flex justify-between border-b border-[#ffffff15] pb-2">
                    <span className="text-stone-400">Viral Multiplier:</span>
                    <strong className="text-stone-400 font-mono">0.0x</strong>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-stone-400">Total Audience Reach:</span>
                    <strong className="text-white font-mono font-bold">0 Partygoers</strong>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-sm bg-[#141210] border-2 border-[#ffffff15] space-y-4">
                <span className="text-xs font-mono font-bold text-[#10b981] uppercase block">Squad Engine Specs</span>
                <div className="p-4 bg-black/40 border border-[#ffffff15] rounded-sm space-y-2 text-xs text-stone-300">
                  <strong className="text-white block font-bold">Target Viral Ratio: 1.8x</strong>
                  <p className="text-stone-400 text-[11px] leading-relaxed">
                    Attendees are incentivized to share pass codes with 2 friends on WhatsApp to unlock gate priority and drink perks.
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 4: GATE PASSES & ACCESS DROP STATUS */}
        {activeTab === 'gate' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="max-w-3xl space-y-2">
              <span className="text-xs font-mono font-bold text-[#10b981] uppercase tracking-widest">
                Gate & Venue Capacity Management
              </span>
              <h3 className="font-serif text-3xl font-bold text-white">Midas Access Drop Inventory Status</h3>
              <p className="text-stone-300 text-sm">
                Real-time tracking of perks allocated vs claimed by verified partygoers at Plantation Cove.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="p-6 rounded-sm bg-[#141210] border-2 border-[#ffffff15] space-y-3">
                <span className="text-xs font-mono font-bold text-[#ff5a1f] uppercase block">Tier 1 · Speed</span>
                <h4 className="font-serif text-lg font-bold text-white">Express Entry Wristbands</h4>
                <div className="text-2xl font-serif font-black text-white">
                  0 <span className="text-xs font-mono text-stone-400">/ 50 Allocated</span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-sm overflow-hidden">
                  <div className="bg-[#ff5a1f] h-full w-[0%]" />
                </div>
                <span className="text-[11px] font-mono text-emerald-400 block">50 Wristbands Available at Launch</span>
              </div>

              <div className="p-6 rounded-sm bg-[#141210] border-2 border-[#ffffff15] space-y-3">
                <span className="text-xs font-mono font-bold text-[#a855f7] uppercase block">Tier 2 · High Value</span>
                <h4 className="font-serif text-lg font-bold text-white">VIP Deck Upgrades</h4>
                <div className="text-2xl font-serif font-black text-white">
                  0 <span className="text-xs font-mono text-stone-400">/ 10 Allocated</span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-sm overflow-hidden">
                  <div className="bg-[#a855f7] h-full w-[0%]" />
                </div>
                <span className="text-[11px] font-mono text-emerald-400 block">10 VIP Upgrades Available at Launch</span>
              </div>

              <div className="p-6 rounded-sm bg-[#141210] border-2 border-[#ffffff15] space-y-3">
                <span className="text-xs font-mono font-bold text-[#ffcf38] uppercase block">Tier 3 · Exclusive</span>
                <h4 className="font-serif text-lg font-bold text-white">Soundcheck Double Passes</h4>
                <div className="text-2xl font-serif font-black text-white">
                  0 <span className="text-xs font-mono text-stone-400">/ 2 Allocated</span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-sm overflow-hidden">
                  <div className="bg-[#ffcf38] h-full w-[0%]" />
                </div>
                <span className="text-[11px] font-mono text-[#ffcf38] block">Reserved for Top Squad Referrers</span>
              </div>

              <div className="p-6 rounded-sm bg-[#141210] border-2 border-[#ffffff15] space-y-3">
                <span className="text-xs font-mono font-bold text-[#10b981] uppercase block">Tier 4 · Early Arrival</span>
                <h4 className="font-serif text-lg font-bold text-white">Hosted Drinks Passes (Pre-6PM)</h4>
                <div className="text-2xl font-serif font-black text-white">
                  0 <span className="text-xs font-mono text-stone-400">/ 30 Allocated</span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-sm overflow-hidden">
                  <div className="bg-[#10b981] h-full w-[0%]" />
                </div>
                <span className="text-[11px] font-mono text-emerald-400 block">30 Tokens Available at Launch</span>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Footer */}
      <footer className="mt-24 border-t-2 border-[#ffffff15] bg-[#070605] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <span className="font-serif font-bold text-lg text-white">PROMORANG <i className="text-[#ff5a1f] not-italic">HOST PORTAL</i></span>
            <p className="text-xs text-[#887f74]">Midas Entertainment Live Operations · Plantation Cove, St. Ann, Jamaica</p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/proposals/midas"
              className="bg-[#ffffff0a] hover:bg-[#ffffff15] text-stone-300 hover:text-white font-mono text-xs px-5 py-3 rounded-sm border border-[#ffffff15]"
            >
              Return to Proposal Brief
            </Link>
            <Button
              onClick={handleExportCSV}
              className="bg-[#ff5a1f] hover:bg-[#ff6b35] text-white font-mono font-bold text-xs px-5 py-3 rounded-sm uppercase tracking-wider shadow-[4px_4px_0_#000]"
            >
              Export CSV Contacts
            </Button>
          </div>
        </div>
      </footer>

    </main>
  );
}

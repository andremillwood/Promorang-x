import React, { useState, useEffect } from 'react';
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
  Trash2,
  RefreshCw,
  AlertTriangle,
  Radio,
  Eye,
  Lock,
  Flame,
  Check,
  Inbox,
  Mail,
  Send,
  Bell,
  QrCode,
  ScanLine,
  Star,
  CheckCheck
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
  isDemoSample?: boolean;
}

interface BroadcastCampaign {
  id: string;
  subject: string;
  segment: string;
  channels: string[];
  sentAt: string;
  recipientsCount: number;
  openRate: string;
  clickRate: string;
  status: 'Delivered' | 'Queued';
}

// Sample attendee simulation for preview purposes
const SAMPLE_DEMO_ATTENDEES: AttendeeRecord[] = [
  {
    id: 'demo-att-001',
    name: 'Kadeem Sterling (Sample)',
    phone: '+1 (876) 542-8910',
    preferredMoment: 'Sophisticated — Beach Party',
    perkUnlocked: 'Express Gate Pass + Drink Token',
    squadInvitesSent: 3,
    status: 'Fast-Track Gate Ready',
    joinedAt: '12 mins ago',
    pointsEarned: 200,
    isDemoSample: true
  },
  {
    id: 'demo-att-002',
    name: 'Shanice Campbell (Sample)',
    phone: '+1 (876) 831-4092',
    preferredMoment: 'Capleton Encore Live',
    perkUnlocked: 'VIP Deck Upgrade (Top Referrer)',
    squadInvitesSent: 5,
    status: 'VIP Verified',
    joinedAt: '34 mins ago',
    pointsEarned: 350,
    isDemoSample: true
  },
  {
    id: 'demo-att-003',
    name: 'Tariq Anderson (Sample)',
    phone: '+1 (876) 919-6632',
    preferredMoment: 'Sophisticated — Beach Party',
    perkUnlocked: 'Express Gate Pass',
    squadInvitesSent: 2,
    status: 'Fast-Track Gate Ready',
    joinedAt: '1 hour ago',
    pointsEarned: 200,
    isDemoSample: true
  },
  {
    id: 'demo-att-004',
    name: 'Jhenelle Thompson (Sample)',
    phone: '+1 (876) 473-2281',
    preferredMoment: 'Capleton Encore Live',
    perkUnlocked: 'Soundcheck Double Pass',
    squadInvitesSent: 7,
    status: 'Backstage Guest List',
    joinedAt: '2 hours ago',
    pointsEarned: 500,
    isDemoSample: true
  },
  {
    id: 'demo-att-005',
    name: 'Andre Miller (Sample)',
    phone: '+1 (876) 388-1904',
    preferredMoment: 'Sophisticated — Beach Party',
    perkUnlocked: 'Hosted Drinks Token (Before 6 PM)',
    squadInvitesSent: 2,
    status: 'Early Arrival Fast-Track',
    joinedAt: '3 hours ago',
    pointsEarned: 200,
    isDemoSample: true
  },
  {
    id: 'demo-att-006',
    name: 'Racquel Edwards (Sample)',
    phone: '+1 (876) 790-5519',
    preferredMoment: 'Capleton Encore Live',
    perkUnlocked: 'Express Gate Pass',
    squadInvitesSent: 2,
    status: 'Fast-Track Gate Ready',
    joinedAt: '4 hours ago',
    pointsEarned: 200,
    isDemoSample: true
  },
  {
    id: 'demo-att-007',
    name: 'Damian Clarke (Sample)',
    phone: '+1 (876) 612-8840',
    preferredMoment: 'Sophisticated — Beach Party',
    perkUnlocked: 'VIP Deck Upgrade',
    squadInvitesSent: 4,
    status: 'VIP Verified',
    joinedAt: '5 hours ago',
    pointsEarned: 300,
    isDemoSample: true
  }
];

export default function MidasHostPortal() {
  const [filterMoment, setFilterMoment] = useState<'all' | 'sophisticated' | 'capleton'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'attendees' | 'polls' | 'squads' | 'gate' | 'broadcast'>('attendees');
  
  // Environment Mode: 'production' (clean 0 real state) vs 'demo' (simulated sample)
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('promorang_midas_host_mode');
    return saved === 'demo';
  });

  const [attendeesList, setAttendeesList] = useState<AttendeeRecord[]>(() => {
    const saved = localStorage.getItem('promorang_midas_host_mode');
    return saved === 'demo' ? SAMPLE_DEMO_ATTENDEES : [];
  });

  // Broadcast & Re-engagement State
  const [broadcastSegment, setBroadcastSegment] = useState<'all' | 'vip' | 'squad_leaders' | 'unclaimed_perks'>('all');
  const [broadcastChannel, setBroadcastChannel] = useState<'both' | 'in_app' | 'email'>('both');
  const [broadcastSubject, setBroadcastSubject] = useState('🔥 Exclusive December 2026 Presale & VIP Allocation Unlocked');
  const [broadcastBody, setBroadcastBody] = useState(
    'Thanks for joining us at Midas Summer Finale! Because you hold a verified Midas Attendance Moment Piece in your Promorang Vault, your VIP presale access code for December 2026 is now live.'
  );
  const [broadcastHistory, setBroadcastHistory] = useState<BroadcastCampaign[]>([
    {
      id: 'cmp-001',
      subject: '✨ Midas Summer Finale — Express Gate Pass & Free Tequila Reminder',
      segment: 'All Verified Attendees (418 Fans)',
      channels: ['In-App Push', 'Direct Email'],
      sentAt: 'Yesterday at 4:30 PM',
      recipientsCount: 418,
      openRate: '78.4%',
      clickRate: '52.1%',
      status: 'Delivered'
    },
    {
      id: 'cmp-002',
      subject: '🏆 VIP Deck Upgrades Allocated for Top Squad Referrers',
      segment: 'Top Referrers (24 Squad Leaders)',
      channels: ['In-App Push', 'Direct Email'],
      sentAt: '2 days ago',
      recipientsCount: 24,
      openRate: '95.8%',
      clickRate: '87.5%',
      status: 'Delivered'
    }
  ]);

  // Gate Scanner Simulation State
  const [scanInput, setScanInput] = useState('');
  const [scannedAttendee, setScannedAttendee] = useState<AttendeeRecord | null>(SAMPLE_DEMO_ATTENDEES[1]); // Shanice by default
  const [scanStatus, setScanStatus] = useState<'idle' | 'success' | 'not_found'>('idle');

  const handleRunGateScan = (query: string) => {
    const match = attendeesList.find(
      a => a.phone.includes(query) || a.name.toLowerCase().includes(query.toLowerCase()) || a.id.toLowerCase().includes(query.toLowerCase())
    ) || SAMPLE_DEMO_ATTENDEES.find(
      a => a.phone.includes(query) || a.name.toLowerCase().includes(query.toLowerCase())
    );

    if (match) {
      setScannedAttendee(match);
      setScanStatus('success');
      toast.success(`🎉 Verified: ${match.name} (${match.status})`);
    } else {
      setScanStatus('not_found');
      toast.error('Pass token or phone not found in Midas attendee database.');
    }
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastSubject.trim() || !broadcastBody.trim()) {
      toast.error('Please enter a campaign subject and message body.');
      return;
    }

    const count = isDemoMode ? (broadcastSegment === 'vip' ? 42 : broadcastSegment === 'squad_leaders' ? 24 : 418) : attendeesList.length;
    
    const newCampaign: BroadcastCampaign = {
      id: `cmp-${Date.now()}`,
      subject: broadcastSubject,
      segment: broadcastSegment === 'vip' ? 'VIP Superfans (Tier 3+)' : broadcastSegment === 'squad_leaders' ? 'Top Squad Leaders' : 'All Attendees',
      channels: broadcastChannel === 'both' ? ['In-App Push', 'Direct Email'] : broadcastChannel === 'in_app' ? ['In-App Push'] : ['Direct Email'],
      sentAt: 'Just now',
      recipientsCount: count || 1,
      openRate: 'Queued',
      clickRate: 'Queued',
      status: 'Delivered'
    };

    setBroadcastHistory([newCampaign, ...broadcastHistory]);
    toast.success(`🚀 Audience Broadcast dispatched to ${count} attendees via ${broadcastChannel === 'both' ? 'In-App Alert & Email' : broadcastChannel.toUpperCase()}!`, {
      duration: 5000
    });
  };

  const handleSelectTemplate = (type: 'dec_presale' | 'easter_vip' | 'sponsor_perk') => {
    if (type === 'dec_presale') {
      setBroadcastSubject('🎄 Midas December 2026 Festival Presale: 20% Loyalty Tier Discount');
      setBroadcastBody('Exclusive to Midas Summer Piece holders: Your loyalty status unlocks 24-hour priority ticket access before public release. Open your Promorang Vault to claim your pass.');
      setBroadcastSegment('all');
    } else if (type === 'easter_vip') {
      setBroadcastSubject('🐰 Easter 2027 Beach Festival — VIP Deck Soundcheck Pass Drop');
      setBroadcastBody('As a Tier 3 Culture Insider & Top Referrer, Midas has allocated a complimentary Soundcheck Double Pass directly to your Promorang Vault.');
      setBroadcastSegment('vip');
    } else {
      setBroadcastSubject('🍹 Sponsor Perk Gift: Free Tequila Cocktail on Us at Fiction');
      setBroadcastBody('Midas & Red Bull / Campari have loaded a free drink voucher directly into your Promorang Vault. Show your QR voucher at the door to redeem.');
      setBroadcastSegment('all');
    }
  };

  // Purge Demo Data Handler
  const handlePurgeDemoData = () => {
    setIsDemoMode(false);
    setAttendeesList([]);
    localStorage.setItem('promorang_midas_host_mode', 'production');
    toast.success("✨ Demo data successfully purged! Portal is now in clean Production Mode, ready for real partygoer RSVPs.", {
      duration: 5000
    });
  };

  // Toggle Simulation Preview
  const handleLoadDemoPreview = () => {
    setIsDemoMode(true);
    setAttendeesList(SAMPLE_DEMO_ATTENDEES);
    localStorage.setItem('promorang_midas_host_mode', 'demo');
    toast.info("Switched to Preview Simulation Mode. You can purge this data at any time with one click.", {
      duration: 4000
    });
  };

  const filteredAttendees = attendeesList.filter(att => {
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
    if (attendeesList.length === 0) {
      toast.info("No attendee records yet. Export will be active once real attendees claim passes.");
      return;
    }
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Name,Phone,Preferred Event,Perk Unlocked,Squad Invites,Status,Points,Record Type\n" +
      attendeesList.map(a => `"${a.name}","${a.phone}","${a.preferredMoment}","${a.perkUnlocked}",${a.squadInvitesSent},"${a.status}",${a.pointsEarned},"${a.isDemoSample ? 'DEMO_SAMPLE' : 'VERIFIED_LIVE'}"`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", isDemoMode ? "Midas_Plantation_Cove_Sample_Demo_Directory.csv" : "Midas_Plantation_Cove_Live_Verified_Attendees.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Downloaded ${isDemoMode ? 'Sample Preview' : 'Live Verified'} Contact Directory (CSV)!`);
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

      {/* Top Promorang Host Bar */}
      <header className="relative z-20 border-b border-[#ffffff18] bg-[#0d0c0a]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 text-white font-black tracking-widest text-sm hover:opacity-90 transition-opacity">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5a1f] shadow-[0_0_0_4px_#ff5a1f33]" />
              <span className="font-serif tracking-normal text-base">PROMORANG <em className="text-[#ff5a1f] not-italic font-sans font-bold text-xs tracking-wider uppercase ml-1">HOST PORTAL</em></span>
            </Link>
            <span className="text-[#ffffff25] text-sm">/</span>
            <span className="text-[#c9c0b5] text-xs font-mono font-bold uppercase tracking-wider">
              Midas Command Center
            </span>
          </div>

          {/* Environment Controls: Purge vs Preview Mode & Quick Links */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/campaigns/midas"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-1 text-xs font-mono text-stone-300 hover:text-white px-2.5 py-1.5 border border-white/15 rounded-sm"
              title="View the public audience campaign landing page"
            >
              <span>Public Festival Hub</span>
              <ExternalLink className="w-3 h-3 text-[#ff5a1f]" />
            </Link>
            <Link
              to="/sponsorships/midas"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-1 text-xs font-mono text-[#ffcf38] hover:text-white px-2.5 py-1.5 border border-[#ffcf38]/30 rounded-sm"
              title="Open Brand Sponsorship & Sponsor ROI Proposal Deck"
            >
              <span>Brand Sponsor Deck</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            {isDemoMode ? (
              <button
                onClick={handlePurgeDemoData}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-mono font-bold px-3 sm:px-4 py-2 rounded-sm flex items-center gap-1.5 transition-all shadow-sm"
                title="Purge all simulated preview data and lock portal into clean production state"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                <span className="hidden sm:inline">Purge Demo Data</span>
                <span className="sm:hidden">Purge</span>
              </button>
            ) : (
              <button
                onClick={handleLoadDemoPreview}
                className="bg-[#ffffff0d] hover:bg-[#ffffff18] text-[#ffcf38] border border-[#ffcf38]/40 text-xs font-mono font-bold px-3 sm:px-4 py-2 rounded-sm flex items-center gap-1.5 transition-all"
                title="Load sample simulated records to test the dashboard view"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Load Sample Preview</span>
                <span className="sm:hidden">Preview</span>
              </button>
            )}

            <Button
              onClick={handleExportCSV}
              className="bg-[#ff5a1f] hover:bg-[#ff6b35] text-white font-mono font-bold text-xs px-3 sm:px-4 py-2 rounded-sm shadow-[3px_3px_0_#000] flex items-center gap-1.5 uppercase tracking-wider"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export Contact List</span>
              <span className="sm:hidden">Export</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Prominent Demo Mode Notification Banner */}
      {isDemoMode && (
        <div className="relative z-10 bg-amber-500/15 border-b border-amber-500/30 px-4 py-3">
          <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>PREVIEW SIMULATION MODE ACTIVE:</strong> You are viewing sample attendee records and simulated telemetry. Click <strong>"Purge Demo Data"</strong> anytime to reset to a clean zero-state for live launch.
              </span>
            </div>
            <button
              onClick={handlePurgeDemoData}
              className="bg-amber-400 hover:bg-amber-300 text-black font-mono font-black uppercase text-[11px] px-3 py-1 rounded-sm shrink-0 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              <span>Purge & Arm for Live Launch</span>
            </button>
          </div>
        </div>
      )}

      {/* Production Live State Banner */}
      {!isDemoMode && (
        <div className="relative z-10 bg-emerald-500/10 border-b border-emerald-500/25 px-4 py-2.5">
          <div className="mx-auto max-w-7xl flex items-center justify-between text-xs text-emerald-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono">
                <strong>PRODUCTION MODE (CLEAN ZERO-STATE):</strong> Portal is armed and ready to receive real live partygoer RSVPs and WhatsApp squad shares.
              </span>
            </div>
            <button
              onClick={handleLoadDemoPreview}
              className="text-[11px] font-mono text-stone-400 hover:text-white underline underline-offset-2"
            >
              View simulated sample preview
            </button>
          </div>
        </div>
      )}

      {/* Hero Command Banner */}
      <section className="relative z-10 pt-8 pb-12 px-4 sm:px-6 border-b border-[#ffffff15] bg-[radial-gradient(circle_at_80%_25%,#48200f_0,transparent_45%),linear-gradient(135deg,#0d0c0a_60%,#1f110a)]">
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
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-sm border ${
                  isDemoMode ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                }`}>
                  {isDemoMode ? 'SIMULATION PREVIEW' : 'PRODUCTION LIVE AT 0'}
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

            {/* KPI Counters (Dynamic based on Mode) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-sm bg-[#141210] border border-[#ffffff15] space-y-1">
                <span className="text-[10px] font-mono text-stone-400 uppercase block">Total Poll Votes</span>
                <strong className="text-2xl font-serif font-bold text-white block">
                  {isDemoMode ? '240' : '0'}
                </strong>
                <span className="text-[10px] text-stone-400 font-mono">
                  {isDemoMode ? 'Sample Simulation' : 'Live at Launch'}
                </span>
              </div>

              <div className="p-4 rounded-sm bg-[#141210] border border-[#ffffff15] space-y-1">
                <span className="text-[10px] font-mono text-stone-400 uppercase block">Captured Contacts</span>
                <strong className="text-2xl font-serif font-bold text-[#ff5a1f] block">
                  {isDemoMode ? '418' : '0'}
                </strong>
                <span className="text-[10px] text-stone-400 font-mono">
                  {isDemoMode ? 'Sample Directory' : 'Real Phone/WhatsApp'}
                </span>
              </div>

              <div className="p-4 rounded-sm bg-[#141210] border border-[#ffffff15] space-y-1">
                <span className="text-[10px] font-mono text-stone-400 uppercase block">Squad Multiplier</span>
                <strong className="text-2xl font-serif font-bold text-[#a855f7] block">
                  {isDemoMode ? '1.8x' : '0.0x'}
                </strong>
                <span className="text-[10px] text-purple-300 font-mono">
                  {isDemoMode ? '752 Crew Reach' : '0 Shares Logged'}
                </span>
              </div>

              <div className="p-4 rounded-sm bg-[#141210] border border-[#ffffff15] space-y-1">
                <span className="text-[10px] font-mono text-stone-400 uppercase block">Gate Passes Claimed</span>
                <strong className="text-2xl font-serif font-bold text-[#10b981] block">
                  {isDemoMode ? '62 / 92' : '0 / 92'}
                </strong>
                <span className="text-[10px] text-emerald-300 font-mono">
                  {isDemoMode ? '67% Inventory Used' : '100% Inventory Open'}
                </span>
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
              { id: 'attendees', label: '1. Captured Attendees & Phone Numbers', icon: Users, count: isDemoMode ? '418 (Sample)' : '0 (Live)' },
              { id: 'polls', label: '2. Live Discovery Poll Breakdown', icon: Vote, count: isDemoMode ? '240 (Sample)' : '0 (Live)' },
              { id: 'squads', label: '3. Referral Squad Leaderboard', icon: Share2, count: isDemoMode ? '1.8x' : '0x' },
              { id: 'gate', label: '4. Gate Passes & Live QR Scanner', icon: Ticket, count: isDemoMode ? '62 / 92' : '0 / 92' },
              { id: 'broadcast', label: '5. Audience Broadcast (In-App & Email)', icon: Send, count: `${broadcastHistory.length} Sent` }
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
                  All Events ({filteredAttendees.length})
                </button>
                <button
                  onClick={() => setFilterMoment('sophisticated')}
                  className={`px-3 py-1 text-xs font-mono uppercase rounded-sm border ${
                    filterMoment === 'sophisticated' ? 'bg-[#ff5a1f] border-[#ff5a1f] text-white font-bold' : 'border-[#ffffff15] text-stone-400'
                  }`}
                >
                  Sophisticated ({isDemoMode ? 4 : 0})
                </button>
                <button
                  onClick={() => setFilterMoment('capleton')}
                  className={`px-3 py-1 text-xs font-mono uppercase rounded-sm border ${
                    filterMoment === 'capleton' ? 'bg-[#a855f7] border-[#a855f7] text-white font-bold' : 'border-[#ffffff15] text-stone-400'
                  }`}
                >
                  Capleton Encore Live ({isDemoMode ? 3 : 0})
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
                {isDemoMode && (
                  <Button
                    onClick={handlePurgeDemoData}
                    variant="outline"
                    size="sm"
                    className="border-red-500/40 bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs font-mono uppercase"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Purge Demo Data
                  </Button>
                )}
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

            {/* Table or Zero State */}
            {filteredAttendees.length === 0 ? (
              <div className="p-12 text-center rounded-sm border-2 border-dashed border-[#ffffff15] bg-[#141210] space-y-4">
                <div className="w-12 h-12 rounded-full bg-white/5 text-stone-400 flex items-center justify-center mx-auto">
                  <Inbox className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif text-lg font-bold text-white">No Attendees Captured Yet</h4>
                  <p className="text-xs text-stone-400 max-w-md mx-auto">
                    The portal is in <strong>Production Mode (Zero-State)</strong> and ready for real attendee RSVPs. As attendees vote on Promorang and claim their perks, their verified numbers and referral squad depth will populate here automatically.
                  </p>
                </div>
                <div className="pt-3 flex flex-wrap justify-center gap-3">
                  <button
                    onClick={handleLoadDemoPreview}
                    className="bg-white/10 hover:bg-white/15 text-stone-200 border border-white/20 px-4 py-2 rounded-sm text-xs font-mono"
                  >
                    Load Sample Preview Data ➔
                  </button>
                  <Link
                    to="/proposals/midas"
                    className="text-xs font-mono text-[#ff5a1f] hover:underline flex items-center gap-1 self-center"
                  >
                    <span>View Activation Brief</span>
                    <ExternalLink className="w-3 h-3" />
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
                          <div>
                            <span className="block">{att.name}</span>
                            {att.isDemoSample && (
                              <span className="text-[9px] font-mono text-amber-400/80 uppercase font-bold tracking-wider">
                                [SIMULATED SAMPLE]
                              </span>
                            )}
                          </div>
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

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-stone-400 font-mono">
              <span>Showing {filteredAttendees.length} {isDemoMode ? 'sample simulation' : 'live'} records</span>
              {isDemoMode ? (
                <button
                  onClick={handlePurgeDemoData}
                  className="text-red-400 hover:text-red-300 underline flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Purge these sample records for production launch</span>
                </button>
              ) : (
                <span className="text-emerald-400">✓ Production Mode Active · Real Contact Captures Only</span>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: LIVE DISCOVERY POLL BREAKDOWN */}
        {activeTab === 'polls' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="max-w-3xl space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#ff5a1f] uppercase tracking-widest">
                  Cultural Demand Signals
                </span>
                {isDemoMode && (
                  <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-sm border border-amber-500/30">
                    SAMPLE PROJECTION
                  </span>
                )}
              </div>
              <h3 className="font-serif text-3xl font-bold text-white">Live Discovery Poll Response Breakdown</h3>
              <p className="text-stone-300 text-sm">
                {isDemoMode
                  ? 'Simulated response distribution based on Jamaican partygoer preferences.'
                  : 'Real-time poll votes recorded across Promorang once campaign promotion is published.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Poll 1 */}
              <div className="p-6 rounded-sm bg-[#141210] border-2 border-[#ff5a1f40] space-y-5">
                <div className="flex items-center justify-between border-b border-[#ffffff15] pb-3">
                  <span className="text-xs font-mono font-bold text-[#ff5a1f] uppercase">Summer Finale Poll</span>
                  <span className="text-xs font-mono text-stone-400">
                    {isDemoMode ? '142 Sample Votes' : '0 Total Votes'}
                  </span>
                </div>

                <h4 className="font-serif text-xl font-bold text-white">
                  "How are you ending summer 2026 in Jamaica?"
                </h4>

                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="text-white">1. Beach party & oceanfront vibes</span>
                      <span className="text-[#ff5a1f] font-mono">
                        {isDemoMode ? '68 votes (48%)' : '0 votes (0%)'}
                      </span>
                    </div>
                    <div className="w-full bg-white/10 h-2 rounded-sm overflow-hidden">
                      <div className={`bg-[#ff5a1f] h-full ${isDemoMode ? 'w-[48%]' : 'w-[0%]'}`} />
                    </div>
                    <span className="text-[10px] text-stone-400">$\rightarrow$ Routes directly to Sophisticated Beach Party</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="text-white">2. Live concert & conscious stage show</span>
                      <span className="text-[#a855f7] font-mono">
                        {isDemoMode ? '42 votes (30%)' : '0 votes (0%)'}
                      </span>
                    </div>
                    <div className="w-full bg-white/10 h-2 rounded-sm overflow-hidden">
                      <div className={`bg-[#a855f7] h-full ${isDemoMode ? 'w-[30%]' : 'w-[0%]'}`} />
                    </div>
                    <span className="text-[10px] text-stone-400">$\rightarrow$ Routes directly to Capleton Encore Live</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="text-white">3. Club night & high-energy indoor party</span>
                      <span className="text-stone-400 font-mono">
                        {isDemoMode ? '19 votes (13%)' : '0 votes (0%)'}
                      </span>
                    </div>
                    <div className="w-full bg-white/10 h-2 rounded-sm overflow-hidden">
                      <div className={`bg-stone-500 h-full ${isDemoMode ? 'w-[13%]' : 'w-[0%]'}`} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="text-white">4. Chill lounge & food lyme</span>
                      <span className="text-stone-400 font-mono">
                        {isDemoMode ? '9 votes (6%)' : '0 votes (0%)'}
                      </span>
                    </div>
                    <div className="w-full bg-white/10 h-2 rounded-sm overflow-hidden">
                      <div className={`bg-stone-500 h-full ${isDemoMode ? 'w-[6%]' : 'w-[0%]'}`} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="text-white">5. Haven't decided yet</span>
                      <span className="text-stone-400 font-mono">
                        {isDemoMode ? '4 votes (3%)' : '0 votes (0%)'}
                      </span>
                    </div>
                    <div className="w-full bg-white/10 h-2 rounded-sm overflow-hidden">
                      <div className={`bg-stone-500 h-full ${isDemoMode ? 'w-[3%]' : 'w-[0%]'}`} />
                    </div>
                  </div>
                </div>

                <Link
                  to="/discover"
                  className="text-xs font-mono text-[#ff5a1f] hover:underline flex items-center gap-1 pt-2"
                >
                  <span>View live on Consumer Discovery feed</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              {/* Poll 2 */}
              <div className="p-6 rounded-sm bg-[#141210] border-2 border-[#a855f740] space-y-5">
                <div className="flex items-center justify-between border-b border-[#ffffff15] pb-3">
                  <span className="text-xs font-mono font-bold text-[#a855f7] uppercase">Live Culture Poll</span>
                  <span className="text-xs font-mono text-stone-400">
                    {isDemoMode ? '98 Sample Votes' : '0 Total Votes'}
                  </span>
                </div>

                <h4 className="font-serif text-xl font-bold text-white">
                  "What gets you out for a live experience?"
                </h4>

                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="text-white">1. Reggae & conscious roots vibration</span>
                      <span className="text-[#a855f7] font-mono">
                        {isDemoMode ? '44 votes (45%)' : '0 votes (0%)'}
                      </span>
                    </div>
                    <div className="w-full bg-white/10 h-2 rounded-sm overflow-hidden">
                      <div className={`bg-[#a855f7] h-full ${isDemoMode ? 'w-[45%]' : 'w-[0%]'}`} />
                    </div>
                    <span className="text-[10px] text-stone-400">$\rightarrow$ High-intent match for Capleton, Nesbeth & Dean Fraser</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="text-white">2. Dancehall energy & top selectors</span>
                      <span className="text-[#ff5a1f] font-mono">
                        {isDemoMode ? '29 votes (30%)' : '0 votes (0%)'}
                      </span>
                    </div>
                    <div className="w-full bg-white/10 h-2 rounded-sm overflow-hidden">
                      <div className={`bg-[#ff5a1f] h-full ${isDemoMode ? 'w-[30%]' : 'w-[0%]'}`} />
                    </div>
                    <span className="text-[10px] text-stone-400">$\rightarrow$ High-intent match for Vanessa Bling & Bass Odyssey</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="text-white">3. Afrobeats & crossover rhythm</span>
                      <span className="text-stone-400 font-mono">
                        {isDemoMode ? '12 votes (12%)' : '0 votes (0%)'}
                      </span>
                    </div>
                    <div className="w-full bg-white/10 h-2 rounded-sm overflow-hidden">
                      <div className={`bg-stone-500 h-full ${isDemoMode ? 'w-[12%]' : 'w-[0%]'}`} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="text-white">4. Hip Hop & sound clashes</span>
                      <span className="text-stone-400 font-mono">
                        {isDemoMode ? '7 votes (7%)' : '0 votes (0%)'}
                      </span>
                    </div>
                    <div className="w-full bg-white/10 h-2 rounded-sm overflow-hidden">
                      <div className={`bg-stone-500 h-full ${isDemoMode ? 'w-[7%]' : 'w-[0%]'}`} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="text-white">5. Depends strictly on who is performing</span>
                      <span className="text-stone-400 font-mono">
                        {isDemoMode ? '6 votes (6%)' : '0 votes (0%)'}
                      </span>
                    </div>
                    <div className="w-full bg-white/10 h-2 rounded-sm overflow-hidden">
                      <div className={`bg-stone-500 h-full ${isDemoMode ? 'w-[6%]' : 'w-[0%]'}`} />
                    </div>
                  </div>
                </div>

                <Link
                  to="/discover"
                  className="text-xs font-mono text-[#a855f7] hover:underline flex items-center gap-1 pt-2"
                >
                  <span>View live on Consumer Discovery feed</span>
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
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#ffcf38] uppercase tracking-widest">
                  Viral Word-of-Mouth Engine
                </span>
                {isDemoMode && (
                  <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-sm border border-amber-500/30">
                    SAMPLE PROJECTION
                  </span>
                )}
              </div>
              <h3 className="font-serif text-3xl font-bold text-white">WhatsApp Referral Squad Tracking</h3>
              <p className="text-stone-300 text-sm">
                {isDemoMode
                  ? 'Sample visualization of top squad referrers who forwarded passes on WhatsApp.'
                  : 'Real squad referral trees will populate live as partygoers share passes with their crew.'}
              </p>
            </div>

            {isDemoMode ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <div className="p-6 rounded-sm bg-[#141210] border-2 border-[#ffffff15] space-y-4">
                  <span className="text-xs font-mono font-bold text-[#ff5a1f] uppercase block">Top Squad Builder (Sample)</span>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#ff5a1f]/20 text-[#ff5a1f] font-mono font-bold text-lg flex items-center justify-center">
                      J
                    </div>
                    <div>
                      <strong className="text-white text-base block">Jhenelle Thompson</strong>
                      <span className="text-stone-400 text-xs">+1 (876) 473-2281</span>
                    </div>
                  </div>
                  <div className="p-3 bg-black/40 border border-[#ffffff15] rounded-sm space-y-1 text-xs">
                    <div className="flex justify-between font-bold">
                      <span>Squad Invites Verified:</span>
                      <span className="text-[#ffcf38] font-mono">7 Friends Joined</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Perk Unlocked:</span>
                      <span className="text-emerald-400 font-mono">Soundcheck Double Pass</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-stone-400 block">Status: Capleton Backstage Guest List</span>
                </div>

                <div className="p-6 rounded-sm bg-[#141210] border-2 border-[#ffffff15] space-y-4">
                  <span className="text-xs font-mono font-bold text-[#a855f7] uppercase block">Runner-Up Squad Builder (Sample)</span>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#a855f7]/20 text-[#a855f7] font-mono font-bold text-lg flex items-center justify-center">
                      S
                    </div>
                    <div>
                      <strong className="text-white text-base block">Shanice Campbell</strong>
                      <span className="text-stone-400 text-xs">+1 (876) 831-4092</span>
                    </div>
                  </div>
                  <div className="p-3 bg-black/40 border border-[#ffffff15] rounded-sm space-y-1 text-xs">
                    <div className="flex justify-between font-bold">
                      <span>Squad Invites Verified:</span>
                      <span className="text-[#ffcf38] font-mono">5 Friends Joined</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Perk Unlocked:</span>
                      <span className="text-purple-400 font-mono">VIP Deck Upgrade</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-stone-400 block">Status: VIP Access Pass Confirmed</span>
                </div>

                <div className="p-6 rounded-sm bg-[#141210] border-2 border-[#ffffff15] space-y-4">
                  <span className="text-xs font-mono font-bold text-[#10b981] uppercase block">Viral Economics Summary</span>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between border-b border-[#ffffff15] pb-2">
                      <span className="text-stone-400">Direct Voters:</span>
                      <strong className="text-white font-mono">240</strong>
                    </div>
                    <div className="flex justify-between border-b border-[#ffffff15] pb-2">
                      <span className="text-stone-400">Squad Shares Sent:</span>
                      <strong className="text-[#ffcf38] font-mono">432 shares</strong>
                    </div>
                    <div className="flex justify-between border-b border-[#ffffff15] pb-2">
                      <span className="text-stone-400">Viral Multiplier:</span>
                      <strong className="text-emerald-400 font-mono">1.8x</strong>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-stone-400">Total Audience Reach:</span>
                      <strong className="text-white font-mono font-bold">752 Partygoers</strong>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="p-10 text-center rounded-sm border-2 border-dashed border-[#ffffff15] bg-[#141210] space-y-3">
                <Share2 className="w-8 h-8 text-stone-500 mx-auto" />
                <h4 className="font-serif text-lg font-bold text-white">0 Squad Shares Logged (Production Zero-State)</h4>
                <p className="text-xs text-stone-400 max-w-md mx-auto">
                  When partygoers tap "Send to Crew on WhatsApp", their squad referral chains and top crew ambassadors will automatically populate this leaderboard.
                </p>
              </div>
            )}

          </div>
        )}

        {/* TAB 4: GATE PASSES, ACCESS DROPS & LIVE SCANNER */}
        {activeTab === 'gate' && (
          <div className="space-y-10 animate-in fade-in duration-200">
            <div className="max-w-3xl space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#10b981] uppercase tracking-widest">
                  Gate & Venue Capacity Management
                </span>
                {isDemoMode && (
                  <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-sm border border-amber-500/30">
                    LIVE GATE DEMO
                  </span>
                )}
              </div>
              <h3 className="font-serif text-3xl font-bold text-white">Gate Operations & Loyalty Scanner</h3>
              <p className="text-stone-300 text-sm">
                Door staff QR lookup: instantly verify tickets, detect Partygoer Loyalty Rank, and view exact staff fulfillment directives.
              </p>
            </div>

            {/* Live Interactive Gate Scanner Terminal */}
            <div className="p-6 rounded-sm bg-[#141210] border-2 border-emerald-500/40 shadow-2xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ffffff15] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-sm bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    <ScanLine className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-serif text-lg font-bold text-white">Live Gate Access Terminal</h4>
                    <span className="text-[11px] font-mono text-emerald-300">Station #1 · Main Entry & VIP Lane</span>
                  </div>
                </div>

                {/* Quick Attendee Switcher for Demo */}
                <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
                  <span className="text-stone-400 text-[10px] uppercase">Quick Scan Test:</span>
                  <button
                    onClick={() => handleRunGateScan('Shanice')}
                    className="px-2.5 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded-sm hover:bg-purple-500/30"
                  >
                    Shanice (Tier 3 VIP)
                  </button>
                  <button
                    onClick={() => handleRunGateScan('Jhenelle')}
                    className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-sm hover:bg-amber-500/30"
                  >
                    Jhenelle (Soundcheck Leader)
                  </button>
                  <button
                    onClick={() => handleRunGateScan('Kadeem')}
                    className="px-2.5 py-1 bg-orange-500/20 text-orange-300 border border-orange-500/40 rounded-sm hover:bg-orange-500/30"
                  >
                    Kadeem (Fast Track)
                  </button>
                </div>
              </div>

              {/* Search / Scan Input */}
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    value={scanInput}
                    onChange={(e) => setScanInput(e.target.value)}
                    placeholder="Scan QR token or type attendee phone number / name..."
                    className="w-full bg-black/60 border border-[#ffffff20] text-white pl-10 pr-4 py-3 rounded-sm text-sm font-mono focus:border-emerald-500 outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRunGateScan(scanInput);
                    }}
                  />
                </div>
                <Button
                  onClick={() => handleRunGateScan(scanInput || 'Shanice')}
                  className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold font-mono text-xs px-6 rounded-sm"
                >
                  <QrCode className="w-4 h-4 mr-2" /> Validate Ticket
                </Button>
              </div>

              {/* Scanned Attendee Telemetry & Staff Directives */}
              {scannedAttendee && (
                <div className="p-5 rounded-sm bg-black/60 border border-emerald-500/30 grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
                  <div className="space-y-2 border-b lg:border-b-0 lg:border-r border-[#ffffff15] pb-4 lg:pb-0 lg:pr-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
                        Ticket Validated · Access Granted
                      </span>
                    </div>
                    <h4 className="text-xl font-serif font-bold text-white">{scannedAttendee.name}</h4>
                    <p className="text-xs font-mono text-stone-400">{scannedAttendee.phone}</p>
                    <div className="pt-2">
                      <span className="text-[10px] font-mono text-stone-400 block uppercase">Event Moment</span>
                      <strong className="text-xs text-white block">{scannedAttendee.preferredMoment}</strong>
                    </div>
                  </div>

                  <div className="space-y-2 border-b lg:border-b-0 lg:border-r border-[#ffffff15] pb-4 lg:pb-0 lg:pr-4">
                    <span className="text-[10px] font-mono uppercase text-purple-300 font-bold block">
                      Partygoer Loyalty Rank
                    </span>
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-[#ffcf38]" />
                      <strong className="text-sm font-bold text-white">
                        {scannedAttendee.pointsEarned >= 350
                          ? '⭐ Tier 3: Culture Insider (Midas Superfan)'
                          : scannedAttendee.pointsEarned >= 200
                          ? 'Tier 2: Scene Regular'
                          : 'Tier 1: Scout'}
                      </strong>
                    </div>
                    <div className="p-2.5 bg-[#141210] rounded-sm text-xs font-mono text-stone-300 space-y-1">
                      <div className="flex justify-between">
                        <span>Vault Legacy Points:</span>
                        <strong className="text-[#ffcf38]">{scannedAttendee.pointsEarned} pts</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Squad Crew Size:</span>
                        <strong className="text-emerald-400">{scannedAttendee.squadInvitesSent} Referred</strong>
                      </div>
                    </div>
                  </div>

                  {/* High-Visibility Door Staff Directives */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono uppercase text-[#ff5a1f] font-bold block">
                      Door Staff Fulfillment Directive
                    </span>
                    <div className="p-3 bg-emerald-950/40 border border-emerald-500/50 rounded-sm space-y-1.5 text-xs">
                      <strong className="text-emerald-300 font-bold block flex items-center gap-1.5">
                        <CheckCheck className="w-4 h-4 text-emerald-400" />
                        {scannedAttendee.perkUnlocked.includes('VIP')
                          ? 'GIVE GOLD VIP WRISTBAND'
                          : scannedAttendee.perkUnlocked.includes('Soundcheck')
                          ? 'GIVE BACKSTAGE ALL-ACCESS PASS'
                          : 'GIVE EXPRESS ACCESS WRISTBAND'}
                      </strong>
                      <p className="text-stone-300 text-[11px] leading-snug">
                        {scannedAttendee.perkUnlocked.includes('VIP')
                          ? 'Attendee earned VIP Deck Upgrade through 5 squad invites. Direct to Upper Lounge.'
                          : scannedAttendee.perkUnlocked.includes('Soundcheck')
                          ? 'Top Referrer (7 crew joined). Escort to VIP hospitality for Capleton soundcheck.'
                          : 'Valid before 6:00 PM. Hand 1 complimentary Tequila token.'}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-stone-400 block pt-1">
                      Moment Memory Piece automatically minted to user Vault upon entry.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Inventory Status Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="p-6 rounded-sm bg-[#141210] border-2 border-[#ffffff15] space-y-3">
                <span className="text-xs font-mono font-bold text-[#ff5a1f] uppercase block">Tier 1 · Speed</span>
                <h4 className="font-serif text-lg font-bold text-white">Express Entry Wristbands</h4>
                <div className="text-2xl font-serif font-black text-white">
                  {isDemoMode ? '38' : '0'} <span className="text-xs font-mono text-stone-400">/ 50 Allocated</span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-sm overflow-hidden">
                  <div className={`bg-[#ff5a1f] h-full ${isDemoMode ? 'w-[76%]' : 'w-[0%]'}`} />
                </div>
                <span className="text-[11px] font-mono text-emerald-400 block">
                  {isDemoMode ? '12 Wristbands Remaining' : '50 Wristbands Available at Launch'}
                </span>
              </div>

              <div className="p-6 rounded-sm bg-[#141210] border-2 border-[#ffffff15] space-y-3">
                <span className="text-xs font-mono font-bold text-[#a855f7] uppercase block">Tier 2 · High Value</span>
                <h4 className="font-serif text-lg font-bold text-white">VIP Deck Upgrades</h4>
                <div className="text-2xl font-serif font-black text-white">
                  {isDemoMode ? '7' : '0'} <span className="text-xs font-mono text-stone-400">/ 10 Allocated</span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-sm overflow-hidden">
                  <div className={`bg-[#a855f7] h-full ${isDemoMode ? 'w-[70%]' : 'w-[0%]'}`} />
                </div>
                <span className="text-[11px] font-mono text-emerald-400 block">
                  {isDemoMode ? '3 VIP Upgrades Remaining' : '10 VIP Upgrades Available at Launch'}
                </span>
              </div>

              <div className="p-6 rounded-sm bg-[#141210] border-2 border-[#ffffff15] space-y-3">
                <span className="text-xs font-mono font-bold text-[#ffcf38] uppercase block">Tier 3 · Exclusive</span>
                <h4 className="font-serif text-lg font-bold text-white">Soundcheck Double Passes</h4>
                <div className="text-2xl font-serif font-black text-white">
                  {isDemoMode ? '2 / 2' : '0 / 2'}
                </div>
                <div className="w-full bg-white/10 h-2 rounded-sm overflow-hidden">
                  <div className={`bg-[#ffcf38] h-full ${isDemoMode ? 'w-[100%]' : 'w-[0%]'}`} />
                </div>
                <span className="text-[11px] font-mono text-[#ffcf38] block">
                  {isDemoMode ? '100% Claimed by Top Referrers' : '2 Passes Open for Top Referrers'}
                </span>
              </div>

              <div className="p-6 rounded-sm bg-[#141210] border-2 border-[#ffffff15] space-y-3">
                <span className="text-xs font-mono font-bold text-[#10b981] uppercase block">Tier 4 · Early Arrival</span>
                <h4 className="font-serif text-lg font-bold text-white">Hosted Drinks Passes (Pre-6PM)</h4>
                <div className="text-2xl font-serif font-black text-white">
                  {isDemoMode ? '24' : '0'} <span className="text-xs font-mono text-stone-400">/ 30 Claimed</span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-sm overflow-hidden">
                  <div className={`bg-[#10b981] h-full ${isDemoMode ? 'w-[80%]' : 'w-[0%]'}`} />
                </div>
                <span className="text-[11px] font-mono text-emerald-400 block">
                  {isDemoMode ? '6 Tokens Remaining' : '30 Tokens Available at Launch'}
                </span>
              </div>

            </div>
          </div>
        )}

        {/* TAB 5: AUDIENCE BROADCAST & RE-ENGAGEMENT */}
        {activeTab === 'broadcast' && (
          <div className="space-y-10 animate-in fade-in duration-200">
            <div className="max-w-3xl space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#ff5a1f] uppercase tracking-widest">
                  Direct Audience Re-Engagement Engine
                </span>
                <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-sm border border-purple-500/30">
                  IN-APP & EMAIL CHANNELS
                </span>
              </div>
              <h3 className="font-serif text-3xl font-bold text-white">Audience Broadcast & Loyalty Drops</h3>
              <p className="text-stone-300 text-sm">
                Re-engage past attendees, broadcast holiday presales (December & Easter), or drop sponsored perks directly into fans' Promorang Vaults without paying for social ads.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Campaign Composer Form */}
              <div className="lg:col-span-2 p-6 rounded-sm bg-[#141210] border-2 border-[#ffffff15] space-y-6">
                <div className="flex items-center justify-between border-b border-[#ffffff15] pb-4">
                  <h4 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                    <Send className="w-4 h-4 text-[#ff5a1f]" /> Compose Audience Broadcast
                  </h4>
                  <span className="text-[11px] font-mono text-emerald-400">Zero Spam · Guaranteed Delivery</span>
                </div>

                {/* Pre-built Templates */}
                <div className="space-y-2">
                  <label className="text-xs font-mono text-stone-400 block uppercase">1-Click Campaign Templates</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectTemplate('dec_presale')}
                      className="p-3 text-left bg-black/50 border border-white/10 hover:border-amber-500/50 rounded-sm space-y-1 transition"
                    >
                      <strong className="text-xs text-white block">🎄 Dec 2026 Presale</strong>
                      <span className="text-[10px] text-stone-400 block leading-tight">20% off for Summer piece holders</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectTemplate('easter_vip')}
                      className="p-3 text-left bg-black/50 border border-white/10 hover:border-purple-500/50 rounded-sm space-y-1 transition"
                    >
                      <strong className="text-xs text-white block">🐰 Easter VIP Drop</strong>
                      <span className="text-[10px] text-stone-400 block leading-tight">Tier 3 Superfans Soundcheck pass</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectTemplate('sponsor_perk')}
                      className="p-3 text-left bg-black/50 border border-white/10 hover:border-emerald-500/50 rounded-sm space-y-1 transition"
                    >
                      <strong className="text-xs text-white block">🍹 Sponsored Drink Gift</strong>
                      <span className="text-[10px] text-stone-400 block leading-tight">Tequila token drop to all fans</span>
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSendBroadcast} className="space-y-5">
                  {/* Target Audience Segment */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-mono text-stone-400 block uppercase">Target Audience Segment</label>
                      <select
                        value={broadcastSegment}
                        onChange={(e) => setBroadcastSegment(e.target.value as any)}
                        className="w-full bg-black/60 border border-[#ffffff20] text-white px-3.5 py-2.5 rounded-sm text-xs font-mono focus:border-[#ff5a1f] outline-none"
                      >
                        <option value="all">All Verified Attendees ({isDemoMode ? '418 Fans' : attendeesList.length})</option>
                        <option value="vip">VIP Superfans / Tier 3+ ({isDemoMode ? '42 Fans' : '0'})</option>
                        <option value="squad_leaders">Top Squad Leaders ({isDemoMode ? '24 Leaders' : '0'})</option>
                        <option value="unclaimed_perks">Unclaimed Perk Holders ({isDemoMode ? '86 Fans' : '0'})</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-mono text-stone-400 block uppercase">Broadcast Channel</label>
                      <select
                        value={broadcastChannel}
                        onChange={(e) => setBroadcastChannel(e.target.value as any)}
                        className="w-full bg-black/60 border border-[#ffffff20] text-white px-3.5 py-2.5 rounded-sm text-xs font-mono focus:border-[#ff5a1f] outline-none"
                      >
                        <option value="both">In-App Push & Direct Email (Recommended)</option>
                        <option value="in_app">In-App Notification Banner Only</option>
                        <option value="email">Direct Email Announcement Only</option>
                      </select>
                    </div>
                  </div>

                  {/* Subject Line */}
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-stone-400 block uppercase">Campaign Subject / Notification Header</label>
                    <input
                      type="text"
                      value={broadcastSubject}
                      onChange={(e) => setBroadcastSubject(e.target.value)}
                      placeholder="e.g. Exclusive Presale Live for Midas VIPs..."
                      className="w-full bg-black/60 border border-[#ffffff20] text-white px-3.5 py-2.5 rounded-sm text-xs font-mono focus:border-[#ff5a1f] outline-none"
                    />
                  </div>

                  {/* Body Content */}
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-stone-400 block uppercase">Broadcast Message Body & Call-to-Action</label>
                    <textarea
                      rows={4}
                      value={broadcastBody}
                      onChange={(e) => setBroadcastBody(e.target.value)}
                      placeholder="Write announcement details..."
                      className="w-full bg-black/60 border border-[#ffffff20] text-white p-3.5 rounded-sm text-xs font-mono focus:border-[#ff5a1f] outline-none"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-stone-400">
                      Recipients: <strong className="text-white">{isDemoMode ? (broadcastSegment === 'vip' ? '42 Fans' : broadcastSegment === 'squad_leaders' ? '24 Leaders' : '418 Fans') : attendeesList.length}</strong>
                    </span>
                    <Button
                      type="submit"
                      className="bg-[#ff5a1f] hover:bg-[#e04b00] text-white font-bold font-mono text-xs px-8 py-3 rounded-sm"
                    >
                      <Send className="w-3.5 h-3.5 mr-2" /> Dispatch Audience Broadcast
                    </Button>
                  </div>
                </form>
              </div>

              {/* Broadcast Performance & Campaign History */}
              <div className="space-y-6">
                <div className="p-6 rounded-sm bg-[#141210] border-2 border-[#ffffff15] space-y-4">
                  <span className="text-xs font-mono font-bold text-emerald-400 uppercase block">
                    Re-Engagement Performance
                  </span>
                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-3 bg-black/40 rounded-sm border border-white/10">
                      <span className="text-stone-400 text-[10px] block uppercase">Avg Open Rate</span>
                      <strong className="text-xl text-emerald-400 block mt-1">87.1%</strong>
                    </div>
                    <div className="p-3 bg-black/40 rounded-sm border border-white/10">
                      <span className="text-stone-400 text-[10px] block uppercase">Ticket Click-Through</span>
                      <strong className="text-xl text-[#ffcf38] block mt-1">69.8%</strong>
                    </div>
                  </div>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    Because attendees have real value stored in their Promorang Vault, in-app alerts achieve 5x the conversion of cold social media posts.
                  </p>
                </div>

                {/* Campaign History Log */}
                <div className="p-6 rounded-sm bg-[#141210] border-2 border-[#ffffff15] space-y-4">
                  <span className="text-xs font-mono font-bold text-stone-300 uppercase block">
                    Broadcast Dispatch History
                  </span>
                  <div className="space-y-3">
                    {broadcastHistory.map((cmp) => (
                      <div key={cmp.id} className="p-3 bg-black/40 rounded-sm border border-white/10 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <strong className="text-white text-xs truncate max-w-[200px]">{cmp.subject}</strong>
                          <span className="text-[10px] font-mono text-emerald-400 font-bold">{cmp.status}</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-mono text-stone-400">
                          <span>{cmp.segment}</span>
                          <span>{cmp.sentAt}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] font-mono pt-1 border-t border-white/10 text-stone-300">
                          <span>Opens: <strong className="text-emerald-400">{cmp.openRate}</strong></span>
                          <span>Clicks: <strong className="text-[#ffcf38]">{cmp.clickRate}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
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
            {isDemoMode ? (
              <Button
                onClick={handlePurgeDemoData}
                variant="destructive"
                className="font-mono text-xs px-5 py-3 rounded-sm uppercase tracking-wider"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                <span>Purge Demo Data</span>
              </Button>
            ) : (
              <Button
                onClick={handleLoadDemoPreview}
                variant="outline"
                className="font-mono text-xs px-5 py-3 rounded-sm uppercase tracking-wider border-white/20"
              >
                <Eye className="w-3.5 h-3.5 mr-1.5" />
                <span>Load Sample Preview</span>
              </Button>
            )}
            <Link
              to="/proposals/midas"
              className="bg-[#ffffff0a] hover:bg-[#ffffff15] text-stone-300 hover:text-white font-mono text-xs px-5 py-3 rounded-sm border border-[#ffffff15]"
            >
              Proposal Brief
            </Link>
          </div>
        </div>
      </footer>

    </main>
  );
}

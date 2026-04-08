import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { QrCode, AlertCircle, ShieldCheck, Users, LogOut, Calendar, Clock, MapPin, ChevronRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/react-app/hooks/useAuth';

// Mock Data for "My Assignments"
const MY_ASSIGNMENTS = [
  {
    id: 'moment-123',
    title: 'Morning Session',
    status: 'live',
    time: 'Now',
    location: 'Main Stage',
    participants: 42,
    verified_count: 38
  },
  {
    id: 'moment-456',
    title: 'VIP Lounge Access',
    status: 'upcoming',
    time: '2:00 PM',
    location: 'Lounge B',
    participants: 0,
    verified_count: 0
  },
  {
    id: 'moment-789',
    title: 'Closing Ceremony',
    status: 'upcoming',
    time: '6:00 PM',
    location: 'Auditorium',
    participants: 0,
    verified_count: 0
  }
];

export default function OperatorDashboard() {
  const { signOut } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeMoment, setActiveMoment] = useState<typeof MY_ASSIGNMENTS[0] | null>(null);

  // Hydrate from URL on load
  useEffect(() => {
    const momentId = searchParams.get('momentId');
    if (momentId) {
      const found = MY_ASSIGNMENTS.find(m => m.id === momentId);
      if (found) {
        setActiveMoment(found);
      } else {
        // Fallback for valid ID format but not in mock list (e.g. real prod ID)
        setActiveMoment({
          id: momentId,
          title: 'Unknown Session',
          status: 'active',
          time: 'Unknown',
          location: 'Unknown',
          participants: 0,
          verified_count: 0
        });
      }
    }
  }, [searchParams]);

  const handleSelectMoment = (moment: typeof MY_ASSIGNMENTS[0]) => {
    setActiveMoment(moment);
    // Optionally update URL to reflect selection, so refreshing keeps state
    setSearchParams({ momentId: moment.id });
  };

  const handleBackToSelection = () => {
    setActiveMoment(null);
    setSearchParams({});
  };

  // ---------------------------------------------------------------------------
  // VIEW: SELECTION SCREEN (Context Selector)
  // ---------------------------------------------------------------------------
  if (!activeMoment) {
    return (
      <div className="min-h-screen bg-[#08060a] text-white font-sans relative overflow-hidden">
        {/* Background */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-500/[0.05] blur-[120px] rounded-full" />
        </div>

        <div className="max-w-md mx-auto p-6 pt-12 space-y-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-500 mb-4">
              <ShieldCheck className="w-6 h-6" />
              <span className="text-xs font-black uppercase tracking-[0.2em]">Operator Access</span>
            </div>
            <h1 className="text-3xl font-bold text-white">Select Active Session</h1>
            <p className="text-white/40 text-sm">Choose the event context you are verifying for.</p>
          </div>

          <div className="space-y-3">
            {MY_ASSIGNMENTS.map((moment) => (
              <button
                key={moment.id}
                onClick={() => handleSelectMoment(moment)}
                className="w-full text-left bg-zinc-900/50 hover:bg-zinc-800/80 border border-white/5 hover:border-amber-500/30 p-4 rounded-xl transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    {moment.status === 'live' && (
                      <span className="inline-block px-2 py-0.5 bg-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-wider rounded-sm mb-2">Live Now</span>
                    )}
                    {moment.status === 'upcoming' && (
                      <span className="inline-block px-2 py-0.5 bg-white/10 text-white/40 text-[10px] font-black uppercase tracking-wider rounded-sm mb-2">Upcoming</span>
                    )}
                    <h3 className="text-lg font-bold text-white group-hover:text-amber-500 transition-colors">{moment.title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-xs text-white/40">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {moment.time}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {moment.location}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                </div>
              </button>
            ))}
          </div>

          <div className="border-t border-white/5 pt-8 flex justify-center">
            <button
              onClick={signOut}
              className="text-xs font-medium text-white/20 hover:text-red-500 transition-colors flex items-center gap-2"
            >
              <LogOut className="w-3 h-3" />
              Log Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // VIEW: TERMINAL (Verification Loop)
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#08060a] text-white font-sans relative overflow-hidden">
      {/* Ambient Background Washes */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-500/[0.05] blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-500/[0.05] blur-[140px] rounded-full" />
      </div>

      {/* Header */}
      <div className="relative z-10 bg-[#08060a]/80 backdrop-blur-xl border-b border-white/5 sticky top-0">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={handleBackToSelection} className="hover:bg-white/10 p-1 rounded-lg transition-colors">
              <ArrowLeft className="w-4 h-4 text-white/60" />
            </button>
            <ShieldCheck className="w-5 h-5 text-amber-500" />
            <h1 className="text-[10px] font-black uppercase tracking-[0.3em] text-white hidden sm:block">Verification Link</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">System Active</span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-xl mx-auto p-6 space-y-8 pb-32">

        {/* Active Moment Card */}
        <div className="bg-zinc-900/50 backdrop-blur-md rounded-[2.5rem] border border-white/10 p-8 shadow-2xl space-y-8 relative overflow-hidden">
          {/* Gloss Effect */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.02] rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-[10px] text-amber-500 font-black uppercase tracking-[0.3em] mb-2">{activeMoment.time}</p>
              <h2 className="text-3xl font-black text-white italic lowercase tracking-tight">{activeMoment.title}</h2>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 relative z-10">
            <div className="p-4 bg-black/20 rounded-2xl border border-white/5 space-y-1">
              <div className="flex items-center gap-2 text-white/40 mb-1">
                <Users className="w-3 h-3" />
                <span className="text-[8px] font-black uppercase tracking-widest">Guests</span>
              </div>
              <p className="text-2xl font-black text-white">{activeMoment.participants}</p>
            </div>
            <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 space-y-1">
              <div className="flex items-center gap-2 text-emerald-500/60 mb-1">
                <ShieldCheck className="w-3 h-3" />
                <span className="text-[8px] font-black uppercase tracking-widest">Verified</span>
              </div>
              <p className="text-2xl font-black text-emerald-500">{activeMoment.verified_count}</p>
            </div>
          </div>

          {/* Primary Action: Verify */}
          <div className="pt-4 relative z-10">
            <button
              onClick={() => console.log('Open Verify Scanner')} // To be implemented
              className="w-full py-5 bg-white text-black hover:bg-amber-500 transition-colors rounded-2xl font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl"
            >
              <QrCode className="w-5 h-5" />
              Launch Scanner
            </button>
            <p className="text-center text-[10px] text-white/20 mt-4 uppercase tracking-widest font-medium">
              Ready to verify assets for {activeMoment.title}
            </p>
          </div>
        </div>

        {/* Pending / Flagged (Fairness Check) */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] px-4">Exceptions Queue</h3>

          <div className="bg-zinc-900/30 rounded-2xl border border-white/5 p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">Waitlist Overflow</p>
                <p className="text-xs text-white/40 mt-0.5">3 participants attempting late entry.</p>
              </div>
            </div>
            <button className="text-[10px] font-black bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg text-white/60 uppercase tracking-widest transition-colors">Review</button>
          </div>
        </div>

        {/* Exit / Logout */}
        <div className="flex justify-center pt-8">
          <button
            onClick={signOut}
            className="flex items-center gap-2 text-white/20 hover:text-red-500 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Close Terminal</span>
          </button>
        </div>
      </div>
    </div>
  );
}

import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../hooks/useAuth';
import {
  PlusCircle,
  Users,
  ShieldCheck,
  Zap,
  Clock,
  Archive,
  ArrowRight,
  Heart,
  Sparkles
} from 'lucide-react';
import { apiFetch } from '@/react-app/utils/api';

// Types
interface MomentSummary {
  id: string;
  title: string;
  type: string;
  status: 'draft' | 'scheduled' | 'live' | 'closed' | 'archived';
  starts_at: string;
  capacity: number;
  rsvps_count: number;
  reliability_req: number;
}

interface DashboardStats {
  activeMoments: number;
  totalParticipants: number;
  avgReliability: number;
}

export default function AdvertiserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [moments, setMoments] = useState<MomentSummary[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    activeMoments: 0,
    totalParticipants: 0,
    avgReliability: 0
  });

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiFetch('/api/moments/managed/list');
      if (response.ok) {
        const data = await response.json();
        setMoments(data.moments || []);
        setStats(data.stats || { activeMoments: 0, totalParticipants: 0, avgReliability: 0 });
      }
    } catch (error) {
      console.error('Failed to fetch moments:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      void fetchDashboard();
    }
  }, [user, fetchDashboard]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-[#08060a]">
        <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08060a] pb-40 relative overflow-hidden">
      {/* Ambient Background Washes */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-500/[0.03] blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-500/[0.03] blur-[140px] rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto space-y-12 px-6 py-12 relative z-10">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter italic lowercase">Hosting Center</h1>
            <p className="text-[10px] text-white/20 font-black uppercase mt-2 tracking-[0.4em]">Manage invitations & track impact</p>
          </div>
          <button
            onClick={() => navigate('/moments/create')}
            className="bg-white text-[#08060a] hover:scale-105 transition-all flex items-center gap-3 px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl shadow-white/5"
          >
            <PlusCircle className="w-4 h-4" />
            Create invitation
          </button>
        </div>

        {/* Impact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-950/50 backdrop-blur-sm p-8 rounded-[2rem] border border-white/5 space-y-4">
            <div className="flex items-center gap-3 text-amber-500/60">
              <Zap className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest leading-none">Active moments</span>
            </div>
            <p className="text-4xl font-black text-white tracking-tighter italic lowercase">{stats.activeMoments}</p>
          </div>
          <div className="bg-zinc-950/50 backdrop-blur-sm p-8 rounded-[2rem] border border-white/5 space-y-4">
            <div className="flex items-center gap-3 text-purple-500/60">
              <Heart className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest leading-none">Neighborhood impact</span>
            </div>
            <p className="text-4xl font-black text-white tracking-tighter italic lowercase">{stats.totalParticipants}</p>
          </div>
          <div className="bg-zinc-950/50 backdrop-blur-sm p-8 rounded-[2rem] border border-white/5 space-y-4">
            <div className="flex items-center gap-3 text-emerald-500/60">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest leading-none">Reliability Score</span>
            </div>
            <p className="text-4xl font-black text-white tracking-tighter italic lowercase">{stats.avgReliability}</p>
          </div>
        </div>

        {/* Moments List */}
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-white/5 pb-4 px-1">
            <h3 className="text-xl font-bold text-white tracking-tight lowercase">Your invitations</h3>
            <div className="flex gap-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40 cursor-pointer hover:text-white transition-colors">All</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-white/10 cursor-pointer hover:text-white transition-colors">Live</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-white/10 cursor-pointer hover:text-white transition-colors">Drafts</span>
            </div>
          </div>

          {moments.length === 0 ? (
            <div className="py-24 text-center bg-white/[0.01] rounded-[3rem] border border-dashed border-white/5 space-y-6">
              <Sparkles className="w-12 h-12 text-white/5 mx-auto" />
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white/40 lowercase">Your ledger is empty</h3>
                <p className="text-sm text-white/20 italic font-medium">Start building your community legacy by hosting your first ritual.</p>
              </div>
              <button
                onClick={() => navigate('/moments/create')}
                className="mt-4 px-8 py-3 bg-white/[0.05] hover:bg-white/10 text-white/40 rounded-full text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Host first moment
              </button>
            </div>
          ) : (
            <div className="grid gap-6">
              {moments.map(moment => (
                <div
                  key={moment.id}
                  onClick={() => navigate(`/moments/${moment.id}/manage`)}
                  className="bg-zinc-950/50 backdrop-blur-sm p-6 rounded-[2rem] border border-white/5 hover:border-white/10 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${moment.status === 'live' ? 'bg-emerald-500/5 text-emerald-400' :
                      moment.status === 'closed' ? 'bg-white/5 text-white/20' :
                        'bg-amber-500/5 text-amber-400'
                      }`}>
                      {moment.status === 'live' ? <Zap className="w-6 h-6 animate-pulse" /> :
                        moment.status === 'closed' ? <Archive className="w-6 h-6" /> :
                          <Clock className="w-6 h-6" />}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white group-hover:text-amber-500 transition-colors lowercase tracking-tight">{moment.title}</h4>
                      <div className="flex items-center gap-4 text-[10px] text-white/20 font-black uppercase tracking-widest mt-1">
                        <span className="text-amber-500/40">{moment.type.replace('_', ' ')}</span>
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {moment.rsvps_count || 0}/{moment.capacity}</span>
                        <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> {moment.reliability_req}+ rank</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className={`text-[10px] font-black uppercase tracking-widest ${moment.status === 'live' ? 'text-emerald-500' :
                        moment.status === 'scheduled' ? 'text-amber-500' :
                          'text-white/10'
                        }`}>{moment.status}</p>
                      <p className="text-[10px] text-white/20 font-medium mt-1 uppercase tracking-tighter italic">{new Date(moment.starts_at).toLocaleDateString()}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-white/10 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/react-app/hooks/useAuth';
import { 
    LogOut,
    Compass,
    Building2
} from 'lucide-react';
import { TodaySkeleton } from '@/react-app/components/ui/SkeletonShimmer';
import api from '@/react-app/lib/api';
import ExecutiveHero from '@/react-app/components/today/ExecutiveHero';
import CreatorDashboardView from '@/react-app/components/today/CreatorDashboardView';
import OrganizerDashboardView from '@/react-app/components/today/OrganizerDashboardView';

export default function Today() {
    const { signOut, user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    // Determine initial role view mode
    const isOrganizerRole = user?.user_type && ['advertiser', 'merchant', 'operator'].includes(user.user_type);
    const [activeMode, setActiveMode] = useState<'creator' | 'organizer'>(isOrganizerRole ? 'organizer' : 'creator');

    useEffect(() => {
        if (user?.user_type) {
            const isOrg = ['advertiser', 'merchant', 'operator'].includes(user.user_type);
            setActiveMode(isOrg ? 'organizer' : 'creator');
        }
    }, [user?.user_type]);

    useEffect(() => {
        const fetchTodayData = async () => {
            try {
                const response = await api.get('/today');
                setData(response.data);
            } catch (error) {
                console.error('Failed to fetch today data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTodayData();
    }, []);

    if (loading) {
        return <TodaySkeleton />;
    }

    return (
        <div className="relative min-h-screen bg-[#08060a] text-white selection:bg-[#FF5500]/30 pb-36">
            {/* Soft Ambient Background Glows */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#FF5500]/[0.06] blur-[150px] rounded-full" />
                <div className="absolute top-[30%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/[0.05] blur-[140px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] bg-amber-500/[0.05] blur-[140px] rounded-full" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-10">
                {/* 1. Unified Executive Hero */}
                <ExecutiveHero
                    activeMode={activeMode}
                    onModeChange={(mode) => setActiveMode(mode)}
                    user={user}
                    data={data}
                />

                {/* 2. Dynamic View Container */}
                {activeMode === 'creator' ? (
                    <CreatorDashboardView data={data} user={user} />
                ) : (
                    <OrganizerDashboardView data={data} user={user} />
                )}

                {/* Footer Section */}
                <footer className="pt-16 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-white/40">
                    <div className="flex items-center gap-4">
                        <span className="font-semibold text-white/60">Promorang Cultural OS</span>
                        <span>·</span>
                        <span>1 Gem = $1.00 USD</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setActiveMode(activeMode === 'creator' ? 'organizer' : 'creator')}
                            className="hover:text-white transition-colors flex items-center gap-1.5"
                        >
                            {activeMode === 'creator' ? (
                                <>
                                    <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                                    Switch to Organizer Mode
                                </>
                            ) : (
                                <>
                                    <Compass className="w-3.5 h-3.5 text-[#FF5500]" />
                                    Switch to Creator Mode
                                </>
                            )}
                        </button>
                        <button
                            onClick={async () => {
                                await signOut();
                                navigate('/auth');
                            }}
                            className="hover:text-rose-400 transition-colors flex items-center gap-1"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            Sign Out
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
}

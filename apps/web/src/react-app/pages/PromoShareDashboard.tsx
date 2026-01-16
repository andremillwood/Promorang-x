import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Ticket, Gift, Clock, Trophy, Sparkles, Calendar, Star } from 'lucide-react';
import { promoShareService, type PromoShareDashboardData, type DrawData, type DrawType } from '../services/promoshare';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import { SponsorshipModal } from '../components/promoshare/SponsorshipModal';

// Draw type configurations
const DRAW_CONFIG: Record<DrawType, { 
    label: string; 
    icon: string; 
    gradient: string; 
    border: string;
    description: string;
}> = {
    daily: {
        label: 'Daily Draw',
        icon: '☀️',
        gradient: 'from-orange-500 to-amber-500',
        border: 'border-orange-500/30',
        description: 'Drawn every day at midnight'
    },
    weekly: {
        label: 'Weekly Draw',
        icon: '📅',
        gradient: 'from-blue-500 to-cyan-500',
        border: 'border-blue-500/30',
        description: 'Drawn every Sunday'
    },
    monthly: {
        label: 'Monthly Draw',
        icon: '🗓️',
        gradient: 'from-purple-500 to-pink-500',
        border: 'border-purple-500/30',
        description: 'Drawn on the 1st of each month'
    },
    grand: {
        label: 'GRAND JACKPOT',
        icon: '🏆',
        gradient: 'from-yellow-400 via-amber-500 to-orange-500',
        border: 'border-yellow-500/50',
        description: 'Weekly mega draw - rolls over until won!'
    }
};

// Helper to format time remaining
function formatTimeLeft(endAt: string): { days: number; hours: number; minutes: number; label: string } {
    const timeLeft = new Date(endAt).getTime() - Date.now();
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    let label = '';
    if (days > 0) label = `${days}d ${hours}h`;
    else if (hours > 0) label = `${hours}h ${minutes}m`;
    else label = `${minutes}m`;
    
    return { days, hours, minutes, label };
}

// Individual Draw Card Component
function DrawCard({ draw, index }: { draw: DrawData; index: number }) {
    const config = DRAW_CONFIG[draw.cycle_type];
    const time = formatTimeLeft(draw.end_at);
    const probability = draw.totalTickets > 0 ? ((draw.userTickets / draw.totalTickets) * 100).toFixed(2) : '0';
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-pr-surface-1 rounded-2xl p-5 border ${config.border} relative overflow-hidden`}
        >
            {/* Rollover Badge */}
            {draw.is_rollover && (
                <div className="absolute top-3 right-3">
                    <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded-full font-medium border border-yellow-500/30">
                        🔥 ROLLOVER
                    </span>
                </div>
            )}
            
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center text-2xl shadow-lg`}>
                    {config.icon}
                </div>
                <div>
                    <h3 className="font-bold text-pr-text-1">{config.label}</h3>
                    <p className="text-xs text-pr-text-2">{config.description}</p>
                </div>
            </div>
            
            {/* Jackpot Amount */}
            <div className="mb-4">
                <p className="text-xs text-pr-text-2 uppercase tracking-wider mb-1">Jackpot</p>
                <div className={`text-3xl font-black bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}>
                    {draw.jackpot_amount.toLocaleString()} 💎
                </div>
            </div>
            
            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-pr-surface-2 rounded-lg p-3">
                    <p className="text-xs text-pr-text-2 mb-1">Your Tickets</p>
                    <p className="text-xl font-bold text-pr-text-1">{draw.userTickets}</p>
                </div>
                <div className="bg-pr-surface-2 rounded-lg p-3">
                    <p className="text-xs text-pr-text-2 mb-1">Win Chance</p>
                    <p className="text-xl font-bold text-pr-text-1">{probability}%</p>
                </div>
            </div>
            
            {/* Countdown */}
            <div className={`bg-gradient-to-r ${config.gradient} rounded-xl p-3 text-white`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">Next Draw</span>
                    </div>
                    <span className="font-bold text-lg">{time.label}</span>
                </div>
            </div>
            
            {/* Pool Items Preview */}
            {draw.poolItems.length > 0 && (
                <div className="mt-3 pt-3 border-t border-pr-surface-3">
                    <p className="text-xs text-pr-text-2 mb-2">Prize Pool</p>
                    <div className="flex flex-wrap gap-1">
                        {draw.poolItems.slice(0, 3).map((item) => (
                            <span key={item.id} className="text-xs bg-pr-surface-2 px-2 py-1 rounded text-pr-text-2">
                                {item.amount} {item.reward_type}s
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
}

export default function PromoShareDashboard() {
    const { user } = useAuth();
    const [data, setData] = useState<PromoShareDashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSponsorModalOpen, setIsSponsorModalOpen] = useState(false);

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                setLoading(true);
                const dashboardData = await promoShareService.getDashboard();
                setData(dashboardData);
            } catch (err) {
                setError('Failed to load dashboard');
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, [user]);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="animate-pulse space-y-6">
                    <div className="h-12 bg-pr-surface-3 rounded-lg w-64 mx-auto" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-64 bg-pr-surface-3 rounded-2xl" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Get draws array (use new format or create from legacy)
    const draws: DrawData[] = data?.draws || (data?.activeCycle ? [{
        id: data.activeCycle.id,
        cycle_type: data.activeCycle.cycle_type,
        end_at: data.activeCycle.end_at,
        jackpot_amount: data.currentJackpot || 0,
        is_rollover: data.isRollover || false,
        userTickets: data.userTickets,
        totalTickets: data.totalTickets,
        ticketNumbers: data.ticketNumbers,
        poolItems: data.poolItems
    }] : []);

    // Sort draws: grand first, then by end time
    const sortedDraws = [...draws].sort((a, b) => {
        if (a.cycle_type === 'grand') return -1;
        if (b.cycle_type === 'grand') return 1;
        return new Date(a.end_at).getTime() - new Date(b.end_at).getTime();
    });

    // Calculate total tickets across all draws
    const totalUserTickets = draws.reduce((sum, d) => sum + d.userTickets, 0);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Header Section */}
            <div className="text-center space-y-4">
                <motion.h1 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400"
                >
                    PromoShare
                </motion.h1>
                <p className="text-lg text-pr-text-2 max-w-2xl mx-auto">
                    Every action earns tickets. Four draws running simultaneously. 
                    <span className="text-yellow-500 font-semibold"> Win daily, weekly, monthly, or hit the GRAND JACKPOT!</span>
                </p>
            </div>

            {/* Quick Stats Bar */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-2xl p-6 text-white shadow-xl"
            >
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                            <Ticket className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-white/80 text-sm">Your Total Tickets</p>
                            <p className="text-4xl font-black">{totalUserTickets}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-center">
                            <p className="text-white/80 text-sm">Active Draws</p>
                            <p className="text-2xl font-bold">{draws.length}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-white/80 text-sm">Combined Jackpot</p>
                            <p className="text-2xl font-bold">{draws.reduce((sum, d) => sum + d.jackpot_amount, 0).toLocaleString()} 💎</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* All Draws Grid */}
            <div>
                <h2 className="text-2xl font-bold text-pr-text-1 mb-4 flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-yellow-500" />
                    Active Draws
                </h2>
                
                {draws.length === 0 ? (
                    <div className="bg-pr-surface-1 rounded-2xl p-12 text-center border border-pr-surface-3">
                        <Sparkles className="w-16 h-16 text-pr-text-2 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-pr-text-1 mb-2">No Active Draws</h3>
                        <p className="text-pr-text-2">New draws are coming soon! Keep earning tickets.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {sortedDraws.map((draw, index) => (
                            <DrawCard key={draw.id} draw={draw} index={index} />
                        ))}
                    </div>
                )}
            </div>

            {/* Ways to Earn & Winners Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Ways to Earn */}
                <div className="bg-pr-surface-1 rounded-2xl p-6 border border-pr-surface-3">
                    <h3 className="text-xl font-bold text-pr-text-1 mb-4 flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500" />
                        Ways to Earn Tickets
                    </h3>
                    <ul className="space-y-3">
                        <li className="flex items-center p-3 bg-pr-surface-2 rounded-xl">
                            <div className="bg-blue-500/20 p-2 rounded-lg mr-4">
                                <span className="text-xl">💧</span>
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-pr-text-1">Complete Drops</h4>
                                <p className="text-sm text-pr-text-2">1 ticket per completed drop</p>
                            </div>
                            <Link to="/earn" className="text-blue-500 text-sm font-medium hover:text-blue-400">Go →</Link>
                        </li>
                        <li className="flex items-center p-3 bg-pr-surface-2 rounded-xl">
                            <div className="bg-pink-500/20 p-2 rounded-lg mr-4">
                                <span className="text-xl">❤️</span>
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-pr-text-1">Social Engagement</h4>
                                <p className="text-sm text-pr-text-2">Likes & comments earn tickets</p>
                            </div>
                            <Link to="/feed" className="text-blue-500 text-sm font-medium hover:text-blue-400">Feed →</Link>
                        </li>
                        <li className="flex items-center p-3 bg-pr-surface-2 rounded-xl">
                            <div className="bg-green-500/20 p-2 rounded-lg mr-4">
                                <span className="text-xl">🎯</span>
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-pr-text-1">Daily Login</h4>
                                <p className="text-sm text-pr-text-2">Bonus ticket every day</p>
                            </div>
                        </li>
                        <li className="flex items-center p-3 bg-pr-surface-2 rounded-xl">
                            <div className="bg-purple-500/20 p-2 rounded-lg mr-4">
                                <span className="text-xl">👥</span>
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-pr-text-1">Refer Friends</h4>
                                <p className="text-sm text-pr-text-2">5 tickets per referral</p>
                            </div>
                            <Link to="/referrals" className="text-blue-500 text-sm font-medium hover:text-blue-400">Invite →</Link>
                        </li>
                    </ul>
                </div>

                {/* Recent Winners */}
                <div className="bg-pr-surface-1 rounded-2xl p-6 border border-pr-surface-3">
                    <h3 className="text-xl font-bold text-pr-text-1 mb-4 flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        Recent Winners
                    </h3>
                    <div className="text-center py-8">
                        <div className="w-20 h-20 bg-pr-surface-2 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Gift className="w-10 h-10 text-pr-text-2" />
                        </div>
                        <p className="text-pr-text-2 mb-2">First draws coming soon!</p>
                        <p className="text-sm text-pr-text-2">Be among the first to win big.</p>
                    </div>
                </div>
            </div>

            {/* How It Works */}
            <div className="bg-gradient-to-br from-pr-surface-1 to-pr-surface-2 rounded-2xl p-6 border border-pr-surface-3">
                <h3 className="text-xl font-bold text-pr-text-1 mb-4">How PromoShare Works</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4">
                        <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span className="text-2xl">1️⃣</span>
                        </div>
                        <h4 className="font-semibold text-pr-text-1 mb-1">Earn Tickets</h4>
                        <p className="text-sm text-pr-text-2">Complete drops, engage socially, refer friends</p>
                    </div>
                    <div className="text-center p-4">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span className="text-2xl">2️⃣</span>
                        </div>
                        <h4 className="font-semibold text-pr-text-1 mb-1">Enter Draws</h4>
                        <p className="text-sm text-pr-text-2">Tickets auto-enter all 4 draw types</p>
                    </div>
                    <div className="text-center p-4">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span className="text-2xl">3️⃣</span>
                        </div>
                        <h4 className="font-semibold text-pr-text-1 mb-1">Wait for Draw</h4>
                        <p className="text-sm text-pr-text-2">Random lottery number drawn</p>
                    </div>
                    <div className="text-center p-4">
                        <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span className="text-2xl">4️⃣</span>
                        </div>
                        <h4 className="font-semibold text-pr-text-1 mb-1">Win Big!</h4>
                        <p className="text-sm text-pr-text-2">No winner? Jackpot rolls over!</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

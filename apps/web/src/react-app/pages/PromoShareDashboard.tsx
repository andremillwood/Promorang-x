import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Ticket, Gift } from 'lucide-react';
import { promoShareService, type PromoShareDashboardData } from '../services/promoshare';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import { SponsorshipModal } from '../components/promoshare/SponsorshipModal';

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

    if (loading) return <div className="flex justify-center p-8">Loading...</div>;

    const activeCycle = data?.activeCycle;
    const timeLeft = activeCycle ? new Date(activeCycle.end_at).getTime() - Date.now() : 0;

    // Format time left
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Header Section */}
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                    PromoShare
                </h1>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                    Participate in the ecosystem where effort compounds. Earn tickets for every action and win big in weekly draws.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Cycle Timer */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-800 rounded-2xl p-6 border border-gray-700 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                    </div>
                    <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">Next Draw</h3>
                    <div className="mt-4 flex items-baseline space-x-2">
                        {activeCycle ? (
                            <div className="text-3xl font-bold text-white">
                                {days}d {hours}h {minutes}m
                            </div>
                        ) : (
                            <div className="text-2xl font-bold text-yellow-500">No Active Draw</div>
                        )}
                    </div>
                    <p className="mt-2 text-sm text-gray-500">Weekly Cycle</p>
                </motion.div>

                {/* User Tickets */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gray-800 rounded-2xl p-6 border border-blue-500/30 relative overflow-hidden bg-gradient-to-br from-gray-800 to-blue-900/20"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 100 4v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2a2 2 0 100-4V6z" /></svg>
                    </div>
                    <h3 className="text-blue-400 text-sm font-medium uppercase tracking-wider">Your Tickets</h3>
                    <div className="mt-4 flex items-baseline space-x-2">
                        <span className="text-5xl font-extrabold text-white tracking-tight">
                            {data?.userTickets || 0}
                        </span>
                        <span className="text-lg text-gray-400">entries</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-400">
                        Current probability: {data?.totalTickets && data?.userTickets ? ((data.userTickets / data.totalTickets) * 100).toFixed(2) : 0}%
                    </p>
                </motion.div>

                {/* Prize Pool */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gray-800 rounded-2xl p-6 border border-purple-500/30 relative overflow-hidden bg-gradient-to-br from-gray-800 to-purple-900/20"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 9a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zm7-9a-1 1 0 00-1 1v2H9a1 1 0 000 2h2v2a1 1 0 102 0V6h2a1 1 0 100-2h-2V3a1 1 0 00-1-1zm-1 9a1 1 0 011 1v2h2a1 1 0 110 2h-2v2a1 1 0 11-2 0v-2H9a1 1 0 110-2h2v-2a1 1 0 011-1z" clipRule="evenodd" /></svg>
                    </div>
                    <h3 className="text-purple-400 text-sm font-medium uppercase tracking-wider">Estimate Prize Pool</h3>
                    <div className="mt-4 space-y-1">
                        {data?.poolItems.map((item) => (
                            <div key={item.id} className="flex items-center space-x-2 text-white">
                                <span className="text-xl font-bold">{item.amount}</span>
                                <span className="text-gray-300 capitalize">{item.reward_type}s</span>
                            </div>
                        ))}
                        {(!data?.poolItems || data.poolItems.length === 0) && (
                            <div className="text-gray-400">Pool is accumulating...</div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Main Content Area */}
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-lg p-6 text-white mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Ticket size={120} />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-purple-500/30 px-3 py-1 rounded-full text-sm font-medium border border-purple-400/20">
                                {data?.activeCycle ? `${data.activeCycle.cycle_type.toUpperCase()} DRAW` : 'NO ACTIVE DRAW'}
                            </span>
                            {data?.isRollover && (
                                <span className="bg-yellow-500/30 px-3 py-1 rounded-full text-sm font-medium border border-yellow-400/20 text-yellow-300">
                                    ROLLOVER JACKPOT
                                </span>
                            )}
                        </div>
                        <h2 className="text-4xl font-bold mb-1">
                            {data?.activeCycle
                                ? new Date(data.activeCycle.end_at).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
                                : 'Coming Soon'}
                        </h2>
                        <p className="text-purple-200">Next draw date</p>
                    </div>

                    <div className="text-center md:text-right">
                        <p className="text-purple-200 text-sm uppercase tracking-wider mb-1">Estimated Jackpot</p>
                        <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-lg">
                            {data?.currentJackpot ? `$${data.currentJackpot.toLocaleString()}` : 'Calculating...'}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                            <Ticket className="w-5 h-5" />
                        </div>
                        <h3 className="font-semibold text-gray-900">Your Tickets</h3>
                    </div>
                    <div className="mb-2">
                        <span className="text-3xl font-bold text-gray-900">{data?.userTickets || 0}</span>
                        <span className="text-gray-500 ml-2">entries</span>
                    </div>
                    {data?.ticketNumbers && data.ticketNumbers.length > 0 && (
                        <div className="mt-4">
                            <p className="text-xs text-gray-500 mb-2 uppercase">Your Numbers</p>
                            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                                {data.ticketNumbers.map(num => (
                                    <span key={num} className="bg-indigo-50 text-indigo-700 text-xs px-2 py-1 rounded border border-indigo-100 font-mono">
                                        #{num.toString().padStart(6, '0')}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                    <p className="text-sm text-gray-500 mt-2">More tickets = higher chance!</p>
                </div>
                {/* Ways to Earn */}
                <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                    <h3 className="text-lg font-bold text-white mb-4">Ways to Earn Tickets</h3>
                    <ul className="space-y-4">
                        <li className="flex items-center p-3 bg-gray-700/50 rounded-xl">
                            <div className="bg-blue-500/20 p-2 rounded-lg mr-4">
                                <span className="text-xl">💧</span>
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-white">Complete Drops</h4>
                                <p className="text-sm text-gray-400">Earn 1 ticket for every completed drop</p>
                            </div>
                            <Link to="/earn" className="text-blue-400 text-sm font-medium hover:text-blue-300">Go</Link>
                        </li>
                        <li className="flex items-center p-3 bg-gray-700/50 rounded-xl">
                            <div className="bg-pink-500/20 p-2 rounded-lg mr-4">
                                <span className="text-xl">❤️</span>
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-white">Social Engagement</h4>
                                <p className="text-sm text-gray-400">Likes and comments earn tickets</p>
                            </div>
                            <Link to="/feed" className="text-blue-400 text-sm font-medium hover:text-blue-300">Feed</Link>
                        </li>
                    </ul>
                </div>

                {/* Recent Activity / Winners (Placeholder for now) */}
                <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                    <h3 className="text-lg font-bold text-white mb-4">Last Draw Winners</h3>
                    <div className="text-center py-8 text-gray-500">
                        First draw coming soon! Be the first to win.
                    </div>
                </div>
            </div>
        </div>
    );
}

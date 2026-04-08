/**
 * Last Night Page
 * 
 * Shows yesterday's finalized outcomes.
 * This turns activity into memory.
 * 
 * Contents:
 * - District that locked
 * - Winning House + scores
 * - User's participation summary
 * - Draw winners
 */

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Clock, Users, Gem, Ticket, ChevronRight, ArrowLeft, Moon, Loader2, AlertCircle } from 'lucide-react';
import api from '@/react-app/lib/api';

interface HouseScore {
    houseId: string;
    houseName: string;
    score: number;
    color: string;
    icon: string;
}

interface DrawWinner {
    tier: string;
    prize: string;
    winner: string;
}

interface LastNightData {
    date: string;
    hasOutcome: boolean;
    demo: boolean;
    district: {
        id: string;
        name: string;
    };
    winner: {
        houseId: string;
        houseName: string;
        houseColor: string;
        houseIcon: string;
    };
    houseScores: HouseScore[];
    stats: {
        participants: number;
        activationsCompleted: number;
        verified_creditsDistributed: number;
    };
    drawWinners: DrawWinner[];
    userParticipation: {
        didParticipate: boolean;
        activationsCompleted: number;
        verified_creditsEarned: number;
        houseRank?: number;
    };
    historyLine: string;
}

export default function LastNight() {
    const navigate = useNavigate();
    const [data, setData] = useState<LastNightData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLastNight = async () => {
            try {
                setLoading(true);
                const response = await api.get<LastNightData>('/last-night');
                setData(response as LastNightData);
            } catch (err) {
                console.error('[LastNight] Error:', err);
                setError(err instanceof Error ? err.message : 'Failed to load');
            } finally {
                setLoading(false);
            }
        };

        fetchLastNight();
    }, []);

    // Format date nicely
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });
    };

    // Get ordinal suffix
    const getOrdinal = (n: number) => {
        const s = ['th', 'st', 'nd', 'rd'];
        const v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 text-purple-400 animate-spin mx-auto mb-4" />
                    <p className="text-zinc-400">Loading last night's results...</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center max-w-md">
                    <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-4" />
                    <p className="text-red-300 mb-4">{error || 'No data available'}</p>
                    <button
                        onClick={() => navigate('/today')}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Today
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950">
            {/* Ambient gradients */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 via-transparent to-zinc-950" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-purple-500/5 blur-[150px] rounded-full" />
            </div>

            <div className="relative max-w-2xl mx-auto px-4 py-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate('/today')}
                        className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm">Today</span>
                    </button>
                    <div className="flex items-center gap-2 text-zinc-500">
                        <Moon className="w-4 h-4" />
                        <span className="text-xs uppercase tracking-widest">Last Night</span>
                    </div>
                </div>

                {/* Date & District */}
                <motion.div
                    className="text-center"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <p className="text-sm text-zinc-500 mb-1">{formatDate(data.date)}</p>
                    <h1 className="text-2xl font-bold text-white">{data.district.name}</h1>
                    {data.demo && (
                        <span className="inline-block mt-2 px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded">
                            Demo Data
                        </span>
                    )}
                </motion.div>

                {/* Winner Announcement */}
                <motion.div
                    className="bg-zinc-900/30 backdrop-blur-sm rounded-2xl p-6 text-center"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    <div
                        className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center text-4xl mb-4"
                        style={{ backgroundColor: `${data.winner.houseColor}20` }}
                    >
                        {data.winner.houseIcon}
                    </div>
                    <Trophy className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                    <p className="text-sm text-zinc-400 mb-1">Victory goes to</p>
                    <h2
                        className="text-2xl font-bold mb-2"
                        style={{ color: data.winner.houseColor }}
                    >
                        {data.winner.houseName}
                    </h2>
                    <p className="text-sm text-zinc-500">{data.historyLine}</p>
                </motion.div>

                {/* Final Standings */}
                <motion.div
                    className="bg-zinc-900/30 backdrop-blur-sm rounded-2xl p-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4 px-1">
                        Final Standings
                    </h3>
                    <div className="space-y-2">
                        {data.houseScores.map((house, index) => (
                            <div
                                key={house.houseId}
                                className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-xl"
                            >
                                <div className="flex items-center gap-3">
                                    <span className={`
                                        w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm
                                        ${index === 0 ? 'bg-amber-500/20 text-amber-400' :
                                            index === 1 ? 'bg-zinc-400/20 text-zinc-300' :
                                                index === 2 ? 'bg-amber-700/20 text-amber-600' :
                                                    'bg-zinc-700/50 text-zinc-500'}
                                    `}>
                                        {index + 1}
                                    </span>
                                    <span className="text-lg">{house.icon}</span>
                                    <span
                                        className="font-medium"
                                        style={{ color: house.color }}
                                    >
                                        {house.houseName}
                                    </span>
                                </div>
                                <span className="font-bold text-white">
                                    {house.score.toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Your Participation */}
                <motion.div
                    className={`rounded-2xl p-5 ${data.userParticipation.didParticipate
                            ? 'bg-emerald-500/10 ring-1 ring-emerald-500/20'
                            : 'bg-zinc-900/30'
                        }`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4 px-1">
                        Your Participation
                    </h3>

                    {data.userParticipation.didParticipate ? (
                        <div className="grid grid-cols-3 gap-3">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white">
                                    {data.userParticipation.activationsCompleted}
                                </div>
                                <div className="text-xs text-zinc-500">activations</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-amber-400">
                                    {data.userParticipation.verified_creditsEarned}
                                </div>
                                <div className="text-xs text-zinc-500">Verified Credits</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white">
                                    {data.userParticipation.houseRank
                                        ? getOrdinal(data.userParticipation.houseRank)
                                        : '—'
                                    }
                                </div>
                                <div className="text-xs text-zinc-500">place</div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-4">
                            <p className="text-zinc-500">You didn't participate yesterday</p>
                            <p className="text-sm text-zinc-600 mt-1">
                                Show up today to be part of history
                            </p>
                        </div>
                    )}
                </motion.div>

                {/* Draw Winners */}
                {data.drawWinners.length > 0 && (
                    <motion.div
                        className="bg-zinc-900/30 backdrop-blur-sm rounded-2xl p-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4 px-1 flex items-center gap-2">
                            <Ticket className="w-4 h-4" />
                            Draw Winners
                        </h3>
                        <div className="space-y-2">
                            {data.drawWinners.map((winner, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-xl"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className={`
                                            text-xs font-bold px-2 py-0.5 rounded
                                            ${winner.tier === 'grand' ? 'bg-amber-500/20 text-amber-400' :
                                                winner.tier === 'major' ? 'bg-purple-500/20 text-purple-400' :
                                                    'bg-zinc-600/50 text-zinc-400'}
                                        `}>
                                            {winner.tier.toUpperCase()}
                                        </span>
                                        <span className="text-white">{winner.winner}</span>
                                    </div>
                                    <span className="text-amber-400 font-medium">{winner.prize}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* District Stats */}
                <motion.div
                    className="grid grid-cols-3 gap-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <div className="bg-zinc-900/30 rounded-xl p-4 text-center">
                        <Users className="w-5 h-5 text-zinc-500 mx-auto mb-2" />
                        <div className="text-lg font-bold text-white">
                            {data.stats.participants}
                        </div>
                        <div className="text-xs text-zinc-500">participants</div>
                    </div>
                    <div className="bg-zinc-900/30 rounded-xl p-4 text-center">
                        <Clock className="w-5 h-5 text-zinc-500 mx-auto mb-2" />
                        <div className="text-lg font-bold text-white">
                            {data.stats.activationsCompleted}
                        </div>
                        <div className="text-xs text-zinc-500">activations</div>
                    </div>
                    <div className="bg-zinc-900/30 rounded-xl p-4 text-center">
                        <Gem className="w-5 h-5 text-zinc-500 mx-auto mb-2" />
                        <div className="text-lg font-bold text-amber-400">
                            {data.stats.verified_creditsDistributed}
                        </div>
                        <div className="text-xs text-zinc-500">Verified Credits</div>
                    </div>
                </motion.div>

                {/* CTA to Today */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    <Link
                        to="/today"
                        className="block w-full py-4 px-6 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold text-center rounded-xl hover:from-amber-400 hover:to-orange-400 transition-all"
                    >
                        Today's War is Live →
                    </Link>
                </motion.div>

                {/* Footer */}
                <div className="text-center pt-4 pb-8">
                    <p className="text-xs text-zinc-600">
                        History is written by those who show up.
                    </p>
                </div>
            </div>
        </div>
    );
}

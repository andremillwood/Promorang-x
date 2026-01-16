/**
 * TodayDraw - Premium Daily Draw Card
 * 
 * Shows:
 * - Animated ticket progress with visual dots
 * - Prize pool preview with icons
 * - Auto-entered status
 * - Celebration state for winners
 */

import { useEffect, useState } from 'react';
import { Ticket, Gift, Trophy, Key, Zap, Award, PartyPopper, Sparkles, Info, X, Clock } from 'lucide-react';
import { getStateBasedCopy, type UserState } from '@/react-app/lib/userState';
import DrawWinnerModal from './DrawWinnerModal';

interface DrawPrize {
    tier: string;
    type: string;
    amount: number;
    description: string;
}

// Prize type icons
const PRIZE_ICONS: Record<string, React.ReactNode> = {
    keys: <Key className="w-3.5 h-3.5" />,
    boost: <Zap className="w-3.5 h-3.5" />,
    badge: <Award className="w-3.5 h-3.5" />,
    access: <Gift className="w-3.5 h-3.5" />,
};

interface DrawResult {
    won: boolean;
    prize_type?: string;
    prize_amount?: number;
}

interface TodayDrawProps {
    tickets: number;
    autoEntered: boolean;
    prizes: DrawPrize[];
    status: string;
    result: DrawResult | null;
    userState: number; // MaturityState (0-3)
}

// ... (icons omitted)

export default function TodayDraw({ tickets, autoEntered, prizes, status, result, userState }: TodayDrawProps) {
    const [showInfo, setShowInfo] = useState(false);
    const [showWinnerModal, setShowWinnerModal] = useState(() => result?.won === true);
    const [timeLeft, setTimeLeft] = useState('');
    const maxTickets = 3;
    const ticketProgress = Math.min(tickets / maxTickets, 1);
    const stateCopy = getStateBasedCopy(userState as UserState);

    // Calculate time until 10:00 UTC
    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const resetTime = new Date();
            resetTime.setUTCHours(10, 0, 0, 0);

            if (now > resetTime) {
                resetTime.setUTCDate(resetTime.getUTCDate() + 1);
            }

            const diff = resetTime.getTime() - now.getTime();
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Winner celebration state
    if (result?.won) {
        return (
            <>
                {/* Winner Modal with Confetti */}
                <DrawWinnerModal
                    isOpen={showWinnerModal}
                    onClose={() => setShowWinnerModal(false)}
                    prize={{
                        type: (result.prize_type as 'keys' | 'boost' | 'badge' | 'gems') || 'keys',
                        amount: result.prize_amount || 0,
                    }}
                    drawDate={new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />

                {/* Static Winner Card (always visible after modal closes) */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-500/30 via-amber-500/20 to-orange-500/10 backdrop-blur-xl border border-yellow-500/30 p-6">
                    {/* Celebration effects */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.2),transparent_50%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(249,115,22,0.15),transparent_50%)]" />

                    {/* Animated sparkles */}
                    <div className="absolute top-4 left-8 animate-pulse">
                        <Sparkles className="w-4 h-4 text-yellow-400/60" />
                    </div>
                    <div className="absolute bottom-8 right-12 animate-pulse delay-150">
                        <Sparkles className="w-3 h-3 text-amber-400/60" />
                    </div>

                    {/* Header */}
                    <div className="relative flex items-center gap-3 mb-4">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-lg shadow-yellow-500/30">
                            <PartyPopper className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-bold text-yellow-400 uppercase tracking-wider">
                            🎉 You Won!
                        </span>
                        <button
                            onClick={() => setShowWinnerModal(true)}
                            className="ml-auto text-xs text-yellow-300/70 hover:text-yellow-300 transition-colors"
                        >
                            View Again
                        </button>
                    </div>

                    {/* Prize Display */}
                    <div className="relative text-center py-4">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl text-white mb-4 shadow-xl shadow-yellow-500/40">
                            <Trophy className="w-10 h-10" />
                        </div>
                        <div className="text-3xl font-black text-white mb-1">
                            {result.prize_amount} {result.prize_type === 'keys' ? 'PromoKeys' : result.prize_type}
                        </div>
                        <p className="text-sm text-yellow-300/80">
                            Added to your wallet!
                        </p>
                    </div>
                </div>
            </>
        );
    }

    // Closed/drawn state
    if (status === 'drawn' || status === 'closed') {
        return (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-white/10 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-xl bg-gray-700/50 text-gray-400">
                        <Ticket className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-white/40">
                        {stateCopy.draw}
                    </span>
                </div>
                <div className="text-center py-4">
                    <p className="text-white/50">
                        {status === 'drawn' ? "Today's draw has ended. Come back tomorrow!" : 'Draw is closed.'}
                    </p>
                </div>
            </div>
        );
    }

    // Active draw
    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600/30 via-purple-600/20 to-fuchsia-600/10 backdrop-blur-xl border border-white/10 p-6 shadow-lg shadow-purple-500/10">
            {/* Ambient glow */}
            <div className="absolute -right-12 -top-12 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
            <div className="absolute -left-8 -bottom-8 w-24 h-24 bg-fuchsia-500/10 rounded-full blur-2xl" />

            {/* Header */}
            <div className="relative flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 text-white shadow-lg shadow-purple-500/30">
                        <Ticket className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-white/60 block">
                            {stateCopy.draw}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-purple-300/60 font-bold">
                            <Clock className="w-3 h-3" />
                            {timeLeft || 'Calculating...'}
                        </div>
                    </div>
                </div>
                {autoEntered && (
                    <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/20 px-3 py-1.5 rounded-full border border-emerald-500/30">
                        ✓ Auto-Entered
                    </span>
                )}
            </div>

            {/* Ticket Count & Progress - Clickable */}
            <div
                className="relative mb-5 cursor-pointer group"
                onClick={() => setShowInfo(!showInfo)}
            >
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-white/80 flex items-center gap-2">
                        🎟️ {tickets} {tickets === 1 ? 'ticket' : 'tickets'}
                        <Info className="w-3.5 h-3.5 text-white/30 group-hover:text-white/60 transition-colors" />
                    </span>
                    <span className="text-xs text-white/40">
                        {tickets}/{maxTickets}
                    </span>
                </div>

                {/* Progress bar */}
                <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-4">
                    <div
                        className="progress-fill h-full bg-gradient-to-r from-violet-400 via-purple-500 to-fuchsia-500 rounded-full"
                        style={{ width: `${ticketProgress * 100}%` }}
                    />
                </div>

                {/* Ticket dots */}
                <div className="flex justify-center gap-3">
                    {[...Array(maxTickets)].map((_, i) => (
                        <div
                            key={i}
                            className={`relative w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 ${i < tickets
                                ? 'bg-gradient-to-br from-violet-400 to-purple-500 text-white shadow-lg shadow-purple-500/30 scale-110'
                                : 'bg-white/10 text-white/30 border border-white/10'
                                }`}
                        >
                            <Ticket className="w-4 h-4" />
                            {i < tickets && (
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-gray-900" />
                            )}
                        </div>
                    ))}
                </div>

                {/* Info Overlay */}
                {showInfo && (
                    <div className="absolute inset-x-0 -top-2 bg-gray-900/95 backdrop-blur-md rounded-xl p-4 border border-white/10 shadow-2xl z-10 animate-in fade-in zoom-in duration-200">
                        <button
                            className="absolute top-2 right-2 p-1 text-white/40 hover:text-white"
                            onClick={(e) => { e.stopPropagation(); setShowInfo(false); }}
                        >
                            <X className="w-4 h-4" />
                        </button>
                        <h4 className="text-xs font-bold text-white mb-2 uppercase tracking-wider">How to earn tickets</h4>
                        <ul className="space-y-2">
                            <li className="text-xs text-white/70 flex items-start gap-2">
                                <span className="w-4 h-4 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-[10px] font-bold mt-0.5">1</span>
                                <span>Complete today's main headline action</span>
                            </li>
                            <li className="text-xs text-white/70 flex items-start gap-2">
                                <span className="w-4 h-4 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-[10px] font-bold mt-0.5">2</span>
                                <span>Reach target point milestones in the Feed</span>
                            </li>
                            <li className="text-xs text-white/70 flex items-start gap-2">
                                <span className="w-4 h-4 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-[10px] font-bold mt-0.5">3</span>
                                <span>Share content or verify promo proofs</span>
                            </li>
                        </ul>
                        <p className="text-[10px] text-emerald-400 mt-3 font-medium">
                            1+ ticket = Auto-entry into tonight's draw!
                        </p>
                    </div>
                )}
            </div>

            {/* Prize Preview */}
            <div className="relative bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-xs text-white/40 font-semibold uppercase tracking-wide mb-3">
                    Tonight's Prizes
                </p>
                <div className="flex flex-wrap gap-2">
                    {prizes.length > 0 ? (
                        prizes.slice(0, 4).map((prize, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center gap-1.5 text-xs bg-white/10 text-white/70 px-3 py-1.5 rounded-lg border border-white/10"
                            >
                                {PRIZE_ICONS[prize.type] || <Gift className="w-3.5 h-3.5" />}
                                {prize.description}
                            </span>
                        ))
                    ) : (
                        <span className="text-xs text-white/40">Keys, boosts, badges & more</span>
                    )}
                </div>
            </div>

            {/* Entry message */}
            {!autoEntered && tickets === 0 && (
                <p className="relative text-xs text-purple-300/60 text-center mt-4 italic">
                    {userState === 0 ? "Earn your first ticket to enter today's draw!" : "Complete one action to auto-enter the draw"}
                </p>
            )}
        </div>
    );
}

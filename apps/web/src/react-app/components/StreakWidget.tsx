import { useState, useEffect } from 'react';
import { Flame, Gift, Calendar, Trophy, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiFetch } from '../utils/api';

interface StreakStatus {
    current_streak: number;
    longest_streak: number;
    checked_in_today: boolean;
    next_reward: number;
    total_streak_gems: number;
}

interface CheckInResult {
    success: boolean;
    streak: number;
    reward: number;
    is_milestone: boolean;
    message: string;
    already_checked_in?: boolean;
}

export default function StreakWidget() {
    const [status, setStatus] = useState<StreakStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [checkingIn, setCheckingIn] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [result, setResult] = useState<CheckInResult | null>(null);

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            const response = await apiFetch('/api/streaks/status');
            const data = await response.json();
            if (data.status === 'success') {
                setStatus(data.data);
            }
        } catch (error) {
            console.error('Error fetching streak status:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async () => {
        setCheckingIn(true);
        try {
            const response = await apiFetch('/api/streaks/checkin', {
                method: 'POST',
            });
            const data = await response.json();

            if (data.status === 'success') {
                setResult(data.data);
                if (data.data.success && !data.data.already_checked_in) {
                    setShowConfetti(true);
                    setTimeout(() => setShowConfetti(false), 3000);
                    // Refresh status
                    fetchStatus();
                }
            }
        } catch (error) {
            console.error('Error checking in:', error);
        } finally {
            setCheckingIn(false);
        }
    };

    if (loading) {
        return (
            <Card className="p-6 bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 animate-pulse">
                <div className="h-20 bg-orange-100 rounded-lg" />
            </Card>
        );
    }

    if (!status) return null;

    const streakLevel = status.current_streak >= 30 ? 'legendary' :
        status.current_streak >= 14 ? 'epic' :
            status.current_streak >= 7 ? 'rare' : 'common';

    const levelColors = {
        common: 'from-orange-400 to-amber-500',
        rare: 'from-blue-500 to-cyan-500',
        epic: 'from-purple-500 to-pink-500',
        legendary: 'from-yellow-400 via-orange-500 to-red-500',
    };

    return (
        <Card className="relative overflow-hidden p-6 bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 shadow-lg">
            {/* Confetti overlay */}
            {showConfetti && (
                <div className="absolute inset-0 pointer-events-none z-10">
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute animate-bounce"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 0.5}s`,
                                animationDuration: `${0.5 + Math.random() * 0.5}s`,
                            }}
                        >
                            {['🔥', '⭐', '💎', '✨'][Math.floor(Math.random() * 4)]}
                        </div>
                    ))}
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${levelColors[streakLevel]} shadow-lg`}>
                        <Flame className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-black text-orange-900 text-lg">Daily Streak</h3>
                        <p className="text-xs text-orange-600 font-medium">Keep the fire burning!</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-3xl font-black text-orange-600">{status.current_streak}</p>
                    <p className="text-[10px] font-bold text-orange-400 uppercase">Days</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-white/60 rounded-xl p-3 border border-orange-100">
                    <Trophy className="w-4 h-4 text-amber-500 mb-1" />
                    <p className="text-lg font-black text-orange-900">{status.longest_streak}</p>
                    <p className="text-[10px] font-bold text-orange-400 uppercase">Best Streak</p>
                </div>
                <div className="bg-white/60 rounded-xl p-3 border border-orange-100">
                    <Gift className="w-4 h-4 text-emerald-500 mb-1" />
                    <p className="text-lg font-black text-orange-900">{status.next_reward}</p>
                    <p className="text-[10px] font-bold text-orange-400 uppercase">Next Reward</p>
                </div>
                <div className="bg-white/60 rounded-xl p-3 border border-orange-100">
                    <Zap className="w-4 h-4 text-blue-500 mb-1" />
                    <p className="text-lg font-black text-orange-900">{status.total_streak_gems}</p>
                    <p className="text-[10px] font-bold text-orange-400 uppercase">Total Gems</p>
                </div>
            </div>

            {/* Result Message */}
            {result && (
                <div className={`mb-4 p-3 rounded-xl text-center font-bold text-sm ${result.success && !result.already_checked_in
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                    {result.message}
                </div>
            )}

            {/* Check-in Button */}
            <Button
                onClick={handleCheckIn}
                disabled={checkingIn || status.checked_in_today}
                className={`w-full h-12 font-black text-base shadow-lg transition-all duration-300 ${status.checked_in_today
                        ? 'bg-green-500 hover:bg-green-500 cursor-default'
                        : `bg-gradient-to-r ${levelColors[streakLevel]} hover:scale-[1.02] hover:shadow-xl`
                    }`}
            >
                {checkingIn ? (
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Checking in...
                    </div>
                ) : status.checked_in_today ? (
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        ✓ Checked in today!
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <Flame className="w-5 h-5" />
                        Claim Daily Bonus ({status.next_reward} 💎)
                    </div>
                )}
            </Button>

            {/* Streak Calendar Preview */}
            <div className="mt-4 flex justify-center gap-1">
                {[...Array(7)].map((_, i) => {
                    const daysFilled = Math.min(status.current_streak, 7);
                    const isFilled = i < daysFilled;
                    return (
                        <div
                            key={i}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${isFilled
                                    ? `bg-gradient-to-br ${levelColors[streakLevel]} text-white shadow-md`
                                    : 'bg-white border-2 border-dashed border-orange-200 text-orange-300'
                                }`}
                        >
                            {i + 1}
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}

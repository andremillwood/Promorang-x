import { useState, useEffect } from 'react';
import { CheckCircle2, Gift, Clock, Target, Flame, Trophy } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiFetch } from '../utils/api';

interface Quest {
    key: string;
    name: string;
    description: string;
    type: 'daily' | 'weekly';
    target: number;
    reward: number;
    icon: string;
    id?: string;
    current: number;
    completed: boolean;
    claimed?: boolean;
}

interface QuestsData {
    daily: Quest[];
    weekly: Quest[];
}

export default function QuestsWidget() {
    const [quests, setQuests] = useState<QuestsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [claimingId, setClaimingId] = useState<string | null>(null);
    const [tab, setTab] = useState<'daily' | 'weekly'>('daily');

    useEffect(() => {
        fetchQuests();
    }, []);

    const fetchQuests = async () => {
        try {
            const response = await apiFetch('/api/quests/active');
            const data = await response.json();
            if (data.status === 'success') {
                setQuests(data.data);
            }
        } catch (error) {
            console.error('Error fetching quests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClaim = async (questId: string) => {
        setClaimingId(questId);
        try {
            const response = await apiFetch(`/api/quests/${questId}/claim`, {
                method: 'POST',
            });
            const data = await response.json();
            if (data.status === 'success') {
                // Mark quest as claimed locally
                setQuests(prev => {
                    if (!prev) return prev;
                    return {
                        daily: prev.daily.map(q => q.id === questId ? { ...q, claimed: true } : q),
                        weekly: prev.weekly.map(q => q.id === questId ? { ...q, claimed: true } : q),
                    };
                });
            }
        } catch (error) {
            console.error('Error claiming quest:', error);
        } finally {
            setClaimingId(null);
        }
    };

    if (loading) {
        return (
            <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 animate-pulse">
                <div className="h-40 bg-indigo-100 rounded-lg" />
            </Card>
        );
    }

    if (!quests) return null;

    const activeQuests = tab === 'daily' ? quests.daily : quests.weekly;
    const completedCount = activeQuests.filter(q => q.completed).length;
    const totalCount = activeQuests.length;

    return (
        <Card className="overflow-hidden bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 shadow-lg">
            {/* Header */}
            <div className="p-4 border-b border-indigo-100">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                            <Target className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-black text-indigo-900 text-lg">Quests</h3>
                            <p className="text-xs text-indigo-600">{completedCount}/{totalCount} completed</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setTab('daily')}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-all ${tab === 'daily'
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'bg-white/50 text-indigo-600 hover:bg-white'
                            }`}
                    >
                        <Flame className="w-4 h-4 inline mr-1" />
                        Daily
                    </button>
                    <button
                        onClick={() => setTab('weekly')}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-all ${tab === 'weekly'
                                ? 'bg-purple-600 text-white shadow-md'
                                : 'bg-white/50 text-purple-600 hover:bg-white'
                            }`}
                    >
                        <Trophy className="w-4 h-4 inline mr-1" />
                        Weekly
                    </button>
                </div>
            </div>

            {/* Quest List */}
            <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
                {activeQuests.map((quest) => {
                    const progress = Math.min(100, (quest.current / quest.target) * 100);
                    const canClaim = quest.completed && !quest.claimed && quest.id;

                    return (
                        <div
                            key={quest.key}
                            className={`p-3 rounded-xl border transition-all ${quest.claimed
                                    ? 'bg-green-50 border-green-200 opacity-60'
                                    : quest.completed
                                        ? 'bg-amber-50 border-amber-300 shadow-md'
                                        : 'bg-white/70 border-indigo-100'
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <div className="text-2xl">{quest.icon}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className={`font-bold text-sm ${quest.claimed ? 'text-green-700' : 'text-indigo-900'}`}>
                                            {quest.name}
                                        </p>
                                        <div className="flex items-center gap-1 text-sm font-black text-amber-600">
                                            <Gift className="w-3.5 h-3.5" />
                                            {quest.reward}
                                        </div>
                                    </div>
                                    <p className="text-xs text-indigo-500 mb-2">{quest.description}</p>

                                    {/* Progress bar */}
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-2 bg-indigo-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-500 ${quest.claimed
                                                        ? 'bg-green-500'
                                                        : quest.completed
                                                            ? 'bg-amber-500'
                                                            : 'bg-indigo-500'
                                                    }`}
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-bold text-indigo-600 w-12 text-right">
                                            {quest.current}/{quest.target}
                                        </span>
                                    </div>
                                </div>

                                {/* Claim button */}
                                {canClaim && (
                                    <Button
                                        onClick={() => handleClaim(quest.id!)}
                                        disabled={claimingId === quest.id}
                                        size="sm"
                                        className="bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-lg animate-pulse"
                                    >
                                        {claimingId === quest.id ? '...' : 'Claim!'}
                                    </Button>
                                )}
                                {quest.claimed && (
                                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="p-3 bg-indigo-100/50 border-t border-indigo-100 flex items-center justify-center gap-2 text-xs text-indigo-600">
                <Clock className="w-3.5 h-3.5" />
                {tab === 'daily' ? 'Resets at midnight' : 'Resets on Sunday'}
            </div>
        </Card>
    );
}

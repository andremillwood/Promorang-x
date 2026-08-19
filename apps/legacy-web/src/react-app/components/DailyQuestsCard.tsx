/**
 * DailyQuestsCard Component
 * 
 * Renders the daily quest streak widget for users.
 * Provides system-generated daily earning tasks (Verification, Trend Clipping, Engagement)
 * independent of 3rd-party merchant activations.
 */

import { useState } from 'react';
import { Flame, CheckCircle2, Circle, Trophy, Sparkles, ArrowRight, ShieldCheck, Video, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface QuestItem {
    id: string;
    title: string;
    description: string;
    rewardGems: number;
    iconType: 'verify' | 'clip' | 'share';
    isCompleted: boolean;
}

export default function DailyQuestsCard() {
    const { toast } = useToast();

    const [streakDays, setStreakDays] = useState(4);
    const [quests, setQuests] = useState<QuestItem[]>([
        {
            id: 'q1',
            title: 'Verify 3 Clip Proofs',
            description: 'Help moderate community clip submissions',
            rewardGems: 50,
            iconType: 'verify',
            isCompleted: true,
        },
        {
            id: 'q2',
            title: 'Clip Trending Media Moment',
            description: 'Post a 30s micro-clip from today’s trending podcast',
            rewardGems: 150,
            iconType: 'clip',
            isCompleted: false,
        },
        {
            id: 'q3',
            title: 'Amplify a Community Moment',
            description: 'React or share 1 community drop activation',
            rewardGems: 50,
            iconType: 'share',
            isCompleted: false,
        },
    ]);

    const completedCount = quests.filter(q => q.isCompleted).length;
    const progressPct = Math.round((completedCount / quests.length) * 100);

    const handleCompleteQuest = (id: string) => {
        setQuests(prev =>
            prev.map(q => {
                if (q.id === id && !q.isCompleted) {
                    toast({
                        title: 'Quest Completed! 🎉',
                        description: `+${q.rewardGems} Gems added to your balance.`,
                    });
                    return { ...q, isCompleted: true };
                }
                return q;
            })
        );
    };

    const renderQuestIcon = (type: QuestItem['iconType']) => {
        switch (type) {
            case 'verify':
                return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
            case 'clip':
                return <Video className="w-4 h-4 text-purple-400" />;
            case 'share':
                return <Share2 className="w-4 h-4 text-sky-400" />;
        }
    };

    return (
        <div className="bg-gradient-to-br from-pr-dark-card to-pr-dark-bg border border-pr-border-subtle rounded-2xl p-5 shadow-xl text-white">
            {/* Header: Streak & Progress */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
                        <Flame className="w-5 h-5 fill-amber-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-base text-white flex items-center gap-1.5">
                            Daily Navigator Quests
                        </h3>
                        <p className="text-xs text-pr-text-muted">Resetting in 14h 32m</p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-full">
                    <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="font-bold text-xs text-amber-300">{streakDays} Day Streak!</span>
                </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="mb-4 bg-pr-dark-bg/80 p-3 rounded-xl border border-pr-border-subtle/50">
                <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="text-pr-text-secondary font-medium">Daily Progress</span>
                    <span className="font-bold text-amber-400">{completedCount}/{quests.length} Completed</span>
                </div>
                <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div
                        className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                    />
                </div>
            </div>

            {/* Quests List */}
            <div className="space-y-2.5">
                {quests.map(quest => (
                    <div
                        key={quest.id}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                            quest.isCompleted
                                ? 'bg-emerald-500/5 border-emerald-500/30 text-pr-text-muted'
                                : 'bg-pr-dark-bg/60 border-pr-border-subtle/40 hover:border-pr-border-subtle text-white'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => handleCompleteQuest(quest.id)}
                                disabled={quest.isCompleted}
                                className="focus:outline-none"
                            >
                                {quest.isCompleted ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
                                ) : (
                                    <Circle className="w-5 h-5 text-pr-text-muted hover:text-white transition-colors" />
                                )}
                            </button>

                            <div>
                                <div className="flex items-center gap-2">
                                    {renderQuestIcon(quest.iconType)}
                                    <span className={`text-sm font-semibold ${quest.isCompleted ? 'line-through text-pr-text-muted' : 'text-white'}`}>
                                        {quest.title}
                                    </span>
                                </div>
                                <p className="text-xs text-pr-text-muted">{quest.description}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                                +{quest.rewardGems} Gems
                            </span>
                            {!quest.isCompleted && (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleCompleteQuest(quest.id)}
                                    className="h-8 text-xs hover:bg-pr-dark-card text-pr-text-secondary hover:text-white px-2"
                                >
                                    Start <ArrowRight className="w-3.5 h-3.5 ml-1" />
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Streak Bonus Claim */}
            {completedCount === quests.length && (
                <div className="mt-4 p-3 bg-gradient-to-r from-amber-500/20 to-purple-500/20 border border-amber-500/40 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-amber-400" />
                        <span className="text-xs font-bold text-amber-200">Daily Quest Bonus Unlocked!</span>
                    </div>
                    <span className="text-xs font-extrabold text-amber-300">💎 +200 Gem Bonus</span>
                </div>
            )}
        </div>
    );
}

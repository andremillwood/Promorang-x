import { useState, useEffect } from 'react';
import {
    CheckCircle2,
    Circle,
    Rocket,
    ChevronRight,
    Gift,
    Target
} from 'lucide-react';
import { apiFetch } from '../utils/api';

interface Goal {
    id: string;
    title: string;
    description: string;
    completed: boolean;
    reward: string;
    action: string;
}

export default function NewUserProgress() {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        try {
            // Mocking progress for now, would be backed by a service
            const mockGoals: Goal[] = [
                { id: 'profile', title: 'Complete Profile', description: 'Add a bio and avatar', completed: true, reward: '10 Gems', action: '/profile' },
                { id: 'interest', title: 'Pick Interests', description: 'Select at least 3 categories', completed: true, reward: '5 Gems', action: '/onboarding' },
                { id: 'drop', title: 'First Application', description: 'Apply for your first drop', completed: false, reward: '20 Gems', action: '/marketplace' },
                { id: 'share', title: 'First Share', description: 'Share content from the feed', completed: false, reward: '15 Gems', action: '/dashboard' },
                { id: 'streak', title: '3-Day Streak', description: 'Login 3 days in a row', completed: false, reward: '50 Gems', action: '/dashboard' },
            ];

            setGoals(mockGoals);

            // Only show if not all completed
            if (mockGoals.some(g => !g.completed)) {
                setIsVisible(true);
            }
        } catch (error) {
            console.error('Error fetching goals:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isVisible || goals.length === 0) return null;

    const completedCount = goals.filter(g => g.completed).length;
    const progressPercent = (completedCount / goals.length) * 100;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-pr-surface-3 shadow-sm overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-indigo-600 to-violet-700 p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-xl">
                            <Rocket className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Your First Week</h3>
                            <p className="text-indigo-100 text-sm">Complete these goals to unlock bonus rewards!</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-black">{Math.round(progressPercent)}%</div>
                        <div className="text-indigo-200 text-[10px] uppercase font-bold">Progress</div>
                    </div>
                </div>

                <div className="w-full bg-white/20 rounded-full h-3 backdrop-blur-sm">
                    <div
                        className="h-full bg-white rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>

            <div className="p-2">
                {goals.map((goal) => (
                    <div
                        key={goal.id}
                        className="group flex items-center justify-between p-4 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-colors cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-800"
                        onClick={() => window.location.href = goal.action}
                    >
                        <div className="flex items-center gap-4">
                            {goal.completed ? (
                                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors">
                                    <Circle className="w-6 h-6" />
                                </div>
                            )}

                            <div>
                                <h4 className={`font-bold text-sm ${goal.completed ? 'text-slate-400 line-through' : 'text-slate-900 dark:text-slate-100'}`}>
                                    {goal.title}
                                </h4>
                                <p className="text-xs text-slate-500">{goal.description}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-lg text-[10px] font-black uppercase">
                                <Gift className="w-3 h-3" />
                                {goal.reward}
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors" />
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/30 border-t border-pr-surface-3">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Target className="w-4 h-4" />
                    <span>New User Challenge • 7 Days Remaining</span>
                </div>
            </div>
        </div>
    );
}

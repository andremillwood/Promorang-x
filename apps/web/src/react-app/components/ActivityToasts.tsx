import { useState, useEffect } from 'react';
import { ShoppingBag, Users, Zap, Trophy, X } from 'lucide-react';
import { apiFetch } from '../utils/api';

interface Activity {
    id: string;
    type: 'purchase' | 'referral' | 'quest' | 'streak';
    user_name: string;
    amount?: number;
    quest_key?: string;
    streak_days?: number;
    time: string;
}

export default function ActivityToasts() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [currentToast, setCurrentToast] = useState<Activity | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        fetchActivity();
        const interval = setInterval(fetchActivity, 60000); // Fresh batch every minute
        return () => clearInterval(interval);
    }, []);

    const fetchActivity = async () => {
        try {
            const response = await apiFetch('/api/activity/recent');
            const data = await response.json();
            if (data.status === 'success') {
                setActivities(data.data.activity);
            }
        } catch (error) {
            console.error('Error fetching activity:', error);
        }
    };

    useEffect(() => {
        if (activities.length > 0 && !currentToast) {
            showNextToast();
        }
    }, [activities, currentToast]);

    const showNextToast = () => {
        if (activities.length === 0) return;

        // Pick a random activity
        const next = activities[Math.floor(Math.random() * activities.length)];
        setCurrentToast(next);
        setIsVisible(true);

        // Hide after 5 seconds
        setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => {
                setCurrentToast(null);
            }, 500); // Wait for fade-out animation
        }, 5000);
    };

    if (!currentToast) return null;

    const content = {
        purchase: {
            icon: <ShoppingBag className="w-4 h-4 text-emerald-500" />,
            text: `purchased for $${currentToast.amount}`,
            bgColor: 'bg-emerald-50',
            borderColor: 'border-emerald-200',
        },
        referral: {
            icon: <Users className="w-4 h-4 text-blue-500" />,
            text: `just referred a new friend!`,
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
        },
        quest: {
            icon: <Trophy className="w-4 h-4 text-amber-500" />,
            text: `completed a ${currentToast.quest_key?.replace('_', ' ')} quest!`,
            bgColor: 'bg-amber-50',
            borderColor: 'border-amber-200',
        },
        streak: {
            icon: <Zap className="w-4 h-4 text-orange-500" />,
            text: `is on a ${currentToast.streak_days} day streak!`,
            bgColor: 'bg-orange-50',
            borderColor: 'border-orange-200',
        },
    }[currentToast.type];

    return (
        <div
            className={`fixed bottom-24 left-4 md:bottom-8 md:left-8 z-50 transition-all duration-500 transform ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
                }`}
        >
            <div className={`flex items-center gap-3 p-4 pr-6 rounded-2xl border shadow-xl bg-white ${content.borderColor}`}>
                <div className={`p-2 rounded-full ${content.bgColor}`}>
                    {content.icon}
                </div>
                <div>
                    <p className="text-sm font-bold text-slate-900 leading-tight">
                        {currentToast.user_name}
                    </p>
                    <p className="text-xs text-slate-500 leading-tight">
                        {content.text}
                    </p>
                </div>
                <button
                    onClick={() => setIsVisible(false)}
                    className="ml-2 text-slate-300 hover:text-slate-500 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

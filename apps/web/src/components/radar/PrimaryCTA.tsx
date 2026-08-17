import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Target, Gift, Key, Gem, Users, Instagram, User, Search, RefreshCw, Trophy, ChevronRight, Sparkles } from 'lucide-react';

interface NextAction {
    action: string;
    message: string;
    cta: string;
    route: string;
    icon: string;
    color: string;
    progress?: {
        current: number;
        target: number;
    };
}

interface NextActionResponse {
    success: boolean;
    primary: NextAction;
    secondary: NextAction[];
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    target: Target,
    gift: Gift,
    key: Key,
    gem: Gem,
    users: Users,
    instagram: Instagram,
    user: User,
    search: Search,
    refresh: RefreshCw,
    trophy: Trophy,
};

const colorMap: Record<string, string> = {
    purple: 'from-purple-600 to-indigo-600',
    green: 'from-green-500 to-emerald-500',
    yellow: 'from-yellow-500 to-amber-500',
    blue: 'from-blue-500 to-cyan-500',
    pink: 'from-pink-500 to-rose-500',
    gray: 'from-gray-500 to-slate-500',
};

interface PrimaryCTAProps {
    className?: string;
    compact?: boolean;
}

export default function PrimaryCTA({ className = '', compact = false }: PrimaryCTAProps) {
    const [nextAction, setNextAction] = useState<NextActionResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchNextAction();
    }, []);

    const fetchNextAction = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/users/next-action', {
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setNextAction(data);
                }
            }
        } catch (err) {
            console.error('Error fetching next action:', err);
            setError('Failed to load recommendation');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className={`animate-pulse bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl p-6 ${className}`}>
                <div className="h-6 bg-purple-200 rounded w-3/4 mb-3"></div>
                <div className="h-10 bg-purple-200 rounded w-1/3"></div>
            </div>
        );
    }

    if (error || !nextAction?.primary) {
        return null; // Don't show anything if there's an error
    }

    const { primary, secondary } = nextAction;
    const IconComponent = iconMap[primary.icon] || Sparkles;
    const gradientClass = colorMap[primary.color] || colorMap.purple;

    if (compact) {
        return (
            <Link
                to={primary.route}
                className={`block bg-gradient-to-r ${gradientClass} rounded-lg p-4 text-white hover:shadow-lg transition-all duration-200 ${className}`}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <IconComponent className="w-5 h-5" />
                        <span className="font-medium text-sm">{primary.message}</span>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                </div>
            </Link>
        );
    }

    return (
        <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
            {/* Primary Action */}
            <div className={`bg-gradient-to-r ${gradientClass} p-6 text-white`}>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                            <IconComponent className="w-6 h-6" />
                            <span className="text-xs font-medium uppercase tracking-wide opacity-90">
                                Recommended Next Step
                            </span>
                        </div>
                        <h3 className="text-xl font-bold mb-3">{primary.message}</h3>

                        {/* Progress bar if available */}
                        {primary.progress && (
                            <div className="mb-4">
                                <div className="flex justify-between text-sm mb-1 opacity-90">
                                    <span>{primary.progress.current} / {primary.progress.target}</span>
                                    <span>{Math.round((primary.progress.current / primary.progress.target) * 100)}%</span>
                                </div>
                                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-white rounded-full transition-all duration-500"
                                        style={{ width: `${(primary.progress.current / primary.progress.target) * 100}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        <Link
                            to={primary.route}
                            className="inline-flex items-center space-x-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-5 py-2.5 rounded-lg font-semibold transition-all duration-200"
                        >
                            <span>{primary.cta}</span>
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Secondary Actions */}
            {secondary && secondary.length > 0 && (
                <div className="p-4 bg-gray-50 border-t">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                        Also Available
                    </p>
                    <div className="space-y-2">
                        {secondary.map((action, index) => {
                            const SecondaryIcon = iconMap[action.icon] || Sparkles;
                            return (
                                <Link
                                    key={index}
                                    to={action.route}
                                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 transition-colors group"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${colorMap[action.color] || colorMap.gray} flex items-center justify-center`}>
                                            <SecondaryIcon className="w-4 h-4 text-white" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">{action.message}</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

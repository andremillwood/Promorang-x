import { useState, useEffect, useCallback } from 'react';
import { Users, Crown, ChevronRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface GuildMember {
    user_id: string;
    username: string;
    display_name: string;
    profile_image: string;
    role?: string;
    level?: number;
    status?: string;
}

interface GuildStats {
    upline: GuildMember[];
    downline: GuildMember[];
    guild_level: number;
    total_commission_earned: number;
}

interface GuildTreeProps {
    userId: string;
    apiBase?: string;
}

export default function GuildTree({ userId, apiBase = '' }: GuildTreeProps) {
    const [guildStats, setGuildStats] = useState<GuildStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchGuildStats = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`${apiBase}/api/referrals/guild/${userId}`);
            const result = await response.json();
            if (result.status === 'success') {
                setGuildStats(result.data);
            } else {
                setError(result.message || 'Failed to load Guild data');
            }
        } catch (err) {
            console.error('Failed to fetch guild stats:', err);
            setError('Failed to load Guild data');
        } finally {
            setLoading(false);
        }
    }, [userId, apiBase]);

    useEffect(() => {
        if (userId) {
            void fetchGuildStats();
        }
    }, [userId, fetchGuildStats]);

    if (loading) {
        return (
            <div className="bg-pr-surface-card rounded-xl p-6 border border-pr-surface-3 animate-pulse">
                <div className="h-6 bg-pr-surface-2 rounded w-1/3 mb-4"></div>
                <div className="space-y-3">
                    <div className="h-12 bg-pr-surface-2 rounded"></div>
                    <div className="h-12 bg-pr-surface-2 rounded"></div>
                </div>
            </div>
        );
    }

    if (error || !guildStats) {
        return (
            <div className="bg-pr-surface-card rounded-xl p-6 border border-pr-surface-3 text-center">
                <Users className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <p className="text-pr-text-2 text-sm">{error || 'No Guild data available'}</p>
            </div>
        );
    }

    const { upline, downline, guild_level, total_commission_earned } = guildStats;

    return (
        <div className="bg-pr-surface-card rounded-xl border border-pr-surface-3 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-4 border-b border-pr-surface-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Crown className="w-5 h-5 text-amber-500" />
                        <h3 className="font-semibold text-pr-text-1">Your Guild</h3>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-pr-text-2">Commission Earned</p>
                        <p className="font-bold text-amber-600">${total_commission_earned.toFixed(2)}</p>
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-4">
                {/* Upline Section */}
                {upline.length > 0 && (
                    <div>
                        <p className="text-xs font-medium text-pr-text-2 uppercase tracking-wider mb-2">
                            Your Upline ({upline.length} level{upline.length > 1 ? 's' : ''})
                        </p>
                        <div className="space-y-2">
                            {upline.map((member, index) => (
                                <Link
                                    key={member.user_id}
                                    to={`/profile/${member.username}`}
                                    className="flex items-center justify-between p-3 bg-pr-surface-1 rounded-lg hover:bg-pr-surface-2 transition-colors group"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="relative">
                                            <img
                                                src={member.profile_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.user_id}`}
                                                alt={member.display_name}
                                                className="w-10 h-10 rounded-full border-2 border-amber-400"
                                            />
                                            <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                                L{member.level}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-pr-text-1">{member.display_name || member.username}</p>
                                            <p className="text-xs text-amber-600">{member.role}</p>
                                        </div>
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Downline Section */}
                <div>
                    <p className="text-xs font-medium text-pr-text-2 uppercase tracking-wider mb-2">
                        Your Recruits ({downline.length})
                    </p>
                    {downline.length === 0 ? (
                        <div className="text-center py-6 bg-pr-surface-1 rounded-lg">
                            <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-pr-text-2">No recruits yet</p>
                            <p className="text-xs text-pr-text-3">Share your referral code to grow your Guild!</p>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-[200px] overflow-y-auto">
                            {downline.map((member) => (
                                <Link
                                    key={member.user_id}
                                    to={`/profile/${member.username}`}
                                    className="flex items-center justify-between p-3 bg-pr-surface-1 rounded-lg hover:bg-pr-surface-2 transition-colors group"
                                >
                                    <div className="flex items-center space-x-3">
                                        <img
                                            src={member.profile_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.user_id}`}
                                            alt={member.display_name}
                                            className="w-10 h-10 rounded-full"
                                        />
                                        <div>
                                            <p className="font-medium text-pr-text-1">{member.display_name || member.username}</p>
                                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${member.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {member.status === 'active' ? 'Active' : 'Pending'}
                                            </span>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

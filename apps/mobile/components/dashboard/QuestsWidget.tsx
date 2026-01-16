import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Target, Gift, Flame, Trophy, Clock, CheckCircle2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import colors from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { useThemeColors } from '@/hooks/useThemeColors';

const API_URL = 'https://promorang-api.vercel.app';

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

export const QuestsWidget = () => {
    const theme = useThemeColors();
    const { token } = useAuthStore();
    const [quests, setQuests] = useState<QuestsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [claimingId, setClaimingId] = useState<string | null>(null);
    const [tab, setTab] = useState<'daily' | 'weekly'>('daily');

    useEffect(() => {
        fetchQuests();
    }, []);

    const fetchQuests = async () => {
        try {
            const response = await fetch(`${API_URL}/api/quests/active`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            if (response.ok) {
                const data = await response.json();
                if (data.status === 'success') {
                    setQuests(data.data);
                }
            }
        } catch (error) {
            console.error('Error fetching quests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClaim = async (questId: string) => {
        if (!token || claimingId) return;

        setClaimingId(questId);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        try {
            const response = await fetch(`${API_URL}/api/quests/${questId}/claim`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            if (data.status === 'success') {
                // Refresh local state
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
            <View style={[styles.loadingContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <ActivityIndicator color={colors.primary} />
                <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading Quests...</Text>
            </View>
        );
    }

    if (!quests) return null;

    const activeQuests = tab === 'daily' ? quests.daily : quests.weekly;
    const completedCount = activeQuests.filter(q => q.completed).length;
    const totalCount = activeQuests.length;

    return (
        <View style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTitleRow}>
                    <LinearGradient
                        colors={['#6366F1', '#8B5CF6']}
                        style={styles.headerIcon}
                    >
                        <Target size={20} color="white" />
                    </LinearGradient>
                    <View>
                        <Text style={[styles.title, { color: theme.text }]}>Quests</Text>
                        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{completedCount}/{totalCount} completed</Text>
                    </View>
                </View>

                {/* Tabs */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        onPress={() => setTab('daily')}
                        style={[
                            styles.tab,
                            tab === 'daily' ? [styles.tabActive, { backgroundColor: '#6366F1' }] : { backgroundColor: theme.background }
                        ]}
                    >
                        <Flame size={14} color={tab === 'daily' ? 'white' : '#6366F1'} />
                        <Text style={[styles.tabText, tab === 'daily' ? { color: 'white' } : { color: '#6366F1' }]}>Daily</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setTab('weekly')}
                        style={[
                            styles.tab,
                            tab === 'weekly' ? [styles.tabActive, { backgroundColor: '#8B5CF6' }] : { backgroundColor: theme.background }
                        ]}
                    >
                        <Trophy size={14} color={tab === 'weekly' ? 'white' : '#8B5CF6'} />
                        <Text style={[styles.tabText, tab === 'weekly' ? { color: 'white' } : { color: '#8B5CF6' }]}>Weekly</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Quest List */}
            <View style={styles.questList}>
                {activeQuests.map((quest) => {
                    const progress = Math.min(1, quest.current / quest.target);
                    const canClaim = quest.completed && !quest.claimed;

                    return (
                        <View
                            key={quest.key}
                            style={[
                                styles.questItem,
                                { backgroundColor: theme.background, borderColor: theme.border },
                                quest.claimed && { opacity: 0.6, borderColor: '#10B98133' },
                                canClaim && { borderColor: '#F59E0B' }
                            ]}
                        >
                            <View style={styles.questTop}>
                                <Text style={styles.questIcon}>{quest.icon}</Text>
                                <View style={styles.questInfo}>
                                    <View style={styles.questNameRow}>
                                        <Text style={[styles.questName, { color: theme.text }]}>{quest.name}</Text>
                                        <View style={styles.rewardBadge}>
                                            <Gift size={12} color="#F59E0B" />
                                            <Text style={styles.rewardText}>{quest.reward}</Text>
                                        </View>
                                    </View>
                                    <Text style={[styles.questDesc, { color: theme.textSecondary }]} numberOfLines={1}>{quest.description}</Text>
                                </View>
                            </View>

                            {/* Progress bar */}
                            <View style={styles.progressRow}>
                                <View style={styles.progressBarBg}>
                                    <View
                                        style={[
                                            styles.progressBarFill,
                                            { width: `${progress * 100}%` },
                                            quest.claimed ? { backgroundColor: '#10B981' } : { backgroundColor: tab === 'daily' ? '#6366F1' : '#8B5CF6' }
                                        ]}
                                    />
                                </View>
                                <Text style={[styles.progressText, { color: theme.textSecondary }]}>
                                    {quest.current}/{quest.target}
                                </Text>
                            </View>

                            {/* Actions */}
                            {canClaim && (
                                <TouchableOpacity
                                    onPress={() => handleClaim(quest.id!)}
                                    disabled={claimingId === quest.id}
                                    style={styles.claimButton}
                                >
                                    {claimingId === quest.id ? (
                                        <ActivityIndicator size="small" color="white" />
                                    ) : (
                                        <Text style={styles.claimButtonText}>Claim!</Text>
                                    )}
                                </TouchableOpacity>
                            )}
                            {quest.claimed && (
                                <View style={styles.claimedBadge}>
                                    <CheckCircle2 size={16} color="#10B981" />
                                    <Text style={styles.claimedText}>Claimed</Text>
                                </View>
                            )}
                        </View>
                    );
                })}
            </View>

            {/* Footer */}
            <View style={[styles.footer, { borderTopColor: theme.border }]}>
                <Clock size={12} color={theme.textSecondary} />
                <Text style={[styles.footerText, { color: theme.textSecondary }]}>
                    {tab === 'daily' ? 'Resets at midnight' : 'Resets on Sunday'}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        padding: 40,
        borderRadius: 16,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        fontWeight: '600',
    },
    container: {
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 16,
        overflow: 'hidden',
    },
    header: {
        padding: 16,
    },
    headerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerIcon: {
        padding: 10,
        borderRadius: 12,
        marginRight: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: '900',
    },
    subtitle: {
        fontSize: 12,
        fontWeight: '500',
    },
    tabContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 10,
        gap: 6,
    },
    tabActive: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '800',
    },
    questList: {
        padding: 16,
        paddingTop: 0,
        gap: 12,
    },
    questItem: {
        padding: 12,
        borderRadius: 14,
        borderWidth: 1,
    },
    questTop: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    questIcon: {
        fontSize: 24,
    },
    questInfo: {
        flex: 1,
    },
    questNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 2,
    },
    questName: {
        fontSize: 15,
        fontWeight: '800',
    },
    rewardBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
        gap: 4,
    },
    rewardText: {
        fontSize: 12,
        fontWeight: '900',
        color: '#B45309',
    },
    questDesc: {
        fontSize: 12,
        fontWeight: '500',
    },
    progressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    progressBarBg: {
        flex: 1,
        height: 8,
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    progressText: {
        fontSize: 11,
        fontWeight: '700',
        width: 35,
        textAlign: 'right',
    },
    claimButton: {
        marginTop: 12,
        backgroundColor: '#F59E0B',
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    claimButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '900',
    },
    claimedBadge: {
        marginTop: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    claimedText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#10B981',
    },
    footer: {
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        borderTopWidth: 1,
    },
    footerText: {
        fontSize: 11,
        fontWeight: '600',
    },
});

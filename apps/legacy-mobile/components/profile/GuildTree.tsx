import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Users, ChevronRight, Crown, UserPlus, UserCheck } from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { api } from '@/lib/api';
import { useRouter } from 'expo-router';

interface GuildMember {
    id: string;
    username: string;
    display_name?: string;
    profile_image?: string;
    level?: number;
    role: 'referrer' | 'upline' | 'guild_master' | 'recruit';
    status?: 'active' | 'pending';
    commission_earned?: number;
}

interface GuildData {
    upline: GuildMember[];
    downline: GuildMember[];
    total_commission: number;
}

interface GuildTreeProps {
    userId: string;
}

export const GuildTree: React.FC<GuildTreeProps> = ({ userId }) => {
    const theme = useThemeColors();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [guildData, setGuildData] = useState<GuildData | null>(null);

    useEffect(() => {
        fetchGuildData();
    }, [userId]);

    const fetchGuildData = async () => {
        try {
            setLoading(true);
            const data = await api.get<any>(`/api/referrals/guild/${userId}`);
            setGuildData(data.data || null);
        } catch (error) {
            console.error('[GuildTree] Error fetching:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <ActivityIndicator size="small" color={theme.textSecondary} />
            </View>
        );
    }

    if (!guildData) {
        return (
            <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                    No Guild data available
                </Text>
            </View>
        );
    }

    const { upline, downline, total_commission } = guildData;
    const activeRecruits = downline.filter(m => m.status === 'active').length;
    const pendingRecruits = downline.filter(m => m.status === 'pending').length;

    return (
        <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View style={[styles.iconCircle, { backgroundColor: '#8B5CF620' }]}>
                        <Users size={18} color="#8B5CF6" />
                    </View>
                    <View>
                        <Text style={[styles.title, { color: theme.text }]}>Your Guild Network</Text>
                        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                            {downline.length} recruit{downline.length !== 1 ? 's' : ''} • {total_commission.toFixed(2)} treasures earned
                        </Text>
                    </View>
                </View>
                <TouchableOpacity onPress={() => router.push('/referrals' as any)}>
                    <ChevronRight size={20} color={theme.textSecondary} />
                </TouchableOpacity>
            </View>

            {/* Upline Section */}
            {upline.length > 0 && (
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>YOUR UPLINE</Text>
                    {upline.map((member, index) => (
                        <View key={member.id} style={[styles.memberRow, { borderColor: theme.border }]}>
                            <View style={[styles.memberIcon, { backgroundColor: index === 0 ? '#F59E0B20' : '#6366F120' }]}>
                                {index === 0 ? (
                                    <Crown size={14} color={index === 0 ? '#F59E0B' : '#6366F1'} />
                                ) : (
                                    <Users size={14} color="#6366F1" />
                                )}
                            </View>
                            <View style={styles.memberInfo}>
                                <Text style={[styles.memberName, { color: theme.text }]}>
                                    {member.display_name || member.username}
                                </Text>
                                <Text style={[styles.memberRole, { color: theme.textSecondary }]}>
                                    {member.role === 'guild_master' ? 'Guild Master' : member.role === 'upline' ? 'Upline' : 'Referrer'}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>
            )}

            {/* Downline Section */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>YOUR RECRUITS</Text>
                <View style={styles.statsRow}>
                    <View style={[styles.statBox, { backgroundColor: '#10B98110' }]}>
                        <UserCheck size={16} color="#10B981" />
                        <Text style={[styles.statValue, { color: '#10B981' }]}>{activeRecruits}</Text>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Active</Text>
                    </View>
                    <View style={[styles.statBox, { backgroundColor: '#F59E0B10' }]}>
                        <UserPlus size={16} color="#F59E0B" />
                        <Text style={[styles.statValue, { color: '#F59E0B' }]}>{pendingRecruits}</Text>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Pending</Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 18,
        borderWidth: 1,
        padding: 18,
        marginBottom: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconCircle: {
        width: 38,
        height: 38,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 15,
        fontWeight: '700',
    },
    subtitle: {
        fontSize: 12,
        marginTop: 2,
    },
    section: {
        marginTop: 12,
    },
    sectionTitle: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1.5,
        marginBottom: 10,
    },
    memberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        gap: 12,
    },
    memberIcon: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    memberInfo: {
        flex: 1,
    },
    memberName: {
        fontSize: 14,
        fontWeight: '600',
    },
    memberRole: {
        fontSize: 11,
        marginTop: 2,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    statBox: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        gap: 8,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '800',
    },
    statLabel: {
        fontSize: 11,
    },
    emptyText: {
        textAlign: 'center',
        fontSize: 14,
        paddingVertical: 20,
    },
});

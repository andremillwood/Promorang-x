/**
 * Operator Dashboard (React Native)
 * 
 * Basic stats and controls dashboard for platform operators.
 * P2 feature for mobile parity.
 */

import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    Users,
    Activity,
    TrendingUp,
    DollarSign,
    ArrowLeft,
    AlertCircle,
    CheckCircle,
    Clock,
    Settings,
} from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAuthStore } from '@/store/authStore';
import { Card } from '@/components/ui/Card';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';

interface OperatorStats {
    totalUsers: number;
    activeToday: number;
    pendingReviews: number;
    pendingWithdrawals: number;
    totalGemsCirculating: number;
    revenue7d: number;
}

export default function OperatorDashboardScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const theme = useThemeColors();
    const { user } = useAuthStore();

    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState<OperatorStats | null>(null);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        // Simulated stats - in production these would come from the API
        setTimeout(() => {
            setStats({
                totalUsers: 12847,
                activeToday: 1234,
                pendingReviews: 47,
                pendingWithdrawals: 12,
                totalGemsCirculating: 458920,
                revenue7d: 15420,
            });
            setIsLoading(false);
        }, 500);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadStats();
        setRefreshing(false);
    };

    if (isLoading) {
        return <LoadingIndicator fullScreen text="Loading operator stats..." />;
    }

    const QUICK_ACTIONS = [
        {
            id: 'reviews',
            title: 'Pending Reviews',
            count: stats?.pendingReviews || 0,
            icon: Clock,
            color: '#F59E0B',
            route: '/admin/proofs',
        },
        {
            id: 'withdrawals',
            title: 'Withdrawals',
            count: stats?.pendingWithdrawals || 0,
            icon: DollarSign,
            color: '#10B981',
            route: '/admin/withdrawals',
        },
    ];

    return (
        <>
            <Stack.Screen
                options={{
                    headerShown: false,
                }}
            />

            <ScrollView
                style={[styles.container, { backgroundColor: theme.background }]}
                contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Header */}
                <LinearGradient
                    colors={['#6366F1', '#4F46E5']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.header, { paddingTop: insets.top + 16 }]}
                >
                    <View style={styles.headerTop}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => router.back()}
                        >
                            <ArrowLeft size={24} color="#FFF" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.settingsButton}>
                            <Settings size={20} color="#FFF" />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.headerTitle}>Operator Dashboard</Text>
                    <Text style={styles.headerSubtitle}>Platform overview and controls</Text>
                </LinearGradient>

                <View style={styles.content}>
                    {/* KPI Grid */}
                    <View style={styles.kpiGrid}>
                        <Card style={styles.kpiCard}>
                            <View style={[styles.kpiIcon, { backgroundColor: '#3B82F620' }]}>
                                <Users size={20} color="#3B82F6" />
                            </View>
                            <Text style={[styles.kpiValue, { color: theme.text }]}>
                                {stats?.totalUsers.toLocaleString()}
                            </Text>
                            <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>Total Users</Text>
                        </Card>

                        <Card style={styles.kpiCard}>
                            <View style={[styles.kpiIcon, { backgroundColor: '#10B98120' }]}>
                                <Activity size={20} color="#10B981" />
                            </View>
                            <Text style={[styles.kpiValue, { color: theme.text }]}>
                                {stats?.activeToday.toLocaleString()}
                            </Text>
                            <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>Active Today</Text>
                        </Card>

                        <Card style={styles.kpiCard}>
                            <View style={[styles.kpiIcon, { backgroundColor: '#8B5CF620' }]}>
                                <TrendingUp size={20} color="#8B5CF6" />
                            </View>
                            <Text style={[styles.kpiValue, { color: theme.text }]}>
                                {stats?.totalGemsCirculating.toLocaleString()}
                            </Text>
                            <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>Gems Circulating</Text>
                        </Card>

                        <Card style={styles.kpiCard}>
                            <View style={[styles.kpiIcon, { backgroundColor: '#F59E0B20' }]}>
                                <DollarSign size={20} color="#F59E0B" />
                            </View>
                            <Text style={[styles.kpiValue, { color: theme.text }]}>
                                ${stats?.revenue7d.toLocaleString()}
                            </Text>
                            <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>7-Day Revenue</Text>
                        </Card>
                    </View>

                    {/* Quick Actions */}
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Actions</Text>

                    {QUICK_ACTIONS.map((action) => {
                        const Icon = action.icon;
                        return (
                            <TouchableOpacity
                                key={action.id}
                                style={[styles.actionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                                onPress={() => router.push(action.route as any)}
                            >
                                <View style={styles.actionLeft}>
                                    <View style={[styles.actionIcon, { backgroundColor: `${action.color}20` }]}>
                                        <Icon size={20} color={action.color} />
                                    </View>
                                    <Text style={[styles.actionTitle, { color: theme.text }]}>{action.title}</Text>
                                </View>
                                <View style={[styles.countBadge, { backgroundColor: action.count > 0 ? '#EF444420' : '#10B98120' }]}>
                                    <Text style={[styles.countText, { color: action.count > 0 ? '#EF4444' : '#10B981' }]}>
                                        {action.count}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}

                    {/* Status Section */}
                    <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 24 }]}>
                        System Status
                    </Text>

                    <Card style={[styles.statusCard, { borderColor: theme.border }]}>
                        <View style={styles.statusRow}>
                            <CheckCircle size={20} color="#10B981" />
                            <Text style={[styles.statusText, { color: theme.text }]}>API: Healthy</Text>
                        </View>
                        <View style={styles.statusRow}>
                            <CheckCircle size={20} color="#10B981" />
                            <Text style={[styles.statusText, { color: theme.text }]}>Database: Healthy</Text>
                        </View>
                        <View style={styles.statusRow}>
                            <CheckCircle size={20} color="#10B981" />
                            <Text style={[styles.statusText, { color: theme.text }]}>Payments: Active</Text>
                        </View>
                    </Card>

                    {/* Info Note */}
                    <View style={[styles.infoNote, { backgroundColor: '#3B82F610', borderColor: '#3B82F630' }]}>
                        <AlertCircle size={16} color="#3B82F6" />
                        <Text style={[styles.infoText, { color: '#3B82F6' }]}>
                            For full admin controls, use the web dashboard at promorang.io/admin
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingBottom: 32,
        paddingHorizontal: 24,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    settingsButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFF',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
    },
    content: {
        padding: 24,
        marginTop: -20,
    },
    kpiGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    kpiCard: {
        width: '47%',
        padding: 16,
        borderRadius: 16,
    },
    kpiIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    kpiValue: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 4,
    },
    kpiLabel: {
        fontSize: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 16,
    },
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 14,
        borderWidth: 1,
        marginBottom: 12,
    },
    actionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    actionIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionTitle: {
        fontSize: 15,
        fontWeight: '600',
    },
    countBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    countText: {
        fontSize: 14,
        fontWeight: '700',
    },
    statusCard: {
        padding: 16,
        borderRadius: 14,
        borderWidth: 1,
        gap: 12,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    statusText: {
        fontSize: 14,
    },
    infoNote: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        marginTop: 20,
    },
    infoText: {
        fontSize: 12,
        flex: 1,
    },
});

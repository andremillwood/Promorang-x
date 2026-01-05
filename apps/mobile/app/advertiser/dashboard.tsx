import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useAdvertiserStore, AdvertiserDrop } from '@/store/advertiserStore';
import { Card } from '@/components/ui/Card';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { Users, BarChart2, MousePointer2, Wallet, Plus, ArrowRight } from 'lucide-react-native';
import colors from '@/constants/colors';

export default function AdvertiserDashboardScreen() {
    const { drops, isLoading, fetchDashboard } = useAdvertiserStore();
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchDashboard();
        setRefreshing(false);
    };

    if (isLoading && !refreshing && drops.length === 0) {
        return <LoadingIndicator fullScreen text="Loading dashboard..." />;
    }

    // Calculate high-level KPIs
    const totalSpend = drops.reduce((sum: number, d: AdvertiserDrop) => sum + (d.total_spend || 0), 0);
    const totalApps = drops.reduce((sum: number, d: AdvertiserDrop) => sum + (d.total_applications || 0), 0);
    const avgCTR = 4.2;

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>Brand Dashboard</Text>
                    <Text style={styles.subtitle}>Overview of your marketing performance</Text>
                </View>

                <View style={styles.kpiGrid}>
                    <Card style={styles.kpiCard}>
                        <View style={[styles.kpiIcon, { backgroundColor: '#DBEAFE' }]}>
                            <Users size={20} color="#2563EB" />
                        </View>
                        <Text style={styles.kpiLabel}>Total Reach</Text>
                        <Text style={styles.kpiValue}>{(totalApps * 450).toLocaleString()}</Text>
                    </Card>

                    <Card style={styles.kpiCard}>
                        <View style={[styles.kpiIcon, { backgroundColor: '#FEF3C7' }]}>
                            <MousePointer2 size={20} color="#D97706" />
                        </View>
                        <Text style={styles.kpiLabel}>Avg CTR</Text>
                        <Text style={styles.kpiValue}>{avgCTR}%</Text>
                    </Card>

                    <Card style={styles.kpiCard}>
                        <View style={[styles.kpiIcon, { backgroundColor: '#DCFCE7' }]}>
                            <BarChart2 size={20} color="#16A34A" />
                        </View>
                        <Text style={styles.kpiLabel}>Converters</Text>
                        <Text style={styles.kpiValue}>{totalApps.toLocaleString()}</Text>
                    </Card>

                    <Card style={styles.kpiCard}>
                        <View style={[styles.kpiIcon, { backgroundColor: '#F3E8FF' }]}>
                            <Wallet size={20} color="#9333EA" />
                        </View>
                        <Text style={styles.kpiLabel}>Spend</Text>
                        <Text style={styles.kpiValue}>${totalSpend.toLocaleString()}</Text>
                    </Card>
                </View>

                <TouchableOpacity style={styles.createButton}>
                    <Plus size={20} color={colors.white} />
                    <Text style={styles.createButtonText}>Create New Drop</Text>
                </TouchableOpacity>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Active Drops</Text>
                    <TouchableOpacity>
                        <Text style={styles.seeAll}>See All</Text>
                    </TouchableOpacity>
                </View>

                {drops.map((drop: AdvertiserDrop) => (
                    <Card key={drop.id} style={styles.dropCard}>
                        <View style={styles.dropMain}>
                            <View>
                                <Text style={styles.dropTitle}>{drop.title}</Text>
                                <Text style={styles.dropMeta}>
                                    {drop.drop_type === 'proof_drop' ? 'Proof Drop' : 'Paid Drop'} • Created {new Date(drop.created_at).toLocaleDateString()}
                                </Text>
                            </View>
                            <View style={[styles.statusBadge, { backgroundColor: drop.status === 'active' ? '#DCFCE7' : '#F3F4F6' }]}>
                                <Text style={[styles.statusText, { color: drop.status === 'active' ? '#16A34A' : colors.darkGray }]}>
                                    {drop.status.toUpperCase()}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.dropStats}>
                            <View style={styles.dropStat}>
                                <Text style={styles.statLabel}>Participants</Text>
                                <Text style={styles.statValue}>{drop.total_applications}</Text>
                            </View>
                            <View style={styles.dropStat}>
                                <Text style={styles.statLabel}>Spend</Text>
                                <Text style={styles.statValue}>${drop.total_spend}</Text>
                            </View>
                            <ArrowRight size={16} color={colors.darkGray} />
                        </View>
                    </Card>
                ))}

                {drops.length === 0 && (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No active drops found.</Text>
                    </View>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.gray,
    },
    content: {
        padding: 20,
    },
    header: {
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: colors.black,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: colors.darkGray,
    },
    kpiGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    kpiCard: {
        width: '48%',
        padding: 16,
        marginBottom: 16,
        alignItems: 'center',
    },
    kpiIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    kpiLabel: {
        fontSize: 12,
        color: colors.darkGray,
        marginBottom: 4,
    },
    kpiValue: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.black,
    },
    createButton: {
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 8,
        marginBottom: 32,
    },
    createButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.black,
    },
    seeAll: {
        fontSize: 14,
        color: colors.primary,
        fontWeight: '600',
    },
    dropCard: {
        padding: 16,
        marginBottom: 12,
    },
    dropMain: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    dropTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.black,
        marginBottom: 4,
    },
    dropMeta: {
        fontSize: 12,
        color: colors.darkGray,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
    },
    dropStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: colors.lightGray,
        paddingTop: 12,
    },
    dropStat: {
        flex: 1,
    },
    statLabel: {
        fontSize: 10,
        color: colors.darkGray,
        marginBottom: 2,
    },
    statValue: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.black,
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: colors.darkGray,
        fontSize: 16,
    }
});

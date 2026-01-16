import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAdvertiserStore, Campaign } from '@/store/advertiserStore';
import { Card } from '@/components/ui/Card';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import {
    Plus,
    ArrowLeft,
    BarChart2,
    Calendar,
    Users,
    DollarSign,
    Target,
    ChevronRight,
    Megaphone,
    TrendingUp,
    Pause,
    Play
} from 'lucide-react-native';
import colors from '@/constants/colors';

export default function CampaignsListScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { campaigns, isLoadingCampaigns, fetchCampaigns, setSelectedCampaign } = useAdvertiserStore();
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchCampaigns();
        setRefreshing(false);
    }, []);

    const handleCampaignPress = (campaign: Campaign) => {
        setSelectedCampaign(campaign);
        router.push(`/advertiser/campaigns/${campaign.id}` as any);
    };

    const handleCreateCampaign = () => {
        router.push('/advertiser/campaigns/new' as any);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('en-US').format(num);
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'active':
                return { bg: '#DCFCE7', text: '#16A34A' };
            case 'paused':
                return { bg: '#FEF3C7', text: '#D97706' };
            case 'completed':
                return { bg: '#F3F4F6', text: '#6B7280' };
            case 'draft':
            default:
                return { bg: '#DBEAFE', text: '#2563EB' };
        }
    };

    const calculateCTR = (campaign: Campaign) => {
        if (!campaign.performance?.impressions || campaign.performance.impressions === 0) return 0;
        return ((campaign.performance.clicks || 0) / campaign.performance.impressions * 100).toFixed(1);
    };

    // Calculate summary stats
    const totalBudget = campaigns.reduce((sum, c) => sum + c.total_budget, 0);
    const totalSpent = campaigns.reduce((sum, c) => sum + c.budget_spent, 0);
    const activeCampaigns = campaigns.filter(c => c.status === 'active').length;

    if (isLoadingCampaigns && campaigns.length === 0) {
        return <LoadingIndicator fullScreen text="Loading campaigns..." />;
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#1F2937" />
                </TouchableOpacity>
                <View style={styles.headerTitle}>
                    <Text style={styles.title}>Campaigns</Text>
                    <Text style={styles.subtitle}>Manage your marketing campaigns</Text>
                </View>
                <TouchableOpacity onPress={handleCreateCampaign} style={styles.addButton}>
                    <Plus size={20} color={colors.white} />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Summary Stats */}
                <View style={styles.summaryRow}>
                    <View style={[styles.summaryCard, { backgroundColor: '#EFF6FF' }]}>
                        <Megaphone size={20} color="#2563EB" />
                        <Text style={[styles.summaryValue, { color: '#1E40AF' }]}>{campaigns.length}</Text>
                        <Text style={styles.summaryLabel}>Total</Text>
                    </View>
                    <View style={[styles.summaryCard, { backgroundColor: '#DCFCE7' }]}>
                        <Play size={20} color="#16A34A" />
                        <Text style={[styles.summaryValue, { color: '#166534' }]}>{activeCampaigns}</Text>
                        <Text style={styles.summaryLabel}>Active</Text>
                    </View>
                    <View style={[styles.summaryCard, { backgroundColor: '#F3E8FF' }]}>
                        <DollarSign size={20} color="#9333EA" />
                        <Text style={[styles.summaryValue, { color: '#6B21A8' }]}>{formatCurrency(totalSpent)}</Text>
                        <Text style={styles.summaryLabel}>Spent</Text>
                    </View>
                </View>

                {/* Campaigns List */}
                {campaigns.length > 0 ? (
                    campaigns.map((campaign) => {
                        const statusStyle = getStatusStyle(campaign.status);
                        const progress = campaign.total_budget > 0 
                            ? (campaign.budget_spent / campaign.total_budget) * 100 
                            : 0;
                        const ctr = calculateCTR(campaign);

                        return (
                            <TouchableOpacity
                                key={campaign.id}
                                onPress={() => handleCampaignPress(campaign)}
                                activeOpacity={0.7}
                            >
                                <Card style={styles.campaignCard}>
                                    <View style={styles.campaignHeader}>
                                        <View style={styles.campaignTitleRow}>
                                            <Text style={styles.campaignName} numberOfLines={1}>
                                                {campaign.name}
                                            </Text>
                                            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                                                <Text style={[styles.statusText, { color: statusStyle.text }]}>
                                                    {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                                                </Text>
                                            </View>
                                        </View>
                                        <ChevronRight size={20} color="#9CA3AF" />
                                    </View>

                                    {campaign.objective && (
                                        <Text style={styles.campaignObjective}>
                                            {campaign.objective.replace('_', ' ')}
                                        </Text>
                                    )}

                                    <View style={styles.campaignMeta}>
                                        <View style={styles.metaItem}>
                                            <Calendar size={14} color="#6B7280" />
                                            <Text style={styles.metaText}>
                                                {new Date(campaign.start_date).toLocaleDateString()}
                                                {campaign.end_date && ` - ${new Date(campaign.end_date).toLocaleDateString()}`}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.statsRow}>
                                        <View style={styles.stat}>
                                            <Text style={styles.statLabel}>Budget</Text>
                                            <Text style={styles.statValue}>{formatCurrency(campaign.total_budget)}</Text>
                                        </View>
                                        <View style={styles.stat}>
                                            <Text style={styles.statLabel}>Spent</Text>
                                            <Text style={styles.statValue}>{formatCurrency(campaign.budget_spent)}</Text>
                                        </View>
                                        <View style={styles.stat}>
                                            <Text style={styles.statLabel}>Impressions</Text>
                                            <Text style={styles.statValue}>
                                                {formatNumber(campaign.performance?.impressions || 0)}
                                            </Text>
                                        </View>
                                        <View style={styles.stat}>
                                            <Text style={styles.statLabel}>CTR</Text>
                                            <Text style={styles.statValue}>{ctr}%</Text>
                                        </View>
                                    </View>

                                    {campaign.status !== 'draft' && (
                                        <View style={styles.progressContainer}>
                                            <View style={styles.progressBar}>
                                                <View 
                                                    style={[
                                                        styles.progressFill, 
                                                        { width: `${Math.min(progress, 100)}%` }
                                                    ]} 
                                                />
                                            </View>
                                            <Text style={styles.progressText}>
                                                {progress.toFixed(0)}% spent
                                            </Text>
                                        </View>
                                    )}
                                </Card>
                            </TouchableOpacity>
                        );
                    })
                ) : (
                    <View style={styles.emptyState}>
                        <BarChart2 size={48} color="#9CA3AF" />
                        <Text style={styles.emptyTitle}>No campaigns yet</Text>
                        <Text style={styles.emptySubtitle}>
                            Get started by creating your first campaign
                        </Text>
                        <TouchableOpacity onPress={handleCreateCampaign} style={styles.emptyButton}>
                            <LinearGradient
                                colors={[colors.primary, '#7C3AED']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.emptyButtonGradient}
                            >
                                <Plus size={20} color={colors.white} />
                                <Text style={styles.emptyButtonText}>Create Campaign</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Floating Action Button */}
            {campaigns.length > 0 && (
                <TouchableOpacity 
                    style={[styles.fab, { bottom: insets.bottom + 80 }]} 
                    onPress={handleCreateCampaign}
                >
                    <LinearGradient
                        colors={[colors.primary, '#7C3AED']}
                        style={styles.fabGradient}
                    >
                        <Plus size={28} color={colors.white} />
                    </LinearGradient>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backButton: {
        padding: 8,
        marginRight: 8,
    },
    headerTitle: {
        flex: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1F2937',
    },
    subtitle: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 2,
    },
    addButton: {
        backgroundColor: colors.primary,
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        padding: 16,
    },
    summaryRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    summaryCard: {
        flex: 1,
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
    },
    summaryValue: {
        fontSize: 20,
        fontWeight: '700',
        marginTop: 8,
    },
    summaryLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    campaignCard: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    campaignHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    campaignTitleRow: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    campaignName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    campaignObjective: {
        fontSize: 13,
        color: '#6B7280',
        textTransform: 'capitalize',
        marginBottom: 8,
    },
    campaignMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaText: {
        fontSize: 12,
        color: '#6B7280',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    stat: {
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 11,
        color: '#9CA3AF',
        marginBottom: 2,
    },
    statValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 12,
    },
    progressBar: {
        flex: 1,
        height: 6,
        backgroundColor: '#E5E7EB',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: colors.primary,
        borderRadius: 3,
    },
    progressText: {
        fontSize: 11,
        color: '#6B7280',
        width: 60,
    },
    emptyState: {
        alignItems: 'center',
        padding: 40,
        backgroundColor: colors.white,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#374151',
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginTop: 8,
    },
    emptyButton: {
        marginTop: 20,
        borderRadius: 12,
        overflow: 'hidden',
    },
    emptyButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 24,
        paddingVertical: 14,
    },
    emptyButtonText: {
        color: colors.white,
        fontWeight: '600',
        fontSize: 15,
    },
    fab: {
        position: 'absolute',
        right: 20,
        borderRadius: 28,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    fabGradient: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

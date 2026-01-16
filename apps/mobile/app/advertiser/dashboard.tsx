import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Image, Dimensions, Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAdvertiserStore, AdvertiserDrop, Campaign, Coupon, SuggestedContent } from '@/store/advertiserStore';
import { useAuthStore } from '@/store/authStore';
import { Card } from '@/components/ui/Card';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { TabBar } from '@/components/ui/TabBar';
import { EmptyState } from '@/components/ui/EmptyState';
import {
    Users,
    BarChart2,
    MousePointer2,
    Wallet,
    Plus,
    ArrowRight,
    Settings,
    TrendingUp,
    Building2,
    Calendar,
    Target,
    Eye,
    DollarSign,
    Gift,
    TicketPercent,
    Sparkles,
    ExternalLink,
    Crown,
    ChevronRight,
    Megaphone,
    Diamond,
    PieChart,
    Activity
} from 'lucide-react-native';
import colors from '@/constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type TabKey = 'overview' | 'campaigns' | 'coupons' | 'analytics';

export default function AdvertiserDashboardScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user } = useAuthStore();
    const {
        drops,
        analytics,
        campaigns,
        coupons,
        redemptions,
        suggestedContent,
        userTier,
        monthlyInventory,
        isLoading,
        isLoadingCampaigns,
        isLoadingCoupons,
        isLoadingSuggestions,
        fetchDashboard,
        fetchCampaigns,
        fetchCoupons,
        fetchSuggestedContent,
        fetchPlans
    } = useAdvertiserStore();
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<TabKey>('overview');

    useEffect(() => {
        if (!user || user.role !== 'advertiser') {
            router.replace('/advertiser/onboarding' as any);
            return;
        }
        fetchDashboard();
        fetchCampaigns();
        fetchCoupons();
        fetchSuggestedContent();
        fetchPlans();
    }, [user]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([
            fetchDashboard(),
            fetchCampaigns(),
            fetchCoupons(),
            fetchSuggestedContent()
        ]);
        setRefreshing(false);
    }, []);

    if (isLoading && !refreshing && drops.length === 0) {
        return <LoadingIndicator fullScreen text="Loading dashboard..." />;
    }

    // Calculate high-level KPIs
    const totalSpend = drops.reduce((sum: number, d: AdvertiserDrop) => sum + (d.total_spend || 0), 0);
    const totalApps = drops.reduce((sum: number, d: AdvertiserDrop) => sum + (d.total_applications || 0), 0);
    const totalGems = drops.reduce((sum: number, d: AdvertiserDrop) => sum + (d.gem_reward_base || 0), 0);
    const avgEngagement = analytics.length > 0
        ? (analytics.reduce((sum, a) => sum + (a.engagement_rate || 0), 0) / analytics.length).toFixed(1)
        : '8.5';
    const avgCTR = 4.2;

    // Tier info
    const getTierInfo = (tier: string) => {
        switch (tier) {
            case 'premium': return { name: 'Premium', color: '#EAB308', bgColor: '#FEF9C3' };
            case 'growth': return { name: 'Growth', color: '#8B5CF6', bgColor: '#F3E8FF' };
            case 'starter': return { name: 'Starter', color: '#3B82F6', bgColor: '#DBEAFE' };
            default: return { name: 'Free', color: '#6B7280', bgColor: '#F3F4F6' };
        }
    };
    const tierInfo = getTierInfo(userTier);

    const renderHeader = () => (
        <LinearGradient
            colors={[colors.primary, '#7C3AED']} // Primary to Vivid Purple
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.headerGradient, { paddingTop: insets.top + 16 }]}
        >
            <View style={styles.headerTop}>
                <View style={styles.brandInfo}>
                    {user?.brand_logo_url ? (
                        <Image source={{ uri: user.brand_logo_url }} style={styles.brandLogo} />
                    ) : (
                        <View style={styles.brandLogoPlaceholder}>
                            <Building2 size={24} color={colors.primary} />
                        </View>
                    )}
                    <View>
                        <Text style={styles.brandName}>{user?.brand_name || 'Brand Name'}</Text>
                        <Text style={styles.greeting}>Welcome back</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.settingsButton}>
                    <Settings size={24} color="rgba(255,255,255,0.8)" />
                </TouchableOpacity>
            </View>

            <View style={styles.quickStatsRow}>
                <View style={styles.quickStat}>
                    <Text style={styles.quickStatLabel}>Total Budget</Text>
                    <Text style={styles.quickStatValue}>$2.5k</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.quickStat}>
                    <Text style={styles.quickStatLabel}>Active Drops</Text>
                    <Text style={styles.quickStatValue}>{drops.filter(d => d.status === 'active').length}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.quickStat}>
                    <Text style={styles.quickStatLabel}>ROI</Text>
                    <View style={styles.trendBadge}>
                        <TrendingUp size={12} color="#4ADE80" />
                        <Text style={styles.trendText}>+12%</Text>
                    </View>
                </View>
            </View>
        </LinearGradient>
    );

    // Tab content renderers
    const renderOverviewTab = () => (
        <View style={styles.content}>
            {/* Subscription Tier Banner */}
            <TouchableOpacity style={[styles.tierBanner, { backgroundColor: tierInfo.bgColor }]} activeOpacity={0.8}>
                <View style={styles.tierBannerLeft}>
                    <Crown size={20} color={tierInfo.color} />
                    <View>
                        <Text style={[styles.tierName, { color: tierInfo.color }]}>{tierInfo.name} Plan</Text>
                        <Text style={styles.tierSubtext}>Tap to view upgrade options</Text>
                    </View>
                </View>
                <ChevronRight size={20} color={tierInfo.color} />
            </TouchableOpacity>

            {/* KPI Grid */}
            <Text style={styles.sectionTitle}>Performance Overview</Text>
            <View style={styles.kpiGrid}>
                <Card style={styles.kpiCard}>
                    <View style={[styles.kpiIcon, { backgroundColor: '#EFF6FF' }]}>
                        <Users size={20} color="#2563EB" />
                    </View>
                    <Text style={styles.kpiValue}>{totalApps.toLocaleString()}</Text>
                    <Text style={styles.kpiLabel}>Participants</Text>
                </Card>

                <Card style={styles.kpiCard}>
                    <View style={[styles.kpiIcon, { backgroundColor: '#FAF5FF' }]}>
                        <Diamond size={20} color="#9333EA" />
                    </View>
                    <Text style={styles.kpiValue}>{totalGems.toFixed(1)}</Text>
                    <Text style={styles.kpiLabel}>Gems Distributed</Text>
                </Card>

                <Card style={styles.kpiCard}>
                    <View style={[styles.kpiIcon, { backgroundColor: '#F0FDF4' }]}>
                        <TrendingUp size={20} color="#16A34A" />
                    </View>
                    <Text style={styles.kpiValue}>{avgEngagement}%</Text>
                    <Text style={styles.kpiLabel}>Avg Engagement</Text>
                </Card>

                <Card style={styles.kpiCard}>
                    <View style={[styles.kpiIcon, { backgroundColor: '#FFFBEB' }]}>
                        <BarChart2 size={20} color="#D97706" />
                    </View>
                    <Text style={styles.kpiValue}>{drops.length}</Text>
                    <Text style={styles.kpiLabel}>Total Drops</Text>
                </Card>
            </View>

            {/* Real-time Metrics */}
            <Text style={styles.sectionTitle}>Real-time Metrics</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.metricsScroll}>
                <View style={[styles.metricChip, { backgroundColor: '#DBEAFE' }]}>
                    <Eye size={16} color="#2563EB" />
                    <Text style={[styles.metricValue, { color: '#1E40AF' }]}>24.3K</Text>
                    <Text style={[styles.metricLabel, { color: '#3B82F6' }]}>Impressions</Text>
                </View>
                <View style={[styles.metricChip, { backgroundColor: '#DCFCE7' }]}>
                    <MousePointer2 size={16} color="#16A34A" />
                    <Text style={[styles.metricValue, { color: '#166534' }]}>1.2K</Text>
                    <Text style={[styles.metricLabel, { color: '#22C55E' }]}>Clicks</Text>
                </View>
                <View style={[styles.metricChip, { backgroundColor: '#F3E8FF' }]}>
                    <Target size={16} color="#9333EA" />
                    <Text style={[styles.metricValue, { color: '#6B21A8' }]}>156</Text>
                    <Text style={[styles.metricLabel, { color: '#A855F7' }]}>Applications</Text>
                </View>
                <View style={[styles.metricChip, { backgroundColor: '#FEF3C7' }]}>
                    <DollarSign size={16} color="#D97706" />
                    <Text style={[styles.metricValue, { color: '#92400E' }]}>$0.78</Text>
                    <Text style={[styles.metricLabel, { color: '#F59E0B' }]}>Cost/Convert</Text>
                </View>
                <View style={[styles.metricChip, { backgroundColor: '#FEE2E2' }]}>
                    <Activity size={16} color="#DC2626" />
                    <Text style={[styles.metricValue, { color: '#991B1B' }]}>{avgCTR}%</Text>
                    <Text style={[styles.metricLabel, { color: '#EF4444' }]}>CTR</Text>
                </View>
            </ScrollView>

            {/* Create Drop Button */}
            <View style={styles.actionSection}>
                <TouchableOpacity style={styles.createButton} activeOpacity={0.9}>
                    <LinearGradient
                        colors={['#EC4899', '#8B5CF6']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.createButtonGradient}
                    >
                        <Plus size={24} color={colors.white} />
                        <Text style={styles.createButtonText}>Create New Drop</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {/* Suggested Content */}
            {suggestedContent.length > 0 && (
                <>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleRow}>
                            <Sparkles size={18} color="#EC4899" />
                            <Text style={styles.sectionTitle}>Suggested to Sponsor</Text>
                        </View>
                        <TouchableOpacity>
                            <Text style={styles.seeAll}>View All</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestedScroll}>
                        {suggestedContent.slice(0, 5).map((content: SuggestedContent) => (
                            <TouchableOpacity
                                key={content.id}
                                style={styles.suggestedCard}
                                onPress={() => content.platform_url && Linking.openURL(content.platform_url)}
                            >
                                <View style={styles.suggestedHeader}>
                                    <View style={styles.platformBadge}>
                                        <Text style={styles.platformText}>{content.platform}</Text>
                                    </View>
                                    {content.is_trending && (
                                        <View style={styles.trendingBadge}>
                                            <Text style={styles.trendingText}>🔥 Trending</Text>
                                        </View>
                                    )}
                                </View>
                                <Text style={styles.suggestedTitle} numberOfLines={2}>{content.title}</Text>
                                <View style={styles.suggestedStats}>
                                    <Text style={styles.suggestedStat}>{content.engagement_rate}% Eng</Text>
                                    <Text style={styles.suggestedStat}>{content.roi_potential || 85}% ROI</Text>
                                </View>
                                <TouchableOpacity style={styles.sponsorButton}>
                                    <Text style={styles.sponsorButtonText}>Sponsor</Text>
                                </TouchableOpacity>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </>
            )}

            {/* Recent Drops */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Drops</Text>
                <TouchableOpacity>
                    <Text style={styles.seeAll}>View All</Text>
                </TouchableOpacity>
            </View>

            {drops.slice(0, 5).map((drop: AdvertiserDrop) => (
                <Card key={drop.id} style={styles.dropCard}>
                    <View style={styles.dropMain}>
                        <View style={styles.dropIcon}>
                            <Calendar size={20} color={colors.darkGray} />
                        </View>
                        <View style={styles.dropContent}>
                            <View style={styles.dropHeaderRow}>
                                <Text style={styles.dropTitle} numberOfLines={1}>{drop.title}</Text>
                                <View style={[styles.statusBadge, { backgroundColor: drop.status === 'active' ? '#DCFCE7' : '#F3F4F6' }]}>
                                    <Text style={[styles.statusText, { color: drop.status === 'active' ? '#16A34A' : colors.darkGray }]}>
                                        {drop.status}
                                    </Text>
                                </View>
                            </View>
                            <Text style={styles.dropMeta}>
                                {drop.drop_type === 'proof_drop' ? 'Proof Drop' : 'Paid Drop'} • {new Date(drop.created_at).toLocaleDateString()}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.dropStatsRow}>
                        <View style={styles.miniStat}>
                            <Users size={14} color={colors.darkGray} />
                            <Text style={styles.miniStatText}>{drop.total_applications} Applicants</Text>
                        </View>
                        <View style={styles.miniStat}>
                            <Diamond size={14} color={colors.darkGray} />
                            <Text style={styles.miniStatText}>{drop.gem_reward_base || 0} Gems</Text>
                        </View>
                    </View>
                </Card>
            ))}

            {drops.length === 0 && (
                <View style={styles.emptyState}>
                    <Megaphone size={48} color="#9CA3AF" />
                    <Text style={styles.emptyText}>No active drops yet.</Text>
                    <Text style={styles.emptySubText}>Create your first campaign to see results here.</Text>
                </View>
            )}
        </View>
    );

    const renderCampaignsTab = () => (
        <View style={styles.content}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Your Campaigns</Text>
                <TouchableOpacity style={styles.addButton} onPress={() => router.push('/advertiser/campaigns/new' as any)}>
                    <Plus size={16} color={colors.white} />
                    <Text style={styles.addButtonText}>New</Text>
                </TouchableOpacity>
            </View>

            {isLoadingCampaigns ? (
                <LoadingIndicator text="Loading campaigns..." />
            ) : campaigns.length > 0 ? (
                campaigns.map((campaign: Campaign) => (
                    <TouchableOpacity key={campaign.id} onPress={() => router.push(`/advertiser/campaigns/${campaign.id}` as any)} activeOpacity={0.7}>
                        <Card style={styles.campaignCard}>
                            <View style={styles.campaignHeader}>
                                <Text style={styles.campaignName}>{campaign.name}</Text>
                                <View style={[styles.statusBadge, {
                                    backgroundColor: campaign.status === 'active' ? '#DCFCE7' :
                                        campaign.status === 'paused' ? '#FEF3C7' : '#F3F4F6'
                                }]}>
                                    <Text style={[styles.statusText, {
                                        color: campaign.status === 'active' ? '#16A34A' :
                                            campaign.status === 'paused' ? '#D97706' : colors.darkGray
                                    }]}>
                                        {campaign.status}
                                    </Text>
                                </View>
                            </View>
                            {campaign.objective && (
                                <Text style={styles.campaignObjective}>{campaign.objective}</Text>
                            )}
                            <View style={styles.campaignStats}>
                                <View style={styles.campaignStat}>
                                    <Text style={styles.campaignStatLabel}>Budget</Text>
                                    <Text style={styles.campaignStatValue}>${campaign.total_budget}</Text>
                                </View>
                                <View style={styles.campaignStat}>
                                    <Text style={styles.campaignStatLabel}>Spent</Text>
                                    <Text style={styles.campaignStatValue}>${campaign.budget_spent}</Text>
                                </View>
                                <View style={styles.campaignStat}>
                                    <Text style={styles.campaignStatLabel}>Impressions</Text>
                                    <Text style={styles.campaignStatValue}>{(campaign.performance?.impressions || 0).toLocaleString()}</Text>
                                </View>
                            </View>
                            <View style={styles.progressContainer}>
                                <View style={styles.progressBar}>
                                    <View style={[styles.progressFill, {
                                        width: `${Math.min((campaign.budget_spent / campaign.total_budget) * 100, 100)}%`
                                    }]} />
                                </View>
                                <Text style={styles.progressText}>
                                    {((campaign.budget_spent / campaign.total_budget) * 100).toFixed(0)}% spent
                                </Text>
                            </View>
                        </Card>
                    </TouchableOpacity>
                ))
            ) : (
                <View style={styles.emptyState}>
                    <Megaphone size={48} color="#9CA3AF" />
                    <Text style={styles.emptyText}>No campaigns yet</Text>
                    <Text style={styles.emptySubText}>Create your first campaign to start promoting</Text>
                    <TouchableOpacity style={styles.emptyButton} onPress={() => router.push('/advertiser/campaigns/new' as any)}>
                        <Text style={styles.emptyButtonText}>Create Campaign</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    const renderCouponsTab = () => (
        <View style={styles.content}>
            {/* Coupon Stats */}
            <View style={styles.couponStatsRow}>
                <View style={[styles.couponStatCard, { backgroundColor: '#F3E8FF' }]}>
                    <TicketPercent size={24} color="#9333EA" />
                    <Text style={styles.couponStatValue}>{coupons.length}</Text>
                    <Text style={styles.couponStatLabel}>Active</Text>
                </View>
                <View style={[styles.couponStatCard, { backgroundColor: '#FEF3C7' }]}>
                    <Gift size={24} color="#D97706" />
                    <Text style={styles.couponStatValue}>
                        {coupons.reduce((sum, c) => sum + (c.quantity_total - c.quantity_remaining), 0)}
                    </Text>
                    <Text style={styles.couponStatLabel}>Distributed</Text>
                </View>
                <View style={[styles.couponStatCard, { backgroundColor: '#DCFCE7' }]}>
                    <Users size={24} color="#16A34A" />
                    <Text style={styles.couponStatValue}>{redemptions.length}</Text>
                    <Text style={styles.couponStatLabel}>Redeemed</Text>
                </View>
            </View>

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Giveaways & Coupons</Text>
                <TouchableOpacity style={styles.addButton} onPress={() => router.push('/advertiser/coupons/new' as any)}>
                    <Plus size={16} color={colors.white} />
                    <Text style={styles.addButtonText}>Create</Text>
                </TouchableOpacity>
            </View>

            {isLoadingCoupons ? (
                <LoadingIndicator text="Loading coupons..." />
            ) : coupons.length > 0 ? (
                coupons.map((coupon: Coupon) => (
                    <TouchableOpacity key={coupon.id} onPress={() => router.push(`/advertiser/coupons/${coupon.id}` as any)} activeOpacity={0.7}>
                        <Card style={styles.couponCard}>
                            <View style={styles.couponHeader}>
                                <View style={styles.couponIcon}>
                                    {coupon.reward_type === 'giveaway' ? (
                                        <Gift size={20} color="#EC4899" />
                                    ) : (
                                        <TicketPercent size={20} color="#8B5CF6" />
                                    )}
                                </View>
                                <View style={styles.couponInfo}>
                                    <Text style={styles.couponTitle}>{coupon.title}</Text>
                                    <Text style={styles.couponValue}>
                                        {coupon.value}{coupon.value_unit === 'percentage' ? '%' : ''} {coupon.reward_type}
                                    </Text>
                                </View>
                                <View style={[styles.statusBadge, {
                                    backgroundColor: coupon.status === 'active' ? '#DCFCE7' : '#FEE2E2'
                                }]}>
                                    <Text style={[styles.statusText, {
                                        color: coupon.status === 'active' ? '#16A34A' : '#DC2626'
                                    }]}>
                                        {coupon.status}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.couponMeta}>
                                <Text style={styles.couponMetaText}>
                                    {coupon.quantity_remaining}/{coupon.quantity_total} remaining
                                </Text>
                                <Text style={styles.couponMetaText}>
                                    Expires {new Date(coupon.end_date).toLocaleDateString()}
                                </Text>
                            </View>
                            {coupon.assignments && coupon.assignments.length > 0 && (
                                <View style={styles.assignmentsList}>
                                    {coupon.assignments.map((a) => (
                                        <View key={a.id} style={styles.assignmentBadge}>
                                            <Text style={styles.assignmentText}>
                                                {a.target_type === 'drop' ? '📦' : '🏆'} {a.target_label || a.target_id}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </Card>
                    </TouchableOpacity>
                ))
            ) : (
                <View style={styles.emptyState}>
                    <Gift size={48} color="#9CA3AF" />
                    <Text style={styles.emptyText}>No incentives yet</Text>
                    <Text style={styles.emptySubText}>Create coupons to reward your top performers</Text>
                    <TouchableOpacity style={styles.emptyButton} onPress={() => router.push('/advertiser/coupons/new' as any)}>
                        <Text style={styles.emptyButtonText}>Create Incentive</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    const renderAnalyticsTab = () => (
        <View style={styles.content}>
            <Text style={styles.sectionTitle}>Performance Analytics</Text>

            {/* Summary Cards */}
            <View style={styles.analyticsGrid}>
                <Card style={styles.analyticsCard}>
                    <Text style={styles.analyticsLabel}>Total Impressions</Text>
                    <Text style={styles.analyticsValue}>
                        {analytics.reduce((sum, a) => sum + (a.impressions || 0), 0).toLocaleString()}
                    </Text>
                    <View style={styles.analyticsTrend}>
                        <TrendingUp size={14} color="#16A34A" />
                        <Text style={styles.analyticsTrendText}>+12%</Text>
                    </View>
                </Card>
                <Card style={styles.analyticsCard}>
                    <Text style={styles.analyticsLabel}>Total Participants</Text>
                    <Text style={styles.analyticsValue}>
                        {analytics.reduce((sum, a) => sum + (a.total_participants || 0), 0).toLocaleString()}
                    </Text>
                    <View style={styles.analyticsTrend}>
                        <TrendingUp size={14} color="#16A34A" />
                        <Text style={styles.analyticsTrendText}>+8%</Text>
                    </View>
                </Card>
            </View>

            <View style={styles.analyticsGrid}>
                <Card style={styles.analyticsCard}>
                    <Text style={styles.analyticsLabel}>Gems Spent</Text>
                    <Text style={styles.analyticsValue}>
                        {analytics.reduce((sum, a) => sum + (a.gems_spent || 0), 0).toFixed(1)}
                    </Text>
                </Card>
                <Card style={styles.analyticsCard}>
                    <Text style={styles.analyticsLabel}>Avg Engagement</Text>
                    <Text style={styles.analyticsValue}>{avgEngagement}%</Text>
                </Card>
            </View>

            {/* Period Analytics Table */}
            {analytics.length > 0 && (
                <>
                    <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Period Breakdown</Text>
                    {analytics.slice(0, 5).map((period, index) => (
                        <Card key={period.id || index} style={styles.periodCard}>
                            <View style={styles.periodHeader}>
                                <Text style={styles.periodDate}>
                                    {new Date(period.period_start).toLocaleDateString()} - {period.period_end ? new Date(period.period_end).toLocaleDateString() : 'Now'}
                                </Text>
                            </View>
                            <View style={styles.periodStats}>
                                <View style={styles.periodStat}>
                                    <Text style={styles.periodStatValue}>{period.drops_created}</Text>
                                    <Text style={styles.periodStatLabel}>Drops</Text>
                                </View>
                                <View style={styles.periodStat}>
                                    <Text style={styles.periodStatValue}>{period.total_participants}</Text>
                                    <Text style={styles.periodStatLabel}>Participants</Text>
                                </View>
                                <View style={styles.periodStat}>
                                    <Text style={styles.periodStatValue}>{period.gems_spent.toFixed(1)}</Text>
                                    <Text style={styles.periodStatLabel}>Gems</Text>
                                </View>
                                <View style={styles.periodStat}>
                                    <Text style={styles.periodStatValue}>{period.engagement_rate.toFixed(1)}%</Text>
                                    <Text style={styles.periodStatLabel}>Engagement</Text>
                                </View>
                            </View>
                        </Card>
                    ))}
                </>
            )}

            {analytics.length === 0 && (
                <View style={styles.emptyState}>
                    <PieChart size={48} color="#9CA3AF" />
                    <Text style={styles.emptyText}>No analytics data yet</Text>
                    <Text style={styles.emptySubText}>Create drops to start tracking performance</Text>
                </View>
            )}
        </View>
    );

    const tabs = [
        { key: 'overview', label: 'Overview' },
        { key: 'campaigns', label: 'Campaigns' },
        { key: 'coupons', label: 'Coupons' },
        { key: 'analytics', label: 'Analytics' },
    ];

    return (
        <View style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.white} />}
            >
                {renderHeader()}

                {/* Tab Bar */}
                <View style={styles.tabContainer}>
                    {tabs.map((tab) => (
                        <TouchableOpacity
                            key={tab.key}
                            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
                            onPress={() => setActiveTab(tab.key as TabKey)}
                        >
                            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Tab Content */}
                {activeTab === 'overview' && renderOverviewTab()}
                {activeTab === 'campaigns' && renderCampaignsTab()}
                {activeTab === 'coupons' && renderCouponsTab()}
                {activeTab === 'analytics' && renderAnalyticsTab()}

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    headerGradient: {
        paddingBottom: 32,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 24,
    },
    brandInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    brandLogo: {
        width: 48,
        height: 48,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    brandLogoPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
    brandName: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.white,
    },
    greeting: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
    },
    settingsButton: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
    },
    quickStatsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 24,
        padding: 16,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    quickStat: {
        alignItems: 'center',
        flex: 1,
    },
    quickStatLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 4,
    },
    quickStatValue: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.white,
    },
    divider: {
        width: 1,
        height: 24,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    trendBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(74, 222, 128, 0.1)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    trendText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#4ADE80',
    },
    content: {
        padding: 24,
        marginTop: -10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 16,
    },
    kpiGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 32,
    },
    kpiCard: {
        width: '48%', // Approx half
        padding: 16,
        borderRadius: 20,
        backgroundColor: colors.white,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    kpiIcon: {
        width: 36,
        height: 36,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    kpiValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 4,
    },
    kpiLabel: {
        fontSize: 12,
        color: '#6B7280',
    },
    actionSection: {
        marginBottom: 32,
    },
    createButton: {
        borderRadius: 16,
        shadowColor: "#EC4899",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    createButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        borderRadius: 16,
        gap: 10,
    },
    createButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.white,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    seeAll: {
        fontSize: 14,
        color: colors.primary,
        fontWeight: '600',
    },
    dropCard: {
        padding: 16,
        borderRadius: 20,
        marginBottom: 16,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    dropMain: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    dropIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dropContent: {
        flex: 1,
    },
    dropHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    dropTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    dropMeta: {
        fontSize: 13,
        color: '#6B7280',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    dropStatsRow: {
        flexDirection: 'row',
        gap: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    miniStat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    miniStatText: {
        fontSize: 12,
        color: '#4B5563',
        fontWeight: '500',
    },
    emptyState: {
        padding: 32,
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 4,
    },
    emptySubText: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
    },
    emptyButton: {
        marginTop: 16,
        backgroundColor: colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    emptyButtonText: {
        color: colors.white,
        fontWeight: '600',
        fontSize: 14,
    },
    // Tab styles
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: colors.white,
        marginHorizontal: 24,
        marginTop: 16,
        borderRadius: 16,
        padding: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 12,
    },
    activeTab: {
        backgroundColor: colors.primary,
    },
    tabText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6B7280',
    },
    activeTabText: {
        color: colors.white,
    },
    // Tier banner
    tierBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 16,
        marginBottom: 24,
    },
    tierBannerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    tierName: {
        fontSize: 16,
        fontWeight: '700',
    },
    tierSubtext: {
        fontSize: 12,
        color: '#6B7280',
    },
    // Metrics scroll
    metricsScroll: {
        marginBottom: 24,
        marginHorizontal: -24,
        paddingHorizontal: 24,
    },
    metricChip: {
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 16,
        marginRight: 12,
        minWidth: 100,
    },
    metricValue: {
        fontSize: 18,
        fontWeight: '700',
        marginTop: 4,
    },
    metricLabel: {
        fontSize: 11,
        fontWeight: '500',
        marginTop: 2,
    },
    // Section title row
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    // Suggested content
    suggestedScroll: {
        marginBottom: 24,
        marginHorizontal: -24,
        paddingHorizontal: 24,
    },
    suggestedCard: {
        width: 200,
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 16,
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    suggestedHeader: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 8,
    },
    platformBadge: {
        backgroundColor: '#F3E8FF',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    platformText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#9333EA',
    },
    trendingBadge: {
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    trendingText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#D97706',
    },
    suggestedTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 8,
    },
    suggestedStats: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    suggestedStat: {
        fontSize: 12,
        color: '#6B7280',
    },
    sponsorButton: {
        backgroundColor: '#EC4899',
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
    },
    sponsorButtonText: {
        color: colors.white,
        fontWeight: '600',
        fontSize: 13,
    },
    // Add button
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
    },
    addButtonText: {
        color: colors.white,
        fontWeight: '600',
        fontSize: 13,
    },
    // Campaign styles
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
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    campaignName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        flex: 1,
    },
    campaignObjective: {
        fontSize: 13,
        color: '#6B7280',
        marginBottom: 12,
    },
    campaignStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    campaignStat: {
        alignItems: 'center',
    },
    campaignStatLabel: {
        fontSize: 11,
        color: '#9CA3AF',
        marginBottom: 2,
    },
    campaignStatValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
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
    // Coupon styles
    couponStatsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    couponStatCard: {
        flex: 1,
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
    },
    couponStatValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1F2937',
        marginTop: 8,
    },
    couponStatLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    couponCard: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    couponHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    couponIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#F3E8FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    couponInfo: {
        flex: 1,
    },
    couponTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1F2937',
    },
    couponValue: {
        fontSize: 13,
        color: '#6B7280',
    },
    couponMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    couponMetaText: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    assignmentsList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 12,
    },
    assignmentBadge: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    assignmentText: {
        fontSize: 12,
        color: '#4B5563',
    },
    // Analytics styles
    analyticsGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    analyticsCard: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    analyticsLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
    },
    analyticsValue: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1F2937',
    },
    analyticsTrend: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 8,
    },
    analyticsTrendText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#16A34A',
    },
    // Period card styles
    periodCard: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    periodHeader: {
        marginBottom: 12,
    },
    periodDate: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
    },
    periodStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    periodStat: {
        alignItems: 'center',
    },
    periodStatValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2937',
    },
    periodStatLabel: {
        fontSize: 11,
        color: '#9CA3AF',
        marginTop: 2,
    },
});

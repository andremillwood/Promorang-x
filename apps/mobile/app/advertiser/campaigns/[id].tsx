import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAdvertiserStore, Campaign, CampaignContent, CampaignDrop, CampaignCoupon, CampaignContentItem } from '@/store/advertiserStore';
import { Card } from '@/components/ui/Card';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import {
    ArrowLeft,
    BarChart2,
    Calendar,
    Users,
    DollarSign,
    Target,
    Edit,
    Trash2,
    Pause,
    Play,
    RefreshCw,
    Plus,
    TrendingUp,
    TrendingDown,
    Eye,
    MousePointer2,
    MoreVertical,
    Clock,
    Zap,
    Gem,
    Key,
    Ticket,
    Gift,
    Share2,
    PenTool,
    Heart,
    Star,
    Link as LinkIcon,
    Image,
    Video,
    MessageSquare,
    Sparkles
} from 'lucide-react-native';
import colors from '@/constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function CampaignDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const insets = useSafeAreaInsets();
    const {
        selectedCampaign,
        campaignContent,
        getCampaign,
        updateCampaignStatus,
        deleteCampaign,
        addCampaignFunds,
        setSelectedCampaign
    } = useAdvertiserStore();
    
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'drops' | 'content' | 'coupons'>('overview');

    useEffect(() => {
        loadCampaign();
    }, [id]);

    const loadCampaign = async () => {
        if (!id) return;
        setLoading(true);
        await getCampaign(id);
        setLoading(false);
    };

    const onRefresh = useCallback(async () => {
        if (!id) return;
        setRefreshing(true);
        await getCampaign(id);
        setRefreshing(false);
    }, [id]);

    const handleStatusChange = async (newStatus: Campaign['status']) => {
        if (!selectedCampaign) return;
        
        setIsUpdating(true);
        const success = await updateCampaignStatus(selectedCampaign.id, newStatus);
        setIsUpdating(false);
        
        if (success) {
            Alert.alert('Success', `Campaign ${newStatus === 'active' ? 'activated' : 'paused'} successfully`);
        } else {
            Alert.alert('Error', 'Failed to update campaign status');
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Campaign',
            'Are you sure you want to delete this campaign? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        if (!selectedCampaign) return;
                        const success = await deleteCampaign(selectedCampaign.id);
                        if (success) {
                            router.back();
                        } else {
                            Alert.alert('Error', 'Failed to delete campaign');
                        }
                    }
                }
            ]
        );
    };

    const handleAddFunds = () => {
        Alert.prompt(
            'Add Funds',
            'Enter amount to add to campaign budget:',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Add',
                    onPress: async (amount: string | undefined) => {
                        if (!amount || !selectedCampaign) return;
                        const numAmount = parseFloat(amount);
                        if (isNaN(numAmount) || numAmount <= 0) {
                            Alert.alert('Error', 'Please enter a valid amount');
                            return;
                        }
                        const result = await addCampaignFunds(selectedCampaign.id, numAmount);
                        if (result) {
                            Alert.alert('Success', `Added $${result.amount_added} to campaign. New budget: $${result.new_total}`);
                        } else {
                            Alert.alert('Error', 'Failed to add funds');
                        }
                    }
                }
            ],
            'plain-text',
            '',
            'numeric'
        );
    };

    const handleEdit = () => {
        router.push(`/advertiser/campaigns/edit/${id}` as any);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('en-US').format(num);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
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

    if (loading) {
        return <LoadingIndicator fullScreen text="Loading campaign..." />;
    }

    if (!selectedCampaign) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <ArrowLeft size={24} color="#1F2937" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Campaign Not Found</Text>
                </View>
                <View style={styles.errorState}>
                    <Text style={styles.errorText}>The requested campaign could not be found.</Text>
                    <TouchableOpacity onPress={() => router.back()} style={styles.errorButton}>
                        <Text style={styles.errorButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const campaign = selectedCampaign;
    const statusStyle = getStatusStyle(campaign.status);
    const progress = campaign.total_budget > 0 ? (campaign.budget_spent / campaign.total_budget) * 100 : 0;
    const ctr = campaign.performance?.impressions && campaign.performance.impressions > 0
        ? ((campaign.performance.clicks || 0) / campaign.performance.impressions * 100).toFixed(2)
        : '0.00';
    const cpc = campaign.performance?.clicks && campaign.performance.clicks > 0
        ? (campaign.budget_spent / campaign.performance.clicks).toFixed(2)
        : '0.00';

    const getDaysRemaining = () => {
        if (!campaign.end_date) return null;
        const today = new Date();
        const end = new Date(campaign.end_date);
        const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return diff;
    };
    const daysRemaining = getDaysRemaining();

    const renderOverviewTab = () => (
        <View style={styles.tabContent}>
            {/* Campaign Summary */}
            <Card style={styles.summaryCard}>
                <Text style={styles.sectionTitle}>Campaign Summary</Text>
                {campaign.description && (
                    <Text style={styles.description}>{campaign.description}</Text>
                )}
                <View style={styles.summaryGrid}>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Objective</Text>
                        <Text style={styles.summaryValue}>
                            {(campaign.objective || 'engagement').replace('_', ' ')}
                        </Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Bid Strategy</Text>
                        <Text style={styles.summaryValue}>
                            {campaign.bid_strategy === 'lowest_cost' ? 'Lowest Cost' :
                             campaign.bid_strategy === 'cost_cap' ? 'Cost Cap' : 'Bid Cap'}
                        </Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Daily Budget</Text>
                        <Text style={styles.summaryValue}>
                            {formatCurrency(campaign.daily_budget || 0)}
                        </Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Campaign Type</Text>
                        <Text style={styles.summaryValue}>
                            {(campaign.campaign_type || 'standard').charAt(0).toUpperCase() + 
                             (campaign.campaign_type || 'standard').slice(1)}
                        </Text>
                    </View>
                </View>
            </Card>

            {/* Quick Actions */}
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
                <TouchableOpacity style={styles.actionButton} onPress={onRefresh}>
                    <RefreshCw size={20} color="#2563EB" />
                    <Text style={styles.actionText}>Refresh</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={handleAddFunds}>
                    <DollarSign size={20} color="#16A34A" />
                    <Text style={styles.actionText}>Add Funds</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={handleEdit}>
                    <Edit size={20} color="#9333EA" />
                    <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, styles.deleteAction]} onPress={handleDelete}>
                    <Trash2 size={20} color="#DC2626" />
                    <Text style={[styles.actionText, { color: '#DC2626' }]}>Delete</Text>
                </TouchableOpacity>
            </View>

            {/* Recent Activity */}
            <Text style={styles.sectionTitle}>Activity Timeline</Text>
            <Card style={styles.activityCard}>
                <View style={styles.activityItem}>
                    <View style={[styles.activityDot, { backgroundColor: '#16A34A' }]} />
                    <View style={styles.activityContent}>
                        <Text style={styles.activityTitle}>Campaign created</Text>
                        <Text style={styles.activityDate}>
                            {campaign.created_at ? formatDate(campaign.created_at) : 'N/A'}
                        </Text>
                    </View>
                </View>
                <View style={styles.activityItem}>
                    <View style={[styles.activityDot, { backgroundColor: '#2563EB' }]} />
                    <View style={styles.activityContent}>
                        <Text style={styles.activityTitle}>Campaign started</Text>
                        <Text style={styles.activityDate}>{formatDate(campaign.start_date)}</Text>
                    </View>
                </View>
                {campaign.updated_at && campaign.updated_at !== campaign.created_at && (
                    <View style={styles.activityItem}>
                        <View style={[styles.activityDot, { backgroundColor: '#9333EA' }]} />
                        <View style={styles.activityContent}>
                            <Text style={styles.activityTitle}>Last updated</Text>
                            <Text style={styles.activityDate}>{formatDate(campaign.updated_at)}</Text>
                        </View>
                    </View>
                )}
            </Card>
        </View>
    );

    const renderPerformanceTab = () => (
        <View style={styles.tabContent}>
            {/* Performance Summary */}
            <View style={styles.perfGrid}>
                <Card style={styles.perfCard}>
                    <View style={[styles.perfIcon, { backgroundColor: '#DBEAFE' }]}>
                        <Eye size={20} color="#2563EB" />
                    </View>
                    <Text style={styles.perfValue}>
                        {formatNumber(campaign.performance?.impressions || 0)}
                    </Text>
                    <Text style={styles.perfLabel}>Impressions</Text>
                </Card>
                <Card style={styles.perfCard}>
                    <View style={[styles.perfIcon, { backgroundColor: '#DCFCE7' }]}>
                        <MousePointer2 size={20} color="#16A34A" />
                    </View>
                    <Text style={styles.perfValue}>
                        {formatNumber(campaign.performance?.clicks || 0)}
                    </Text>
                    <Text style={styles.perfLabel}>Clicks</Text>
                </Card>
                <Card style={styles.perfCard}>
                    <View style={[styles.perfIcon, { backgroundColor: '#F3E8FF' }]}>
                        <Target size={20} color="#9333EA" />
                    </View>
                    <Text style={styles.perfValue}>{ctr}%</Text>
                    <Text style={styles.perfLabel}>CTR</Text>
                </Card>
                <Card style={styles.perfCard}>
                    <View style={[styles.perfIcon, { backgroundColor: '#FEF3C7' }]}>
                        <DollarSign size={20} color="#D97706" />
                    </View>
                    <Text style={styles.perfValue}>${cpc}</Text>
                    <Text style={styles.perfLabel}>CPC</Text>
                </Card>
            </View>

            {/* Budget Progress */}
            <Card style={styles.budgetCard}>
                <Text style={styles.sectionTitle}>Budget Utilization</Text>
                <View style={styles.budgetHeader}>
                    <Text style={styles.budgetSpent}>{formatCurrency(campaign.budget_spent)}</Text>
                    <Text style={styles.budgetTotal}>of {formatCurrency(campaign.total_budget)}</Text>
                </View>
                <View style={styles.budgetProgressBar}>
                    <View style={[styles.budgetProgressFill, { width: `${Math.min(progress, 100)}%` }]} />
                </View>
                <View style={styles.budgetFooter}>
                    <Text style={styles.budgetRemaining}>
                        {formatCurrency(campaign.total_budget - campaign.budget_spent)} remaining
                    </Text>
                    <Text style={styles.budgetPercent}>{progress.toFixed(1)}%</Text>
                </View>
            </Card>

            {/* Target Metrics */}
            <Card style={styles.targetCard}>
                <Text style={styles.sectionTitle}>Target vs Actual</Text>
                <View style={styles.targetRow}>
                    <View style={styles.targetItem}>
                        <Text style={styles.targetLabel}>Target CTR</Text>
                        <Text style={styles.targetValue}>{campaign.target_ctr || 2.0}%</Text>
                        <View style={styles.targetComparison}>
                            {parseFloat(ctr) >= (campaign.target_ctr || 2.0) ? (
                                <TrendingUp size={14} color="#16A34A" />
                            ) : (
                                <TrendingDown size={14} color="#DC2626" />
                            )}
                            <Text style={[
                                styles.targetDiff,
                                { color: parseFloat(ctr) >= (campaign.target_ctr || 2.0) ? '#16A34A' : '#DC2626' }
                            ]}>
                                {(parseFloat(ctr) - (campaign.target_ctr || 2.0)).toFixed(2)}%
                            </Text>
                        </View>
                    </View>
                    <View style={styles.targetItem}>
                        <Text style={styles.targetLabel}>Target CPC</Text>
                        <Text style={styles.targetValue}>${campaign.target_cpc || 0.50}</Text>
                        <View style={styles.targetComparison}>
                            {parseFloat(cpc) <= (campaign.target_cpc || 0.50) ? (
                                <TrendingDown size={14} color="#16A34A" />
                            ) : (
                                <TrendingUp size={14} color="#DC2626" />
                            )}
                            <Text style={[
                                styles.targetDiff,
                                { color: parseFloat(cpc) <= (campaign.target_cpc || 0.50) ? '#16A34A' : '#DC2626' }
                            ]}>
                                ${Math.abs(parseFloat(cpc) - (campaign.target_cpc || 0.50)).toFixed(2)}
                            </Text>
                        </View>
                    </View>
                </View>
            </Card>
        </View>
    );

    const renderContentTab = () => (
        <View style={styles.tabContent}>
            <View style={styles.contentHeader}>
                <Text style={styles.sectionTitle}>Campaign Content</Text>
                <TouchableOpacity style={styles.addContentButton}>
                    <Plus size={16} color={colors.white} />
                    <Text style={styles.addContentText}>Add</Text>
                </TouchableOpacity>
            </View>

            {campaignContent.length > 0 ? (
                campaignContent.map((content) => (
                    <Card key={content.id} style={styles.contentCard}>
                        <View style={styles.contentCardHeader}>
                            <Text style={styles.contentTitle}>{content.title}</Text>
                            <View style={[styles.contentStatus, {
                                backgroundColor: content.status === 'live' ? '#DCFCE7' :
                                    content.status === 'approved' ? '#DBEAFE' : '#FEF3C7'
                            }]}>
                                <Text style={[styles.contentStatusText, {
                                    color: content.status === 'live' ? '#16A34A' :
                                        content.status === 'approved' ? '#2563EB' : '#D97706'
                                }]}>
                                    {content.status}
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.contentMeta}>
                            {content.platform} • {content.creator}
                        </Text>
                        <View style={styles.contentStats}>
                            <View style={styles.contentStat}>
                                <Text style={styles.contentStatLabel}>Budget</Text>
                                <Text style={styles.contentStatValue}>{formatCurrency(content.budget)}</Text>
                            </View>
                            <View style={styles.contentStat}>
                                <Text style={styles.contentStatLabel}>Spent</Text>
                                <Text style={styles.contentStatValue}>{formatCurrency(content.spent)}</Text>
                            </View>
                            <View style={styles.contentStat}>
                                <Text style={styles.contentStatLabel}>Impressions</Text>
                                <Text style={styles.contentStatValue}>{formatNumber(content.impressions)}</Text>
                            </View>
                        </View>
                    </Card>
                ))
            ) : (
                <View style={styles.emptyContent}>
                    <Zap size={40} color="#9CA3AF" />
                    <Text style={styles.emptyContentTitle}>No content yet</Text>
                    <Text style={styles.emptyContentSubtitle}>
                        Add content to promote in this campaign
                    </Text>
                </View>
            )}
        </View>
    );

    // Render Drops Tab - New Promorang model
    const renderDropsTab = () => {
        const drops = campaign.drops || [];
        const dropTypeIcons: Record<string, any> = {
            share: Share2,
            create: PenTool,
            engage: Heart,
            review: Star,
        };

        return (
            <View style={styles.tabContent}>
                <View style={styles.contentHeader}>
                    <Text style={styles.sectionTitle}>Campaign Drops</Text>
                    <TouchableOpacity style={styles.addContentButton}>
                        <Plus size={16} color={colors.white} />
                        <Text style={styles.addContentText}>Add</Text>
                    </TouchableOpacity>
                </View>

                {drops.length > 0 ? (
                    drops.map((drop) => {
                        const DropIcon = dropTypeIcons[drop.type] || Sparkles;
                        const progress = drop.max_participants > 0 
                            ? ((drop.current_participants || 0) / drop.max_participants) * 100 
                            : 0;

                        return (
                            <Card key={drop.id} style={styles.contentCard}>
                                <View style={styles.contentCardHeader}>
                                    <View style={styles.dropTypeRow}>
                                        <View style={styles.dropTypeIcon}>
                                            <DropIcon size={16} color={colors.primary} />
                                        </View>
                                        <Text style={styles.contentTitle}>{drop.title}</Text>
                                    </View>
                                    <View style={[styles.contentStatus, {
                                        backgroundColor: drop.status === 'active' ? '#DCFCE7' :
                                            drop.status === 'completed' ? '#DBEAFE' : '#FEF3C7'
                                    }]}>
                                        <Text style={[styles.contentStatusText, {
                                            color: drop.status === 'active' ? '#16A34A' :
                                                drop.status === 'completed' ? '#2563EB' : '#D97706'
                                        }]}>
                                            {drop.status || 'active'}
                                        </Text>
                                    </View>
                                </View>
                                
                                {drop.description && (
                                    <Text style={styles.dropDescription}>{drop.description}</Text>
                                )}
                                
                                <View style={styles.dropRewards}>
                                    <View style={styles.dropRewardItem}>
                                        <Gem size={14} color="#9333EA" />
                                        <Text style={styles.dropRewardText}>{drop.gem_reward} gems</Text>
                                    </View>
                                    <View style={styles.dropRewardItem}>
                                        <Key size={14} color="#D97706" />
                                        <Text style={styles.dropRewardText}>{drop.keys_cost} keys</Text>
                                    </View>
                                    <View style={styles.dropRewardItem}>
                                        <Users size={14} color="#2563EB" />
                                        <Text style={styles.dropRewardText}>
                                            {drop.current_participants || 0}/{drop.max_participants}
                                        </Text>
                                    </View>
                                </View>
                                
                                <View style={styles.dropProgressContainer}>
                                    <View style={styles.dropProgressBar}>
                                        <View style={[styles.dropProgressFill, { width: `${Math.min(progress, 100)}%` }]} />
                                    </View>
                                    <Text style={styles.dropProgressText}>{progress.toFixed(0)}% filled</Text>
                                </View>
                            </Card>
                        );
                    })
                ) : (
                    <View style={styles.emptyContent}>
                        <Sparkles size={40} color="#9CA3AF" />
                        <Text style={styles.emptyContentTitle}>No drops yet</Text>
                        <Text style={styles.emptyContentSubtitle}>
                            Add drops for creators to complete and earn rewards
                        </Text>
                    </View>
                )}
            </View>
        );
    };

    // Render Coupons Tab - New Promorang model
    const renderCouponsTab = () => {
        const coupons = campaign.coupons || [];

        return (
            <View style={styles.tabContent}>
                <View style={styles.contentHeader}>
                    <Text style={styles.sectionTitle}>Campaign Coupons</Text>
                    <TouchableOpacity style={styles.addContentButton}>
                        <Plus size={16} color={colors.white} />
                        <Text style={styles.addContentText}>Add</Text>
                    </TouchableOpacity>
                </View>

                {/* PromoShare Contribution */}
                {campaign.promoshare_contribution && campaign.promoshare_contribution > 0 && (
                    <Card style={styles.promoShareCard}>
                        <View style={styles.promoShareRow}>
                            <View style={styles.promoShareIcon}>
                                <Ticket size={20} color="#9333EA" />
                            </View>
                            <View style={styles.promoShareInfo}>
                                <Text style={styles.promoShareTitle}>PromoShare Contribution</Text>
                                <Text style={styles.promoShareValue}>
                                    {campaign.promoshare_contribution} 💎 to jackpot
                                </Text>
                            </View>
                        </View>
                    </Card>
                )}

                {coupons.length > 0 ? (
                    coupons.map((coupon) => {
                        const claimed = coupon.quantity_claimed || 0;
                        const remaining = coupon.quantity - claimed;
                        const progress = coupon.quantity > 0 ? (claimed / coupon.quantity) * 100 : 0;

                        return (
                            <Card key={coupon.id} style={styles.contentCard}>
                                <View style={styles.contentCardHeader}>
                                    <View style={styles.couponHeader}>
                                        <Gift size={18} color={colors.primary} />
                                        <Text style={styles.contentTitle}>{coupon.title}</Text>
                                    </View>
                                    <View style={[styles.couponBadge, {
                                        backgroundColor: remaining > 0 ? '#DCFCE7' : '#FEF3C7'
                                    }]}>
                                        <Text style={[styles.couponBadgeText, {
                                            color: remaining > 0 ? '#16A34A' : '#D97706'
                                        }]}>
                                            {remaining > 0 ? `${remaining} left` : 'Depleted'}
                                        </Text>
                                    </View>
                                </View>
                                
                                <View style={styles.couponValue}>
                                    <Text style={styles.couponValueText}>
                                        {coupon.discount_type === 'percent' 
                                            ? `${coupon.discount_value}% Off`
                                            : coupon.discount_type === 'fixed'
                                                ? `$${coupon.discount_value} Off`
                                                : 'Free Item'}
                                    </Text>
                                </View>
                                
                                <View style={styles.couponStats}>
                                    <Text style={styles.couponStatText}>
                                        {claimed} claimed of {coupon.quantity}
                                    </Text>
                                </View>
                                
                                <View style={styles.dropProgressContainer}>
                                    <View style={styles.dropProgressBar}>
                                        <View style={[styles.dropProgressFill, { 
                                            width: `${Math.min(progress, 100)}%`,
                                            backgroundColor: '#16A34A'
                                        }]} />
                                    </View>
                                </View>
                            </Card>
                        );
                    })
                ) : (
                    <View style={styles.emptyContent}>
                        <Gift size={40} color="#9CA3AF" />
                        <Text style={styles.emptyContentTitle}>No coupons yet</Text>
                        <Text style={styles.emptyContentSubtitle}>
                            Add coupons to incentivize participation
                        </Text>
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#1F2937" />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={styles.headerTitle} numberOfLines={1}>{campaign.name}</Text>
                    <View style={styles.headerMeta}>
                        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                            <Text style={[styles.statusText, { color: statusStyle.text }]}>
                                {campaign.status}
                            </Text>
                        </View>
                        {daysRemaining !== null && (
                            <Text style={styles.daysRemaining}>
                                {daysRemaining > 0 ? `${daysRemaining} days left` : 'Ended'}
                            </Text>
                        )}
                    </View>
                </View>
                {campaign.status === 'active' ? (
                    <TouchableOpacity 
                        onPress={() => handleStatusChange('paused')} 
                        style={styles.statusButton}
                        disabled={isUpdating}
                    >
                        <Pause size={20} color="#D97706" />
                    </TouchableOpacity>
                ) : campaign.status === 'paused' || campaign.status === 'draft' ? (
                    <TouchableOpacity 
                        onPress={() => handleStatusChange('active')} 
                        style={styles.statusButton}
                        disabled={isUpdating}
                    >
                        <Play size={20} color="#16A34A" />
                    </TouchableOpacity>
                ) : null}
            </View>

            {/* Stats Cards */}
            <View style={styles.statsRow}>
                <View style={[styles.statCard, { backgroundColor: '#EFF6FF' }]}>
                    <DollarSign size={18} color="#2563EB" />
                    <Text style={[styles.statValue, { color: '#1E40AF' }]}>
                        {formatCurrency(campaign.total_budget)}
                    </Text>
                    <Text style={styles.statLabel}>Budget</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: '#F0FDF4' }]}>
                    <Users size={18} color="#16A34A" />
                    <Text style={[styles.statValue, { color: '#166534' }]}>
                        {formatNumber(campaign.participants_count || 0)}
                    </Text>
                    <Text style={styles.statLabel}>Participants</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: '#FAF5FF' }]}>
                    <BarChart2 size={18} color="#9333EA" />
                    <Text style={[styles.statValue, { color: '#6B21A8' }]}>
                        {formatNumber(campaign.performance?.impressions || 0)}
                    </Text>
                    <Text style={styles.statLabel}>Impressions</Text>
                </View>
            </View>

            {/* Tab Bar */}
            <View style={styles.tabBar}>
                {(['overview', 'drops', 'content', 'coupons'] as const).map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, activeTab === tab && styles.activeTab]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {activeTab === 'overview' && renderOverviewTab()}
                {activeTab === 'drops' && renderDropsTab()}
                {activeTab === 'content' && renderContentTab()}
                {activeTab === 'coupons' && renderCouponsTab()}
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backButton: {
        padding: 8,
        marginRight: 8,
    },
    headerInfo: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
    },
    headerMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 4,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    daysRemaining: {
        fontSize: 12,
        color: '#6B7280',
    },
    statusButton: {
        padding: 10,
        backgroundColor: '#F3F4F6',
        borderRadius: 10,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 8,
        padding: 16,
        backgroundColor: colors.white,
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
    },
    statValue: {
        fontSize: 16,
        fontWeight: '700',
        marginTop: 6,
    },
    statLabel: {
        fontSize: 11,
        color: '#6B7280',
        marginTop: 2,
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: colors.white,
        paddingHorizontal: 16,
        paddingBottom: 12,
        gap: 8,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10,
        backgroundColor: '#F3F4F6',
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
    tabContent: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 12,
    },
    summaryCard: {
        padding: 16,
        borderRadius: 16,
        backgroundColor: colors.white,
        marginBottom: 20,
    },
    description: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 16,
        lineHeight: 20,
    },
    summaryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    summaryItem: {
        width: '45%',
    },
    summaryLabel: {
        fontSize: 12,
        color: '#9CA3AF',
        marginBottom: 4,
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
        textTransform: 'capitalize',
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 20,
    },
    actionButton: {
        width: '47%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 14,
        backgroundColor: colors.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    deleteAction: {
        borderColor: '#FEE2E2',
        backgroundColor: '#FEF2F2',
    },
    actionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    activityCard: {
        padding: 16,
        borderRadius: 16,
        backgroundColor: colors.white,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    activityDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginTop: 4,
        marginRight: 12,
    },
    activityContent: {
        flex: 1,
    },
    activityTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1F2937',
    },
    activityDate: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 2,
    },
    perfGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 16,
    },
    perfCard: {
        width: '47%',
        padding: 16,
        borderRadius: 16,
        backgroundColor: colors.white,
        alignItems: 'center',
    },
    perfIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    perfValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1F2937',
    },
    perfLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 4,
    },
    budgetCard: {
        padding: 16,
        borderRadius: 16,
        backgroundColor: colors.white,
        marginBottom: 16,
    },
    budgetHeader: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 8,
        marginBottom: 12,
    },
    budgetSpent: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1F2937',
    },
    budgetTotal: {
        fontSize: 14,
        color: '#6B7280',
    },
    budgetProgressBar: {
        height: 8,
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
        overflow: 'hidden',
    },
    budgetProgressFill: {
        height: '100%',
        backgroundColor: colors.primary,
        borderRadius: 4,
    },
    budgetFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    budgetRemaining: {
        fontSize: 13,
        color: '#6B7280',
    },
    budgetPercent: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1F2937',
    },
    targetCard: {
        padding: 16,
        borderRadius: 16,
        backgroundColor: colors.white,
    },
    targetRow: {
        flexDirection: 'row',
        gap: 16,
    },
    targetItem: {
        flex: 1,
        alignItems: 'center',
    },
    targetLabel: {
        fontSize: 12,
        color: '#9CA3AF',
        marginBottom: 4,
    },
    targetValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
    },
    targetComparison: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    targetDiff: {
        fontSize: 12,
        fontWeight: '600',
    },
    contentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    addContentButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    addContentText: {
        color: colors.white,
        fontWeight: '600',
        fontSize: 13,
    },
    contentCard: {
        padding: 16,
        borderRadius: 16,
        backgroundColor: colors.white,
        marginBottom: 12,
    },
    contentCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    contentTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1F2937',
        flex: 1,
    },
    contentStatus: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    contentStatusText: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    contentMeta: {
        fontSize: 13,
        color: '#6B7280',
        marginBottom: 12,
    },
    contentStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    contentStat: {
        alignItems: 'center',
    },
    contentStatLabel: {
        fontSize: 11,
        color: '#9CA3AF',
        marginBottom: 2,
    },
    contentStatValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
    },
    emptyContent: {
        alignItems: 'center',
        padding: 40,
        backgroundColor: colors.white,
        borderRadius: 16,
    },
    emptyContentTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginTop: 12,
    },
    emptyContentSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginTop: 4,
    },
    errorState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    errorText: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 16,
    },
    errorButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 10,
    },
    errorButtonText: {
        color: colors.white,
        fontWeight: '600',
    },
    // Drop tab styles
    dropTypeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    dropTypeIcon: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: '#FAF5FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    dropDescription: {
        fontSize: 13,
        color: '#6B7280',
        marginBottom: 12,
        lineHeight: 18,
    },
    dropRewards: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 12,
    },
    dropRewardItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    dropRewardText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#374151',
    },
    dropProgressContainer: {
        marginTop: 8,
    },
    dropProgressBar: {
        height: 6,
        backgroundColor: '#E5E7EB',
        borderRadius: 3,
        overflow: 'hidden',
    },
    dropProgressFill: {
        height: '100%',
        backgroundColor: '#9333EA',
        borderRadius: 3,
    },
    dropProgressText: {
        fontSize: 11,
        color: '#6B7280',
        marginTop: 4,
        textAlign: 'right',
    },
    // PromoShare styles
    promoShareCard: {
        padding: 16,
        borderRadius: 16,
        backgroundColor: '#FAF5FF',
        borderWidth: 1,
        borderColor: '#E9D5FF',
        marginBottom: 12,
    },
    promoShareRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    promoShareIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#F3E8FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    promoShareInfo: {
        flex: 1,
    },
    promoShareTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#581C87',
    },
    promoShareValue: {
        fontSize: 13,
        color: '#7C3AED',
        marginTop: 2,
    },
    // Coupon styles
    couponHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    couponBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    couponBadgeText: {
        fontSize: 11,
        fontWeight: '600',
    },
    couponValue: {
        backgroundColor: '#F0FDF4',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        marginBottom: 12,
        alignSelf: 'flex-start',
    },
    couponValueText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#16A34A',
    },
    couponStats: {
        marginBottom: 8,
    },
    couponStatText: {
        fontSize: 13,
        color: '#6B7280',
    },
});

/**
 * Start Page Hub (Mobile)
 * 
 * Consolidated landing page for new/early-stage users.
 * Uses a state machine for progressive disclosure:
 * - State 0: First contact with 2 CTAs
 * - State 1+: Full hub with action categories
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    RefreshControl,
    Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    Gift,
    Calendar,
    Camera,
    TrendingUp,
    Instagram,
    Store,
    BarChart3,
    ArrowRight,
    ChevronDown,
    ChevronUp,
    Sparkles,
    Trophy,
    DollarSign,
    Coins
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAuthStore } from '@/store/authStore';
import { useMaturityStore, UserMaturityState } from '@/store/maturityStore';
import colors from '@/constants/colors';
import InstagramConnectModal from '@/components/InstagramConnectModal';
import EconomyStepModal, { EconomyStep } from '@/components/EconomyStepModal';
import TodayLayout from '@/components/TodayLayout';
import AppHeader from '@/components/ui/AppHeader';

const { width } = Dimensions.get('window');

// The Promorang Economy Flow
const ECONOMY_STEPS = [
    { id: 'monetize' as EconomyStep, icon: Coins, label: 'Monetize', description: 'Get recognized for likes & shares', color: '#F59E0B' },
    { id: 'spot_trends' as EconomyStep, icon: TrendingUp, label: 'Scout', description: 'Spot viral content early', color: '#EC4899' },
    { id: 'build_rank' as EconomyStep, icon: Trophy, label: 'Rank Up', description: 'Build your access level', color: '#8B5CF6' },
    { id: 'withdraw' as EconomyStep, icon: DollarSign, label: 'Withdraw', description: 'Turn gems into cash', color: '#10B981' },
];

// Drop categories to explore
const DROP_CATEGORIES = [
    { title: 'Deals', path: '/deals', icon: Gift, colors: ['#10B981', '#059669'] as [string, string], caption: 'Brand actions with rewards' },
    { title: 'Scout', path: '/bounty', icon: TrendingUp, colors: ['#F97316', '#EC4899'] as [string, string], caption: "Spot hits, earn finder's fee" },
    { title: 'Events', path: '/events', icon: Calendar, colors: ['#3B82F6', '#6366F1'] as [string, string], caption: 'Earn for showing up' },
    { title: 'Content', path: '/post', icon: Camera, colors: ['#8B5CF6', '#EC4899'] as [string, string], caption: 'Post social proof' },
    { title: 'Market', path: '/market', icon: BarChart3, colors: ['#3B82F6', '#06B6D4'] as [string, string], caption: 'Forecast & earn shares' },
    { title: 'Shop', path: '/store', icon: Store, colors: ['#F59E0B', '#F97316'] as [string, string], caption: 'Shop & earn cashback' },
];

// Rank timeline data
const RANK_TIMELINE = [
    { day: '0', title: 'Entry', features: ['Deals', 'Events', 'Shop'], color: '#6B7280' },
    { day: '7', title: 'Active', features: ['PromoShare', 'Referrals'], color: '#3B82F6' },
    { day: '14', title: 'Trusted', features: ['Growth Hub', 'Priority Access'], color: '#8B5CF6' },
    { day: '30+', title: 'Power', features: ['Full Platform', 'Premium Drops'], color: '#F97316' },
];

export default function StartScreen() {
    const router = useRouter();
    const theme = useThemeColors();
    const { user, isAuthenticated } = useAuthStore();
    const { maturityState, visibility } = useMaturityStore();

    const [refreshing, setRefreshing] = useState(false);
    const [showFirstContact, setShowFirstContact] = useState(true);
    const [showRankDetails, setShowRankDetails] = useState(false);
    const [showInstagramModal, setShowInstagramModal] = useState(false);
    const [activeEconomyModal, setActiveEconomyModal] = useState<EconomyStep | null>(null);

    // Check if user has seen full hub before
    useEffect(() => {
        const checkHubPreference = async () => {
            const hasSeenHub = await AsyncStorage.getItem('promorang_show_hub');
            if (hasSeenHub === 'true' || maturityState >= UserMaturityState.ACTIVE) {
                setShowFirstContact(false);
            }
        };
        checkHubPreference();
    }, [maturityState]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setTimeout(() => setRefreshing(false), 1000);
    };

    const handleShowFullHub = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await AsyncStorage.setItem('promorang_show_hub', 'true');
        setShowFirstContact(false);
    };

    const handleInstagramPress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setShowInstagramModal(true);
    };

    const handleCategoryPress = (path: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push(path as any);
    };

    // First Contact View (State 0)
    if (showFirstContact && maturityState === UserMaturityState.FIRST_TIME) {
        return (
            <TodayLayout>
                <AppHeader showLogo showNotifications showAvatar />
                <View style={[styles.container, { backgroundColor: theme.background }]}>
                    <ScrollView
                        contentContainerStyle={styles.firstContactContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Welcome Badge */}
                        <LinearGradient
                            colors={['rgba(249, 115, 22, 0.1)', 'rgba(236, 72, 153, 0.1)']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={[styles.welcomeBadge, { borderColor: 'rgba(249, 115, 22, 0.2)' }]}
                        >
                            <Sparkles size={18} color="#F97316" />
                            <Text style={styles.welcomeBadgeText}>Welcome to Promorang</Text>
                        </LinearGradient>

                        {/* Headline */}
                        <Text style={[styles.headline, { color: theme.text }]}>
                            Get paid for{'\n'}
                            <Text style={styles.headlineGradient}>stuff you already do</Text>
                        </Text>

                        <Text style={[styles.subheadline, { color: theme.textSecondary }]}>
                            Like posts, visit places, share discoveries. We turn that into real money.
                        </Text>

                        {/* Primary CTA - Instagram */}
                        <TouchableOpacity
                            style={styles.primaryCard}
                            onPress={handleInstagramPress}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={['#EC4899', '#8B5CF6', '#6366F1']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.primaryCardGradient}
                            >
                                <View style={styles.primaryIconCircle}>
                                    <Instagram size={24} color="#FFF" />
                                </View>
                                <View style={styles.primaryTextContainer}>
                                    <Text style={styles.primaryTitle}>Verify Instagram & Start</Text>
                                    <Text style={styles.primarySubtitle}>Takes 30 seconds • No posting</Text>
                                </View>
                                <ArrowRight size={20} color="#FFF" />
                            </LinearGradient>
                        </TouchableOpacity>

                        <Text style={[styles.orText, { color: theme.textSecondary }]}>or</Text>

                        {/* Secondary CTA - Browse Deals */}
                        <TouchableOpacity
                            style={[styles.secondaryCard, { backgroundColor: theme.surface, borderColor: 'rgba(16, 185, 129, 0.3)' }]}
                            onPress={() => handleCategoryPress('/deals')}
                            activeOpacity={0.8}
                        >
                            <View style={styles.secondaryIconCircle}>
                                <Gift size={24} color="#10B981" />
                            </View>
                            <View style={styles.primaryTextContainer}>
                                <Text style={[styles.secondaryTitle, { color: theme.text }]}>Browse Deals First</Text>
                                <Text style={[styles.secondarySubtitle, { color: theme.textSecondary }]}>See what rewards are available</Text>
                            </View>
                            <ArrowRight size={20} color={theme.textSecondary} />
                        </TouchableOpacity>

                        {/* Social Proof */}
                        <Text style={[styles.socialProof, { color: theme.textSecondary }]}>
                            Join 10,000+ people earning from their social presence
                        </Text>

                        {/* Expand to Full Hub */}
                        <TouchableOpacity
                            style={styles.expandButton}
                            onPress={handleShowFullHub}
                        >
                            <Text style={[styles.expandText, { color: theme.textSecondary }]}>Explore all options</Text>
                            <ChevronDown size={18} color={theme.textSecondary} />
                        </TouchableOpacity>
                    </ScrollView>

                    <InstagramConnectModal
                        visible={showInstagramModal}
                        onClose={() => setShowInstagramModal(false)}
                    />
                </View>
            </TodayLayout>
        );
    }

    // Full Hub View (State 1+)
    return (
        <TodayLayout>
            <AppHeader showLogo showNotifications showAvatar />
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <ScrollView
                    contentContainerStyle={styles.hubContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor={colors.primary}
                        />
                    }
                >
                    {/* Header */}
                    <View style={styles.hubHeader}>
                        <Text style={[styles.hubTitle, { color: theme.text }]}>Start Earning</Text>
                        <Text style={[styles.hubSubtitle, { color: theme.textSecondary }]}>
                            Pick an action to build your rank
                        </Text>
                    </View>

                    {/* Go to Today Handoff Banner - State 1+ */}
                    {maturityState >= UserMaturityState.ACTIVE && (
                        <TouchableOpacity
                            style={styles.todayBanner}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                router.push('/(tabs)' as any);
                            }}
                            activeOpacity={0.9}
                        >
                            <LinearGradient
                                colors={['#F97316', '#EC4899']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.todayBannerGradient}
                            >
                                <View style={styles.todayBannerContent}>
                                    <View>
                                        <Text style={styles.todayBannerTitle}>You're in. Let's focus on today.</Text>
                                        <Text style={styles.todayBannerSubtitle}>Daily progress is where rewards happen</Text>
                                    </View>
                                    <View style={styles.todayBannerButton}>
                                        <Text style={styles.todayBannerButtonText}>Go to Today</Text>
                                        <ArrowRight size={16} color="#F97316" />
                                    </View>
                                </View>
                                <Sparkles size={48} color="rgba(255,255,255,0.15)" style={styles.todayBannerIcon} />
                            </LinearGradient>
                        </TouchableOpacity>
                    )}

                    {/* Balances Bar */}
                    {user && (
                        <View style={[styles.balancesBar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                            <View style={styles.balanceItem}>
                                <Coins size={18} color="#F59E0B" />
                                <Text style={[styles.balanceValue, { color: theme.text }]}>{user.points_balance?.toLocaleString() || '0'}</Text>
                                <Text style={[styles.balanceLabel, { color: theme.textSecondary }]}>Points</Text>
                            </View>
                            <View style={[styles.balanceDivider, { backgroundColor: theme.border }]} />
                            <View style={styles.balanceItem}>
                                <Trophy size={18} color="#8B5CF6" />
                                <Text style={[styles.balanceValue, { color: theme.text }]}>{user.keys_balance || '0'}</Text>
                                <Text style={[styles.balanceLabel, { color: theme.textSecondary }]}>Keys</Text>
                            </View>
                            <View style={[styles.balanceDivider, { backgroundColor: theme.border }]} />
                            <View style={styles.balanceItem}>
                                <DollarSign size={18} color="#10B981" />
                                <Text style={[styles.balanceValue, { color: theme.text }]}>{user.gems_balance || '0'}</Text>
                                <Text style={[styles.balanceLabel, { color: theme.textSecondary }]}>Gems</Text>
                            </View>
                        </View>
                    )}

                    {/* Economy Flow Cards */}
                    <View style={styles.economySection}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Your Path to Rewards</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.economyScroll}
                        >
                            {ECONOMY_STEPS.map((step, index) => {
                                const Icon = step.icon;
                                return (
                                    <TouchableOpacity
                                        key={step.id}
                                        style={[styles.economyCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                                        onPress={() => setActiveEconomyModal(step.id)}
                                    >
                                        <View style={[styles.economyIconCircle, { backgroundColor: `${step.color}20` }]}>
                                            <Icon size={22} color={step.color} />
                                        </View>
                                        <Text style={[styles.economyLabel, { color: theme.text }]}>{step.label}</Text>
                                        <Text style={[styles.economyStep, { color: theme.textSecondary }]}>Step {index + 1}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>

                    {/* Instagram Connect CTA */}
                    {!user?.instagram_connected && (
                        <TouchableOpacity
                            style={styles.instagramBanner}
                            onPress={handleInstagramPress}
                        >
                            <LinearGradient
                                colors={['#EC4899', '#8B5CF6']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.instagramBannerGradient}
                            >
                                <Instagram size={20} color="#FFF" />
                                <Text style={styles.instagramBannerText}>Connect Instagram to unlock all rewards</Text>
                                <ArrowRight size={18} color="#FFF" />
                            </LinearGradient>
                        </TouchableOpacity>
                    )}

                    {/* Categories Grid */}
                    <View style={styles.categoriesSection}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Ways to Earn</Text>
                        <View style={styles.categoriesGrid}>
                            {DROP_CATEGORIES.map((category) => {
                                const Icon = category.icon;
                                return (
                                    <TouchableOpacity
                                        key={category.title}
                                        style={[styles.categoryCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                                        onPress={() => handleCategoryPress(category.path)}
                                        activeOpacity={0.8}
                                    >
                                        <LinearGradient
                                            colors={category.colors}
                                            style={styles.categoryIconCircle}
                                        >
                                            <Icon size={22} color="#FFF" />
                                        </LinearGradient>
                                        <Text style={[styles.categoryTitle, { color: theme.text }]}>{category.title}</Text>
                                        <Text style={[styles.categoryCaption, { color: theme.textSecondary }]} numberOfLines={2}>
                                            {category.caption}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    {/* Rank Timeline (Collapsible) */}
                    <View style={[styles.rankSection, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                        <TouchableOpacity
                            style={styles.rankHeader}
                            onPress={() => {
                                Haptics.selectionAsync();
                                setShowRankDetails(!showRankDetails);
                            }}
                        >
                            <View>
                                <Text style={[styles.rankTitle, { color: theme.text }]}>Access Rank Timeline</Text>
                                <Text style={[styles.rankSubtitle, { color: theme.textSecondary }]}>
                                    Consistency unlocks features
                                </Text>
                            </View>
                            {showRankDetails ? (
                                <ChevronUp size={20} color={theme.textSecondary} />
                            ) : (
                                <ChevronDown size={20} color={theme.textSecondary} />
                            )}
                        </TouchableOpacity>

                        {showRankDetails && (
                            <View style={styles.rankTimeline}>
                                {RANK_TIMELINE.map((rank, index) => (
                                    <View key={rank.day} style={styles.rankRow}>
                                        <View style={[styles.rankDot, { backgroundColor: rank.color }]} />
                                        <View style={styles.rankInfo}>
                                            <Text style={[styles.rankDay, { color: rank.color }]}>Day {rank.day}</Text>
                                            <Text style={[styles.rankTitleText, { color: theme.text }]}>{rank.title}</Text>
                                            <Text style={[styles.rankFeatures, { color: theme.textSecondary }]}>
                                                {rank.features.join(' • ')}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Bottom Padding */}
                    <View style={{ height: 100 }} />
                </ScrollView>

                {/* Economy Step Modal */}
                {activeEconomyModal && (
                    <EconomyStepModal
                        step={activeEconomyModal}
                        visible={true}
                        onClose={() => setActiveEconomyModal(null)}
                        onOpenInstagramModal={() => {
                            setActiveEconomyModal(null);
                            setShowInstagramModal(true);
                        }}
                    />
                )}

                {/* Instagram Connect Modal */}
                <InstagramConnectModal
                    visible={showInstagramModal}
                    onClose={() => setShowInstagramModal(false)}
                />
            </View>
        </TodayLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    // First Contact Styles
    firstContactContent: {
        padding: 24,
        paddingTop: 40,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100%',
    },
    welcomeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 8,
        marginBottom: 24,
        borderWidth: 1,
    },
    welcomeBadgeText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#F97316',
    },
    headline: {
        fontSize: 32,
        fontWeight: '800',
        textAlign: 'center',
        lineHeight: 40,
        marginBottom: 12,
    },
    headlineGradient: {
        color: '#EC4899',
    },
    subheadline: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 24,
    },
    primaryCard: {
        width: '100%',
        borderRadius: 16,
        overflow: 'hidden',
    },
    primaryCardGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 16,
    },
    primaryIconCircle: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryTextContainer: {
        flex: 1,
    },
    primaryTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FFF',
        marginBottom: 2,
    },
    primarySubtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.8)',
    },
    orText: {
        fontSize: 12,
        marginVertical: 12,
    },
    secondaryCard: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        gap: 16,
    },
    secondaryIconCircle: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryTitle: {
        fontSize: 17,
        fontWeight: '700',
        marginBottom: 2,
    },
    secondarySubtitle: {
        fontSize: 13,
    },
    socialProof: {
        marginTop: 32,
        fontSize: 12,
        textAlign: 'center',
    },
    expandButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 24,
        gap: 8,
        paddingVertical: 12,
    },
    expandText: {
        fontSize: 14,
        fontWeight: '500',
    },
    // Hub Styles
    hubContent: {
        padding: 20,
    },
    hubHeader: {
        marginBottom: 24,
    },
    hubTitle: {
        fontSize: 28,
        fontWeight: '800',
    },
    hubSubtitle: {
        fontSize: 14,
        marginTop: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 12,
    },
    economySection: {
        marginBottom: 24,
    },
    economyScroll: {
        gap: 10,
    },
    economyCard: {
        width: 95,
        padding: 12,
        borderRadius: 14,
        borderWidth: 1,
        alignItems: 'center',
        gap: 6,
        marginRight: 10,
    },
    economyIconCircle: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    economyLabel: {
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
    },
    economyStep: {
        fontSize: 10,
    },
    instagramBanner: {
        marginBottom: 24,
        borderRadius: 14,
        overflow: 'hidden',
    },
    instagramBannerGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        gap: 12,
    },
    instagramBannerText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
        color: '#FFF',
    },
    categoriesSection: {
        marginBottom: 24,
    },
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    categoryCard: {
        width: (width - 52) / 2,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        gap: 8,
    },
    categoryIconCircle: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    categoryTitle: {
        fontSize: 15,
        fontWeight: '700',
    },
    categoryCaption: {
        fontSize: 12,
        lineHeight: 16,
    },
    rankSection: {
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
    },
    rankHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    rankTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    rankSubtitle: {
        fontSize: 12,
        marginTop: 2,
    },
    rankTimeline: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        gap: 16,
    },
    rankRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    rankDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginTop: 4,
    },
    rankInfo: {
        flex: 1,
    },
    rankDay: {
        fontSize: 12,
        fontWeight: '700',
    },
    rankTitleText: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 2,
    },
    rankFeatures: {
        fontSize: 12,
        marginTop: 2,
    },
    // Today Banner Styles
    todayBanner: {
        marginBottom: 16,
        borderRadius: 16,
        overflow: 'hidden',
    },
    todayBannerGradient: {
        padding: 16,
        position: 'relative',
    },
    todayBannerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    todayBannerTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FFF',
        marginBottom: 2,
    },
    todayBannerSubtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.8)',
    },
    todayBannerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },
    todayBannerButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#F97316',
    },
    todayBannerIcon: {
        position: 'absolute',
        right: 16,
        top: '50%',
        marginTop: -24,
        opacity: 0.15,
    },
    // Balances Bar Styles
    balancesBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 16,
    },
    balanceItem: {
        alignItems: 'center',
        gap: 4,
    },
    balanceValue: {
        fontSize: 20,
        fontWeight: '700',
    },
    balanceLabel: {
        fontSize: 11,
    },
    balanceDivider: {
        width: 1,
        height: 40,
    },
});

import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import { useGrowthStore, StakingChannel, FundingProject, ShieldPolicy, StakingPosition } from '@/store/growthStore';
import { TabBar } from '@/components/ui/TabBar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { Zap, TrendingUp, Shield, HelpCircle, ArrowRight, Star, Target, Crown, Trophy, Sparkles } from 'lucide-react-native';
import colors from '@/constants/colors';
import { HubNode } from '@/components/growth/HubNode';
import { AppHeader } from '@/components/ui/AppHeader';
import { BalancesBar } from '@/components/ui/BalancesBar';
import { useAuthStore } from '@/store/authStore';
import TodayLayout from '@/components/TodayLayout';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '@/hooks/useThemeColors';

const { width } = Dimensions.get('window');

export default function GrowthHubScreen() {
    const theme = useThemeColors();
    const [activeTab, setActiveTab] = useState('path');
    const [refreshing, setRefreshing] = useState(false);
    const { user } = useAuthStore();
    const {
        channels,
        stakingPositions,
        fundingProjects,
        shieldPolicies,
        fetchChannels,
        fetchStaking,
        fetchFunding,
        fetchShield,
        claimRewards,
        isLoading
    } = useGrowthStore();

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        if (activeTab === 'staking' || activeTab === 'path') {
            await Promise.all([fetchChannels(), fetchStaking()]);
        }
        if (activeTab === 'funding' || activeTab === 'path') await fetchFunding();
        if (activeTab === 'shield' || activeTab === 'path') await fetchShield();
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const tabs = [
        { key: 'path', label: 'The Path' },
        { key: 'staking', label: 'Staking' },
        { key: 'funding', label: 'Projects' },
        { key: 'shield', label: 'Shield' },
    ];

    const pathNodes = useMemo(() => {
        return [
            { id: 'start', name: 'Identity', icon: Target, status: 'completed' },
            { id: 'staking', name: 'First Stake', icon: TrendingUp, status: 'unlocked' },
            { id: 'funding', name: 'Backer', icon: Star, status: 'locked' },
            { id: 'shield', name: 'Defender', icon: Shield, status: 'locked' },
            { id: 'elite', name: 'Elite', icon: Crown, status: 'locked' },
        ];
    }, []);

    const renderPath = () => (
        <ScrollView
            style={styles.pathContainer}
            contentContainerStyle={styles.pathContent}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.pathHeader}>
                <Text style={[styles.pathTitle, { color: theme.text }]}>Your Growth Journey</Text>
                <Text style={[styles.pathSubtitle, { color: theme.textSecondary }]}>Complete milestones to unlock new features and higher tiers.</Text>
            </View>

            <View style={styles.road}>
                {pathNodes.map((node, index) => {
                    // Zigzag calculation
                    const offset = index % 4; // 0, 1, 2, 3
                    let horizontalPosition = 0;
                    if (offset === 1) horizontalPosition = 40;
                    if (offset === 2) horizontalPosition = 0;
                    if (offset === 3) horizontalPosition = -40;

                    return (
                        <HubNode
                            key={node.id}
                            id={node.id}
                            name={node.name}
                            icon={node.icon}
                            status={node.status as any}
                            onPress={() => setActiveTab(node.id === 'staking' ? 'staking' : activeTab)}
                            style={{ transform: [{ translateX: horizontalPosition }] }}
                        />
                    );
                })}
            </View>
        </ScrollView>
    );

    const renderStaking = () => (
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Boost Your Content</Text>
            <Text style={[styles.sectionDesc, { color: theme.textSecondary }]}>Stake gems in your favorite channels to increase visibility and earn rewards.</Text>

            {stakingPositions.length > 0 && (
                <View style={{ marginBottom: 24 }}>
                    <Text style={[styles.subsectionTitle, { color: theme.text }]}>Your Active Stakes</Text>
                    {stakingPositions.map((pos: StakingPosition) => (
                        <Card key={pos.id} style={styles.itemCard}>
                            <View style={styles.itemHeader}>
                                <Zap size={20} color={colors.primary} />
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.itemName, { color: theme.text }]}>Active Stake</Text>
                                    <Text style={[styles.itemMeta, { color: theme.textSecondary }]}>{pos.amount} Gems • Earned {pos.rewards_earned.toFixed(2)}</Text>
                                </View>
                                <Button title="Claim" size="sm" variant="outline" onPress={() => claimRewards(pos.id)} />
                            </View>
                        </Card>
                    ))}
                </View>
            )}

            <Text style={[styles.subsectionTitle, { color: theme.text }]}>Available Channels</Text>
            {channels.map((channel: StakingChannel) => (
                <Card key={channel.id} style={styles.itemCard}>
                    <View style={styles.itemHeader}>
                        <View style={[styles.iconBox, { backgroundColor: `${colors.primary}15` }]}>
                            <TrendingUp size={20} color={colors.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.itemName, { color: theme.text }]}>{channel.name}</Text>
                            <Text style={[styles.itemMeta, { color: theme.textSecondary }]}>{channel.description}</Text>
                        </View>
                        <View style={styles.apyBadge}>
                            <Text style={styles.apyText}>+{channel.apy}% APY</Text>
                        </View>
                    </View>
                    <Button title="Stake Gems" variant="primary" size="sm" style={styles.itemAction} onPress={() => { }} />
                </Card>
            ))}
        </View>
    );

    const renderFunding = () => (
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Community Funding</Text>
            <Text style={[styles.sectionDesc, { color: theme.textSecondary }]}>Back promising creators and get exclusive rewards when they hit their targets.</Text>

            {fundingProjects.map((project: FundingProject) => (
                <Card key={project.id} style={styles.itemCard}>
                    <Text style={[styles.itemName, { color: theme.text }]}>{project.title}</Text>
                    <Text style={[styles.itemMeta, { color: theme.textSecondary }]} numberOfLines={2}>{project.description}</Text>
                    <View style={styles.progressContainer}>
                        <View style={styles.progressLabelRow}>
                            <Text style={[styles.progressValue, { color: theme.textSecondary }]}>${project.current_amount} of ${project.target_amount}</Text>
                            <Text style={styles.progressPercent}>{Math.round((project.current_amount / project.target_amount) * 100)}%</Text>
                        </View>
                        <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
                            <View style={[styles.progressFill, { width: `${(project.current_amount / project.target_amount) * 100}%` }]} />
                        </View>
                    </View>
                    <Button title="Back this Project" variant="primary" size="sm" onPress={() => { }} />
                </Card>
            ))}
        </View>
    );

    const renderShield = () => (
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Social Protection</Text>
            <Text style={[styles.sectionDesc, { color: theme.textSecondary }]}>Insure your account against shadowbans, removals, and platform changes.</Text>

            {shieldPolicies.map((policy: ShieldPolicy) => (
                <Card key={policy.id} style={styles.itemCard}>
                    <View style={styles.itemHeader}>
                        <View style={[styles.iconBox, { backgroundColor: '#DCFCE7' }]}>
                            <Shield size={20} color="#16A34A" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.itemName, { color: theme.text }]}>{policy.name}</Text>
                            <Text style={[styles.itemMeta, { color: theme.textSecondary }]}>Coverage: {policy.coverage_amount} Gems</Text>
                        </View>
                    </View>
                    <View style={[styles.priceRow, { borderTopColor: theme.border }]}>
                        <Text style={[styles.priceLabel, { color: theme.textSecondary }]}>Premium</Text>
                        <Text style={[styles.priceValue, { color: theme.text }]}>{policy.premium_amount} Gems / {policy.duration_days} days</Text>
                    </View>
                    <Button title="Subscribe" variant="primary" size="sm" onPress={() => { }} />
                </Card>
            ))}
        </View>
    );

    if (isLoading && !refreshing) {
        return <LoadingIndicator fullScreen text="Loading Growth Hub..." />;
    }

    return (
        <TodayLayout>
            <AppHeader transparent hideLeft showBack showNotifications showAvatar />
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <Stack.Screen options={{ headerShown: false }} />

                <ScrollView
                    style={styles.content}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    stickyHeaderIndices={[1]}
                >
                    <View style={styles.headerContainer}>
                        <LinearGradient
                            colors={['#10B981', '#3B82F6']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.heroSection}
                        >
                            <View style={styles.heroContent}>
                                <View>
                                    <Text style={styles.heroTitle}>Growth Hub</Text>
                                    <Text style={styles.heroSubtitle}>Stake, back, and secure your growth</Text>
                                </View>
                                <Sparkles size={40} color="rgba(255,255,255,0.2)" />
                            </View>
                            <Trophy size={100} color="rgba(255,255,255,0.05)" style={styles.heroIcon} />
                        </LinearGradient>

                        <View style={styles.contentPadding}>
                            <BalancesBar user={user} />
                        </View>
                    </View>

                    <View style={{ backgroundColor: theme.background }}>
                        <TabBar
                            tabs={tabs}
                            activeTab={activeTab}
                            onTabChange={setActiveTab}
                            variant="pills"
                            containerStyle={styles.tabBar}
                        />
                    </View>

                    {activeTab === 'path' && renderPath()}
                    {activeTab === 'staking' && renderStaking()}
                    {activeTab === 'funding' && renderFunding()}
                    {activeTab === 'shield' && renderShield()}
                </ScrollView>
            </View>
        </TodayLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.gray,
    },
    tabBar: {
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    headerContainer: {
        marginBottom: 8,
    },
    heroSection: {
        padding: 24,
        paddingTop: 60,
        paddingBottom: 40,
        position: 'relative',
        overflow: 'hidden',
    },
    heroContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#FFF',
        marginBottom: 4,
    },
    heroSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
    },
    heroIcon: {
        position: 'absolute',
        right: -20,
        bottom: -20,
    },
    contentPadding: {
        paddingHorizontal: 0,
        marginTop: -20,
    },
    content: {
        flex: 1,
    },
    pathContainer: {
        flex: 1,
    },
    pathContent: {
        paddingBottom: 40,
    },
    pathHeader: {
        padding: 24,
        alignItems: 'center',
    },
    pathTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.black,
        textAlign: 'center',
    },
    pathSubtitle: {
        fontSize: 14,
        color: colors.darkGray,
        textAlign: 'center',
        marginTop: 8,
    },
    road: {
        alignItems: 'center',
        marginTop: 20,
    },
    section: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 8,
    },
    subsectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
        marginTop: 8,
    },
    sectionDesc: {
        fontSize: 14,
        color: colors.darkGray,
        marginBottom: 24,
        lineHeight: 20,
    },
    itemCard: {
        padding: 16,
        marginBottom: 16,
    },
    itemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 12,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemName: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.black,
    },
    itemMeta: {
        fontSize: 12,
        color: colors.darkGray,
    },
    apyBadge: {
        backgroundColor: '#DCFCE7',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    apyText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#16A34A',
    },
    itemAction: {
        marginTop: 12,
    },
    progressContainer: {
        marginTop: 16,
        marginBottom: 16,
    },
    progressLabelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    progressValue: {
        fontSize: 12,
        color: colors.darkGray,
    },
    progressPercent: {
        fontSize: 12,
        fontWeight: '700',
        color: colors.primary,
    },
    progressBar: {
        height: 8,
        backgroundColor: colors.lightGray,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: colors.primary,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: colors.lightGray,
    },
    priceLabel: {
        fontSize: 12,
        color: colors.darkGray,
    },
    priceValue: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.black,
    }
});

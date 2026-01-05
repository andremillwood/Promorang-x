import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useGrowthStore, StakingChannel, FundingProject, ShieldPolicy } from '@/store/growthStore';
import { useAdvertiserStore, AdvertiserDrop } from '@/store/advertiserStore';
import { TabBar } from '@/components/ui/TabBar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { Zap, TrendingUp, Shield, HelpCircle, ArrowRight } from 'lucide-react-native';
import colors from '@/constants/colors';

export default function GrowthHubScreen() {
    const [activeTab, setActiveTab] = useState('staking');
    const [refreshing, setRefreshing] = useState(false);
    const { channels, fundingProjects, shieldPolicies, fetchChannels, fetchFunding, fetchShield, isLoading } = useGrowthStore();

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        if (activeTab === 'staking') await fetchChannels();
        else if (activeTab === 'funding') await fetchFunding();
        else if (activeTab === 'shield') await fetchShield();
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const tabs = [
        { key: 'staking', label: 'The Channel' },
        { key: 'funding', label: 'Kickstarter' },
        { key: 'shield', label: 'Shield' },
    ];

    const renderStaking = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Boost Your Content</Text>
            <Text style={styles.sectionDesc}>Stake gems in your favorite channels to increase visibility and earn rewards.</Text>

            {channels.map((channel: StakingChannel) => (
                <Card key={channel.id} style={styles.itemCard}>
                    <View style={styles.itemHeader}>
                        <View style={[styles.iconBox, { backgroundColor: '#FDE68A' }]}>
                            <TrendingUp size={20} color="#D97706" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.itemName}>{channel.name}</Text>
                            <Text style={styles.itemMeta}>{channel.description}</Text>
                        </View>
                        <View style={styles.apyBadge}>
                            <Text style={styles.apyText}>+{channel.apy}% APY</Text>
                        </View>
                    </View>
                    <Button title="Stake Gems" variant="outline" size="sm" style={styles.itemAction} onPress={() => { }} />
                </Card>
            ))}
        </View>
    );

    const renderFunding = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Community Funding</Text>
            <Text style={styles.sectionDesc}>Back promising creators and get exclusive rewards when they hit their targets.</Text>

            {fundingProjects.map((project: FundingProject) => (
                <Card key={project.id} style={styles.itemCard}>
                    <Text style={styles.itemName}>{project.title}</Text>
                    <Text style={styles.itemMeta} numberOfLines={2}>{project.description}</Text>
                    <View style={styles.progressContainer}>
                        <View style={styles.progressLabelRow}>
                            <Text style={styles.progressValue}>${project.current_amount} of ${project.target_amount}</Text>
                            <Text style={styles.progressPercent}>{Math.round((project.current_amount / project.target_amount) * 100)}%</Text>
                        </View>
                        <View style={styles.progressBar}>
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
            <Text style={styles.sectionTitle}>Social Protection</Text>
            <Text style={styles.sectionDesc}>Insure your account against shadowbans, removals, and platform changes.</Text>

            {shieldPolicies.map((policy: ShieldPolicy) => (
                <Card key={policy.id} style={styles.itemCard}>
                    <View style={styles.itemHeader}>
                        <View style={[styles.iconBox, { backgroundColor: '#DCFCE7' }]}>
                            <Shield size={20} color="#16A34A" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.itemName}>{policy.name}</Text>
                            <Text style={styles.itemMeta}>Coverage: {policy.coverage_amount} Gems</Text>
                        </View>
                    </View>
                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Premium</Text>
                        <Text style={styles.priceValue}>{policy.premium_amount} Gems / {policy.duration_days} days</Text>
                    </View>
                    <Button title="Subscribe" variant="primary" size="sm" onPress={() => { }} />
                </Card>
            ))}
        </View>
    );

    return (
        <View style={styles.container}>
            <TabBar
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                variant="underlined"
                containerStyle={styles.tabBar}
            />
            <ScrollView
                style={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {activeTab === 'staking' && renderStaking()}
                {activeTab === 'funding' && renderFunding()}
                {activeTab === 'shield' && renderShield()}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.gray,
    },
    tabBar: {
        backgroundColor: colors.white,
        elevation: 2,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    content: {
        flex: 1,
    },
    section: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.black,
        marginBottom: 8,
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

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Share, Clipboard } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Users, TrendingUp, DollarSign, Award, Copy, Share2, ChevronRight, Gift, Star, Crown, Medal, Zap, CheckCircle2 } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import { useAuthStore } from '@/store/authStore';
import { useThemeColors } from '@/hooks/useThemeColors';
import colors from '@/constants/colors';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { Card } from '@/components/ui/Card';
import { LinearGradient } from 'expo-linear-gradient';

const API_URL = 'https://promorang-api.vercel.app';

interface ReferralStats {
    summary: {
        total_referrals: number;
        active_referrals: number;
        pending_referrals: number;
        conversion_rate: string;
        total_earnings: {
            usd: number;
            gems: number;
            points: number;
        };
        referral_code: string;
        tier?: {
            tier_name: string;
            tier_level: number;
            commission_rate: number;
            badge_icon: string;
            badge_color: string;
        } | null;
    };
    referrals: any[];
    recent_commissions: any[];
}

interface ReferralTier {
    tier_name: string;
    tier_level: number;
    min_referrals: number;
    commission_rate: number;
    badge_icon: string;
    badge_color: string;
    perks: string[];
}

export default function ReferralDashboardScreen() {
    const router = useRouter();
    const theme = useThemeColors();
    const { token, user } = useAuthStore();

    const [stats, setStats] = useState<ReferralStats | null>(null);
    const [tiers, setTiers] = useState<ReferralTier[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showQR, setShowQR] = useState(false);

    const fetchReferralData = useCallback(async () => {
        if (!token) return;

        try {
            const [statsRes, tiersRes] = await Promise.all([
                fetch(`${API_URL}/api/referrals/stats`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${API_URL}/api/referrals/tiers`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            const statsData = await statsRes.json();
            const tiersData = await tiersRes.json();

            if (statsData.status === 'success' && statsData.data) {
                setStats(statsData.data);
            }
            if (tiersData.status === 'success' && tiersData.data?.tiers) {
                setTiers(tiersData.data.tiers);
            }
        } catch (error) {
            console.error('Error fetching referral data:', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, [token]);

    useEffect(() => {
        fetchReferralData();
    }, [fetchReferralData]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchReferralData();
    };

    const copyReferralCode = async () => {
        if (!stats?.summary.referral_code) return;
        
        try {
            await Clipboard.setString(stats.summary.referral_code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    const shareReferralLink = async () => {
        if (!stats?.summary.referral_code) return;

        const shareUrl = `https://promorang.com/signup?ref=${stats.summary.referral_code}`;
        
        try {
            await Share.share({
                message: `Join me on Promorang and earn rewards! Use my referral code: ${stats.summary.referral_code}\n\n${shareUrl}`,
                url: shareUrl,
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const getTierIcon = (tierLevel: number) => {
        switch (tierLevel) {
            case 1: return <Medal size={20} color="#CD7F32" />;
            case 2: return <Medal size={20} color="#C0C0C0" />;
            case 3: return <Crown size={20} color="#FFD700" />;
            case 4: return <Star size={20} color="#8B5CF6" />;
            default: return <Award size={20} color={colors.primary} />;
        }
    };

    if (isLoading) {
        return <LoadingIndicator fullScreen text="Loading referral data..." />;
    }

    const referralCode = stats?.summary.referral_code || 'LOADING...';
    const shareUrl = `https://promorang.com/signup?ref=${referralCode}`;

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen
                options={{
                    title: 'Referrals',
                    headerStyle: { backgroundColor: theme.background },
                    headerTitleStyle: { color: theme.text, fontWeight: '700' },
                }}
            />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={colors.primary}
                    />
                }
            >
                {/* Header Card */}
                <LinearGradient
                    colors={['#8B5CF6', '#EC4899']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.headerCard}
                >
                    <View style={styles.headerTop}>
                        <View>
                            <Text style={styles.headerTitle}>Invite & Earn</Text>
                            <Text style={styles.headerSubtitle}>
                                Earn up to {((stats?.summary.tier?.commission_rate || 0.05) * 100).toFixed(0)}% commission on referrals
                            </Text>
                        </View>
                        {stats?.summary.tier && (
                            <View style={[styles.tierBadge, { backgroundColor: stats.summary.tier.badge_color }]}>
                                <Text style={styles.tierBadgeIcon}>{stats.summary.tier.badge_icon}</Text>
                                <Text style={styles.tierBadgeText}>{stats.summary.tier.tier_name}</Text>
                            </View>
                        )}
                    </View>

                    {/* Referral Code */}
                    <View style={styles.codeContainer}>
                        <Text style={styles.codeLabel}>Your Referral Code</Text>
                        <View style={styles.codeBox}>
                            <Text style={styles.codeText}>{referralCode}</Text>
                            <TouchableOpacity onPress={copyReferralCode} style={styles.copyButton}>
                                {copied ? (
                                    <CheckCircle2 size={20} color="#10B981" />
                                ) : (
                                    <Copy size={20} color="#FFF" />
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionButtons}>
                        <TouchableOpacity style={styles.actionButton} onPress={shareReferralLink}>
                            <Share2 size={18} color="#8B5CF6" />
                            <Text style={styles.actionButtonText}>Share Link</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton} onPress={() => setShowQR(!showQR)}>
                            <Zap size={18} color="#8B5CF6" />
                            <Text style={styles.actionButtonText}>{showQR ? 'Hide QR' : 'Show QR'}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* QR Code */}
                    {showQR && (
                        <View style={styles.qrContainer}>
                            <QRCode
                                value={shareUrl}
                                size={160}
                                color="#1F2937"
                                backgroundColor="#FFFFFF"
                            />
                            <Text style={styles.qrHint}>Scan to join with your code</Text>
                        </View>
                    )}
                </LinearGradient>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <Card style={styles.statCard}>
                        <Users size={24} color="#3B82F6" />
                        <Text style={[styles.statValue, { color: theme.text }]}>
                            {stats?.summary.total_referrals || 0}
                        </Text>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Referrals</Text>
                    </Card>
                    <Card style={styles.statCard}>
                        <TrendingUp size={24} color="#10B981" />
                        <Text style={[styles.statValue, { color: theme.text }]}>
                            {stats?.summary.active_referrals || 0}
                        </Text>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Active</Text>
                    </Card>
                    <Card style={styles.statCard}>
                        <DollarSign size={24} color="#F59E0B" />
                        <Text style={[styles.statValue, { color: theme.text }]}>
                            ${(stats?.summary.total_earnings?.usd || 0).toFixed(2)}
                        </Text>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Earned</Text>
                    </Card>
                    <Card style={styles.statCard}>
                        <Gift size={24} color="#8B5CF6" />
                        <Text style={[styles.statValue, { color: theme.text }]}>
                            {stats?.summary.total_earnings?.gems || 0}
                        </Text>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Gems</Text>
                    </Card>
                </View>

                {/* Conversion Rate */}
                <Card style={styles.conversionCard}>
                    <View style={styles.conversionHeader}>
                        <Text style={[styles.conversionTitle, { color: theme.text }]}>Conversion Rate</Text>
                        <Text style={styles.conversionValue}>{stats?.summary.conversion_rate || '0'}%</Text>
                    </View>
                    <View style={styles.conversionBar}>
                        <View 
                            style={[
                                styles.conversionFill, 
                                { width: `${Math.min(parseFloat(stats?.summary.conversion_rate || '0'), 100)}%` }
                            ]} 
                        />
                    </View>
                    <Text style={[styles.conversionHint, { color: theme.textSecondary }]}>
                        {stats?.summary.pending_referrals || 0} pending signups
                    </Text>
                </Card>

                {/* Tier Progress */}
                <TouchableOpacity 
                    style={[styles.tierProgressCard, { backgroundColor: theme.card }]}
                    onPress={() => router.push('/referrals/tiers' as any)}
                >
                    <View style={styles.tierProgressHeader}>
                        <View style={styles.tierProgressLeft}>
                            {getTierIcon(stats?.summary.tier?.tier_level || 1)}
                            <View>
                                <Text style={[styles.tierProgressTitle, { color: theme.text }]}>
                                    {stats?.summary.tier?.tier_name || 'Bronze'} Tier
                                </Text>
                                <Text style={[styles.tierProgressSubtitle, { color: theme.textSecondary }]}>
                                    {((stats?.summary.tier?.commission_rate || 0.05) * 100).toFixed(0)}% commission rate
                                </Text>
                            </View>
                        </View>
                        <ChevronRight size={20} color={theme.textSecondary} />
                    </View>
                    <Text style={[styles.tierProgressHint, { color: colors.primary }]}>
                        View all tiers & perks →
                    </Text>
                </TouchableOpacity>

                {/* Recent Referrals */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Referrals</Text>
                        <TouchableOpacity onPress={() => router.push('/referrals/list' as any)}>
                            <Text style={styles.sectionLink}>View All</Text>
                        </TouchableOpacity>
                    </View>

                    {stats?.referrals && stats.referrals.length > 0 ? (
                        stats.referrals.slice(0, 5).map((referral, index) => (
                            <Card key={referral.id || index} style={styles.referralItem}>
                                <View style={styles.referralAvatar}>
                                    <Text style={styles.referralAvatarText}>
                                        {referral.users?.display_name?.[0] || 'U'}
                                    </Text>
                                </View>
                                <View style={styles.referralInfo}>
                                    <Text style={[styles.referralName, { color: theme.text }]}>
                                        {referral.users?.display_name || 'Anonymous'}
                                    </Text>
                                    <Text style={[styles.referralDate, { color: theme.textSecondary }]}>
                                        Joined {new Date(referral.created_at).toLocaleDateString()}
                                    </Text>
                                </View>
                                <View style={[
                                    styles.referralStatus,
                                    { backgroundColor: referral.status === 'active' ? '#10B98120' : '#F59E0B20' }
                                ]}>
                                    <Text style={[
                                        styles.referralStatusText,
                                        { color: referral.status === 'active' ? '#10B981' : '#F59E0B' }
                                    ]}>
                                        {referral.status}
                                    </Text>
                                </View>
                            </Card>
                        ))
                    ) : (
                        <Card style={styles.emptyReferrals}>
                            <Users size={40} color={theme.textSecondary} style={{ opacity: 0.3 }} />
                            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                                No referrals yet. Share your code to start earning!
                            </Text>
                        </Card>
                    )}
                </View>

                {/* How It Works */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>How It Works</Text>
                    <Card style={styles.howItWorksCard}>
                        {[
                            { step: '1', title: 'Share Your Code', desc: 'Send your unique referral code to friends' },
                            { step: '2', title: 'They Sign Up', desc: 'Friends join using your referral link' },
                            { step: '3', title: 'Earn Rewards', desc: 'Get gems & cash when they complete actions' },
                        ].map((item, index) => (
                            <View key={index} style={styles.howItWorksItem}>
                                <View style={styles.howItWorksStep}>
                                    <Text style={styles.howItWorksStepText}>{item.step}</Text>
                                </View>
                                <View style={styles.howItWorksContent}>
                                    <Text style={[styles.howItWorksTitle, { color: theme.text }]}>{item.title}</Text>
                                    <Text style={[styles.howItWorksDesc, { color: theme.textSecondary }]}>{item.desc}</Text>
                                </View>
                            </View>
                        ))}
                    </Card>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 100,
    },
    headerCard: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#FFF',
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 4,
    },
    tierBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 4,
    },
    tierBadgeIcon: {
        fontSize: 14,
    },
    tierBadgeText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '700',
    },
    codeContainer: {
        marginBottom: 16,
    },
    codeLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    codeBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    codeText: {
        flex: 1,
        color: '#FFF',
        fontSize: 20,
        fontWeight: '800',
        letterSpacing: 2,
        fontFamily: 'monospace',
    },
    copyButton: {
        padding: 8,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    actionButtonText: {
        color: '#8B5CF6',
        fontSize: 14,
        fontWeight: '700',
    },
    qrContainer: {
        alignItems: 'center',
        marginTop: 20,
        padding: 16,
        backgroundColor: '#FFF',
        borderRadius: 16,
    },
    qrHint: {
        marginTop: 12,
        fontSize: 12,
        color: '#6B7280',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 16,
    },
    statCard: {
        flex: 1,
        minWidth: '45%',
        padding: 16,
        alignItems: 'center',
        borderRadius: 16,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '800',
        marginTop: 8,
    },
    statLabel: {
        fontSize: 12,
        marginTop: 4,
    },
    conversionCard: {
        padding: 16,
        marginBottom: 16,
    },
    conversionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    conversionTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    conversionValue: {
        fontSize: 20,
        fontWeight: '800',
        color: colors.primary,
    },
    conversionBar: {
        height: 8,
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
        overflow: 'hidden',
    },
    conversionFill: {
        height: '100%',
        backgroundColor: colors.primary,
        borderRadius: 4,
    },
    conversionHint: {
        fontSize: 12,
        marginTop: 8,
    },
    tierProgressCard: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
    },
    tierProgressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    tierProgressLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    tierProgressTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    tierProgressSubtitle: {
        fontSize: 13,
        marginTop: 2,
    },
    tierProgressHint: {
        fontSize: 13,
        fontWeight: '600',
        marginTop: 12,
    },
    section: {
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    sectionLink: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.primary,
    },
    referralItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        marginBottom: 8,
    },
    referralAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    referralAvatarText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    referralInfo: {
        flex: 1,
    },
    referralName: {
        fontSize: 15,
        fontWeight: '600',
    },
    referralDate: {
        fontSize: 12,
        marginTop: 2,
    },
    referralStatus: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    referralStatusText: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    emptyReferrals: {
        padding: 30,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 12,
    },
    howItWorksCard: {
        padding: 16,
    },
    howItWorksItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    howItWorksStep: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    howItWorksStepText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '800',
    },
    howItWorksContent: {
        flex: 1,
    },
    howItWorksTitle: {
        fontSize: 15,
        fontWeight: '700',
    },
    howItWorksDesc: {
        fontSize: 13,
        marginTop: 2,
    },
});

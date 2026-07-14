import { StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
    ACTIVATION_REVIEW_NEXT_DECISIONS,
    ACTIVATION_REVIEW_SUMMARY,
    STAKEHOLDER_RETURN_BLUEPRINTS,
    STAKEHOLDER_RETURN_METRICS,
    type StakeholderReturnMetricId,
    type StakeholderReturnRole,
} from '@promorang/shared';
import { Text, View } from '@/components/Themed';
import { Colors as DesignColors, Typography, Spacing } from '@/constants/DesignTokens';
import { useColorScheme } from '@/components/useColorScheme';
import { LinearGradient } from 'expo-linear-gradient';

import { useUserBalance } from '@/hooks/useEconomy';
import { useStakeholderReturn } from '@/hooks/useStakeholderReturn';
import { useAuth } from '@/context/AuthContext';

import { useRouter } from 'expo-router';
import { ProductTour } from '@/components/ProductTour';
import { InfoTooltip } from '@/components/InfoTooltip';

type IconName = keyof typeof Ionicons.glyphMap;
type BalanceLike = { points?: number; promokeys?: number; gems?: number } | null;
type RoleViewProps = { isDark: boolean };
type ParticipantViewProps = RoleViewProps & { balance: BalanceLike; gemProgressPercent: number };

export default function DashboardScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { user, activeRole, roles } = useAuth();
    const { balance } = useUserBalance();
    const router = useRouter();

    const gemsToNextValueMarker = 250;
    const currentGemProgress = balance ? ((balance.gems || 0) % gemsToNextValueMarker) : 0;
    const gemProgressPercent = (currentGemProgress / gemsToNextValueMarker) * 100;

    const renderRoleDashboard = () => {
        switch (activeRole) {
            case 'brand':
                return <BrandDashboardView isDark={isDark} />;
            case 'agency':
                return <BrandDashboardView isDark={isDark} />;
            case 'merchant':
                return <MerchantDashboardView isDark={isDark} />;
            case 'host':
                return <HostDashboardView isDark={isDark} />;
            case 'creator':
                return <ParticipantDashboardView balance={balance} gemProgressPercent={gemProgressPercent} isDark={isDark} />;
            default:
                return (
                    <ParticipantDashboardView
                        balance={balance}
                        gemProgressPercent={gemProgressPercent}
                        isDark={isDark}
                    />
                );
        }
    };

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: isDark ? DesignColors.black : DesignColors.gray[50] }]}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
        >
            {/* Premium Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.greeting}>Welcome back,</Text>
                        <Text style={styles.userName}>
                            {user?.user_metadata?.full_name?.split(" ")[0] || "Explorer"}
                        </Text>
                    </View>
                    <Pressable
                        onPress={() => router.push('/modal')}
                        style={[styles.avatarContainer, { borderColor: DesignColors.primary }]}
                    >
                        <Ionicons name="person" size={24} color={DesignColors.primary} />
                        {roles.length > 1 && (
                            <View style={styles.roleBadge}>
                                <Ionicons name="repeat" size={8} color="white" />
                            </View>
                        )}
                    </Pressable>
                </View>

                {renderRoleDashboard()}
            </View>

            <View style={{ height: 100 }} />

            {/* Product Tour */}
            <ProductTour tourId="dashboard" autoStart={true} />
        </ScrollView>
    );
}

/**
 * PARTICIPANT VIEW
 */
function ParticipantDashboardView({ balance, gemProgressPercent, isDark }: ParticipantViewProps) {
    const router = useRouter();
    const availableGems = balance?.gems || 0;
    const accessSignals = balance?.promokeys || 0;
    return (
        <View style={{ gap: 24 }}>
            {/* Economic Tracks */}
            <View style={{ gap: 12 }}>
                <LinearGradient
                    colors={[isDark ? DesignColors.gray[900] : 'white', isDark ? DesignColors.black : DesignColors.gray[50]]}
                    style={styles.rankCard}
                >
                    <View style={styles.rankHeader}>
                        <View style={styles.rankIcon}>
                            <Ionicons name="trending-up" size={16} color={DesignColors.primary} />
                        </View>
                        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'transparent' }}>
                            <Text style={styles.rankTitle}>Consistency Rank</Text>
                            <InfoTooltip content="Your rank grows when your check-ins, proof, and participation are verified. Higher ranks can unlock better access." />
                        </View>
                        <View style={{ alignItems: 'flex-end', backgroundColor: 'transparent' }}>
                            <Text style={styles.rankPercent}>25%</Text>
                        </View>
                    </View>
                    <View style={styles.progressBarBg}>
                        <LinearGradient
                            colors={[DesignColors.primary, DesignColors.accent]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{ width: '25%', height: '100%', borderRadius: 4 }}
                        />
                    </View>
                </LinearGradient>

                <LinearGradient
                    colors={[isDark ? DesignColors.gray[900] : 'white', isDark ? DesignColors.black : DesignColors.gray[50]]}
                    style={styles.rankCard}
                >
                    <View style={styles.rankHeader}>
                        <View style={[styles.rankIcon, { backgroundColor: '#F59E0B20' }]}>
                            <Ionicons name="diamond" size={16} color="#F59E0B" />
                        </View>
                        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'transparent' }}>
                            <Text style={styles.rankTitle}>Gem Progress</Text>
                            <InfoTooltip content="Gems are your platform value. They can secure access, rewards, creator work, and eligible payouts." />
                        </View>
                        <View style={{ alignItems: 'flex-end', backgroundColor: 'transparent' }}>
                            <Text style={[styles.rankPercent, { color: '#F59E0B' }]}>{Math.round(gemProgressPercent)}%</Text>
                        </View>
                    </View>
                    <View style={styles.progressBarBg}>
                        <LinearGradient
                            colors={['#FCD34D', '#F59E0B']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{ width: `${gemProgressPercent}%`, height: '100%', borderRadius: 4 }}
                        />
                    </View>
                </LinearGradient>
            </View>

            {/* Unlock Hosting (Promotional Card) */}
            <Pressable
                onPress={() => router.push('/dashboard/host-application')}
                style={{ overflow: 'hidden', borderRadius: 12 }}
            >
                <LinearGradient
                    colors={['#8B5CF6', '#6D28D9']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                >
                    <View style={{ flex: 1 }}>
                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Start hosting moments</Text>
                        <Text style={{ color: '#E9D5FF', fontSize: 13, marginTop: 4 }}>
                            Create moments, verify turnout, and build your community.
                        </Text>
                    </View>
                    <View style={{ backgroundColor: 'white', padding: 8, borderRadius: 20 }}>
                        <Ionicons name="arrow-forward" size={20} color="#6D28D9" />
                    </View>
                </LinearGradient>
            </Pressable>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
                {[
                    { label: 'Gems', value: availableGems.toLocaleString(), icon: 'diamond', color: '#F59E0B' },
                    { label: 'Access', value: accessSignals.toString(), icon: 'shield-checkmark', color: DesignColors.primary },
                    { label: 'Check-ins', value: '8', icon: 'location', color: '#10B981' },
                    { label: 'This month', value: '3', icon: 'time', color: '#8B5CF6' },
                ].map((stat, i) => (
                    <View key={i} style={[styles.statCard, { backgroundColor: isDark ? DesignColors.gray[900] : 'white' }]}>
                        <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
                            <Ionicons name={stat.icon as IconName} size={16} color={stat.color} />
                        </View>
                        <Text style={[styles.statValue, { color: isDark ? 'white' : DesignColors.gray[900] }]}>{stat.value}</Text>
                        <Text style={styles.statLabel}>{stat.label}</Text>
                    </View>
                ))}
            </View>

            <MobileReturnCard role="participant" isDark={isDark} />

            {/* Content Tabs */}
            <View style={{ marginTop: 12 }}>
                <View style={styles.tabsRow}>
                    <Text style={[styles.tabActive, { borderBottomColor: DesignColors.primary, color: isDark ? 'white' : 'black' }]}>MY MOMENTS</Text>
                    <Text style={styles.tabInactive}>PROPOSALS</Text>
                    <Text style={styles.tabInactive}>SAVED</Text>
                </View>

                <View style={styles.grid}>
                    <View style={[styles.emptyState, { backgroundColor: isDark ? DesignColors.gray[900] : 'white' }]}>
                        <Ionicons name="camera-outline" size={48} color={DesignColors.gray[400]} style={{ marginBottom: 16 }} />
                        <Text style={[styles.emptyTitle, { color: isDark ? 'white' : DesignColors.gray[900] }]}>Build your record</Text>
                        <Text style={styles.emptyDesc}>Join moments and verify your attendance to fill this gallery.</Text>
                    </View>
                </View>
            </View>
        </View >
    );
}

/**
 * BRAND VIEW
 */
function BrandDashboardView({ isDark }: RoleViewProps) {
    const router = useRouter();
    return (
        <View style={{ gap: 24 }}>
            {/* Quick Actions */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
                <Pressable
                    onPress={() => router.push('/catalog')}
                    style={[styles.actionButton, { backgroundColor: isDark ? DesignColors.gray[900] : 'white' }]}
                >
                    <Ionicons name="storefront-outline" size={24} color={DesignColors.primary} />
                    <Text style={[styles.actionButtonText, { color: isDark ? 'white' : DesignColors.gray[900] }]}>Catalog</Text>
                </Pressable>
                <Pressable
                    onPress={() => router.push('/proposals')}
                    style={[styles.actionButton, { backgroundColor: isDark ? DesignColors.gray[900] : 'white' }]}
                >
                    <Ionicons name="document-text-outline" size={24} color={DesignColors.accent} />
                    <Text style={[styles.actionButtonText, { color: isDark ? 'white' : DesignColors.gray[900] }]}>Proposals</Text>
                </Pressable>
            </View>

            <MobileReturnCard role="brand" isDark={isDark} />

            <View style={styles.statsGrid}>
                {[
                    { label: 'Gems funded', value: '0', icon: 'diamond', color: DesignColors.primary },
                    { label: 'Access impact', value: '0', icon: 'shield-checkmark', color: '#F59E0B' },
                ].map((stat, i) => (
                    <View key={i} style={[styles.statCard, { backgroundColor: isDark ? DesignColors.gray[900] : 'white' }]}>
                        <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
                            <Ionicons name={stat.icon as IconName} size={16} color={stat.color} />
                        </View>
                        <Text style={[styles.statValue, { color: isDark ? 'white' : DesignColors.gray[900] }]}>{stat.value}</Text>
                        <Text style={styles.statLabel}>{stat.label}</Text>
                    </View>
                ))}
            </View>
            <View style={[styles.emptyState, { backgroundColor: isDark ? DesignColors.gray[900] : 'white' }]}>
                <Ionicons name="analytics" size={48} color={DesignColors.primary} style={{ marginBottom: 16 }} />
                <Text style={[styles.emptyTitle, { color: isDark ? 'white' : DesignColors.gray[900] }]}>Campaign movement</Text>
                <Text style={styles.emptyDesc}>Activate your first sponsorship to see visits, content, and rewards in one place.</Text>
            </View>
        </View>
    );
}

/**
 * MERCHANT VIEW
 */
function MerchantDashboardView({ isDark }: RoleViewProps) {
    return (
        <View style={{ gap: 24 }}>
            <MobileReturnCard role="merchant" isDark={isDark} />

            <View style={styles.statsGrid}>
                {[
                    { label: 'Venue Yield', value: '4.2x', icon: 'trending-up', color: '#10B981' },
                    { label: 'Check-ins', value: '890', icon: 'location', color: DesignColors.primary },
                ].map((stat, i) => (
                    <View key={i} style={[styles.statCard, { backgroundColor: isDark ? DesignColors.gray[900] : 'white' }]}>
                        <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
                            <Ionicons name={stat.icon as IconName} size={16} color={stat.color} />
                        </View>
                        <Text style={[styles.statValue, { color: isDark ? 'white' : DesignColors.gray[900] }]}>{stat.value}</Text>
                        <Text style={styles.statLabel}>{stat.label}</Text>
                    </View>
                ))}
            </View>
            <View style={[styles.emptyState, { backgroundColor: isDark ? DesignColors.gray[900] : 'white' }]}>
                <Ionicons name="storefront" size={48} color="#10B981" style={{ marginBottom: 16 }} />
                <Text style={[styles.emptyTitle, { color: isDark ? 'white' : DesignColors.gray[900] }]}>Venue Insights</Text>
                <Text style={styles.emptyDesc}>Connect your venues to track foot traffic and yield.</Text>
            </View>
        </View>
    );
}

/**
 * HOST VIEW
 */
function HostDashboardView({ isDark }: RoleViewProps) {
    const router = useRouter();
    const { balance } = useUserBalance();

    const gems = balance?.gems || 0;
    return (
        <View style={{ gap: 24 }}>
            {/* Quick Actions */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
                <Pressable
                    onPress={() => router.push('/catalog')}
                    style={[styles.actionButton, { backgroundColor: isDark ? DesignColors.gray[900] : 'white' }]}
                >
                    <Ionicons name="briefcase-outline" size={24} color={DesignColors.primary} />
                    <Text style={[styles.actionButtonText, { color: isDark ? 'white' : DesignColors.gray[900] }]}>Services</Text>
                </Pressable>
                <Pressable
                    onPress={() => router.push('/proposals')}
                    style={[styles.actionButton, { backgroundColor: isDark ? DesignColors.gray[900] : 'white' }]}
                >
                    <Ionicons name="paper-plane-outline" size={24} color={DesignColors.accent} />
                    <Text style={[styles.actionButtonText, { color: isDark ? 'white' : DesignColors.gray[900] }]}>Proposals</Text>
                </Pressable>
            </View>

            {/* Wallet Section */}
            <View style={[styles.statCard, { backgroundColor: isDark ? DesignColors.gray[900] : 'white', flexDirection: 'column', alignItems: 'flex-start', padding: 20 }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: 10 }}>
                    <View>
                        <Text style={styles.statLabel}>Wallet Balance</Text>
                        <Text style={[styles.statValue, { fontSize: 32, color: isDark ? 'white' : DesignColors.gray[900] }]}>{gems.toLocaleString()} Gems</Text>
                        <Text style={{ color: DesignColors.gray[500], fontSize: 12 }}>US${gems.toFixed(2)} platform value · available for eligible payouts</Text>
                    </View>
                    <View style={[styles.statIcon, { backgroundColor: DesignColors.success + '20', width: 48, height: 48 }]}>
                        <Ionicons name="wallet" size={24} color={DesignColors.success} />
                    </View>
                </View>

                <Pressable
                    style={{
                        backgroundColor: DesignColors.black,
                        paddingVertical: 10,
                        paddingHorizontal: 16,
                        borderRadius: 8,
                        width: '100%',
                        alignItems: 'center',
                        marginTop: 4
                    }}
                    onPress={() => router.push('/dashboard/payouts')}
                >
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Manage Gems</Text>
                </Pressable>
            </View>

            <MobileReturnCard role="host" isDark={isDark} />

            <View style={styles.statsGrid}>
                {[
                    { label: 'Host Rank', value: '—', icon: 'ribbon', color: '#F59E0B' },
                    { label: 'Gems earned', value: gems.toLocaleString(), icon: 'diamond', color: DesignColors.primary },
                ].map((stat, i) => (
                    <View key={i} style={[styles.statCard, { backgroundColor: isDark ? DesignColors.gray[900] : 'white' }]}>
                        <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
                            <Ionicons name={stat.icon as IconName} size={16} color={stat.color} />
                        </View>
                        <Text style={[styles.statValue, { color: isDark ? 'white' : DesignColors.gray[900] }]}>{stat.value}</Text>
                        <Text style={styles.statLabel}>{stat.label}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

function MobileReturnCard({ role, isDark }: { role: Extract<StakeholderReturnRole, 'participant' | 'brand' | 'merchant' | 'host'>; isDark: boolean }) {
    const { data, loading } = useStakeholderReturn();
    const blueprint = STAKEHOLDER_RETURN_BLUEPRINTS[role];
    const metricValue: Record<StakeholderReturnMetricId, number> = {
        accessOpened: data.accessCount,
        gemsEarned: data.gemsEarned,
        doorsOpened: data.accessCount,
        peopleAroundIt: data.people,
        visitsMoved: data.people,
        returns: data.returns,
        redemptions: data.redemptions,
        valueMoved: data.grossValue,
        peopleReached: data.people,
        storiesCreated: data.stories,
        collaborations: data.collaborations,
        gemsMoved: Math.max(data.gemsEarned, data.grossValue),
    };
    const metrics = blueprint.metrics.slice(0, 3).map((id) => ({ ...STAKEHOLDER_RETURN_METRICS[id], value: metricValue[id] }));

    return (
        <View style={[styles.returnCard, { backgroundColor: isDark ? DesignColors.gray[900] : 'white' }]}>
            <View style={styles.returnHead}>
                <View style={styles.returnIcon}><Ionicons name="sparkles" size={17} color={DesignColors.primary} /></View>
                <View style={{ flex: 1, backgroundColor: 'transparent' }}>
                    <Text style={styles.returnEyebrow}>{blueprint.title.toUpperCase()}</Text>
                    <Text style={[styles.returnTitle, { color: isDark ? 'white' : DesignColors.gray[900] }]}>{blueprint.headline}</Text>
                </View>
            </View>
            <Text style={styles.returnBody}>{data.summary || 'As Moments are reviewed, your human and commercial return will collect here in plain language.'}</Text>
            {!!(data.participantValue || data.contentReturn || data.gemsReturn || data.sceneLearning) && (
                <View style={styles.signalStack}>
                    {!!data.participantValue && <ReturnSignal label="PARTICIPANT VALUE" value={data.participantValue} />}
                    {!!data.contentReturn && <ReturnSignal label="CONTENT RETURN" value={data.contentReturn} />}
                    {!!data.gemsReturn && <ReturnSignal label="GEMS MOVED" value={data.gemsReturn} />}
                    {!!data.sceneLearning && <ReturnSignal label="SCENE LEARNING" value={data.sceneLearning} />}
                </View>
            )}
            <View style={styles.nextDecisionBox}>
                <Text style={styles.returnStatementLabel}>{data.nextDecision ? `NEXT DECISION: ${data.nextDecision.toUpperCase()}` : ACTIVATION_REVIEW_SUMMARY.cta.toUpperCase()}</Text>
                <Text style={styles.returnStatementText}>{data.nextDecisionNote || 'Every reviewed Moment should help decide whether to repeat, improve, invite, fund, or close.'}</Text>
                <View style={styles.nextDecisionRow}>
                    {ACTIVATION_REVIEW_NEXT_DECISIONS.map((decision) => (
                        <View key={decision.id} style={styles.nextDecisionPill}>
                            <Text style={styles.nextDecisionText}>{decision.label}</Text>
                        </View>
                    ))}
                </View>
            </View>
            <View style={styles.returnStatement}>
                <Text style={styles.returnStatementLabel}>SOCIAL RETURN</Text>
                <Text style={styles.returnStatementText}>{blueprint.socialReturn}</Text>
            </View>
            <View style={styles.returnStatement}>
                <Text style={styles.returnStatementLabel}>COMMERCIAL RETURN</Text>
                <Text style={styles.returnStatementText}>{blueprint.commercialReturn}</Text>
            </View>
            <View style={styles.returnMetrics}>
                {metrics.map((metric) => (
                    <View key={metric.id} style={styles.returnMetric}>
                        <Text style={[styles.returnMetricValue, { color: isDark ? 'white' : DesignColors.gray[900] }]}>{loading ? '...' : Number(metric.value || 0).toLocaleString()}</Text>
                        <Text style={styles.returnMetricLabel}>{metric.label}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

function ReturnSignal({ label, value }: { label: string; value: string }) {
    return (
        <View style={styles.returnSignal}>
            <Text style={styles.returnStatementLabel}>{label}</Text>
            <Text style={styles.returnStatementText}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        padding: Spacing.container,
    },
    header: {
        marginTop: Platform.OS === 'ios' ? 60 : 40,
        marginBottom: Spacing.xl,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    greeting: {
        fontSize: Typography.sizes.sm,
        color: DesignColors.gray[500],
        marginBottom: 4,
    },
    userName: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    avatarContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: DesignColors.primary + '10',
    },
    roleBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: DesignColors.primary,
        width: 18,
        height: 18,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'white',
    },
    rankCard: {
        padding: 16,
        borderRadius: 24,
        marginBottom: Spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    rankHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    rankIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: DesignColors.primary + '20',
        alignItems: 'center',
        justifyContent: 'center',
    },
    rankTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
        color: DesignColors.gray[500],
        marginBottom: 2,
    },
    rankLevel: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    rankPercent: {
        fontSize: 16,
        fontWeight: 'bold',
        color: DesignColors.primary,
    },
    progressBarBg: {
        height: 6,
        backgroundColor: DesignColors.gray[200],
        borderRadius: 4,
        overflow: 'hidden',
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    statCard: {
        flex: 1,
        padding: 12,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 1,
    },
    statIcon: {
        width: 32,
        height: 32,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 10,
        color: DesignColors.gray[500],
        textTransform: 'uppercase',
        fontWeight: 'bold',
    },
    tabsRow: {
        flexDirection: 'row',
        gap: 24,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: DesignColors.gray[200],
        marginBottom: 24,
    },
    tabActive: {
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1,
        paddingBottom: 12,
        borderBottomWidth: 2,
        marginBottom: -13,
    },
    tabInactive: {
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1,
        color: DesignColors.gray[400],
    },
    grid: {
        minHeight: 200,
    },
    emptyState: {
        padding: 40,
        borderRadius: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        borderStyle: 'dashed',
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    emptyDesc: {
        fontSize: 14,
        color: DesignColors.gray[500],
        textAlign: 'center',
        lineHeight: 20,
    },
    actionButton: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    actionButtonText: {
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    returnCard: {
        padding: 16,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: DesignColors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    returnHead: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    returnIcon: {
        width: 38,
        height: 38,
        borderRadius: 13,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,106,26,.12)',
        marginRight: 10,
    },
    returnEyebrow: {
        color: DesignColors.primary,
        fontFamily: 'SpaceMono',
        fontSize: 7,
        letterSpacing: .6,
    },
    returnTitle: {
        fontSize: 15,
        fontWeight: '900',
        marginTop: 2,
    },
    returnBody: {
        color: DesignColors.gray[500],
        fontSize: 9,
        lineHeight: 15,
        marginTop: 12,
    },
    returnStatement: {
        marginTop: 10,
        padding: 11,
        borderRadius: 13,
        backgroundColor: 'rgba(255,255,255,.04)',
        borderWidth: 1,
        borderColor: DesignColors.border,
    },
    returnStatementLabel: {
        color: DesignColors.primary,
        fontFamily: 'SpaceMono',
        fontSize: 6.5,
        letterSpacing: .5,
    },
    returnStatementText: {
        color: DesignColors.gray[400],
        fontSize: 8.5,
        lineHeight: 14,
        marginTop: 5,
    },
    signalStack: {
        gap: 7,
        marginTop: 10,
        backgroundColor: 'transparent',
    },
    returnSignal: {
        padding: 10,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,.035)',
        borderWidth: 1,
        borderColor: DesignColors.border,
    },
    nextDecisionBox: {
        marginTop: 10,
        padding: 11,
        borderRadius: 13,
        backgroundColor: 'rgba(255,106,26,.07)',
        borderWidth: 1,
        borderColor: 'rgba(255,106,26,.16)',
    },
    nextDecisionRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginTop: 9,
        backgroundColor: 'transparent',
    },
    nextDecisionPill: {
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderRadius: 99,
        backgroundColor: 'rgba(0,0,0,.18)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,.08)',
    },
    nextDecisionText: {
        color: DesignColors.primary,
        fontFamily: 'SpaceMono',
        fontSize: 6.5,
        letterSpacing: .4,
        textTransform: 'uppercase',
    },
    returnMetrics: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 13,
        backgroundColor: 'transparent',
    },
    returnMetric: {
        flex: 1,
        padding: 10,
        borderRadius: 13,
        backgroundColor: 'rgba(255,255,255,.04)',
        borderWidth: 1,
        borderColor: DesignColors.border,
    },
    returnMetricValue: {
        fontSize: 15,
        fontWeight: '900',
    },
    returnMetricLabel: {
        color: DesignColors.gray[500],
        fontSize: 7,
        fontWeight: '800',
        textTransform: 'uppercase',
        marginTop: 3,
    }
});

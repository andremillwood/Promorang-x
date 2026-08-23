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
import { StreakStatusHeader } from '@/components/gamification/StreakStatusHeader';
import { DealStoryPlayer, StoryItem } from '@/components/stories/DealStoryPlayer';
import { CameraMomentScanner } from '@/components/camera/CameraMomentScanner';
import { PromoHeatmapView } from '@/components/map/PromoHeatmapView';
import { useState } from 'react';
type BalanceLike = { points?: number; promokeys?: number; gems?: number } | null;
type RoleViewProps = { isDark: boolean };
type ParticipantViewProps = RoleViewProps & { balance: BalanceLike };

export default function DashboardScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { user, activeRole, roles } = useAuth();
    const { balance } = useUserBalance();
    const router = useRouter();

    const [storyVisible, setStoryVisible] = useState(false);
    const [cameraVisible, setCameraVisible] = useState(false);

    const sampleStories: StoryItem[] = [
        {
            id: 's1',
            merchantName: 'Downtown Coffee Co.',
            merchantLogo: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=100',
            mediaUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800',
            dealTitle: 'Free Artisan Pastry w/ Cold Brew',
            dealDiscount: '20% OFF',
            expiresIn: '3h 15m',
        },
        {
            id: 's2',
            merchantName: 'Pulse Fitness Studio',
            merchantLogo: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=100',
            mediaUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800',
            dealTitle: 'VIP Pass Drop - First HIIT Session',
            dealDiscount: '50% OFF',
            expiresIn: '5h 40m',
        },
    ];

    const renderRoleDashboard = () => {
        switch (activeRole) {
            case 'brand':
                return <BrandDashboardView isDark={isDark} />;
            case 'agency':
                return <AgencyDashboardView isDark={isDark} />;
            case 'merchant':
                return <MerchantDashboardView isDark={isDark} />;
            case 'host':
                return <HostDashboardView isDark={isDark} />;
            case 'creator':
                return <CreatorDashboardView balance={balance} isDark={isDark} />;
            case 'admin':
                return <AdminDashboardView isDark={isDark} />;
            default:
                return (
                    <ParticipantDashboardView
                        balance={balance}
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

                {/* Snapchat Loss-Aversion Streak Header */}
                <StreakStatusHeader
                    currentStreak={5}
                    hoursRemaining={4}
                    onPressStreak={() => setStoryVisible(true)}
                />

                {renderRoleDashboard()}
            </View>

            <View style={{ height: 100 }} />

            {/* Snapchat Deal Stories Modal */}
            <DealStoryPlayer
                visible={storyVisible}
                stories={sampleStories}
                onClose={() => setStoryVisible(false)}
                onClaimDeal={() => {
                    setStoryVisible(false);
                    setCameraVisible(true);
                }}
            />

            {/* Camera Proof-of-Moment Scanner Modal */}
            <CameraMomentScanner
                visible={cameraVisible}
                onClose={() => setCameraVisible(false)}
            />

            {/* Product Tour */}
            <ProductTour tourId="dashboard" autoStart={true} />
        </ScrollView>
    );
}

/**
 * PARTICIPANT VIEW
 */
function ParticipantDashboardView({ balance, isDark }: ParticipantViewProps) {
    const router = useRouter();
    const availableGems = balance?.gems || 0;
    const accessSignals = balance?.promokeys || 0;
    return (
        <View style={{ gap: 24 }}>
            <View style={[styles.valueReceipt, { backgroundColor: isDark ? DesignColors.gray[900] : 'white' }]}>
                <Text style={styles.valueReceiptEyebrow}>WHAT IS AVAILABLE NOW</Text>
                <Text style={[styles.valueReceiptTitle, { color: isDark ? 'white' : DesignColors.gray[900] }]}>{availableGems.toLocaleString()} Gems</Text>
                <Text style={styles.valueReceiptCopy}>US${availableGems.toLocaleString()} platform value · {accessSignals ? `${accessSignals} access ${accessSignals === 1 ? 'signal' : 'signals'} ready` : 'no active access yet'}</Text>
                <Pressable onPress={() => router.push('/vault')} style={styles.valueReceiptAction}><Text style={styles.valueReceiptActionText}>Open your Vault</Text><Ionicons name="arrow-forward" size={16} color={DesignColors.black} /></Pressable>
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

            <Pressable onPress={() => router.push('/create-proposal')} style={styles.roleNextMove}><View style={styles.roleNextIcon}><Ionicons name="sparkles" size={20} color={DesignColors.black} /></View><View style={styles.roleNextCopy}><Text style={styles.roleNextLabel}>NEXT ACTIVATION</Text><Text style={styles.roleNextTitle}>Start with the change you want to make possible.</Text><Text style={styles.roleNextText}>Shape the Scene, people, participant value, proof, and Gem reserve before anything goes live.</Text></View><Ionicons name="arrow-forward" size={18} color={DesignColors.primary} /></Pressable>
        </View>
    );
}

/**
 * MERCHANT VIEW
 */
function MerchantDashboardView({ isDark }: RoleViewProps) {
    const router = useRouter();
    return (
        <View style={{ gap: 20 }}>
            {/* Primary Action: QR Code Scanner */}
            <Pressable
                onPress={() => router.push('/merchant/scan')}
                style={{
                    backgroundColor: '#10B981',
                    paddingVertical: 18,
                    paddingHorizontal: 20,
                    borderRadius: 18,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 }}>
                    <View style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.18)', alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name="qr-code" size={26} color="white" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ color: 'white', fontWeight: '900', fontSize: 16 }}>SCAN CUSTOMER QR PASS</Text>
                        <Text style={{ color: 'rgba(255,255,255,0.88)', fontSize: 12, marginTop: 2 }}>Verify check-ins, redeem passes & track foot traffic</Text>
                    </View>
                </View>
                <Ionicons name="arrow-forward" size={20} color="white" />
            </Pressable>

            {/* Quick Actions */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
                <Pressable
                    onPress={() => router.push('/merchant/scan')}
                    style={[styles.actionButton, { backgroundColor: isDark ? DesignColors.gray[900] : 'white' }]}
                >
                    <Ionicons name="scan-outline" size={24} color="#10B981" />
                    <Text style={[styles.actionButtonText, { color: isDark ? 'white' : DesignColors.gray[900] }]}>Scanner</Text>
                </Pressable>
                <Pressable
                    onPress={() => router.push('/merchant/create-offer')}
                    style={[styles.actionButton, { backgroundColor: isDark ? DesignColors.gray[900] : 'white' }]}
                >
                    <Ionicons name="add-circle-outline" size={24} color={DesignColors.primary} />
                    <Text style={[styles.actionButtonText, { color: isDark ? 'white' : DesignColors.gray[900] }]}>New Offer</Text>
                </Pressable>
            </View>

            <MobileReturnCard role="merchant" isDark={isDark} />

            <Pressable onPress={() => router.push('/create-proposal')} style={styles.roleNextMove}>
                <View style={[styles.roleNextIcon, { backgroundColor: '#10B981' }]}><Ionicons name="storefront" size={20} color={DesignColors.black} /></View>
                <View style={styles.roleNextCopy}>
                    <Text style={styles.roleNextLabel}>YOUR PLACE IN THE SCENE</Text>
                    <Text style={styles.roleNextTitle}>Shape a venue activation and a reason to return.</Text>
                    <Text style={styles.roleNextText}>Verified visits and redemptions will appear only after people actually act.</Text>
                </View>
                <Ionicons name="arrow-forward" size={18} color={DesignColors.primary} />
            </Pressable>
        </View>
    );
}

/**
 * CREATOR VIEW
 */
function CreatorDashboardView({ balance, isDark }: ParticipantViewProps) {
    const router = useRouter();
    const availableGems = balance?.gems || 0;
    return (
        <View style={{ gap: 24 }}>
            <View style={[styles.statCard, { backgroundColor: isDark ? DesignColors.gray[900] : 'white', flexDirection: 'column', alignItems: 'flex-start', padding: 20 }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: 10 }}>
                    <View>
                        <Text style={styles.statLabel}>CREATOR EARNINGS</Text>
                        <Text style={[styles.statValue, { fontSize: 32, color: isDark ? 'white' : DesignColors.gray[900] }]}>{availableGems.toLocaleString()} Gems</Text>
                        <Text style={{ color: DesignColors.gray[500], fontSize: 12 }}>US${availableGems.toFixed(2)} earned from verified action bounties</Text>
                    </View>
                    <View style={[styles.statIcon, { backgroundColor: '#EC489920', width: 48, height: 48 }]}>
                        <Ionicons name="videocam" size={24} color="#EC4899" />
                    </View>
                </View>
            </View>
            <MobileReturnCard role="creator" isDark={isDark} />
            <Pressable onPress={() => router.push('/discover')} style={styles.roleNextMove}>
                <View style={[styles.roleNextIcon, { backgroundColor: '#EC4899' }]}><Ionicons name="sparkles" size={20} color={DesignColors.black} /></View>
                <View style={styles.roleNextCopy}>
                    <Text style={styles.roleNextLabel}>CREATOR PROMPTS</Text>
                    <Text style={styles.roleNextTitle}>Find an active prompt worth publishing.</Text>
                    <Text style={styles.roleNextText}>Earn verified payouts when your story sets real attendance in motion.</Text>
                </View>
                <Ionicons name="arrow-forward" size={18} color={DesignColors.primary} />
            </Pressable>
        </View>
    );
}

/**
 * AGENCY VIEW
 */
function AgencyDashboardView({ isDark }: RoleViewProps) {
    const router = useRouter();
    return (
        <View style={{ gap: 24 }}>
            <View style={{ flexDirection: 'row', gap: 12 }}>
                <Pressable
                    onPress={() => router.push('/modal')}
                    style={[styles.actionButton, { backgroundColor: isDark ? DesignColors.gray[900] : 'white' }]}
                >
                    <Ionicons name="people-outline" size={24} color="#F59E0B" />
                    <Text style={[styles.actionButtonText, { color: isDark ? 'white' : DesignColors.gray[900] }]}>Client Roster</Text>
                </Pressable>
                <Pressable
                    onPress={() => router.push('/proposals')}
                    style={[styles.actionButton, { backgroundColor: isDark ? DesignColors.gray[900] : 'white' }]}
                >
                    <Ionicons name="layers-outline" size={24} color={DesignColors.primary} />
                    <Text style={[styles.actionButtonText, { color: isDark ? 'white' : DesignColors.gray[900] }]}>Portfolio</Text>
                </Pressable>
            </View>
            <MobileReturnCard role="agency" isDark={isDark} />
            <Pressable onPress={() => router.push('/create-proposal')} style={styles.roleNextMove}>
                <View style={[styles.roleNextIcon, { backgroundColor: '#F59E0B' }]}><Ionicons name="git-branch" size={20} color={DesignColors.black} /></View>
                <View style={styles.roleNextCopy}>
                    <Text style={styles.roleNextLabel}>CLIENT ACTIVATION</Text>
                    <Text style={styles.roleNextTitle}>Run multi-partner client briefs from one hub.</Text>
                    <Text style={styles.roleNextText}>Coordinate brands, hosts, venues, and creators with attributable returns.</Text>
                </View>
                <Ionicons name="arrow-forward" size={18} color={DesignColors.primary} />
            </Pressable>
        </View>
    );
}

/**
 * ADMIN VIEW
 */
function AdminDashboardView({ isDark }: RoleViewProps) {
    const router = useRouter();
    return (
        <View style={{ gap: 24 }}>
            <View style={{ flexDirection: 'row', gap: 12 }}>
                <Pressable
                    onPress={() => router.push('/studio')}
                    style={[styles.actionButton, { backgroundColor: isDark ? DesignColors.gray[900] : 'white' }]}
                >
                    <Ionicons name="flash-outline" size={24} color="#6B7280" />
                    <Text style={[styles.actionButtonText, { color: isDark ? 'white' : DesignColors.gray[900] }]}>Studio Admin</Text>
                </Pressable>
                <Pressable
                    onPress={() => router.push('/catalog')}
                    style={[styles.actionButton, { backgroundColor: isDark ? DesignColors.gray[900] : 'white' }]}
                >
                    <Ionicons name="grid-outline" size={24} color={DesignColors.primary} />
                    <Text style={[styles.actionButtonText, { color: isDark ? 'white' : DesignColors.gray[900] }]}>Asset Catalog</Text>
                </Pressable>
            </View>
            <MobileReturnCard role="agency" isDark={isDark} />
            <Pressable onPress={() => router.push('/studio')} style={styles.roleNextMove}>
                <View style={[styles.roleNextIcon, { backgroundColor: '#6B7280' }]}><Ionicons name="analytics" size={20} color={DesignColors.black} /></View>
                <View style={styles.roleNextCopy}>
                    <Text style={styles.roleNextLabel}>SYSTEM OPERATING CONSOLE</Text>
                    <Text style={styles.roleNextTitle}>Oversee live activations & system health.</Text>
                    <Text style={styles.roleNextText}>Manage platform nodes, verify escrow pools, and audit ecosystem activities.</Text>
                </View>
                <Ionicons name="arrow-forward" size={18} color={DesignColors.primary} />
            </Pressable>
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

        </View>
    );
}

function MobileReturnCard({ role, isDark }: { role: StakeholderReturnRole; isDark: boolean }) {
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
        fontSize: 12,
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
        fontSize: 12,
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
    valueReceipt: {
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: DesignColors.border,
    },
    valueReceiptEyebrow: {
        color: DesignColors.primary,
        fontFamily: 'SpaceMono',
        fontSize: 12,
        letterSpacing: .7,
    },
    valueReceiptTitle: {
        fontSize: 34,
        lineHeight: 38,
        fontWeight: '900',
        letterSpacing: -1,
        marginTop: 9,
    },
    valueReceiptCopy: {
        color: DesignColors.gray[500],
        fontSize: 12,
        lineHeight: 16,
        marginTop: 5,
    },
    valueReceiptAction: {
        minHeight: 45,
        marginTop: 17,
        paddingHorizontal: 15,
        borderRadius: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: DesignColors.primary,
    },
    valueReceiptActionText: {
        color: DesignColors.black,
        fontSize: 12,
        fontWeight: '900',
    },
    roleNextMove: {
        padding: 17,
        borderRadius: 23,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: DesignColors.gray[900],
        borderWidth: 1,
        borderColor: 'rgba(255,106,26,.24)',
    },
    roleNextIcon: {
        width: 42,
        height: 42,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: DesignColors.primary,
        marginRight: 12,
    },
    roleNextCopy: {
        flex: 1,
        paddingRight: 10,
        backgroundColor: 'transparent',
    },
    roleNextLabel: {
        color: DesignColors.primary,
        fontFamily: 'SpaceMono',
        fontSize: 12,
        letterSpacing: .6,
    },
    roleNextTitle: {
        color: 'white',
        fontSize: 14,
        lineHeight: 18,
        fontWeight: '900',
        marginTop: 4,
    },
    roleNextText: {
        color: DesignColors.gray[500],
        fontSize: 12,
        lineHeight: 15,
        marginTop: 4,
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
        fontSize: 12,
        letterSpacing: .6,
    },
    returnTitle: {
        fontSize: 15,
        fontWeight: '900',
        marginTop: 2,
    },
    returnBody: {
        color: DesignColors.gray[500],
        fontSize: 12,
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
        fontSize: 12,
        letterSpacing: .5,
    },
    returnStatementText: {
        color: DesignColors.gray[400],
        fontSize: 12.5,
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
        fontSize: 12,
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
        fontSize: 12,
        fontWeight: '800',
        textTransform: 'uppercase',
        marginTop: 3,
    }
});

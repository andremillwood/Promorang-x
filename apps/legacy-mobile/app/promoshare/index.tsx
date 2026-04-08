import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Dimensions,
    Animated,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
    Ticket,
    Gift,
    Clock,
    Trophy,
    Star,
    Zap,
    Users,
    ChevronRight,
    Sparkles,
    Diamond,
    Key,
    Coins,
    Share2,
    Target,
    CheckCircle,
    History,
    Award,
} from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAuthStore } from '@/store/authStore';
import { haptics } from '@/lib/haptics';
import colors from '@/constants/colors';

const { width } = Dimensions.get('window');
const API_URL = 'https://promorang-api.vercel.app';

type DrawType = 'daily' | 'weekly' | 'monthly' | 'grand';

interface PoolItem {
    id: string;
    reward_type: 'gem' | 'key' | 'point' | 'coupon' | 'product' | 'other';
    amount: number;
    description: string;
    image_url?: string;
    sponsor_name?: string;
}

interface DrawData {
    id: string | number;
    cycle_type: DrawType;
    status?: string;
    start_at?: string;
    end_at: string;
    jackpot_amount: number;
    is_rollover: boolean;
    userTickets: number;
    totalTickets: number;
    ticketNumbers?: number[];
    poolItems: PoolItem[];
}

interface PromoShareData {
    draws?: DrawData[];
    // Legacy fields
    activeCycle?: {
        id: string;
        cycle_type: DrawType;
        status: string;
        start_at: string;
        end_at: string;
    } | null;
    userTickets?: number;
    totalTickets?: number;
    poolItems?: PoolItem[];
    currentJackpot?: number;
    ticketNumbers?: number[];
    isRollover?: boolean;
    recentWinners?: { username: string; prize: string; date: string }[];
}

// Draw type configurations
const DRAW_CONFIG: Record<DrawType, {
    label: string;
    icon: string;
    colors: [string, string];
    description: string;
}> = {
    daily: {
        label: 'Daily Draw',
        icon: '☀️',
        colors: ['#F97316', '#F59E0B'],
        description: 'Drawn every day at midnight'
    },
    weekly: {
        label: 'Weekly Draw',
        icon: '📅',
        colors: ['#3B82F6', '#06B6D4'],
        description: 'Drawn every Sunday'
    },
    monthly: {
        label: 'Monthly Draw',
        icon: '🗓️',
        colors: ['#8B5CF6', '#EC4899'],
        description: 'Drawn on the 1st of each month'
    },
    grand: {
        label: 'GRAND JACKPOT',
        icon: '🏆',
        colors: ['#F59E0B', '#EF4444'],
        description: 'Weekly mega draw - rolls over!'
    }
};

const EARN_METHODS = [
    { icon: Zap, title: 'Complete Drops', tickets: '+1-5', color: '#F59E0B', description: 'Finish drop tasks' },
    { icon: Share2, title: 'Share Content', tickets: '+1', color: '#3B82F6', description: 'Share to social' },
    { icon: Users, title: 'Refer Friends', tickets: '+10', color: '#10B981', description: 'Per signup' },
    { icon: Target, title: 'Daily Login', tickets: '+1', color: '#8B5CF6', description: 'Every day' },
    { icon: Star, title: 'Leave Reviews', tickets: '+2', color: '#EC4899', description: 'Rate products' },
    { icon: CheckCircle, title: 'Complete Profile', tickets: '+5', color: '#6366F1', description: 'One time' },
];

const REWARD_ICONS: Record<string, any> = {
    gem: Diamond,
    key: Key,
    point: Coins,
    coupon: Gift,
    product: Gift,
    other: Sparkles,
};

export default function PromoShareScreen() {
    const router = useRouter();
    const theme = useThemeColors();
    const { user, token } = useAuthStore();

    const [refreshing, setRefreshing] = useState(false);
    const [data, setData] = useState<PromoShareData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    // Animated values
    const ticketPulse = React.useRef(new Animated.Value(1)).current;

    useEffect(() => {
        fetchPromoShareData();
        
        // Pulse animation for tickets
        Animated.loop(
            Animated.sequence([
                Animated.timing(ticketPulse, { toValue: 1.05, duration: 1000, useNativeDriver: true }),
                Animated.timing(ticketPulse, { toValue: 1, duration: 1000, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    useEffect(() => {
        if (!data?.activeCycle) return;

        const timer = setInterval(() => {
            const endTime = new Date(data.activeCycle!.end_at).getTime();
            const now = Date.now();
            const diff = endTime - now;

            if (diff <= 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return;
            }

            setTimeLeft({
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((diff % (1000 * 60)) / 1000),
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [data?.activeCycle]);

    const fetchPromoShareData = async () => {
        try {
            setIsLoading(true);
            
            // Try real API first
            if (token) {
                try {
                    const response = await fetch(`${API_URL}/api/promoshare/dashboard`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.ok) {
                        const result = await response.json();
                        if (result.success && result.data) {
                            setData(result.data);
                            return;
                        }
                    }
                } catch (e) {
                    console.log('API unavailable, using mock data');
                }
            }

            // Mock data fallback with all 4 draw types
            const now = Date.now();
            
            setData({
                draws: [
                    {
                        id: 1,
                        cycle_type: 'daily',
                        end_at: new Date(now + 12 * 60 * 60 * 1000).toISOString(),
                        jackpot_amount: 50,
                        is_rollover: false,
                        userTickets: 3,
                        totalTickets: 89,
                        poolItems: [{ id: 'd1', reward_type: 'gem', amount: 50, description: 'Daily Gems' }]
                    },
                    {
                        id: 2,
                        cycle_type: 'weekly',
                        end_at: new Date(now + 4 * 24 * 60 * 60 * 1000).toISOString(),
                        jackpot_amount: 500,
                        is_rollover: false,
                        userTickets: 12,
                        totalTickets: 450,
                        poolItems: [{ id: 'w1', reward_type: 'gem', amount: 500, description: 'Weekly Jackpot' }]
                    },
                    {
                        id: 3,
                        cycle_type: 'monthly',
                        end_at: new Date(now + 18 * 24 * 60 * 60 * 1000).toISOString(),
                        jackpot_amount: 2500,
                        is_rollover: false,
                        userTickets: 45,
                        totalTickets: 2100,
                        poolItems: [{ id: 'm1', reward_type: 'gem', amount: 2500, description: 'Monthly Grand Prize' }]
                    },
                    {
                        id: 4,
                        cycle_type: 'grand',
                        end_at: new Date(now + 4 * 24 * 60 * 60 * 1000).toISOString(),
                        jackpot_amount: 10000,
                        is_rollover: true,
                        userTickets: 12,
                        totalTickets: 450,
                        poolItems: [{ id: 'g1', reward_type: 'gem', amount: 10000, description: 'GRAND JACKPOT' }]
                    }
                ],
                recentWinners: [
                    { username: 'alex_creator', prize: '250 Gems', date: '2 days ago' },
                    { username: 'sarah_style', prize: '$25 Coupon', date: '2 days ago' },
                    { username: 'mike_gamer', prize: '100 Keys', date: '2 days ago' },
                ],
            });
        } catch (error) {
            console.error('Error fetching PromoShare data:', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchPromoShareData();
    };

    // Get draws array (use new format or create from legacy)
    const draws: DrawData[] = data?.draws || (data?.activeCycle ? [{
        id: data.activeCycle.id,
        cycle_type: data.activeCycle.cycle_type,
        end_at: data.activeCycle.end_at,
        jackpot_amount: data.currentJackpot || 0,
        is_rollover: data.isRollover || false,
        userTickets: data.userTickets || 0,
        totalTickets: data.totalTickets || 0,
        ticketNumbers: data.ticketNumbers,
        poolItems: data.poolItems || []
    }] : []);

    // Sort draws: grand first, then by end time
    const sortedDraws = [...draws].sort((a, b) => {
        if (a.cycle_type === 'grand') return -1;
        if (b.cycle_type === 'grand') return 1;
        return new Date(a.end_at).getTime() - new Date(b.end_at).getTime();
    });

    // Calculate totals
    const totalUserTickets = draws.reduce((sum, d) => sum + d.userTickets, 0);
    const combinedJackpot = draws.reduce((sum, d) => sum + d.jackpot_amount, 0);

    // Helper to format time
    const formatTimeLeft = (endAt: string) => {
        const diff = new Date(endAt).getTime() - Date.now();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        if (days > 0) return `${days}d ${hours}h`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen
                options={{
                    title: 'PromoShare',
                    headerStyle: { backgroundColor: theme.background },
                    headerTitleStyle: { color: theme.text, fontWeight: '700' },
                    headerRight: () => (
                        <TouchableOpacity
                            style={styles.headerButton}
                            onPress={() => router.push('/promoshare/history' as any)}
                        >
                            <History size={22} color={theme.text} />
                        </TouchableOpacity>
                    ),
                }}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={colors.primary}
                    />
                }
            >
                {/* Hero Section */}
                <LinearGradient
                    colors={['#6366F1', '#8B5CF6', '#EC4899']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.heroSection}
                >
                    <View style={styles.heroDecor1} />
                    <View style={styles.heroDecor2} />

                    <View style={styles.heroContent}>
                        <Text style={styles.heroTitle}>PromoShare</Text>
                        <Text style={styles.heroSubtitle}>
                            Four draws running simultaneously. Win daily, weekly, monthly, or hit the GRAND JACKPOT!
                        </Text>
                    </View>
                </LinearGradient>

                {/* Quick Stats Bar */}
                <View style={[styles.quickStatsBar, { backgroundColor: theme.surface }]}>
                    <View style={styles.quickStatItem}>
                        <Ticket size={20} color={colors.primary} />
                        <View>
                            <Text style={[styles.quickStatValue, { color: theme.text }]}>{totalUserTickets}</Text>
                            <Text style={[styles.quickStatLabel, { color: theme.textSecondary }]}>Your Tickets</Text>
                        </View>
                    </View>
                    <View style={styles.quickStatDivider} />
                    <View style={styles.quickStatItem}>
                        <Trophy size={20} color="#F59E0B" />
                        <View>
                            <Text style={[styles.quickStatValue, { color: theme.text }]}>{draws.length}</Text>
                            <Text style={[styles.quickStatLabel, { color: theme.textSecondary }]}>Active Draws</Text>
                        </View>
                    </View>
                    <View style={styles.quickStatDivider} />
                    <View style={styles.quickStatItem}>
                        <Diamond size={20} color="#8B5CF6" />
                        <View>
                            <Text style={[styles.quickStatValue, { color: theme.text }]}>{combinedJackpot.toLocaleString()}</Text>
                            <Text style={[styles.quickStatLabel, { color: theme.textSecondary }]}>Total Jackpot</Text>
                        </View>
                    </View>
                </View>

                {/* All Draws Grid */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Active Draws</Text>
                    <View style={styles.drawsGrid}>
                        {sortedDraws.map((draw) => {
                            const config = DRAW_CONFIG[draw.cycle_type];
                            const probability = draw.totalTickets > 0 
                                ? ((draw.userTickets / draw.totalTickets) * 100).toFixed(1) 
                                : '0';
                            
                            return (
                                <View key={draw.id} style={[styles.drawCard, { backgroundColor: theme.surface }]}>
                                    {/* Rollover Badge - Only for grand */}
                                    {draw.is_rollover && (
                                        <View style={styles.rolloverBadgeSmall}>
                                            <Text style={styles.rolloverBadgeSmallText}>🔥 ROLLOVER</Text>
                                        </View>
                                    )}
                                    
                                    {/* Header */}
                                    <View style={styles.drawCardHeader}>
                                        <LinearGradient
                                            colors={config.colors}
                                            style={styles.drawIconContainer}
                                        >
                                            <Text style={styles.drawIcon}>{config.icon}</Text>
                                        </LinearGradient>
                                        <View style={styles.drawCardHeaderText}>
                                            <Text style={[styles.drawCardTitle, { color: theme.text }]}>{config.label}</Text>
                                            <Text style={[styles.drawCardDesc, { color: theme.textSecondary }]}>{config.description}</Text>
                                        </View>
                                    </View>
                                    
                                    {/* Jackpot */}
                                    <Text style={[styles.drawJackpot, { color: config.colors[0] }]}>
                                        {draw.jackpot_amount.toLocaleString()} 💎
                                    </Text>
                                    
                                    {/* Stats */}
                                    <View style={styles.drawStats}>
                                        <View style={[styles.drawStatBox, { backgroundColor: theme.background }]}>
                                            <Text style={[styles.drawStatValue, { color: theme.text }]}>{draw.userTickets}</Text>
                                            <Text style={[styles.drawStatLabel, { color: theme.textSecondary }]}>Tickets</Text>
                                        </View>
                                        <View style={[styles.drawStatBox, { backgroundColor: theme.background }]}>
                                            <Text style={[styles.drawStatValue, { color: theme.text }]}>{probability}%</Text>
                                            <Text style={[styles.drawStatLabel, { color: theme.textSecondary }]}>Chance</Text>
                                        </View>
                                    </View>
                                    
                                    {/* Countdown */}
                                    <LinearGradient
                                        colors={config.colors}
                                        style={styles.drawCountdown}
                                    >
                                        <Clock size={14} color="#FFF" />
                                        <Text style={styles.drawCountdownText}>{formatTimeLeft(draw.end_at)}</Text>
                                    </LinearGradient>
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* How to Earn Tickets */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Earn More Tickets</Text>
                        <TouchableOpacity onPress={() => router.push('/promoshare/earn' as any)}>
                            <Text style={styles.seeAllText}>See All</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.earnGrid}>
                        {EARN_METHODS.slice(0, 4).map((method, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[styles.earnCard, { backgroundColor: theme.surface }]}
                                onPress={() => haptics.light()}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.earnIcon, { backgroundColor: `${method.color}15` }]}>
                                    <method.icon size={20} color={method.color} />
                                </View>
                                <Text style={[styles.earnTitle, { color: theme.text }]}>{method.title}</Text>
                                <Text style={[styles.earnTickets, { color: method.color }]}>{method.tickets}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Recent Winners */}
                {data?.recentWinners && data.recentWinners.length > 0 && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Winners</Text>
                        {data.recentWinners.map((winner, index) => (
                            <View key={index} style={[styles.winnerCard, { backgroundColor: theme.surface }]}>
                                <View style={styles.winnerAvatar}>
                                    <Award size={20} color="#F59E0B" />
                                </View>
                                <View style={styles.winnerInfo}>
                                    <Text style={[styles.winnerName, { color: theme.text }]}>@{winner.username}</Text>
                                    <Text style={[styles.winnerDate, { color: theme.textSecondary }]}>{winner.date}</Text>
                                </View>
                                <Text style={[styles.winnerPrize, { color: colors.primary }]}>{winner.prize}</Text>
                            </View>
                        ))}
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerButton: {
        padding: 8,
        marginRight: 8,
    },
    // Hero Section
    heroSection: {
        padding: 24,
        paddingTop: 20,
        paddingBottom: 30,
        position: 'relative',
        overflow: 'hidden',
    },
    heroDecor1: {
        position: 'absolute',
        top: -50,
        right: -50,
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    heroDecor2: {
        position: 'absolute',
        bottom: -30,
        left: -30,
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    heroContent: {
        alignItems: 'center',
    },
    heroTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: '#FFF',
        marginBottom: 8,
    },
    heroSubtitle: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.9)',
        textAlign: 'center',
        marginBottom: 16,
    },
    cycleBadgeRow: {
        flexDirection: 'row',
        gap: 8,
    },
    cycleBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    cycleBadgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFF',
    },
    rolloverBadge: {
        backgroundColor: 'rgba(252,211,77,0.3)',
        borderColor: 'rgba(252,211,77,0.5)',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    rolloverBadgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FCD34D',
    },
    // Quick Stats Bar
    quickStatsBar: {
        marginHorizontal: 16,
        marginTop: -20,
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    quickStatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    quickStatValue: {
        fontSize: 18,
        fontWeight: '800',
    },
    quickStatLabel: {
        fontSize: 11,
    },
    quickStatDivider: {
        width: 1,
        height: 30,
        backgroundColor: 'rgba(128,128,128,0.2)',
    },
    // Draw Cards Grid
    drawsGrid: {
        gap: 12,
    },
    drawCard: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 4,
    },
    rolloverBadgeSmall: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: 'rgba(245,158,11,0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    rolloverBadgeSmallText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#F59E0B',
    },
    drawCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    drawIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    drawIcon: {
        fontSize: 22,
    },
    drawCardHeaderText: {
        flex: 1,
    },
    drawCardTitle: {
        fontSize: 15,
        fontWeight: '700',
    },
    drawCardDesc: {
        fontSize: 11,
        marginTop: 2,
    },
    drawJackpot: {
        fontSize: 26,
        fontWeight: '900',
        marginBottom: 12,
    },
    drawStats: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 12,
    },
    drawStatBox: {
        flex: 1,
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
    },
    drawStatValue: {
        fontSize: 18,
        fontWeight: '700',
    },
    drawStatLabel: {
        fontSize: 10,
        marginTop: 2,
    },
    drawCountdown: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        borderRadius: 10,
    },
    drawCountdownText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFF',
    },
    // Timer Card
    timerCard: {
        marginHorizontal: 16,
        marginTop: -20,
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    timerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 12,
    },
    timerLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    timerGrid: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    timerUnit: {
        alignItems: 'center',
        minWidth: 50,
    },
    timerValue: {
        fontSize: 28,
        fontWeight: '800',
    },
    timerUnitLabel: {
        fontSize: 11,
        marginTop: 2,
    },
    timerSeparator: {
        fontSize: 24,
        fontWeight: '700',
        marginHorizontal: 4,
    },
    // Stats Row
    statsRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 12,
        marginTop: 16,
    },
    statCard: {
        flex: 1,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
    },
    ticketCard: {
        overflow: 'hidden',
    },
    statCardGradient: {
        flex: 1,
        width: '100%',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        margin: -16,
    },
    statCardValue: {
        fontSize: 32,
        fontWeight: '800',
        color: '#FFF',
        marginTop: 8,
    },
    statCardLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.9)',
        marginTop: 4,
    },
    statCardSub: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 2,
    },
    // Sections
    section: {
        paddingHorizontal: 16,
        marginTop: 24,
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
        marginBottom: 12,
    },
    seeAllText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.primary,
    },
    // Prize Grid
    prizeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    prizeCard: {
        width: (width - 42) / 2,
        padding: 14,
        borderRadius: 14,
        alignItems: 'center',
    },
    prizeIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(139,92,246,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    prizeAmount: {
        fontSize: 13,
        fontWeight: '600',
        textAlign: 'center',
    },
    prizeSponsor: {
        fontSize: 11,
        marginTop: 4,
    },
    // Ticket Numbers
    ticketNumbersRow: {
        flexDirection: 'row',
        gap: 10,
        paddingRight: 16,
    },
    ticketNumber: {
        backgroundColor: '#3B82F6',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
    },
    ticketNumberText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFF',
    },
    // Earn Grid
    earnGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    earnCard: {
        width: (width - 42) / 2,
        padding: 14,
        borderRadius: 14,
        alignItems: 'center',
    },
    earnIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    earnTitle: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 4,
    },
    earnTickets: {
        fontSize: 14,
        fontWeight: '800',
    },
    // Winners
    winnerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 14,
        marginBottom: 8,
    },
    winnerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(245,158,11,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    winnerInfo: {
        flex: 1,
    },
    winnerName: {
        fontSize: 14,
        fontWeight: '600',
    },
    winnerDate: {
        fontSize: 12,
        marginTop: 2,
    },
    winnerPrize: {
        fontSize: 14,
        fontWeight: '700',
    },
});

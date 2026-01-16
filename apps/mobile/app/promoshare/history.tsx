import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
    Ticket,
    Trophy,
    Calendar,
    ChevronRight,
    Award,
    Gift,
    Diamond,
    Key,
    Coins,
    CheckCircle,
    XCircle,
    Clock,
} from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAuthStore } from '@/store/authStore';
import colors from '@/constants/colors';

const API_URL = 'https://promorang-api.vercel.app';

interface DrawResult {
    id: string;
    cycle_type: 'daily' | 'weekly' | 'monthly';
    draw_date: string;
    your_tickets: number;
    total_tickets: number;
    won: boolean;
    prize?: string;
    prize_type?: string;
    winning_numbers?: number[];
    your_numbers?: number[];
}

interface TicketEarning {
    id: string;
    action: string;
    tickets_earned: number;
    timestamp: string;
    description: string;
}

const PRIZE_ICONS: Record<string, any> = {
    gem: Diamond,
    key: Key,
    point: Coins,
    coupon: Gift,
    product: Gift,
};

export default function PromoShareHistoryScreen() {
    const router = useRouter();
    const theme = useThemeColors();
    const { token } = useAuthStore();

    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'draws' | 'earnings'>('draws');
    const [drawHistory, setDrawHistory] = useState<DrawResult[]>([]);
    const [ticketEarnings, setTicketEarnings] = useState<TicketEarning[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            setIsLoading(true);

            // Try real API
            if (token) {
                try {
                    const response = await fetch(`${API_URL}/api/promoshare/history`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.ok) {
                        const result = await response.json();
                        if (result.success && result.data) {
                            setDrawHistory(result.data.draws || []);
                            setTicketEarnings(result.data.earnings || []);
                            return;
                        }
                    }
                } catch (e) {
                    console.log('API unavailable, using mock data');
                }
            }

            // Mock data
            setDrawHistory([
                {
                    id: '1',
                    cycle_type: 'weekly',
                    draw_date: '2026-01-05T00:00:00Z',
                    your_tickets: 35,
                    total_tickets: 11200,
                    won: true,
                    prize: '50 Gems',
                    prize_type: 'gem',
                    winning_numbers: [47, 156, 892],
                    your_numbers: [12, 47, 89, 156],
                },
                {
                    id: '2',
                    cycle_type: 'weekly',
                    draw_date: '2025-12-29T00:00:00Z',
                    your_tickets: 28,
                    total_tickets: 9800,
                    won: false,
                    winning_numbers: [234, 567, 890],
                    your_numbers: [45, 123, 456],
                },
                {
                    id: '3',
                    cycle_type: 'weekly',
                    draw_date: '2025-12-22T00:00:00Z',
                    your_tickets: 42,
                    total_tickets: 10500,
                    won: true,
                    prize: '25 Keys',
                    prize_type: 'key',
                    winning_numbers: [89, 234, 567],
                    your_numbers: [23, 89, 234, 567],
                },
                {
                    id: '4',
                    cycle_type: 'weekly',
                    draw_date: '2025-12-15T00:00:00Z',
                    your_tickets: 15,
                    total_tickets: 8900,
                    won: false,
                    winning_numbers: [111, 222, 333],
                    your_numbers: [55, 66, 77],
                },
            ]);

            setTicketEarnings([
                { id: '1', action: 'drop_complete', tickets_earned: 3, timestamp: '2026-01-09T14:30:00Z', description: 'Completed "Tech Review" drop' },
                { id: '2', action: 'referral', tickets_earned: 10, timestamp: '2026-01-09T10:15:00Z', description: 'Friend @alex_new signed up' },
                { id: '3', action: 'daily_login', tickets_earned: 1, timestamp: '2026-01-09T08:00:00Z', description: 'Daily login bonus' },
                { id: '4', action: 'share', tickets_earned: 1, timestamp: '2026-01-08T16:45:00Z', description: 'Shared content to Twitter' },
                { id: '5', action: 'drop_complete', tickets_earned: 5, timestamp: '2026-01-08T12:30:00Z', description: 'Completed "Fashion Haul" drop' },
                { id: '6', action: 'review', tickets_earned: 2, timestamp: '2026-01-07T15:20:00Z', description: 'Left review on TechStore' },
                { id: '7', action: 'daily_login', tickets_earned: 1, timestamp: '2026-01-07T09:00:00Z', description: 'Daily login bonus' },
            ]);

        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchHistory();
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const totalWins = drawHistory.filter(d => d.won).length;
    const totalTicketsEarned = ticketEarnings.reduce((sum, e) => sum + e.tickets_earned, 0);

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen
                options={{
                    title: 'History',
                    headerStyle: { backgroundColor: theme.background },
                    headerTitleStyle: { color: theme.text, fontWeight: '700' },
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
                {/* Stats Summary */}
                <View style={styles.statsRow}>
                    <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
                        <Trophy size={24} color="#F59E0B" />
                        <Text style={[styles.statValue, { color: theme.text }]}>{totalWins}</Text>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Wins</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
                        <Ticket size={24} color="#3B82F6" />
                        <Text style={[styles.statValue, { color: theme.text }]}>{totalTicketsEarned}</Text>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Earned</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
                        <Calendar size={24} color="#8B5CF6" />
                        <Text style={[styles.statValue, { color: theme.text }]}>{drawHistory.length}</Text>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Draws</Text>
                    </View>
                </View>

                {/* Tabs */}
                <View style={styles.tabs}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'draws' && styles.tabActive]}
                        onPress={() => setActiveTab('draws')}
                    >
                        <Trophy size={18} color={activeTab === 'draws' ? colors.primary : theme.textSecondary} />
                        <Text style={[
                            styles.tabText,
                            { color: activeTab === 'draws' ? colors.primary : theme.textSecondary }
                        ]}>
                            Draw Results
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'earnings' && styles.tabActive]}
                        onPress={() => setActiveTab('earnings')}
                    >
                        <Ticket size={18} color={activeTab === 'earnings' ? colors.primary : theme.textSecondary} />
                        <Text style={[
                            styles.tabText,
                            { color: activeTab === 'earnings' ? colors.primary : theme.textSecondary }
                        ]}>
                            Ticket Earnings
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Draw Results */}
                {activeTab === 'draws' && (
                    <View style={styles.listSection}>
                        {drawHistory.map((draw) => {
                            const PrizeIcon = draw.prize_type ? PRIZE_ICONS[draw.prize_type] || Gift : Gift;
                            return (
                                <View key={draw.id} style={[styles.drawCard, { backgroundColor: theme.surface }]}>
                                    <View style={styles.drawHeader}>
                                        <View style={styles.drawDateRow}>
                                            <Calendar size={16} color={theme.textSecondary} />
                                            <Text style={[styles.drawDate, { color: theme.text }]}>
                                                {formatDate(draw.draw_date)}
                                            </Text>
                                            <View style={styles.cycleTypeBadge}>
                                                <Text style={styles.cycleTypeText}>
                                                    {draw.cycle_type.toUpperCase()}
                                                </Text>
                                            </View>
                                        </View>
                                        {draw.won ? (
                                            <View style={styles.wonBadge}>
                                                <CheckCircle size={14} color="#10B981" />
                                                <Text style={styles.wonText}>WON</Text>
                                            </View>
                                        ) : (
                                            <View style={styles.lostBadge}>
                                                <XCircle size={14} color="#EF4444" />
                                                <Text style={styles.lostText}>NO WIN</Text>
                                            </View>
                                        )}
                                    </View>

                                    {draw.won && draw.prize && (
                                        <View style={styles.prizeRow}>
                                            <PrizeIcon size={20} color={colors.primary} />
                                            <Text style={[styles.prizeText, { color: colors.primary }]}>
                                                {draw.prize}
                                            </Text>
                                        </View>
                                    )}

                                    <View style={styles.drawStats}>
                                        <View style={styles.drawStat}>
                                            <Text style={[styles.drawStatLabel, { color: theme.textSecondary }]}>Your Tickets</Text>
                                            <Text style={[styles.drawStatValue, { color: theme.text }]}>{draw.your_tickets}</Text>
                                        </View>
                                        <View style={styles.drawStat}>
                                            <Text style={[styles.drawStatLabel, { color: theme.textSecondary }]}>Total Pool</Text>
                                            <Text style={[styles.drawStatValue, { color: theme.text }]}>{draw.total_tickets.toLocaleString()}</Text>
                                        </View>
                                        <View style={styles.drawStat}>
                                            <Text style={[styles.drawStatLabel, { color: theme.textSecondary }]}>Your Odds</Text>
                                            <Text style={[styles.drawStatValue, { color: theme.text }]}>
                                                {((draw.your_tickets / draw.total_tickets) * 100).toFixed(2)}%
                                            </Text>
                                        </View>
                                    </View>

                                    {draw.winning_numbers && (
                                        <View style={styles.numbersSection}>
                                            <Text style={[styles.numbersLabel, { color: theme.textSecondary }]}>Winning Numbers</Text>
                                            <View style={styles.numbersRow}>
                                                {draw.winning_numbers.map((num, i) => (
                                                    <View key={i} style={[
                                                        styles.numberBadge,
                                                        draw.your_numbers?.includes(num) && styles.numberBadgeMatch
                                                    ]}>
                                                        <Text style={[
                                                            styles.numberText,
                                                            draw.your_numbers?.includes(num) && styles.numberTextMatch
                                                        ]}>
                                                            #{num}
                                                        </Text>
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                    )}
                                </View>
                            );
                        })}
                    </View>
                )}

                {/* Ticket Earnings */}
                {activeTab === 'earnings' && (
                    <View style={styles.listSection}>
                        {ticketEarnings.map((earning) => (
                            <View key={earning.id} style={[styles.earningCard, { backgroundColor: theme.surface }]}>
                                <View style={styles.earningIcon}>
                                    <Ticket size={20} color="#3B82F6" />
                                </View>
                                <View style={styles.earningInfo}>
                                    <Text style={[styles.earningDescription, { color: theme.text }]}>
                                        {earning.description}
                                    </Text>
                                    <View style={styles.earningTimeRow}>
                                        <Clock size={12} color={theme.textSecondary} />
                                        <Text style={[styles.earningTime, { color: theme.textSecondary }]}>
                                            {formatDate(earning.timestamp)} at {formatTime(earning.timestamp)}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.earningTickets}>
                                    <Text style={styles.earningTicketsText}>+{earning.tickets_earned}</Text>
                                </View>
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
    // Stats Row
    statsRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingTop: 16,
        gap: 10,
    },
    statCard: {
        flex: 1,
        padding: 16,
        borderRadius: 14,
        alignItems: 'center',
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
    // Tabs
    tabs: {
        flexDirection: 'row',
        marginHorizontal: 16,
        marginTop: 20,
        backgroundColor: 'rgba(128,128,128,0.1)',
        borderRadius: 12,
        padding: 4,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 10,
        gap: 6,
    },
    tabActive: {
        backgroundColor: 'rgba(139,92,246,0.15)',
    },
    tabText: {
        fontSize: 13,
        fontWeight: '600',
    },
    // List Section
    listSection: {
        paddingHorizontal: 16,
        marginTop: 16,
    },
    // Draw Card
    drawCard: {
        padding: 16,
        borderRadius: 14,
        marginBottom: 12,
    },
    drawHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    drawDateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    drawDate: {
        fontSize: 14,
        fontWeight: '600',
    },
    cycleTypeBadge: {
        backgroundColor: 'rgba(139,92,246,0.15)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    cycleTypeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#8B5CF6',
    },
    wonBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(16,185,129,0.15)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    wonText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#10B981',
    },
    lostBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(239,68,68,0.15)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    lostText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#EF4444',
    },
    prizeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(128,128,128,0.1)',
    },
    prizeText: {
        fontSize: 16,
        fontWeight: '700',
    },
    drawStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    drawStat: {
        alignItems: 'center',
    },
    drawStatLabel: {
        fontSize: 11,
        marginBottom: 4,
    },
    drawStatValue: {
        fontSize: 14,
        fontWeight: '700',
    },
    numbersSection: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(128,128,128,0.1)',
    },
    numbersLabel: {
        fontSize: 12,
        marginBottom: 8,
    },
    numbersRow: {
        flexDirection: 'row',
        gap: 8,
    },
    numberBadge: {
        backgroundColor: 'rgba(128,128,128,0.1)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    numberBadgeMatch: {
        backgroundColor: 'rgba(16,185,129,0.2)',
    },
    numberText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
    },
    numberTextMatch: {
        color: '#10B981',
    },
    // Earning Card
    earningCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 14,
        marginBottom: 10,
    },
    earningIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: 'rgba(59,130,246,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    earningInfo: {
        flex: 1,
    },
    earningDescription: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 4,
    },
    earningTimeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    earningTime: {
        fontSize: 12,
    },
    earningTickets: {
        backgroundColor: 'rgba(16,185,129,0.15)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    earningTicketsText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#10B981',
    },
});

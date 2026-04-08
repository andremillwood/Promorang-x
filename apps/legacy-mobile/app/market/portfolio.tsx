import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Image,
    Dimensions,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    ArrowDownRight,
    Wallet,
    PieChart,
    BarChart3,
    Clock,
    ChevronRight,
} from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAuthStore } from '@/store/authStore';
import { haptics } from '@/lib/haptics';
import colors from '@/constants/colors';

const { width } = Dimensions.get('window');

interface PortfolioSummary {
    total_value: number;
    total_invested: number;
    total_profit_loss: number;
    profit_loss_percent: number;
    day_change: number;
    day_change_percent: number;
}

interface Holding {
    id: string;
    content_id: string;
    title: string;
    creator_name: string;
    thumbnail: string;
    shares_owned: number;
    avg_cost: number;
    current_price: number;
    total_value: number;
    profit_loss: number;
    profit_loss_percent: number;
    day_change_percent: number;
}

interface Transaction {
    id: string;
    content_title: string;
    type: 'buy' | 'sell';
    shares: number;
    price: number;
    total: number;
    timestamp: string;
}

const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value.toFixed(2)}`;
};

export default function PortfolioScreen() {
    const router = useRouter();
    const theme = useThemeColors();
    const { user, token } = useAuthStore();

    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'holdings' | 'history'>('holdings');
    const [summary, setSummary] = useState<PortfolioSummary | null>(null);
    const [holdings, setHoldings] = useState<Holding[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchPortfolio();
    }, []);

    const fetchPortfolio = async () => {
        try {
            setIsLoading(true);
            // Mock data - replace with real API
            setSummary({
                total_value: 2847.50,
                total_invested: 2450.00,
                total_profit_loss: 397.50,
                profit_loss_percent: 16.22,
                day_change: 45.30,
                day_change_percent: 1.62,
            });

            setHoldings([
                {
                    id: '1',
                    content_id: 'c1',
                    title: 'iPhone 16 Pro Max Review',
                    creator_name: 'TechReviewer',
                    thumbnail: 'https://picsum.photos/seed/tech1/200/200',
                    shares_owned: 15,
                    avg_cost: 21.50,
                    current_price: 24.50,
                    total_value: 367.50,
                    profit_loss: 45.00,
                    profit_loss_percent: 13.95,
                    day_change_percent: 5.24,
                },
                {
                    id: '2',
                    content_id: 'c3',
                    title: 'Acoustic Cover - Viral Hit',
                    creator_name: 'MusicMaven',
                    thumbnail: 'https://picsum.photos/seed/music1/200/200',
                    shares_owned: 25,
                    avg_cost: 28.00,
                    current_price: 32.00,
                    total_value: 800.00,
                    profit_loss: 100.00,
                    profit_loss_percent: 14.29,
                    day_change_percent: 12.5,
                },
                {
                    id: '3',
                    content_id: 'c2',
                    title: 'Summer Fashion Haul 2026',
                    creator_name: 'StyleQueen',
                    thumbnail: 'https://picsum.photos/seed/fashion1/200/200',
                    shares_owned: 40,
                    avg_cost: 20.00,
                    current_price: 18.75,
                    total_value: 750.00,
                    profit_loss: -50.00,
                    profit_loss_percent: -6.25,
                    day_change_percent: -2.1,
                },
                {
                    id: '4',
                    content_id: 'c4',
                    title: 'Epic Gaming Montage',
                    creator_name: 'ProGamer',
                    thumbnail: 'https://picsum.photos/seed/gaming1/200/200',
                    shares_owned: 60,
                    avg_cost: 14.00,
                    current_price: 15.25,
                    total_value: 915.00,
                    profit_loss: 75.00,
                    profit_loss_percent: 8.93,
                    day_change_percent: -0.8,
                },
            ]);

            setTransactions([
                {
                    id: 't1',
                    content_title: 'iPhone 16 Pro Max Review',
                    type: 'buy',
                    shares: 5,
                    price: 24.50,
                    total: 122.50,
                    timestamp: '2026-01-09T14:30:00Z',
                },
                {
                    id: 't2',
                    content_title: 'Acoustic Cover - Viral Hit',
                    type: 'buy',
                    shares: 10,
                    price: 30.00,
                    total: 300.00,
                    timestamp: '2026-01-09T10:15:00Z',
                },
                {
                    id: 't3',
                    content_title: 'Old Meme Compilation',
                    type: 'sell',
                    shares: 20,
                    price: 3.50,
                    total: 70.00,
                    timestamp: '2026-01-08T16:45:00Z',
                },
                {
                    id: 't4',
                    content_title: 'Summer Fashion Haul 2026',
                    type: 'buy',
                    shares: 15,
                    price: 19.50,
                    total: 292.50,
                    timestamp: '2026-01-08T09:20:00Z',
                },
            ]);

        } catch (error) {
            console.error('Error fetching portfolio:', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchPortfolio();
    };

    const navigateToShare = async (contentId: string) => {
        await haptics.light();
        router.push({ pathname: '/promoshare/[id]', params: { id: contentId } } as any);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const isPositive = (summary?.profit_loss_percent || 0) >= 0;

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen
                options={{
                    title: 'Portfolio',
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
                {/* Portfolio Summary Card */}
                <LinearGradient
                    colors={isPositive ? ['#10B981', '#059669'] : ['#EF4444', '#DC2626']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.summaryCard}
                >
                    <View style={styles.summaryHeader}>
                        <Text style={styles.summaryLabel}>Total Portfolio Value</Text>
                        <Wallet size={24} color="rgba(255,255,255,0.8)" />
                    </View>
                    <Text style={styles.summaryValue}>
                        ${summary?.total_value.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
                    </Text>

                    <View style={styles.summaryStats}>
                        <View style={styles.summaryStat}>
                            <Text style={styles.summaryStatLabel}>Total P/L</Text>
                            <Text style={styles.summaryStatValue}>
                                {isPositive ? '+' : ''}${summary?.total_profit_loss.toFixed(2) || '0.00'}
                                {' '}({isPositive ? '+' : ''}{summary?.profit_loss_percent.toFixed(2) || '0'}%)
                            </Text>
                        </View>
                        <View style={styles.summaryStat}>
                            <Text style={styles.summaryStatLabel}>Today</Text>
                            <View style={styles.dayChangeRow}>
                                {(summary?.day_change || 0) >= 0 ? (
                                    <ArrowUpRight size={16} color="#FFF" />
                                ) : (
                                    <ArrowDownRight size={16} color="#FFF" />
                                )}
                                <Text style={styles.summaryStatValue}>
                                    ${Math.abs(summary?.day_change || 0).toFixed(2)} ({summary?.day_change_percent.toFixed(2)}%)
                                </Text>
                            </View>
                        </View>
                    </View>
                </LinearGradient>

                {/* Quick Stats */}
                <View style={styles.quickStats}>
                    <View style={[styles.quickStatCard, { backgroundColor: theme.surface }]}>
                        <PieChart size={20} color={colors.primary} />
                        <Text style={[styles.quickStatValue, { color: theme.text }]}>
                            {holdings.length}
                        </Text>
                        <Text style={[styles.quickStatLabel, { color: theme.textSecondary }]}>
                            Holdings
                        </Text>
                    </View>
                    <View style={[styles.quickStatCard, { backgroundColor: theme.surface }]}>
                        <BarChart3 size={20} color="#F59E0B" />
                        <Text style={[styles.quickStatValue, { color: theme.text }]}>
                            {holdings.reduce((sum, h) => sum + h.shares_owned, 0)}
                        </Text>
                        <Text style={[styles.quickStatLabel, { color: theme.textSecondary }]}>
                            Total Shares
                        </Text>
                    </View>
                    <View style={[styles.quickStatCard, { backgroundColor: theme.surface }]}>
                        <TrendingUp size={20} color="#10B981" />
                        <Text style={[styles.quickStatValue, { color: theme.text }]}>
                            {holdings.filter(h => h.profit_loss > 0).length}
                        </Text>
                        <Text style={[styles.quickStatLabel, { color: theme.textSecondary }]}>
                            Profitable
                        </Text>
                    </View>
                </View>

                {/* Tabs */}
                <View style={styles.tabs}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'holdings' && styles.tabActive]}
                        onPress={() => setActiveTab('holdings')}
                    >
                        <Text style={[
                            styles.tabText,
                            { color: activeTab === 'holdings' ? colors.primary : theme.textSecondary }
                        ]}>
                            Holdings
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'history' && styles.tabActive]}
                        onPress={() => setActiveTab('history')}
                    >
                        <Text style={[
                            styles.tabText,
                            { color: activeTab === 'history' ? colors.primary : theme.textSecondary }
                        ]}>
                            History
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Holdings List */}
                {activeTab === 'holdings' && (
                    <View style={styles.holdingsList}>
                        {holdings.map((holding) => {
                            const isProfitable = holding.profit_loss >= 0;
                            return (
                                <TouchableOpacity
                                    key={holding.id}
                                    style={[styles.holdingCard, { backgroundColor: theme.surface }]}
                                    onPress={() => navigateToShare(holding.content_id)}
                                    activeOpacity={0.7}
                                >
                                    <Image
                                        source={{ uri: holding.thumbnail }}
                                        style={styles.holdingThumbnail}
                                    />
                                    <View style={styles.holdingInfo}>
                                        <Text style={[styles.holdingTitle, { color: theme.text }]} numberOfLines={1}>
                                            {holding.title}
                                        </Text>
                                        <Text style={[styles.holdingCreator, { color: theme.textSecondary }]}>
                                            {holding.creator_name} • {holding.shares_owned} shares
                                        </Text>
                                        <View style={styles.holdingPrices}>
                                            <Text style={[styles.holdingAvgCost, { color: theme.textSecondary }]}>
                                                Avg: ${holding.avg_cost.toFixed(2)}
                                            </Text>
                                            <Text style={[styles.holdingCurrentPrice, { color: theme.text }]}>
                                                Now: ${holding.current_price.toFixed(2)}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.holdingPL}>
                                        <Text style={[styles.holdingValue, { color: theme.text }]}>
                                            ${holding.total_value.toFixed(2)}
                                        </Text>
                                        <View style={[
                                            styles.holdingPLBadge,
                                            { backgroundColor: isProfitable ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)' }
                                        ]}>
                                            {isProfitable ? (
                                                <ArrowUpRight size={12} color="#10B981" />
                                            ) : (
                                                <ArrowDownRight size={12} color="#EF4444" />
                                            )}
                                            <Text style={{ color: isProfitable ? '#10B981' : '#EF4444', fontSize: 11, fontWeight: '600' }}>
                                                {isProfitable ? '+' : ''}{holding.profit_loss_percent.toFixed(1)}%
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}

                {/* Transaction History */}
                {activeTab === 'history' && (
                    <View style={styles.transactionsList}>
                        {transactions.map((tx) => (
                            <View
                                key={tx.id}
                                style={[styles.transactionCard, { backgroundColor: theme.surface }]}
                            >
                                <View style={[
                                    styles.txTypeBadge,
                                    { backgroundColor: tx.type === 'buy' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)' }
                                ]}>
                                    {tx.type === 'buy' ? (
                                        <ArrowUpRight size={16} color="#10B981" />
                                    ) : (
                                        <ArrowDownRight size={16} color="#EF4444" />
                                    )}
                                </View>
                                <View style={styles.txInfo}>
                                    <Text style={[styles.txTitle, { color: theme.text }]} numberOfLines={1}>
                                        {tx.content_title}
                                    </Text>
                                    <Text style={[styles.txDetails, { color: theme.textSecondary }]}>
                                        {tx.type === 'buy' ? 'Bought' : 'Sold'} {tx.shares} @ ${tx.price.toFixed(2)}
                                    </Text>
                                    <View style={styles.txTimeRow}>
                                        <Clock size={12} color={theme.textSecondary} />
                                        <Text style={[styles.txTime, { color: theme.textSecondary }]}>
                                            {formatDate(tx.timestamp)}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={[
                                    styles.txTotal,
                                    { color: tx.type === 'buy' ? '#EF4444' : '#10B981' }
                                ]}>
                                    {tx.type === 'buy' ? '-' : '+'}${tx.total.toFixed(2)}
                                </Text>
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
    // Summary Card
    summaryCard: {
        margin: 16,
        borderRadius: 20,
        padding: 20,
    },
    summaryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
    },
    summaryValue: {
        fontSize: 36,
        fontWeight: '800',
        color: '#FFF',
        marginBottom: 16,
    },
    summaryStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    summaryStat: {},
    summaryStatLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 4,
    },
    summaryStatValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFF',
    },
    dayChangeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    // Quick Stats
    quickStats: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 10,
        marginBottom: 20,
    },
    quickStatCard: {
        flex: 1,
        padding: 14,
        borderRadius: 14,
        alignItems: 'center',
    },
    quickStatValue: {
        fontSize: 20,
        fontWeight: '700',
        marginTop: 8,
    },
    quickStatLabel: {
        fontSize: 11,
        marginTop: 4,
    },
    // Tabs
    tabs: {
        flexDirection: 'row',
        marginHorizontal: 16,
        marginBottom: 16,
        backgroundColor: 'rgba(128,128,128,0.1)',
        borderRadius: 12,
        padding: 4,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10,
    },
    tabActive: {
        backgroundColor: 'rgba(139,92,246,0.15)',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
    },
    // Holdings
    holdingsList: {
        paddingHorizontal: 16,
    },
    holdingCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 14,
        marginBottom: 10,
    },
    holdingThumbnail: {
        width: 52,
        height: 52,
        borderRadius: 10,
        marginRight: 12,
    },
    holdingInfo: {
        flex: 1,
    },
    holdingTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
    },
    holdingCreator: {
        fontSize: 12,
        marginBottom: 4,
    },
    holdingPrices: {
        flexDirection: 'row',
        gap: 12,
    },
    holdingAvgCost: {
        fontSize: 11,
    },
    holdingCurrentPrice: {
        fontSize: 11,
        fontWeight: '600',
    },
    holdingPL: {
        alignItems: 'flex-end',
    },
    holdingValue: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 4,
    },
    holdingPLBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 6,
        gap: 2,
    },
    // Transactions
    transactionsList: {
        paddingHorizontal: 16,
    },
    transactionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 14,
        marginBottom: 10,
    },
    txTypeBadge: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    txInfo: {
        flex: 1,
    },
    txTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
    },
    txDetails: {
        fontSize: 12,
        marginBottom: 4,
    },
    txTimeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    txTime: {
        fontSize: 11,
    },
    txTotal: {
        fontSize: 15,
        fontWeight: '700',
    },
});

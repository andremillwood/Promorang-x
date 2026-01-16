import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions,
    TextInput,
    Modal,
    Alert,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Polyline, Line, Rect, G } from 'react-native-svg';
import {
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    ArrowDownRight,
    Star,
    Share2,
    Users,
    Activity,
    Clock,
    BarChart3,
    ChevronDown,
    X,
    Minus,
    Plus,
    Info,
    ExternalLink,
} from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAuthStore } from '@/store/authStore';
import { haptics } from '@/lib/haptics';
import colors from '@/constants/colors';

const { width } = Dimensions.get('window');

interface ShareDetail {
    id: string;
    content_id: string;
    title: string;
    description: string;
    creator_name: string;
    creator_avatar: string;
    creator_id: string;
    platform: string;
    category_name: string;
    current_price: number;
    previous_close: number;
    change_24h: number;
    change_7d: number;
    volume_24h: number;
    market_cap: number;
    total_shares: number;
    available_shares: number;
    holder_count: number;
    day_high: number;
    day_low: number;
    all_time_high: number;
    thumbnail?: string;
    content_url?: string;
}

interface OHLCData {
    period_start: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

interface Holding {
    shares_owned: number;
    avg_cost: number;
    total_value: number;
    profit_loss: number;
    profit_loss_percent: number;
}

const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value.toFixed(2)}`;
};

// Simple line chart component
const PriceChart = ({ data, height = 180, color }: { data: number[]; height?: number; color: string }) => {
    if (!data || data.length < 2) {
        return (
            <View style={[styles.chartPlaceholder, { height }]}>
                <Activity size={32} color="#666" />
                <Text style={styles.chartPlaceholderText}>No price data</Text>
            </View>
        );
    }

    const chartWidth = width - 32;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const points = data.map((value, index) => {
        const x = (index / (data.length - 1)) * chartWidth;
        const y = height - ((value - min) / range) * (height - 20) - 10;
        return `${x},${y}`;
    }).join(' ');

    return (
        <Svg width={chartWidth} height={height}>
            <Polyline
                points={points}
                fill="none"
                stroke={color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
};

export default function ShareDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const theme = useThemeColors();
    const { user, token } = useAuthStore();

    const [share, setShare] = useState<ShareDetail | null>(null);
    const [priceHistory, setPriceHistory] = useState<number[]>([]);
    const [holding, setHolding] = useState<Holding | null>(null);
    const [isWatchlisted, setIsWatchlisted] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState<'1D' | '1W' | '1M' | '3M' | 'ALL'>('1D');
    const [isLoading, setIsLoading] = useState(true);

    // Trade modal state
    const [showTradeModal, setShowTradeModal] = useState(false);
    const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
    const [tradeAmount, setTradeAmount] = useState('1');

    useEffect(() => {
        fetchShareDetail();
    }, [id]);

    const fetchShareDetail = async () => {
        try {
            setIsLoading(true);
            // Mock data - replace with real API
            setShare({
                id: id || '1',
                content_id: 'c1',
                title: 'iPhone 16 Pro Max - Ultimate Review',
                description: 'The most comprehensive review of Apple\'s latest flagship smartphone, covering camera, performance, battery life, and more.',
                creator_name: 'TechReviewer',
                creator_avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=tech1',
                creator_id: 'u1',
                platform: 'YouTube',
                category_name: 'Technology',
                current_price: 24.50,
                previous_close: 23.28,
                change_24h: 5.24,
                change_7d: 12.8,
                volume_24h: 12500,
                market_cap: 245000,
                total_shares: 10000,
                available_shares: 3420,
                holder_count: 156,
                day_high: 25.10,
                day_low: 23.05,
                all_time_high: 28.75,
                thumbnail: 'https://picsum.photos/seed/tech1/400/300',
                content_url: 'https://youtube.com/watch?v=example',
            });

            // Mock price history
            const mockPrices = Array.from({ length: 24 }, (_, i) => {
                return 22 + Math.random() * 4 + (i / 24) * 2;
            });
            setPriceHistory(mockPrices);

            // Mock user holding
            if (user) {
                setHolding({
                    shares_owned: 15,
                    avg_cost: 21.50,
                    total_value: 367.50,
                    profit_loss: 45.00,
                    profit_loss_percent: 13.95,
                });
            }

        } catch (error) {
            console.error('Error fetching share detail:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTrade = async () => {
        const amount = parseInt(tradeAmount);
        if (isNaN(amount) || amount <= 0) {
            Alert.alert('Invalid Amount', 'Please enter a valid number of shares');
            return;
        }

        await haptics.medium();

        // Mock trade execution
        Alert.alert(
            'Trade Executed',
            `Successfully ${tradeType === 'buy' ? 'bought' : 'sold'} ${amount} shares at $${share?.current_price.toFixed(2)}`,
            [{ text: 'OK', onPress: () => setShowTradeModal(false) }]
        );
    };

    const toggleWatchlist = async () => {
        await haptics.light();
        setIsWatchlisted(!isWatchlisted);
    };

    const handleShare = async () => {
        await haptics.light();
        // Implement share functionality
    };

    if (!share) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <Stack.Screen options={{ title: 'Loading...' }} />
            </View>
        );
    }

    const isPositive = share.change_24h >= 0;
    const tradeTotal = parseFloat(tradeAmount) * share.current_price;

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen
                options={{
                    title: '',
                    headerStyle: { backgroundColor: theme.background },
                    headerRight: () => (
                        <View style={styles.headerActions}>
                            <TouchableOpacity onPress={toggleWatchlist} style={styles.headerButton}>
                                <Star
                                    size={22}
                                    color={isWatchlisted ? '#F59E0B' : theme.textSecondary}
                                    fill={isWatchlisted ? '#F59E0B' : 'transparent'}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
                                <Share2 size={22} color={theme.text} />
                            </TouchableOpacity>
                        </View>
                    ),
                }}
            />

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header Section */}
                <View style={styles.header}>
                    <Image source={{ uri: share.thumbnail }} style={styles.thumbnail} />
                    <View style={styles.headerInfo}>
                        <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
                            {share.title}
                        </Text>
                        <TouchableOpacity
                            style={styles.creatorRow}
                            onPress={() => router.push({ pathname: '/user/[id]', params: { id: share.creator_id } } as any)}
                        >
                            <Image source={{ uri: share.creator_avatar }} style={styles.creatorAvatar} />
                            <Text style={[styles.creatorName, { color: theme.textSecondary }]}>
                                {share.creator_name}
                            </Text>
                            <Text style={[styles.platform, { color: theme.textSecondary }]}>
                                • {share.platform}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Price Section */}
                <View style={styles.priceSection}>
                    <View style={styles.priceRow}>
                        <Text style={[styles.currentPrice, { color: theme.text }]}>
                            ${share.current_price.toFixed(2)}
                        </Text>
                        <View style={[
                            styles.changeBadge,
                            { backgroundColor: isPositive ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)' }
                        ]}>
                            {isPositive ? (
                                <ArrowUpRight size={18} color="#10B981" />
                            ) : (
                                <ArrowDownRight size={18} color="#EF4444" />
                            )}
                            <Text style={{ color: isPositive ? '#10B981' : '#EF4444', fontSize: 15, fontWeight: '700' }}>
                                {isPositive ? '+' : ''}{share.change_24h.toFixed(2)}%
                            </Text>
                        </View>
                    </View>
                    <Text style={[styles.priceSubtext, { color: theme.textSecondary }]}>
                        Previous close: ${share.previous_close.toFixed(2)}
                    </Text>
                </View>

                {/* Chart Section */}
                <View style={styles.chartSection}>
                    <View style={styles.periodTabs}>
                        {(['1D', '1W', '1M', '3M', 'ALL'] as const).map((period) => (
                            <TouchableOpacity
                                key={period}
                                style={[
                                    styles.periodTab,
                                    selectedPeriod === period && styles.periodTabActive
                                ]}
                                onPress={() => setSelectedPeriod(period)}
                            >
                                <Text style={[
                                    styles.periodTabText,
                                    { color: selectedPeriod === period ? colors.primary : theme.textSecondary }
                                ]}>
                                    {period}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View style={styles.chart}>
                        <PriceChart
                            data={priceHistory}
                            height={180}
                            color={isPositive ? '#10B981' : '#EF4444'}
                        />
                    </View>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Day High</Text>
                        <Text style={[styles.statValue, { color: theme.text }]}>${share.day_high.toFixed(2)}</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Day Low</Text>
                        <Text style={[styles.statValue, { color: theme.text }]}>${share.day_low.toFixed(2)}</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>24h Volume</Text>
                        <Text style={[styles.statValue, { color: theme.text }]}>{formatCurrency(share.volume_24h)}</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Market Cap</Text>
                        <Text style={[styles.statValue, { color: theme.text }]}>{formatCurrency(share.market_cap)}</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Holders</Text>
                        <Text style={[styles.statValue, { color: theme.text }]}>{share.holder_count}</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>ATH</Text>
                        <Text style={[styles.statValue, { color: theme.text }]}>${share.all_time_high.toFixed(2)}</Text>
                    </View>
                </View>

                {/* Your Position */}
                {holding && (
                    <View style={[styles.positionCard, { backgroundColor: theme.surface }]}>
                        <Text style={[styles.positionTitle, { color: theme.text }]}>Your Position</Text>
                        <View style={styles.positionGrid}>
                            <View style={styles.positionItem}>
                                <Text style={[styles.positionLabel, { color: theme.textSecondary }]}>Shares</Text>
                                <Text style={[styles.positionValue, { color: theme.text }]}>{holding.shares_owned}</Text>
                            </View>
                            <View style={styles.positionItem}>
                                <Text style={[styles.positionLabel, { color: theme.textSecondary }]}>Avg Cost</Text>
                                <Text style={[styles.positionValue, { color: theme.text }]}>${holding.avg_cost.toFixed(2)}</Text>
                            </View>
                            <View style={styles.positionItem}>
                                <Text style={[styles.positionLabel, { color: theme.textSecondary }]}>Value</Text>
                                <Text style={[styles.positionValue, { color: theme.text }]}>${holding.total_value.toFixed(2)}</Text>
                            </View>
                            <View style={styles.positionItem}>
                                <Text style={[styles.positionLabel, { color: theme.textSecondary }]}>P/L</Text>
                                <Text style={[
                                    styles.positionValue,
                                    { color: holding.profit_loss >= 0 ? '#10B981' : '#EF4444' }
                                ]}>
                                    {holding.profit_loss >= 0 ? '+' : ''}${holding.profit_loss.toFixed(2)} ({holding.profit_loss_percent.toFixed(1)}%)
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* About Section */}
                <View style={styles.aboutSection}>
                    <Text style={[styles.aboutTitle, { color: theme.text }]}>About</Text>
                    <Text style={[styles.aboutText, { color: theme.textSecondary }]}>
                        {share.description}
                    </Text>
                    <TouchableOpacity style={styles.viewContentButton}>
                        <ExternalLink size={16} color={colors.primary} />
                        <Text style={styles.viewContentText}>View Original Content</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Trade Buttons */}
            <View style={[styles.tradeBar, { backgroundColor: theme.background }]}>
                <TouchableOpacity
                    style={[styles.tradeButton, styles.sellButton]}
                    onPress={() => {
                        setTradeType('sell');
                        setShowTradeModal(true);
                        haptics.light();
                    }}
                >
                    <Text style={styles.tradeButtonText}>Sell</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tradeButton, styles.buyButton]}
                    onPress={() => {
                        setTradeType('buy');
                        setShowTradeModal(true);
                        haptics.light();
                    }}
                >
                    <Text style={styles.tradeButtonText}>Buy</Text>
                </TouchableOpacity>
            </View>

            {/* Trade Modal */}
            <Modal
                visible={showTradeModal}
                animationType="slide"
                transparent
                onRequestClose={() => setShowTradeModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>
                                {tradeType === 'buy' ? 'Buy' : 'Sell'} {share.title.slice(0, 20)}...
                            </Text>
                            <TouchableOpacity onPress={() => setShowTradeModal(false)}>
                                <X size={24} color={theme.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalBody}>
                            <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>
                                Current Price
                            </Text>
                            <Text style={[styles.modalPrice, { color: theme.text }]}>
                                ${share.current_price.toFixed(2)}
                            </Text>

                            <Text style={[styles.modalLabel, { color: theme.textSecondary, marginTop: 20 }]}>
                                Number of Shares
                            </Text>
                            <View style={styles.amountInput}>
                                <TouchableOpacity
                                    style={[styles.amountButton, { backgroundColor: theme.surface }]}
                                    onPress={() => {
                                        const current = parseInt(tradeAmount) || 0;
                                        if (current > 1) setTradeAmount((current - 1).toString());
                                    }}
                                >
                                    <Minus size={20} color={theme.text} />
                                </TouchableOpacity>
                                <TextInput
                                    style={[styles.amountTextInput, { color: theme.text, backgroundColor: theme.surface }]}
                                    value={tradeAmount}
                                    onChangeText={setTradeAmount}
                                    keyboardType="number-pad"
                                    textAlign="center"
                                />
                                <TouchableOpacity
                                    style={[styles.amountButton, { backgroundColor: theme.surface }]}
                                    onPress={() => {
                                        const current = parseInt(tradeAmount) || 0;
                                        setTradeAmount((current + 1).toString());
                                    }}
                                >
                                    <Plus size={20} color={theme.text} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.totalRow}>
                                <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>Total</Text>
                                <Text style={[styles.totalValue, { color: theme.text }]}>
                                    ${isNaN(tradeTotal) ? '0.00' : tradeTotal.toFixed(2)}
                                </Text>
                            </View>

                            {tradeType === 'buy' && (
                                <View style={styles.availableRow}>
                                    <Info size={14} color={theme.textSecondary} />
                                    <Text style={[styles.availableText, { color: theme.textSecondary }]}>
                                        {share.available_shares.toLocaleString()} shares available
                                    </Text>
                                </View>
                            )}

                            {tradeType === 'sell' && holding && (
                                <View style={styles.availableRow}>
                                    <Info size={14} color={theme.textSecondary} />
                                    <Text style={[styles.availableText, { color: theme.textSecondary }]}>
                                        You own {holding.shares_owned} shares
                                    </Text>
                                </View>
                            )}
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.confirmButton,
                                { backgroundColor: tradeType === 'buy' ? '#10B981' : '#EF4444' }
                            ]}
                            onPress={handleTrade}
                        >
                            <Text style={styles.confirmButtonText}>
                                Confirm {tradeType === 'buy' ? 'Purchase' : 'Sale'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 8,
    },
    headerButton: {
        padding: 8,
    },
    // Header
    header: {
        flexDirection: 'row',
        padding: 16,
        gap: 14,
    },
    thumbnail: {
        width: 80,
        height: 80,
        borderRadius: 12,
    },
    headerInfo: {
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 8,
    },
    creatorRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    creatorAvatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginRight: 8,
    },
    creatorName: {
        fontSize: 14,
        fontWeight: '500',
    },
    platform: {
        fontSize: 14,
        marginLeft: 4,
    },
    // Price Section
    priceSection: {
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    currentPrice: {
        fontSize: 36,
        fontWeight: '800',
    },
    changeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
        gap: 4,
    },
    priceSubtext: {
        fontSize: 13,
        marginTop: 4,
    },
    // Chart
    chartSection: {
        paddingHorizontal: 16,
        marginBottom: 20,
    },
    periodTabs: {
        flexDirection: 'row',
        marginBottom: 16,
        gap: 8,
    },
    periodTab: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 8,
    },
    periodTabActive: {
        backgroundColor: 'rgba(139,92,246,0.15)',
    },
    periodTabText: {
        fontSize: 13,
        fontWeight: '600',
    },
    chart: {
        alignItems: 'center',
    },
    chartPlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    chartPlaceholderText: {
        color: '#666',
        marginTop: 8,
    },
    // Stats Grid
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 12,
        gap: 8,
        marginBottom: 20,
    },
    statCard: {
        width: (width - 40) / 3,
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 11,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 14,
        fontWeight: '700',
    },
    // Position Card
    positionCard: {
        marginHorizontal: 16,
        padding: 16,
        borderRadius: 16,
        marginBottom: 20,
    },
    positionTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 16,
    },
    positionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    positionItem: {
        width: '45%',
    },
    positionLabel: {
        fontSize: 12,
        marginBottom: 4,
    },
    positionValue: {
        fontSize: 16,
        fontWeight: '600',
    },
    // About
    aboutSection: {
        paddingHorizontal: 16,
    },
    aboutTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 8,
    },
    aboutText: {
        fontSize: 14,
        lineHeight: 22,
    },
    viewContentButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 12,
    },
    viewContentText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.primary,
    },
    // Trade Bar
    tradeBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        padding: 16,
        paddingBottom: 32,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(128,128,128,0.2)',
    },
    tradeButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
    },
    buyButton: {
        backgroundColor: '#10B981',
    },
    sellButton: {
        backgroundColor: '#EF4444',
    },
    tradeButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFF',
    },
    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    modalBody: {},
    modalLabel: {
        fontSize: 13,
        marginBottom: 8,
    },
    modalPrice: {
        fontSize: 32,
        fontWeight: '800',
    },
    amountInput: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    amountButton: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    amountTextInput: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        fontSize: 20,
        fontWeight: '700',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 24,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(128,128,128,0.2)',
    },
    totalLabel: {
        fontSize: 16,
    },
    totalValue: {
        fontSize: 24,
        fontWeight: '800',
    },
    availableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 12,
    },
    availableText: {
        fontSize: 13,
    },
    confirmButton: {
        marginTop: 24,
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
    },
    confirmButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFF',
    },
});

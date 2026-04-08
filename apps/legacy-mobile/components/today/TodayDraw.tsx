import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, LayoutAnimation, Platform } from 'react-native';
import { Ticket, Gift, Key, Zap, Award, Sparkles, Clock, Info, CheckCircle2, Trophy } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '@/hooks/useThemeColors';

interface DrawPrize {
    tier: string;
    type: string;
    amount: number;
    description: string;
}

interface DrawResult {
    won: boolean;
    prize_type?: string;
    prize_amount?: number;
}

interface TodayDrawProps {
    tickets: number;
    autoEntered: boolean;
    prizes: DrawPrize[];
    status: string;
    result: DrawResult | null;
}

const PRIZE_ICONS: Record<string, any> = {
    keys: Key,
    boost: Zap,
    badge: Award,
    access: Gift,
};

export const TodayDraw: React.FC<TodayDrawProps> = ({
    tickets,
    autoEntered,
    prizes,
    status,
    result
}) => {
    const theme = useThemeColors();
    const [showInfo, setShowInfo] = useState(false);
    const [timeLeft, setTimeLeft] = useState('');
    const maxTickets = 3;
    const ticketProgress = Math.min(tickets / maxTickets, 1);

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const resetTime = new Date();
            resetTime.setUTCHours(10, 0, 0, 0);
            if (now > resetTime) {
                resetTime.setUTCDate(resetTime.getUTCDate() + 1);
            }
            const diff = resetTime.getTime() - now.getTime();
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const toggleInfo = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setShowInfo(!showInfo);
    };

    if (result?.won) {
        return (
            <TouchableOpacity activeOpacity={0.9} style={styles.winnerCard}>
                <LinearGradient
                    colors={['#F59E0B', '#B45309']}
                    style={styles.winnerGradient}
                >
                    <View style={styles.winnerHeader}>
                        <Sparkles size={20} color="#FFF" />
                        <Text style={styles.winnerHeaderText}>YOU WON!</Text>
                    </View>
                    <View style={styles.winnerContent}>
                        <View style={styles.winnerIconBg}>
                            <Trophy size={40} color="#F59E0B" />
                        </View>
                        <Text style={styles.winnerAmount}>
                            {result.prize_amount} {result.prize_type?.toUpperCase()}
                        </Text>
                        <Text style={styles.winnerHint}>Added to your wallet!</Text>
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        );
    }

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['rgba(139, 92, 246, 0.2)', 'rgba(217, 70, 239, 0.1)']}
                style={styles.drawCard}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerTitleRow}>
                        <LinearGradient
                            colors={['#8B5CF6', '#D946EF']}
                            style={styles.iconBg}
                        >
                            <Ticket size={20} color="#FFF" />
                        </LinearGradient>
                        <View>
                            <Text style={styles.label}>DAILY DRAW</Text>
                            <View style={styles.clockRow}>
                                <Clock size={10} color="rgba(255,255,255,0.6)" />
                                <Text style={styles.timeText}>{timeLeft || 'Loading...'}</Text>
                            </View>
                        </View>
                    </View>
                    {autoEntered && (
                        <View style={styles.enteredBadge}>
                            <CheckCircle2 size={12} color="#10B981" />
                            <Text style={styles.enteredText}>Entered</Text>
                        </View>
                    )}
                </View>

                {/* Progress */}
                <TouchableOpacity
                    style={styles.progressSection}
                    onPress={toggleInfo}
                    activeOpacity={0.8}
                >
                    <View style={styles.progressLabels}>
                        <View style={styles.ticketCountRow}>
                            <Text style={styles.ticketCountText}>🎟️ {tickets} {tickets === 1 ? 'ticket' : 'tickets'}</Text>
                            <Info size={14} color="rgba(255,255,255,0.4)" />
                        </View>
                        <Text style={styles.progressFraction}>{tickets}/{maxTickets}</Text>
                    </View>

                    <View style={styles.progressBarBg}>
                        <LinearGradient
                            colors={['#8B5CF6', '#D946EF']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={[styles.progressBarFill, { width: `${ticketProgress * 100}%` }]}
                        />
                    </View>

                    {/* Dots */}
                    <View style={styles.dotsRow}>
                        {[...Array(maxTickets)].map((_, i) => (
                            <View
                                key={i}
                                style={[
                                    styles.dot,
                                    i < tickets ? styles.activeDot : styles.inactiveDot
                                ]}
                            >
                                <Ticket size={12} color={i < tickets ? '#FFF' : 'rgba(255,255,255,0.2)'} />
                            </View>
                        ))}
                    </View>

                    {showInfo && (
                        <View style={styles.infoBox}>
                            <Text style={styles.infoTitle}>HOW TO EARN</Text>
                            <Text style={styles.infoText}>1. Complete Today's Headline action</Text>
                            <Text style={styles.infoText}>2. Interact with trending posts</Text>
                            <Text style={styles.infoText}>3. Share your proof to the community</Text>
                        </View>
                    )}
                </TouchableOpacity>

                {/* Prize Pool */}
                <View style={[styles.prizePool, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                    <Text style={styles.prizePoolTitle}>TONIGHT'S PRIZES</Text>
                    <View style={styles.prizeList}>
                        {prizes.length > 0 ? prizes.slice(0, 3).map((prize, idx) => {
                            const Icon = PRIZE_ICONS[prize.type] || Gift;
                            return (
                                <View key={idx} style={styles.prizeBadge}>
                                    <Icon size={12} color="rgba(255,255,255,0.7)" />
                                    <Text style={styles.prizeText}>{prize.description}</Text>
                                </View>
                            );
                        }) : (
                            <Text style={styles.noPrizes}>PromoKeys, Gems, and Power Boosts</Text>
                        )}
                    </View>
                </View>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    drawCard: {
        borderRadius: 24,
        padding: 20,
        backgroundColor: '#1E1B4B', // fallback dark indigo
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    headerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconBg: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    label: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 2,
    },
    clockRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    timeText: {
        color: '#D946EF',
        fontSize: 11,
        fontWeight: '800',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    enteredBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.3)',
    },
    enteredText: {
        color: '#10B981',
        fontSize: 11,
        fontWeight: '700',
    },
    progressSection: {
        marginBottom: 20,
    },
    progressLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    ticketCountRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    ticketCountText: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: '800',
    },
    progressFraction: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 12,
        fontWeight: '700',
    },
    progressBarBg: {
        height: 10,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 5,
        overflow: 'hidden',
        marginBottom: 16,
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 5,
    },
    dotsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
    },
    dot: {
        width: 32,
        height: 32,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    activeDot: {
        backgroundColor: '#8B5CF6',
        borderColor: '#A78BFA',
    },
    inactiveDot: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderColor: 'rgba(255,255,255,0.1)',
    },
    infoBox: {
        marginTop: 16,
        padding: 12,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    infoTitle: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '900',
        marginBottom: 6,
    },
    infoText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 11,
        marginBottom: 4,
    },
    prizePool: {
        padding: 16,
        borderRadius: 16,
    },
    prizePoolTitle: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1,
        marginBottom: 10,
    },
    prizeList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    prizeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
    },
    prizeText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 11,
        fontWeight: '600',
    },
    noPrizes: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 11,
        fontStyle: 'italic',
    },
    winnerCard: {
        marginBottom: 24,
        borderRadius: 24,
        overflow: 'hidden',
    },
    winnerGradient: {
        padding: 24,
        alignItems: 'center',
    },
    winnerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    winnerHeaderText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: 2,
    },
    winnerContent: {
        alignItems: 'center',
    },
    winnerIconBg: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    winnerAmount: {
        color: '#FFF',
        fontSize: 28,
        fontWeight: '900',
        marginBottom: 4,
    },
    winnerHint: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        fontWeight: '600',
    },
});

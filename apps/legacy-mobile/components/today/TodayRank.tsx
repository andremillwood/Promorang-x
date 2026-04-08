import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, TrendingUp, TrendingDown, Minus, Ticket, ChevronRight } from 'lucide-react-native';

interface TodayRankProps {
    rank: number | null;
    percentile: number | null;
    change: number;
    todayProgress: {
        tickets: number;
        dynamic_points: number;
        label: string;
    };
    userState: number; // MaturityState (0-3)
}

export const TodayRank: React.FC<TodayRankProps> = ({ rank, percentile, change, todayProgress, userState }) => {

    // Determine movement indicator
    const getMovementIndicator = () => {
        if (change > 0) {
            return {
                icon: TrendingUp,
                text: `+${change}`,
                colors: {
                    bg: 'rgba(16, 185, 129, 0.2)',
                    border: 'rgba(16, 185, 129, 0.3)',
                    text: '#34D399'
                }
            };
        } else if (change < 0) {
            return {
                icon: TrendingDown,
                text: `${change}`,
                colors: {
                    bg: 'rgba(239, 68, 68, 0.2)',
                    border: 'rgba(239, 68, 68, 0.3)',
                    text: '#F87171'
                }
            };
        }
        return {
            icon: Minus,
            text: '—',
            colors: {
                bg: 'rgba(107, 114, 128, 0.2)',
                border: 'rgba(107, 114, 128, 0.3)',
                text: '#9CA3AF'
            }
        };
    };

    const movement = getMovementIndicator();
    const MovementIcon = movement.icon;
    const percentileValue = percentile !== null ? Math.round(100 - percentile) : null;

    // Fallback labels
    const rankLabel = userState === 0 ? "Entry Rank" : "Global Rank";

    return (
        <LinearGradient
            colors={['rgba(79, 70, 229, 0.3)', 'rgba(147, 51, 234, 0.2)', 'rgba(219, 39, 119, 0.1)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.container}
        >
            {/* Header */}
            <View style={styles.header}>
                <LinearGradient
                    colors={['#818CF8', '#A855F7']}
                    style={styles.iconContainer}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <Trophy size={14} color="#FFF" />
                </LinearGradient>
                <Text style={styles.label}>{rankLabel.toUpperCase()}</Text>
            </View>

            {/* Rank Display */}
            {rank !== null ? (
                <View style={styles.content}>
                    {/* Rank number + movement */}
                    <View style={styles.rankRow}>
                        <Text style={styles.rankValue}>#{rank.toLocaleString()}</Text>
                        <View style={[styles.badge, { backgroundColor: movement.colors.bg, borderColor: movement.colors.border }]}>
                            <MovementIcon size={10} color={movement.colors.text} />
                            <Text style={[styles.badgeText, { color: movement.colors.text }]}>{movement.text}</Text>
                        </View>
                    </View>

                    {/* Percentile Bar */}
                    {percentileValue !== null && (
                        <View style={styles.percentileContainer}>
                            <Text style={styles.percentileLabel}>Top {percentileValue}%</Text>
                            <View style={styles.progressBarBg}>
                                <LinearGradient
                                    colors={['#818CF8', '#A855F7']}
                                    start={{ x: 0, y: 0.5 }}
                                    end={{ x: 1, y: 0.5 }}
                                    style={[styles.progressBarFill, { width: `${100 - percentileValue}%` }]}
                                />
                            </View>
                        </View>
                    )}
                </View>
            ) : (
                <View style={styles.content}>
                    <Text style={styles.placeholderText}>
                        {userState === 0 ? "Rank unlocks after day 1" : "Calculating rank..."}
                    </Text>
                </View>
            )}

            {/* Footer: Today Progress */}
            <View style={styles.footer}>
                <Text style={styles.footerLabel}>Today</Text>
                <View style={styles.ticketBadge}>
                    <Ticket size={10} color="#C084FC" />
                    <Text style={styles.ticketText}>{todayProgress.tickets} tickets</Text>
                    <ChevronRight size={10} color="rgba(255,255,255,0.3)" />
                </View>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        minHeight: 120,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    iconContainer: {
        width: 28,
        height: 28,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    label: {
        fontSize: 10,
        fontWeight: '700',
        color: 'rgba(255, 255, 255, 0.7)',
        letterSpacing: 0.5,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        marginBottom: 12,
    },
    rankRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    rankValue: {
        fontSize: 22,
        fontWeight: '900',
        color: '#FFF',
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 12,
        borderWidth: 1,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
    },
    percentileContainer: {
        marginTop: 4,
    },
    percentileLabel: {
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.5)',
        marginBottom: 4,
    },
    progressBarBg: {
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 2,
    },
    placeholderText: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.4)',
        fontStyle: 'italic',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
    },
    footerLabel: {
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.4)',
    },
    ticketBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    ticketText: {
        fontSize: 10,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.9)',
    },
});

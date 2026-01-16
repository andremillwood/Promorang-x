import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ticket, Clock, Trophy, ChevronRight, Sparkles } from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAuthStore } from '@/store/authStore';
import { haptics } from '@/lib/haptics';
import colors from '@/constants/colors';

const API_URL = 'https://promorang-api.vercel.app';

interface PromoShareWidgetProps {
    style?: any;
}

export function PromoShareWidget({ style }: PromoShareWidgetProps) {
    const router = useRouter();
    const theme = useThemeColors();
    const { token } = useAuthStore();

    const [userTickets, setUserTickets] = useState(0);
    const [jackpot, setJackpot] = useState(0);
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0 });
    const [isLoading, setIsLoading] = useState(true);

    const pulseAnim = React.useRef(new Animated.Value(1)).current;

    useEffect(() => {
        fetchPromoShareData();

        // Pulse animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.02, duration: 1500, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    const fetchPromoShareData = async () => {
        try {
            if (token) {
                const response = await fetch(`${API_URL}/api/promoshare/dashboard`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const result = await response.json();
                    if (result.success && result.data) {
                        setUserTickets(result.data.userTickets || 0);
                        setJackpot(result.data.currentJackpot || 0);
                        
                        if (result.data.activeCycle) {
                            const endTime = new Date(result.data.activeCycle.end_at).getTime();
                            updateTimeLeft(endTime);
                        }
                        return;
                    }
                }
            }

            // Mock data fallback
            setUserTickets(47);
            setJackpot(1250);
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 5);
            updateTimeLeft(nextWeek.getTime());

        } catch (error) {
            console.log('PromoShare widget fetch failed');
            setUserTickets(47);
            setJackpot(1250);
        } finally {
            setIsLoading(false);
        }
    };

    const updateTimeLeft = (endTime: number) => {
        const now = Date.now();
        const diff = endTime - now;

        if (diff <= 0) {
            setTimeLeft({ days: 0, hours: 0, mins: 0 });
            return;
        }

        setTimeLeft({
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            mins: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        });
    };

    const handlePress = async () => {
        await haptics.light();
        router.push('/promoshare' as any);
    };

    return (
        <Animated.View style={[style, { transform: [{ scale: pulseAnim }] }]}>
            <TouchableOpacity
                style={styles.container}
                onPress={handlePress}
                activeOpacity={0.9}
            >
                <LinearGradient
                    colors={['#6366F1', '#8B5CF6', '#A855F7']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradient}
                >
                    {/* Decorative sparkles */}
                    <View style={styles.sparkle1}>
                        <Sparkles size={16} color="rgba(255,255,255,0.3)" />
                    </View>
                    <View style={styles.sparkle2}>
                        <Sparkles size={12} color="rgba(255,255,255,0.2)" />
                    </View>

                    <View style={styles.content}>
                        {/* Left side - Icon and title */}
                        <View style={styles.leftSection}>
                            <View style={styles.iconContainer}>
                                <Ticket size={24} color="#FFF" />
                            </View>
                            <View style={styles.textContainer}>
                                <Text style={styles.title}>PromoShare</Text>
                                <View style={styles.timerRow}>
                                    <Clock size={12} color="rgba(255,255,255,0.8)" />
                                    <Text style={styles.timerText}>
                                        {timeLeft.days}d {timeLeft.hours}h {timeLeft.mins}m
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Right side - Stats */}
                        <View style={styles.rightSection}>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{userTickets}</Text>
                                <Text style={styles.statLabel}>tickets</Text>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.statItem}>
                                <View style={styles.jackpotRow}>
                                    <Trophy size={14} color="#FCD34D" />
                                    <Text style={styles.statValue}>{jackpot}</Text>
                                </View>
                                <Text style={styles.statLabel}>jackpot</Text>
                            </View>
                            <ChevronRight size={20} color="rgba(255,255,255,0.7)" />
                        </View>
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    gradient: {
        padding: 16,
        position: 'relative',
    },
    sparkle1: {
        position: 'absolute',
        top: 8,
        right: 60,
    },
    sparkle2: {
        position: 'absolute',
        bottom: 12,
        left: 100,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    textContainer: {},
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFF',
        marginBottom: 4,
    },
    timerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    timerText: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '500',
    },
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statItem: {
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFF',
    },
    statLabel: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.7)',
        textTransform: 'uppercase',
        marginTop: 2,
    },
    jackpotRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    divider: {
        width: 1,
        height: 30,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
});

export default PromoShareWidget;

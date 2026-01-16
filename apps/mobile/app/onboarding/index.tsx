import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Gift, Zap, Users, Trophy, ChevronRight, Sparkles } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import colors from '@/constants/colors';

const { width, height } = Dimensions.get('window');

interface OnboardingSlide {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    icon: any;
    iconColor: string;
    gradient: [string, string];
    image?: string;
}

const slides: OnboardingSlide[] = [
    {
        id: 'welcome',
        title: 'Welcome to Promorang',
        subtitle: 'Your rewards journey starts here',
        description: 'Earn gems, points, and real rewards by engaging with brands you love.',
        icon: Sparkles,
        iconColor: '#FFD700',
        gradient: ['#8B5CF6', '#EC4899'],
    },
    {
        id: 'drops',
        title: 'Complete Drops',
        subtitle: 'Quick tasks, big rewards',
        description: 'Watch videos, share content, and complete simple tasks to earn gems instantly.',
        icon: Zap,
        iconColor: '#F59E0B',
        gradient: ['#F59E0B', '#EF4444'],
    },
    {
        id: 'coupons',
        title: 'Unlock Coupons',
        subtitle: 'Real savings, real value',
        description: 'Redeem your earnings for exclusive discounts and free items at your favorite stores.',
        icon: Gift,
        iconColor: '#10B981',
        gradient: ['#10B981', '#3B82F6'],
    },
    {
        id: 'compete',
        title: 'Climb the Ranks',
        subtitle: 'Compete & earn more',
        description: 'Join leaderboards, invite friends, and unlock higher tiers for better commission rates.',
        icon: Trophy,
        iconColor: '#FFD700',
        gradient: ['#6366F1', '#8B5CF6'],
    },
    {
        id: 'community',
        title: 'Join the Community',
        subtitle: 'Grow together',
        description: 'Connect with creators, attend events, and be part of the Promorang economy.',
        icon: Users,
        iconColor: '#EC4899',
        gradient: ['#EC4899', '#8B5CF6'],
    },
];

export default function OnboardingScreen() {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    const slideRef = useRef<any>(null);

    const handleNext = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        
        if (currentIndex < slides.length - 1) {
            setCurrentIndex(currentIndex + 1);
            slideRef.current?.scrollTo({ x: (currentIndex + 1) * width, animated: true });
        } else {
            await completeOnboarding();
        }
    };

    const handleSkip = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        await completeOnboarding();
    };

    const completeOnboarding = async () => {
        try {
            await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.replace('/(tabs)');
        } catch (error) {
            console.error('Error completing onboarding:', error);
            router.replace('/(tabs)');
        }
    };

    const renderSlide = (slide: OnboardingSlide, index: number) => {
        const Icon = slide.icon;
        
        return (
            <View key={slide.id} style={styles.slide}>
                <LinearGradient
                    colors={slide.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientBackground}
                >
                    {/* Icon Container */}
                    <View style={styles.iconContainer}>
                        <View style={styles.iconCircle}>
                            <Icon size={64} color={slide.iconColor} />
                        </View>
                        
                        {/* Floating particles */}
                        <View style={[styles.particle, styles.particle1]} />
                        <View style={[styles.particle, styles.particle2]} />
                        <View style={[styles.particle, styles.particle3]} />
                    </View>

                    {/* Content */}
                    <View style={styles.contentContainer}>
                        <Text style={styles.subtitle}>{slide.subtitle}</Text>
                        <Text style={styles.title}>{slide.title}</Text>
                        <Text style={styles.description}>{slide.description}</Text>
                    </View>
                </LinearGradient>
            </View>
        );
    };

    const renderPagination = () => {
        return (
            <View style={styles.pagination}>
                {slides.map((_, index) => {
                    const isActive = index === currentIndex;
                    return (
                        <TouchableOpacity
                            key={index}
                            onPress={() => {
                                setCurrentIndex(index);
                                slideRef.current?.scrollTo({ x: index * width, animated: true });
                                Haptics.selectionAsync();
                            }}
                        >
                            <View
                                style={[
                                    styles.paginationDot,
                                    isActive && styles.paginationDotActive,
                                ]}
                            />
                        </TouchableOpacity>
                    );
                })}
            </View>
        );
    };

    const isLastSlide = currentIndex === slides.length - 1;

    return (
        <View style={styles.container}>
            {/* Slides */}
            <Animated.ScrollView
                ref={slideRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                scrollEventThrottle={16}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: false }
                )}
                onMomentumScrollEnd={(e) => {
                    const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
                    setCurrentIndex(newIndex);
                }}
            >
                {slides.map((slide, index) => renderSlide(slide, index))}
            </Animated.ScrollView>

            {/* Bottom Controls */}
            <View style={styles.bottomContainer}>
                {renderPagination()}

                <View style={styles.buttonContainer}>
                    {!isLastSlide && (
                        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                            <Text style={styles.skipButtonText}>Skip</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={[styles.nextButton, isLastSlide && styles.nextButtonFull]}
                        onPress={handleNext}
                    >
                        <LinearGradient
                            colors={['#8B5CF6', '#EC4899']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.nextButtonGradient}
                        >
                            <Text style={styles.nextButtonText}>
                                {isLastSlide ? "Let's Go!" : 'Next'}
                            </Text>
                            {!isLastSlide && <ChevronRight size={20} color="#FFF" />}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    slide: {
        width,
        height,
    },
    gradientBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    iconContainer: {
        position: 'relative',
        marginBottom: 48,
    },
    iconCircle: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    particle: {
        position: 'absolute',
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: 'rgba(255,255,255,0.5)',
    },
    particle1: {
        top: -20,
        right: 10,
    },
    particle2: {
        bottom: 10,
        left: -15,
    },
    particle3: {
        top: 30,
        right: -20,
        width: 8,
        height: 8,
    },
    contentContainer: {
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    subtitle: {
        fontSize: 14,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.8)',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 8,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#FFF',
        textAlign: 'center',
        marginBottom: 16,
    },
    description: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        textAlign: 'center',
        lineHeight: 24,
    },
    bottomContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 24,
        paddingBottom: 50,
        paddingTop: 20,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 24,
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.4)',
        marginHorizontal: 4,
    },
    paginationDotActive: {
        width: 24,
        backgroundColor: '#FFF',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    skipButton: {
        paddingVertical: 16,
        paddingHorizontal: 24,
    },
    skipButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.7)',
    },
    nextButton: {
        flex: 1,
        marginLeft: 16,
    },
    nextButtonFull: {
        marginLeft: 0,
    },
    nextButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        gap: 8,
    },
    nextButtonText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFF',
    },
});

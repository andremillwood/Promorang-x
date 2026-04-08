/**
 * Growth Pillar Detail Screen (React Native)
 * 
 * Dynamic pillar detail page for Social Shield, Gems Staking, 
 * Creator Funding, Growth Channels, Auto-Invest, and Platform Economy.
 */

import React from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    Shield,
    Diamond,
    Percent,
    Users,
    Zap,
    Coins,
    ArrowLeft,
    CheckCircle,
    ArrowRight,
} from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';

interface PillarInfo {
    id: string;
    title: string;
    subtitle: string;
    icon: any;
    color: string;
    gradient: [string, string];
    features: string[];
    cta: string;
    ctaRoute: string;
}

const PILLARS: Record<string, PillarInfo> = {
    shield: {
        id: 'shield',
        title: 'Social Shield',
        subtitle: 'Protection for your online presence',
        icon: Shield,
        color: '#10B981',
        gradient: ['#10B981', '#059669'],
        features: [
            'Content insurance against demonetization',
            'Platform ban recovery assistance',
            'Account verification support',
            'Priority customer support',
            'Legal consultation access',
        ],
        cta: 'Activate Shield',
        ctaRoute: '/growth/hub',
    },
    staking: {
        id: 'staking',
        title: 'Gems Staking',
        subtitle: 'Earn passive income from your Gems',
        icon: Diamond,
        color: '#8B5CF6',
        gradient: ['#8B5CF6', '#7C3AED'],
        features: [
            'Up to 12% APY on staked Gems',
            'Flexible lock periods (30, 90, 180 days)',
            'Compound earnings automatically',
            'Early unstake with reduced rewards',
            'Priority access to new opportunities',
        ],
        cta: 'Start Staking',
        ctaRoute: '/growth/hub',
    },
    autoinvest: {
        id: 'autoinvest',
        title: '3% Auto-Invest',
        subtitle: 'Automatic portfolio growth',
        icon: Percent,
        color: '#F59E0B',
        gradient: ['#F59E0B', '#D97706'],
        features: [
            '3% of earnings auto-invested',
            'Diversified creator portfolio',
            'Weekly rebalancing',
            'Transparent performance tracking',
            'Opt-out anytime',
        ],
        cta: 'Configure Auto-Invest',
        ctaRoute: '/growth/hub',
    },
    funding: {
        id: 'funding',
        title: 'Creator Funding',
        subtitle: 'Access capital for your projects',
        icon: Users,
        color: '#EC4899',
        gradient: ['#EC4899', '#DB2777'],
        features: [
            'Up to $10,000 in creator grants',
            'Revenue-based financing options',
            'Equipment and production support',
            'Marketing budget assistance',
            'No credit check required',
        ],
        cta: 'Apply for Funding',
        ctaRoute: '/growth/hub',
    },
    channels: {
        id: 'channels',
        title: 'Growth Channels',
        subtitle: 'Multi-platform amplification',
        icon: Zap,
        color: '#3B82F6',
        gradient: ['#3B82F6', '#2563EB'],
        features: [
            'Cross-platform content syndication',
            'Viral potential analysis',
            'Collaboration matching',
            'Trend alerts and insights',
            'Audience expansion tools',
        ],
        cta: 'Explore Channels',
        ctaRoute: '/growth/hub',
    },
    economy: {
        id: 'economy',
        title: 'Platform Economy',
        subtitle: 'Participate in platform governance',
        icon: Coins,
        color: '#6366F1',
        gradient: ['#6366F1', '#4F46E5'],
        features: [
            'Vote on platform decisions',
            'Revenue sharing from platform fees',
            'Access to beta features',
            'Creator council eligibility',
            'Platform token allocation',
        ],
        cta: 'Join Economy',
        ctaRoute: '/growth/hub',
    },
};

export default function PillarDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const theme = useThemeColors();

    const pillar = PILLARS[id || 'shield'];

    if (!pillar) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <Text style={[styles.errorText, { color: theme.text }]}>Pillar not found</Text>
            </View>
        );
    }

    const Icon = pillar.icon;

    return (
        <>
            <Stack.Screen
                options={{
                    headerShown: false,
                }}
            />

            <ScrollView
                style={[styles.container, { backgroundColor: theme.background }]}
                contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
            >
                {/* Hero Header */}
                <LinearGradient
                    colors={pillar.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.hero, { paddingTop: insets.top + 16 }]}
                >
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <ArrowLeft size={24} color="#FFF" />
                    </TouchableOpacity>

                    <View style={styles.heroContent}>
                        <View style={styles.iconContainer}>
                            <Icon size={40} color="#FFF" />
                        </View>
                        <Text style={styles.heroTitle}>{pillar.title}</Text>
                        <Text style={styles.heroSubtitle}>{pillar.subtitle}</Text>
                    </View>
                </LinearGradient>

                {/* Features Section */}
                <View style={styles.content}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>What You Get</Text>

                    <View style={[styles.featuresCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                        {pillar.features.map((feature, index) => (
                            <View key={index} style={styles.featureRow}>
                                <View style={[styles.checkCircle, { backgroundColor: `${pillar.color}20` }]}>
                                    <CheckCircle size={16} color={pillar.color} />
                                </View>
                                <Text style={[styles.featureText, { color: theme.text }]}>{feature}</Text>
                            </View>
                        ))}
                    </View>

                    {/* CTA Button */}
                    <TouchableOpacity
                        style={styles.ctaButton}
                        onPress={() => router.push(pillar.ctaRoute as any)}
                    >
                        <LinearGradient
                            colors={pillar.gradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.ctaGradient}
                        >
                            <Text style={styles.ctaText}>{pillar.cta}</Text>
                            <ArrowRight size={20} color="#FFF" />
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* More Pillars */}
                    <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 32 }]}>
                        Explore More
                    </Text>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.pillarsScroll}
                    >
                        {Object.values(PILLARS)
                            .filter(p => p.id !== pillar.id)
                            .map((p) => {
                                const PIcon = p.icon;
                                return (
                                    <TouchableOpacity
                                        key={p.id}
                                        style={[styles.pillarCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                                        onPress={() => router.replace(`/growth/pillar/${p.id}` as any)}
                                    >
                                        <View style={[styles.pillarIcon, { backgroundColor: `${p.color}20` }]}>
                                            <PIcon size={20} color={p.color} />
                                        </View>
                                        <Text style={[styles.pillarName, { color: theme.text }]}>{p.title}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                    </ScrollView>
                </View>
            </ScrollView>
        </>
    );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    errorText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 100,
    },
    hero: {
        paddingBottom: 40,
        paddingHorizontal: 24,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    heroContent: {
        alignItems: 'center',
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFF',
        marginBottom: 8,
    },
    heroSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        textAlign: 'center',
    },
    content: {
        padding: 24,
        marginTop: -20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 16,
    },
    featuresCard: {
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    checkCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    featureText: {
        fontSize: 14,
        flex: 1,
    },
    ctaButton: {
        marginTop: 24,
        borderRadius: 14,
        overflow: 'hidden',
    },
    ctaGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 18,
    },
    ctaText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFF',
    },
    pillarsScroll: {
        gap: 12,
    },
    pillarCard: {
        padding: 16,
        borderRadius: 14,
        borderWidth: 1,
        alignItems: 'center',
        width: 100,
    },
    pillarIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    pillarName: {
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
    },
});

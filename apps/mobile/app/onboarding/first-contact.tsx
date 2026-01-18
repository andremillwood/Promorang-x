/**
 * First Contact View
 * 
 * Simplified first experience for new mobile users.
 * Two primary actions: Verify Instagram or Browse Deals.
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    SafeAreaView
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Instagram, Gift, ArrowRight, ChevronDown } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useThemeColors } from '@/hooks/useThemeColors';
import InstagramConnectModal from '@/components/InstagramConnectModal';

const { width } = Dimensions.get('window');

interface FirstContactViewProps {
    userName?: string;
}

export default function FirstContactScreen() {
    const router = useRouter();
    const theme = useThemeColors();
    const [showInstagramModal, setShowInstagramModal] = useState(false);

    const handleExpandHub = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await AsyncStorage.setItem('promorang_show_hub', 'true');
        await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
        router.replace('/(tabs)');
    };

    const handleBrowseDeals = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
        router.replace('/deals');
    };

    const handleInstagramConnect = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setShowInstagramModal(true);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Logo */}
            <View style={styles.header}>
                <Text style={[styles.logo, { color: theme.text }]}>Promorang</Text>
            </View>

            {/* Main Content */}
            <View style={styles.content}>
                {/* Badge */}
                <LinearGradient
                    colors={['rgba(249, 115, 22, 0.1)', 'rgba(236, 72, 153, 0.1)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.badge}
                >
                    <Sparkles size={16} color="#F97316" />
                    <Text style={styles.badgeText}>Welcome to Promorang</Text>
                </LinearGradient>

                {/* Headline */}
                <Text style={[styles.headline, { color: theme.text }]}>
                    Get paid for{'\n'}
                    <Text style={styles.headlineGradient}>
                        stuff you already do
                    </Text>
                </Text>

                <Text style={[styles.subheadline, { color: theme.textSecondary }]}>
                    Like posts, visit places, share discoveries. We turn that into real money.
                </Text>

                {/* Action Cards */}
                <View style={styles.actionsContainer}>
                    {/* Instagram Connect - Primary */}
                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={handleInstagramConnect}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={['#EC4899', '#8B5CF6', '#6366F1']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.actionCardGradient}
                        >
                            <View style={styles.actionIconCircle}>
                                <Instagram size={24} color="#FFF" />
                            </View>
                            <View style={styles.actionTextContainer}>
                                <Text style={styles.actionTitle}>Verify Instagram & Start</Text>
                                <Text style={styles.actionSubtitle}>Takes 30 seconds • No posting</Text>
                            </View>
                            <ArrowRight size={20} color="#FFF" />
                        </LinearGradient>
                    </TouchableOpacity>

                    <Text style={[styles.orText, { color: theme.textSecondary }]}>or</Text>

                    {/* Browse Deals - Secondary */}
                    <TouchableOpacity
                        style={[styles.secondaryCard, { backgroundColor: theme.surface, borderColor: 'rgba(16, 185, 129, 0.3)' }]}
                        onPress={handleBrowseDeals}
                        activeOpacity={0.8}
                    >
                        <View style={styles.secondaryIconCircle}>
                            <Gift size={24} color="#10B981" />
                        </View>
                        <View style={styles.actionTextContainer}>
                            <Text style={[styles.secondaryTitle, { color: theme.text }]}>Browse Deals First</Text>
                            <Text style={[styles.secondarySubtitle, { color: theme.textSecondary }]}>See what rewards are available</Text>
                        </View>
                        <ArrowRight size={20} color={theme.textSecondary} />
                    </TouchableOpacity>
                </View>

                {/* Social Proof */}
                <Text style={[styles.socialProof, { color: theme.textSecondary }]}>
                    Join 10,000+ people earning from their social presence
                </Text>
            </View>

            {/* Footer */}
            <TouchableOpacity
                style={[styles.footer, { borderTopColor: theme.border }]}
                onPress={handleExpandHub}
            >
                <Text style={[styles.footerText, { color: theme.textSecondary }]}>
                    Explore all options
                </Text>
                <ChevronDown size={18} color={theme.textSecondary} />
            </TouchableOpacity>

            {/* Instagram Modal */}
            <InstagramConnectModal
                visible={showInstagramModal}
                onClose={() => setShowInstagramModal(false)}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 20,
        alignItems: 'center',
    },
    logo: {
        fontSize: 24,
        fontWeight: '700',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 8,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(249, 115, 22, 0.2)',
    },
    badgeText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#F97316',
    },
    headline: {
        fontSize: 32,
        fontWeight: '800',
        textAlign: 'center',
        lineHeight: 40,
        marginBottom: 12,
    },
    headlineGradient: {
        color: '#EC4899',
    },
    subheadline: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 24,
    },
    actionsContainer: {
        width: '100%',
        gap: 12,
    },
    actionCard: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    actionCardGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 16,
    },
    actionIconCircle: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionTextContainer: {
        flex: 1,
    },
    actionTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FFF',
        marginBottom: 2,
    },
    actionSubtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.8)',
    },
    orText: {
        textAlign: 'center',
        fontSize: 12,
    },
    secondaryCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        gap: 16,
    },
    secondaryIconCircle: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryTitle: {
        fontSize: 17,
        fontWeight: '700',
        marginBottom: 2,
    },
    secondarySubtitle: {
        fontSize: 13,
    },
    socialProof: {
        marginTop: 32,
        fontSize: 12,
        textAlign: 'center',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        paddingBottom: 40,
        borderTopWidth: 1,
        gap: 8,
    },
    footerText: {
        fontSize: 14,
        fontWeight: '500',
    },
});

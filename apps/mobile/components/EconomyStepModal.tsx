/**
 * EconomyStepModal
 * 
 * Educational modals for each step in the Promorang economy.
 * Teaches users about the step and CTAs them to take action.
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
    X,
    ArrowRight,
    Sparkles,
    TrendingUp,
    Trophy,
    DollarSign,
    Zap
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useThemeColors } from '@/hooks/useThemeColors';

const { width } = Dimensions.get('window');

export type EconomyStep = 'monetize' | 'spot_trends' | 'build_rank' | 'withdraw';

interface EconomyStepModalProps {
    step: EconomyStep;
    visible: boolean;
    onClose: () => void;
    onOpenInstagramModal?: () => void;
}

const STEP_CONTENT = {
    monetize: {
        icon: Sparkles,
        iconBg: ['#F97316', '#F59E0B'] as [string, string],
        title: 'Monetize Your Routine',
        subtitle: 'Turn everyday social activity into rewards',
        bullets: [
            { emoji: '❤️', text: 'Likes, comments, and saves you already do earn points' },
            { emoji: '📍', text: 'Check in at places you visit for location bonuses' },
            { emoji: '🔗', text: 'Share products you love and earn when friends buy' },
        ],
        incentive: '+50 points for completing your first social proof',
        cta: { label: 'Connect Instagram', action: 'instagram' as const },
        ctaSecondary: { label: 'Browse Deals', path: '/deals' },
    },
    spot_trends: {
        icon: TrendingUp,
        iconBg: ['#EC4899', '#F43F5E'] as [string, string],
        title: 'Spot Trends First',
        subtitle: "Find the next viral hit before it blows up",
        bullets: [
            { emoji: '🔍', text: 'Scout content you think will go viral' },
            { emoji: '💰', text: "Earn a finder's fee when brands sponsor it" },
            { emoji: '📈', text: 'Build equity in content you discover early' },
        ],
        incentive: 'Finders earn 5-15% of sponsorship revenue forever',
        cta: { label: 'Start Scouting', path: '/bounty' },
        ctaSecondary: { label: 'See Trending', path: '/market' },
    },
    build_rank: {
        icon: Trophy,
        iconBg: ['#8B5CF6', '#6366F1'] as [string, string],
        title: 'Build Your Access Rank',
        subtitle: 'Consistency unlocks premium opportunities',
        bullets: [
            { emoji: '🌱', text: 'Day 0: Entry access to deals and events' },
            { emoji: '⭐', text: 'Day 7+: Leaderboard, referrals, PromoShare lottery' },
            { emoji: '💎', text: 'Day 14+: Priority access, Growth Hub, premium campaigns' },
        ],
        incentive: 'Higher ranks get first access to limited drops',
        cta: { label: 'View Your Progress', path: '/growth' },
        ctaSecondary: { label: 'Go to Today', path: '/today' },
    },
    withdraw: {
        icon: DollarSign,
        iconBg: ['#10B981', '#059669'] as [string, string],
        title: 'Withdraw Real Money',
        subtitle: 'Gems convert to cash you can spend anywhere',
        bullets: [
            { emoji: '💎', text: '1 Gem = $1 USD, always' },
            { emoji: '🏦', text: 'Withdraw to PayPal, Venmo, or bank account' },
            { emoji: '🛍️', text: 'Or use gems for in-app purchases and boosts' },
        ],
        incentive: 'No minimum withdrawal, no hidden fees',
        cta: { label: 'View Wallet', path: '/(tabs)/wallet' },
        ctaSecondary: { label: 'How to Earn Gems', path: '/deals' },
    },
};

export default function EconomyStepModal({
    step,
    visible,
    onClose,
    onOpenInstagramModal
}: EconomyStepModalProps) {
    const router = useRouter();
    const theme = useThemeColors();
    const content = STEP_CONTENT[step];
    const Icon = content.icon;

    const handlePrimaryCta = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        if ('action' in content.cta && content.cta.action === 'instagram') {
            onClose();
            onOpenInstagramModal?.();
        } else if ('path' in content.cta) {
            onClose();
            router.push(content.cta.path as any);
        }
    };

    const handleSecondaryCta = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onClose();
        router.push(content.ctaSecondary.path as any);
    };

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.modalContainer, { backgroundColor: theme.surface }]}>
                    {/* Header */}
                    <LinearGradient
                        colors={content.iconBg}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.header}
                    >
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={onClose}
                        >
                            <X size={24} color="#FFF" />
                        </TouchableOpacity>

                        <View style={styles.headerContent}>
                            <View style={styles.iconCircle}>
                                <Icon size={28} color="#FFF" />
                            </View>
                            <View style={styles.headerText}>
                                <Text style={styles.headerTitle}>{content.title}</Text>
                                <Text style={styles.headerSubtitle}>{content.subtitle}</Text>
                            </View>
                        </View>
                    </LinearGradient>

                    {/* Content */}
                    <View style={styles.content}>
                        {/* Bullets */}
                        <View style={styles.bulletContainer}>
                            {content.bullets.map((bullet, i) => (
                                <View key={i} style={styles.bulletRow}>
                                    <Text style={styles.bulletEmoji}>{bullet.emoji}</Text>
                                    <Text style={[styles.bulletText, { color: theme.text }]}>
                                        {bullet.text}
                                    </Text>
                                </View>
                            ))}
                        </View>

                        {/* Incentive */}
                        <LinearGradient
                            colors={['rgba(249, 115, 22, 0.1)', 'rgba(236, 72, 153, 0.1)']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={[styles.incentiveBox, { borderColor: 'rgba(249, 115, 22, 0.2)' }]}
                        >
                            <Zap size={18} color="#F59E0B" />
                            <Text style={styles.incentiveText}>
                                {content.incentive}
                            </Text>
                        </LinearGradient>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[styles.secondaryButton, { borderColor: theme.border }]}
                            onPress={handleSecondaryCta}
                        >
                            <Text style={[styles.secondaryButtonText, { color: theme.textSecondary }]}>
                                {content.ctaSecondary.label}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={handlePrimaryCta}
                        >
                            <LinearGradient
                                colors={content.iconBg}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.primaryButtonGradient}
                            >
                                <Text style={styles.primaryButtonText}>{content.cta.label}</Text>
                                <ArrowRight size={18} color="#FFF" />
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
        maxHeight: '85%',
    },
    header: {
        padding: 20,
        paddingTop: 16,
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        paddingRight: 40,
    },
    iconCircle: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerText: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFF',
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
    },
    content: {
        padding: 20,
        gap: 20,
    },
    bulletContainer: {
        gap: 16,
    },
    bulletRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    bulletEmoji: {
        fontSize: 20,
    },
    bulletText: {
        flex: 1,
        fontSize: 15,
        lineHeight: 22,
    },
    incentiveBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
    },
    incentiveText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
        color: '#F59E0B',
    },
    footer: {
        flexDirection: 'row',
        padding: 20,
        paddingTop: 0,
        paddingBottom: 40,
        gap: 12,
    },
    secondaryButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
    },
    secondaryButtonText: {
        fontSize: 15,
        fontWeight: '600',
    },
    primaryButton: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden',
    },
    primaryButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        gap: 6,
    },
    primaryButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFF',
    },
});

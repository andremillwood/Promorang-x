import { StyleSheet, Pressable, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, View } from '@/components/Themed';
import { Colors as DesignColors, Typography, Spacing, BorderRadius } from '@/constants/DesignTokens';
import { useColorScheme } from '@/components/useColorScheme';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProposeScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: isDark ? DesignColors.black : DesignColors.gray[50] }]}
            contentContainerStyle={styles.contentContainer}
        >
            {/* Header Section */}
            <View style={styles.header}>
                <View style={[styles.badge, { borderColor: DesignColors.primary + '40', backgroundColor: DesignColors.primary + '10' }]}>
                    <Ionicons name="sparkles" size={12} color={DesignColors.primary} />
                    <Text style={[styles.badgeText, { color: DesignColors.primary }]}>Get Your Idea Funded</Text>
                </View>

                <Text style={styles.title}>
                    Don't pay to organize.{"\n"}
                    <Text style={{ color: DesignColors.primary }}>Get paid to create.</Text>
                </Text>

                <Text style={styles.subtitle}>
                    Have a concept for a moment? Brands are looking for hosts like you.
                    Propose your idea, get approved, and unlock the budget to make it real.
                </Text>
            </View>

            {/* CTA Buttons */}
            <View style={styles.actionRow}>
                <Pressable
                    style={({ pressed }) => [
                        styles.primaryButton,
                        { backgroundColor: DesignColors.primary, opacity: pressed ? 0.9 : 1 }
                    ]}
                    onPress={() => router.push('/create-proposal')}
                >
                    <Text style={styles.primaryButtonText}>Start Proposal</Text>
                    <Ionicons name="arrow-forward" size={20} color="white" />
                </Pressable>

                <Pressable
                    style={({ pressed }) => [
                        styles.secondaryButton,
                        { borderColor: DesignColors.gray[300], backgroundColor: isDark ? 'transparent' : 'white', opacity: pressed ? 0.7 : 1 }
                    ]}
                    onPress={() => router.push('/discover')}
                >
                    <Text style={[styles.secondaryButtonText, { color: isDark ? 'white' : DesignColors.gray[900] }]}>See Examples</Text>
                </Pressable>
            </View>

            {/* Steps Section */}
            <View style={styles.stepsContainer}>
                {[
                    { icon: 'bulb', title: '1. Pitch', desc: 'Describe your event idea & budget.', color: '#F59E0B' },
                    { icon: 'checkmark-circle', title: '2. Verify', desc: 'We review for safety & viability.', color: '#10B981' },
                    { icon: 'cash', title: '3. Fund', desc: 'Brands escrow budget instantly.', color: '#3B82F6' },
                ].map((step, i) => (
                    <View key={i} style={[styles.stepCard, { backgroundColor: isDark ? DesignColors.gray[900] : 'white' }]}>
                        <View style={[styles.iconBox, { backgroundColor: step.color + '20' }]}>
                            <Ionicons name={step.icon as any} size={24} color={step.color} />
                        </View>
                        <Text style={[styles.stepTitle, { color: isDark ? 'white' : DesignColors.gray[900] }]}>{step.title}</Text>
                        <Text style={styles.stepDesc}>{step.desc}</Text>
                    </View>
                ))}
            </View>

            {/* Guarantee Card */}
            <LinearGradient
                colors={[DesignColors.primary + '10', DesignColors.accent + '10']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.guaranteeCard}
            >
                <Ionicons name="rocket" size={32} color={DesignColors.primary} style={{ marginBottom: 12 }} />
                <Text style={[styles.guaranteeTitle, { color: isDark ? 'white' : DesignColors.gray[900] }]}>Zero Financial Risk</Text>
                <Text style={styles.guaranteeDesc}>
                    Unlike traditional event hosting, you don't front the costs.
                    If a brand funds your proposal, the budget is escrowed instantly.
                </Text>
            </LinearGradient>

            <View style={{ height: 100 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        padding: Spacing.container,
    },
    header: {
        marginTop: Platform.OS === 'ios' ? 60 : 40,
        marginBottom: Spacing["2xl"],
        alignItems: 'center',
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 100,
        borderWidth: 1,
        marginBottom: Spacing.lg,
        gap: 6,
    },
    badgeText: {
        fontSize: Typography.sizes.xs,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: Spacing.md,
        lineHeight: 40,
    },
    subtitle: {
        fontSize: Typography.sizes.base,
        color: DesignColors.gray[500],
        textAlign: 'center',
        lineHeight: 24,
        maxWidth: 300,
    },
    actionRow: {
        flexDirection: 'row',
        gap: Spacing.md,
        justifyContent: 'center',
        marginBottom: Spacing["2xl"],
    },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 100,
        gap: 8,
        shadowColor: DesignColors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    primaryButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: Typography.sizes.base,
    },
    secondaryButton: {
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 100,
        borderWidth: 1,
    },
    secondaryButtonText: {
        fontWeight: 'bold',
        fontSize: Typography.sizes.base,
    },
    stepsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing["2xl"],
        gap: 8,
    },
    stepCard: {
        flex: 1,
        padding: 16,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    stepTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
        textAlign: 'center',
    },
    stepDesc: {
        fontSize: 11,
        color: DesignColors.gray[500],
        textAlign: 'center',
        lineHeight: 16,
    },
    guaranteeCard: {
        padding: 32,
        borderRadius: 32,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: DesignColors.primary + '20',
    },
    guaranteeTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    guaranteeDesc: {
        fontSize: 14,
        color: DesignColors.gray[500],
        textAlign: 'center',
        lineHeight: 20,
        maxWidth: 280,
    },
});

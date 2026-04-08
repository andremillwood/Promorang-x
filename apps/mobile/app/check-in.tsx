import { StyleSheet, Pressable, Platform, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Text, View } from '@/components/Themed';
import { Colors as DesignColors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/DesignTokens';
import { useColorScheme } from '@/components/useColorScheme';
import { useState } from 'react';

const { width, height } = Dimensions.get('window');

export default function CheckInScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [status, setStatus] = useState<'idle' | 'locating' | 'success'>('idle');

    const startCheckIn = () => {
        setStatus('locating');
        setTimeout(() => {
            setStatus('success');
        }, 2000);
    };

    if (status === 'success') {
        return (
            <View style={[styles.container, { backgroundColor: DesignColors.secondary }]}>
                <View style={styles.successContent}>
                    <View style={styles.successIconCircle}>
                        <Ionicons name="checkmark-circle" size={80} color={DesignColors.success} />
                    </View>
                    <Text style={[styles.successTitle, { color: DesignColors.white }]}>Moment Captured!</Text>
                    <Text style={styles.successDesc}>You've earned +150 Points and a Visit Badge.</Text>

                    <View style={styles.rewardSummary}>
                        <View style={styles.rewardPill}>
                            <Ionicons name="flash" size={16} color={DesignColors.primary} />
                            <Text style={styles.rewardPillText}>+150 XP</Text>
                        </View>
                        <View style={styles.rewardPill}>
                            <Ionicons name="gift" size={16} color={DesignColors.primary} />
                            <Text style={styles.rewardPillText}>Free Latte</Text>
                        </View>
                    </View>

                    <Pressable style={styles.doneBtn} onPress={() => setStatus('idle')}>
                        <Text style={styles.doneBtnText}>Return to Today</Text>
                    </Pressable>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: isDark ? DesignColors.black : DesignColors.gray[50] }]}>
            <View style={styles.header}>
                <Text style={styles.label}>CHECK-IN AT</Text>
                <Text style={styles.venueName}>La Colombe Coffee</Text>
                <View style={styles.locationTag}>
                    <Ionicons name="location" size={14} color={DesignColors.primary} />
                    <Text style={styles.locationText}>SoHo, New York</Text>
                </View>
            </View>

            <View style={styles.mapPlaceholder}>
                {/* Simulated Map */}
                <View style={[styles.pulse, { backgroundColor: DesignColors.primary + '30' }]} />
                <View style={styles.mapDot} />
            </View>

            <View style={styles.footer}>
                <BlurView intensity={isDark ? 30 : 50} style={styles.footerBlur}>
                    <Text style={styles.verifyText}>
                        {status === 'locating' ? 'Verifying your location...' : 'Verify your location to unlock rewards.'}
                    </Text>
                    <Pressable
                        style={[styles.checkInBtn, { backgroundColor: DesignColors.primary }]}
                        onPress={startCheckIn}
                        disabled={status === 'locating'}
                    >
                        {status === 'locating' ? (
                            <Ionicons name="sync" size={24} color={DesignColors.white} />
                        ) : (
                            <>
                                <Text style={styles.checkInBtnText}>Check In Now</Text>
                                <Ionicons name="arrow-forward" size={20} color={DesignColors.white} />
                            </>
                        )}
                    </Pressable>
                </BlurView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: Spacing.container,
    },
    header: {
        marginTop: Platform.OS === 'ios' ? 70 : 50,
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    label: {
        fontSize: 10,
        fontWeight: 'bold',
        color: DesignColors.gray[500],
        letterSpacing: 2,
        marginBottom: 8,
    },
    venueName: {
        fontSize: Typography.sizes["2xl"],
        fontWeight: 'bold',
        textAlign: 'center',
    },
    locationTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 8,
        backgroundColor: 'transparent',
    },
    locationText: {
        fontSize: Typography.sizes.sm,
        color: DesignColors.gray[500],
    },
    mapPlaceholder: {
        marginTop: 60,
        height: 300,
        borderRadius: BorderRadius["2xl"],
        backgroundColor: 'rgba(0,0,0,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    mapDot: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: DesignColors.primary,
        borderWidth: 4,
        borderColor: DesignColors.white,
        zIndex: 10,
    },
    pulse: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        left: Spacing.container,
        right: Spacing.container,
        borderRadius: BorderRadius["2xl"],
        overflow: 'hidden',
        backgroundColor: 'transparent',
    },
    footerBlur: {
        padding: Spacing.lg,
        alignItems: 'center',
    },
    verifyText: {
        fontSize: Typography.sizes.sm,
        color: DesignColors.gray[500],
        marginBottom: Spacing.lg,
        textAlign: 'center',
    },
    checkInBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: 56,
        borderRadius: BorderRadius.full,
        gap: 12,
    },
    checkInBtnText: {
        color: DesignColors.white,
        fontSize: Typography.sizes.base,
        fontWeight: 'bold',
    },
    successContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    successIconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.xl,
    },
    successTitle: {
        fontSize: Typography.sizes["3xl"],
        fontWeight: 'bold',
        marginBottom: 8,
    },
    successDesc: {
        fontSize: Typography.sizes.sm,
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
        paddingHorizontal: Spacing["2xl"],
    },
    rewardSummary: {
        flexDirection: 'row',
        gap: Spacing.md,
        marginTop: Spacing["2xl"],
        backgroundColor: 'transparent',
    },
    rewardPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: BorderRadius.full,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    rewardPillText: {
        color: DesignColors.white,
        fontSize: Typography.sizes.xs,
        fontWeight: 'bold',
    },
    doneBtn: {
        marginTop: 60,
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: BorderRadius.full,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    doneBtnText: {
        color: DesignColors.white,
        fontWeight: 'bold',
        fontSize: Typography.sizes.base,
    },
});

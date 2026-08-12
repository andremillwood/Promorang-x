import { Alert, StyleSheet, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Text, View } from '@/components/Themed';
import { Colors as DesignColors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/DesignTokens';
import { useColorScheme } from '@/components/useColorScheme';
import { useState } from 'react';
import { ProductTour } from '@/components/ProductTour';
import { InfoTooltip } from '@/components/InfoTooltip';
import { participationApi } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';

export default function CheckInScreen() {
    const { momentId, title, venue } = useLocalSearchParams<{ momentId?: string; title?: string; venue?: string }>();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [status, setStatus] = useState<'idle' | 'verifying' | 'success'>('idle');
    const queryClient = useQueryClient();

    const startCheckIn = async () => {
        if (!momentId) return;
        setStatus('verifying');
        try {
            await participationApi.checkIn(momentId);
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['moment-participation', momentId] }),
                queryClient.invalidateQueries({ queryKey: ['moment-journey', momentId] }),
                queryClient.invalidateQueries({ queryKey: ['vault-summary'] }),
            ]);
            setStatus('success');
        } catch (error) {
            setStatus('idle');
            const message = error instanceof Error ? error.message : 'Please try again.';
            Alert.alert('Check-in could not be sent', message);
        }
    };

    if (status === 'success') {
        return (
            <View style={[styles.container, { backgroundColor: DesignColors.secondary }]}>
                <View style={styles.successContent}>
                    <View style={styles.receipt}>
                        <View style={styles.receiptTop}><View style={styles.receiptSeal}><Ionicons name="checkmark" size={25} color={DesignColors.success} /></View><Text style={styles.receiptEyebrow}>YOU WERE PART OF THIS</Text></View>
                        <Text style={[styles.successTitle, { color: DesignColors.white }]}>{title ? `${title} is now part of your story.` : 'Your presence was received.'}</Text>
                        <Text style={styles.successDesc}>The host is taking a look. Your memory is already yours; anything else this Moment opens will settle after review.</Text>
                        <View style={styles.receiptRule} />
                        <ReceiptLine icon="archive-outline" label="Memory" value="Kept in your Vault" />
                        <ReceiptLine icon="people-outline" label="Presence" value="With the host for review" />
                        <ReceiptLine icon="key-outline" label="What comes next" value="Ready when it opens" />
                        <Pressable style={styles.doneBtn} onPress={() => router.replace('/vault')}><Text style={styles.doneBtnText}>Keep this in your Vault</Text><Ionicons name="arrow-forward" size={18} color={DesignColors.black} /></Pressable>
                        <Pressable style={styles.todayLink} onPress={() => router.replace('/')}><Text style={styles.todayLinkText}>Return to Today</Text></Pressable>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: isDark ? DesignColors.black : DesignColors.gray[50] }]}>
            <View style={styles.header}>
                <Text style={styles.label}>CHECK-IN AT</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'transparent' }}>
                <Text style={styles.venueName}>{venue || title || 'This Moment'}</Text>
                    <InfoTooltip content="Send your check-in so the host can confirm this Moment counted." />
                </View>
                <View style={styles.locationTag}>
                    <Ionicons name="shield-checkmark" size={14} color={DesignColors.primary} />
                    <Text style={styles.locationText}>Count this Moment</Text>
                </View>
            </View>

            <View style={styles.mapPlaceholder}>
                <View style={[styles.pulse, { backgroundColor: DesignColors.primary + '30' }]} />
                <View style={styles.mapDot}>
                    <Ionicons name="qr-code" size={30} color={DesignColors.white} />
                </View>
            </View>

            <View style={styles.footer}>
                <BlurView intensity={isDark ? 30 : 50} style={styles.footerBlur}>
                    <Text style={styles.verifyText}>
                        {status === 'verifying' ? 'Checking your presence...' : 'Send your check-in so this participation can be reviewed.'}
                    </Text>
                    <Pressable
                        style={[styles.checkInBtn, { backgroundColor: DesignColors.primary }]}
                        onPress={startCheckIn}
                        disabled={status === 'verifying'}
                    >
                        {status === 'verifying' ? (
                            <Ionicons name="sync" size={24} color={DesignColors.white} />
                        ) : (
                            <>
                                <Text style={styles.checkInBtnText}>Submit Check-In</Text>
                                <Ionicons name="arrow-forward" size={20} color={DesignColors.white} />
                            </>
                        )}
                    </Pressable>
                </BlurView>
            </View>

            {/* Product Tour */}
            <ProductTour tourId="check-in" autoStart={true} />
        </View>
    );
}

function ReceiptLine({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
    return <View style={styles.receiptLine}><Ionicons name={icon} size={18} color={DesignColors.primary} /><View style={styles.receiptLineCopy}><Text style={styles.receiptLineLabel}>{label}</Text><Text style={styles.receiptLineValue}>{value}</Text></View></View>;
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
        fontSize: 12,
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
        width: 74,
        height: 74,
        borderRadius: 24,
        backgroundColor: DesignColors.primary,
        borderWidth: 6,
        borderColor: DesignColors.white,
        alignItems: 'center',
        justifyContent: 'center',
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
    receipt: { width: '100%', maxWidth: 430, padding: 24, borderRadius: BorderRadius['2xl'], backgroundColor: '#10120F', borderWidth: 1, borderColor: 'rgba(103,197,135,.24)', ...Shadows.medium },
    receiptTop: { flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 22, backgroundColor: 'transparent' },
    receiptSeal: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(103,197,135,.12)', borderWidth: 1, borderColor: 'rgba(103,197,135,.24)' },
    receiptEyebrow: { color: DesignColors.success, fontFamily: 'SpaceMono', fontSize: 12, letterSpacing: 1 },
    receiptRule: { height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,255,255,.12)', marginVertical: 20 },
    receiptLine: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, backgroundColor: 'transparent' },
    receiptLineCopy: { flex: 1, backgroundColor: 'transparent' },
    receiptLineLabel: { color: DesignColors.gray[500], fontSize: 12 },
    receiptLineValue: { color: DesignColors.white, fontSize: 13, fontWeight: '700', marginTop: 2 },
    todayLink: { alignItems: 'center', paddingTop: 15 },
    todayLinkText: { color: DesignColors.gray[400], fontSize: 12, fontWeight: '700' },
    successTitle: {
        fontSize: Typography.sizes["3xl"],
        fontWeight: 'bold',
        marginBottom: 8,
    },
    successDesc: {
        fontSize: Typography.sizes.sm,
        color: 'rgba(255,255,255,0.6)',
        lineHeight: 21,
    },
    doneBtn: {
        marginTop: 24,
        minHeight: 54,
        paddingHorizontal: 22,
        borderRadius: BorderRadius.full,
        backgroundColor: DesignColors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 9,
    },
    doneBtnText: {
        color: DesignColors.black,
        fontWeight: '900',
        fontSize: Typography.sizes.sm,
    },
});

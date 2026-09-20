import { Alert, StyleSheet, Pressable, Platform, TextInput, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { BlurView } from 'expo-blur';
import * as Location from 'expo-location';
import { Text, View } from '@/components/Themed';
import { Colors as DesignColors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/DesignTokens';
import { useColorScheme } from '@/components/useColorScheme';
import { useEffect, useMemo, useState } from 'react';
import { ProductTour } from '@/components/ProductTour';
import { InfoTooltip } from '@/components/InfoTooltip';
import { apiRequest, participationApi, WEB_BASE } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';

type ProofRequirement = {
    id: string;
    requirement_type: string;
    label?: string | null;
    instructions?: string | null;
    is_required?: boolean | null;
};

type SubmissionOutcome = 'verified' | 'pending' | null;

export default function CheckInScreen() {
    const { momentId, title, venue } = useLocalSearchParams<{ momentId?: string; title?: string; venue?: string }>();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [status, setStatus] = useState<'idle' | 'verifying' | 'success'>('idle');
    const [requirements, setRequirements] = useState<ProofRequirement[]>([]);
    const [requirementsLoading, setRequirementsLoading] = useState(true);
    const [proofCode, setProofCode] = useState('');
    const [outcome, setOutcome] = useState<SubmissionOutcome>(null);
    const queryClient = useQueryClient();

    useEffect(() => {
        let active = true;
        if (!momentId) {
            setRequirementsLoading(false);
            return () => { active = false; };
        }
        apiRequest<{ requirements?: ProofRequirement[] }>(`/api/proof/moments/${encodeURIComponent(momentId)}/requirements`)
            .then((payload) => {
                if (active) setRequirements((payload?.requirements || []).filter((item) => item.is_required !== false));
            })
            .catch(() => {
                if (active) setRequirements([]);
            })
            .finally(() => {
                if (active) setRequirementsLoading(false);
            });
        return () => { active = false; };
    }, [momentId]);

    const requirementTypes = useMemo(
        () => requirements.map((requirement) => String(requirement.requirement_type || '').toLowerCase()),
        [requirements],
    );
    const requiresCode = requirementTypes.some((type) => type === 'venue_qr' || type === 'rotating_code');
    const requiresGeofence = requirementTypes.includes('geofence');
    const requiresUnsupportedMedia = requirementTypes.some((type) => type === 'timestamped_media' || type === 'receipt');
    const requiresProof = requirements.length > 0;

    const refreshJourney = async () => {
        if (!momentId) return;
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['moment-participation', momentId] }),
            queryClient.invalidateQueries({ queryKey: ['moment-journey', momentId] }),
            queryClient.invalidateQueries({ queryKey: ['vault-summary'] }),
        ]);
    };

    const openWebProof = async () => {
        if (!momentId) return;
        await Linking.openURL(`${WEB_BASE}/moments/${encodeURIComponent(momentId)}/checkin`);
    };

    const startCheckIn = async () => {
        if (!momentId || requirementsLoading) return;

        if (requiresUnsupportedMedia) {
            Alert.alert(
                'Additional evidence required',
                'This Moment requires photo or receipt evidence. Continue in the web proof flow so the evidence can be uploaded and reviewed.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Continue', onPress: () => { void openWebProof(); } },
                ],
            );
            return;
        }

        if (requiresCode && !proofCode.trim()) {
            Alert.alert('Code required', 'Enter the venue or rotating code before submitting proof.');
            return;
        }

        setStatus('verifying');
        try {
            if (!requiresProof) {
                const response = await participationApi.checkIn(momentId);
                setOutcome(response?.verification_status === 'pending' ? 'pending' : 'verified');
            } else {
                let coordinates: { latitude: number; longitude: number } | null = null;
                if (requiresGeofence) {
                    const permission = await Location.requestForegroundPermissionsAsync();
                    if (permission.status !== 'granted') {
                        throw new Error('Location permission is required for this Moment.');
                    }
                    const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
                    coordinates = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    };
                }

                const response = await apiRequest<any>(`/api/participation/moments/${encodeURIComponent(momentId)}/complete`, {
                    method: 'POST',
                    body: JSON.stringify({
                        proof_bundle: {
                            proof_code: proofCode.trim() || null,
                            ...(coordinates || {}),
                        },
                        proof_code: proofCode.trim() || null,
                    }),
                });
                setOutcome(response?.checkin?.verification_status === 'verified' ? 'verified' : 'pending');
            }

            await refreshJourney();
            setStatus('success');
        } catch (error) {
            setStatus('idle');
            const message = error instanceof Error ? error.message : 'Please try again.';
            Alert.alert(requiresProof ? 'Proof could not be submitted' : 'Check-in could not be sent', message);
        }
    };

    if (status === 'success') {
        const pending = outcome !== 'verified';
        return (
            <View style={[styles.container, { backgroundColor: DesignColors.secondary }]}>
                <View style={styles.successContent}>
                    <View style={styles.receipt}>
                        <View style={styles.receiptTop}><View style={styles.receiptSeal}><Ionicons name={pending ? 'time-outline' : 'checkmark'} size={25} color={pending ? DesignColors.warning : DesignColors.success} /></View><Text style={styles.receiptEyebrow}>{pending ? 'PROOF RECORDED' : 'VERIFIED PARTICIPATION'}</Text></View>
                        <Text style={[styles.successTitle, { color: DesignColors.white }]}>{pending ? 'Your proof is waiting for verification.' : (title ? `${title} is now part of your story.` : 'Your participation was verified.')}</Text>
                        <Text style={styles.successDesc}>{pending ? 'Submission is recorded. No memory, reward, payout, or other consequence is implied until verification is complete.' : 'This participation was verified. Source-backed retained history can now appear in your Vault when issued.'}</Text>
                        <View style={styles.receiptRule} />
                        <ReceiptLine icon="shield-checkmark-outline" label="Proof" value={pending ? 'Pending review' : 'Verified'} />
                        <ReceiptLine icon="archive-outline" label="Vault" value={pending ? 'No retained object implied yet' : 'Refreshes from issued records'} />
                        <ReceiptLine icon="key-outline" label="What comes next" value={pending ? 'Wait for verification' : 'Follow the recorded consequence'} />
                        <Pressable style={styles.doneBtn} onPress={() => router.replace('/vault')}><Text style={styles.doneBtnText}>Open your Vault</Text><Ionicons name="arrow-forward" size={18} color={DesignColors.black} /></Pressable>
                        <Pressable style={styles.todayLink} onPress={() => router.replace('/')}><Text style={styles.todayLinkText}>Return to Today</Text></Pressable>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: isDark ? DesignColors.black : DesignColors.gray[50] }]}>
            <View style={styles.header}>
                <Text style={styles.label}>{requiresProof ? 'SUBMIT PROOF FOR' : 'CHECK-IN AT'}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'transparent' }}>
                <Text style={styles.venueName}>{venue || title || 'This Moment'}</Text>
                    <InfoTooltip content={requiresProof ? 'Required evidence is recorded first. Verification and any consequences happen separately.' : 'Send your check-in so this Moment can be recorded.'} />
                </View>
                <View style={styles.locationTag}>
                    <Ionicons name="shield-checkmark" size={14} color={DesignColors.primary} />
                    <Text style={styles.locationText}>{requiresProof ? 'Proof ≠ verification' : 'Source-backed check-in'}</Text>
                </View>
            </View>

            <View style={styles.mapPlaceholder}>
                <View style={[styles.pulse, { backgroundColor: DesignColors.primary + '30' }]} />
                <View style={styles.mapDot}>
                    <Ionicons name={requiresGeofence ? 'location' : 'qr-code'} size={30} color={DesignColors.white} />
                </View>
            </View>

            <View style={styles.footer}>
                <BlurView intensity={isDark ? 30 : 50} style={styles.footerBlur}>
                    {requiresCode ? (
                        <TextInput
                            value={proofCode}
                            onChangeText={(value) => setProofCode(value.toUpperCase())}
                            placeholder="ENTER PROOF CODE"
                            placeholderTextColor={DesignColors.gray[500]}
                            autoCapitalize="characters"
                            maxLength={16}
                            style={styles.codeInput}
                        />
                    ) : null}
                    <Text style={styles.verifyText}>
                        {status === 'verifying'
                            ? (requiresProof ? 'Recording your proof...' : 'Checking your participation...')
                            : requiresUnsupportedMedia
                                ? 'Photo or receipt evidence is required; continue in the web proof flow.'
                                : requiresGeofence
                                    ? 'Your device location will be checked against the recorded Moment geofence when you submit.'
                                    : requiresProof
                                        ? 'Submit the required evidence. It will remain pending until verified.'
                                        : 'Send your check-in so this participation can be recorded.'}
                    </Text>
                    <Pressable
                        style={[styles.checkInBtn, { backgroundColor: DesignColors.primary }]}
                        onPress={requiresUnsupportedMedia ? openWebProof : startCheckIn}
                        disabled={status === 'verifying' || requirementsLoading}
                    >
                        {status === 'verifying' || requirementsLoading ? (
                            <Ionicons name="sync" size={24} color={DesignColors.white} />
                        ) : (
                            <>
                                <Text style={styles.checkInBtnText}>{requiresUnsupportedMedia ? 'Continue to proof upload' : requiresProof ? 'Submit Proof' : 'Submit Check-In'}</Text>
                                <Ionicons name="arrow-forward" size={20} color={DesignColors.white} />
                            </>
                        )}
                    </Pressable>
                </BlurView>
            </View>

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
    codeInput: {
        width: '100%',
        minHeight: 50,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,.16)',
        backgroundColor: 'rgba(0,0,0,.24)',
        color: DesignColors.white,
        paddingHorizontal: 16,
        textAlign: 'center',
        fontSize: Typography.sizes.lg,
        fontWeight: '800',
        letterSpacing: 2,
        marginBottom: Spacing.md,
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

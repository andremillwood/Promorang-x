import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Vibration } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Camera, CameraView } from 'expo-camera';
import { ArrowLeft, QrCode, Keyboard, CheckCircle2, XCircle, Loader2 } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { useThemeColors } from '@/hooks/useThemeColors';
import colors from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { safeBack } from '@/lib/navigation';

const API_URL = 'https://promorang-api.vercel.app';

export default function TicketScannerScreen() {
    const { eventId } = useLocalSearchParams<{ eventId: string }>();
    const router = useRouter();
    const theme = useThemeColors();
    const { token } = useAuthStore();

    const [mode, setMode] = useState<'scan' | 'manual'>('manual');
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [scanned, setScanned] = useState(false);
    const [manualCode, setManualCode] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

    useEffect(() => {
        if (mode === 'scan') {
            requestCameraPermission();
        }
    }, [mode]);

    const requestCameraPermission = async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
    };

    const validateTicket = async (code: string) => {
        if (!code.trim() || !token) return;

        setIsValidating(true);
        setResult(null);

        try {
            const response = await fetch(`${API_URL}/api/events/${eventId}/tickets/activate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ activation_code: code.trim().toUpperCase() })
            });
            const data = await response.json();

            if (data.status === 'success') {
                Vibration.vibrate([0, 100, 50, 100]);
                setResult({ success: true, message: 'Ticket validated! Guest checked in.' });
            } else {
                Vibration.vibrate(500);
                setResult({ success: false, message: data.error || 'Invalid ticket code' });
            }
        } catch (error) {
            Vibration.vibrate(500);
            setResult({ success: false, message: 'Failed to validate. Please try again.' });
        } finally {
            setIsValidating(false);
            setScanned(false);
        }
    };

    const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
        if (scanned || isValidating) return;
        setScanned(true);

        try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'event_ticket' && parsed.code) {
                validateTicket(parsed.code);
            } else {
                setResult({ success: false, message: 'Invalid QR code format' });
                setScanned(false);
            }
        } catch {
            validateTicket(data);
        }
    };

    const handleManualSubmit = () => {
        if (manualCode.trim()) {
            validateTicket(manualCode);
        }
    };

    const resetScanner = () => {
        setResult(null);
        setManualCode('');
        setScanned(false);
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen
                options={{
                    title: '',
                    headerTransparent: true,
                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={() => safeBack(router)}
                            style={[styles.headerIcon, { backgroundColor: 'rgba(0,0,0,0.4)' }]}
                        >
                            <ArrowLeft size={24} color="#FFF" />
                        </TouchableOpacity>
                    ),
                }}
            />

            {/* Header */}
            <LinearGradient
                colors={['#8B5CF6', '#EC4899']}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <QrCode size={28} color="#FFF" />
                    <View>
                        <Text style={styles.headerTitle}>Ticket Scanner</Text>
                        <Text style={styles.headerSubtitle}>Validate guest tickets</Text>
                    </View>
                </View>
            </LinearGradient>

            {/* Mode Toggle */}
            <View style={styles.modeToggle}>
                <TouchableOpacity
                    style={[styles.modeButton, mode === 'manual' && styles.modeButtonActive]}
                    onPress={() => setMode('manual')}
                >
                    <Keyboard size={18} color={mode === 'manual' ? colors.primary : '#9CA3AF'} />
                    <Text style={[styles.modeButtonText, mode === 'manual' && styles.modeButtonTextActive]}>
                        Manual Entry
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.modeButton, mode === 'scan' && styles.modeButtonActive]}
                    onPress={() => setMode('scan')}
                >
                    <QrCode size={18} color={mode === 'scan' ? colors.primary : '#9CA3AF'} />
                    <Text style={[styles.modeButtonText, mode === 'scan' && styles.modeButtonTextActive]}>
                        Scan QR
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.content}>
                {mode === 'manual' ? (
                    <View style={styles.manualContainer}>
                        <Text style={[styles.label, { color: theme.textSecondary }]}>
                            Enter Activation Code
                        </Text>
                        <TextInput
                            style={[styles.codeInput, { color: theme.text }]}
                            value={manualCode}
                            onChangeText={(text) => setManualCode(text.toUpperCase())}
                            placeholder="e.g., A1B2C3D4"
                            placeholderTextColor="#9CA3AF"
                            maxLength={12}
                            autoCapitalize="characters"
                            autoCorrect={false}
                        />
                        <Text style={styles.hint}>
                            Enter the 8-character code from the guest's ticket
                        </Text>
                        <TouchableOpacity
                            style={[styles.validateButton, (!manualCode.trim() || isValidating) && styles.validateButtonDisabled]}
                            onPress={handleManualSubmit}
                            disabled={!manualCode.trim() || isValidating}
                        >
                            {isValidating ? (
                                <Loader2 size={20} color="#FFF" />
                            ) : (
                                <>
                                    <CheckCircle2 size={20} color="#FFF" />
                                    <Text style={styles.validateButtonText}>Validate Ticket</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.scanContainer}>
                        {hasPermission === null ? (
                            <Text style={{ color: theme.textSecondary }}>Requesting camera permission...</Text>
                        ) : hasPermission === false ? (
                            <View style={styles.noPermission}>
                                <Text style={[styles.noPermissionText, { color: theme.text }]}>
                                    Camera permission is required to scan QR codes.
                                </Text>
                                <TouchableOpacity
                                    style={styles.permissionButton}
                                    onPress={requestCameraPermission}
                                >
                                    <Text style={styles.permissionButtonText}>Grant Permission</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.cameraContainer}>
                                <CameraView
                                    style={styles.camera}
                                    facing="back"
                                    barcodeScannerSettings={{
                                        barcodeTypes: ['qr'],
                                    }}
                                    onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                                />
                                <View style={styles.scanOverlay}>
                                    <View style={styles.scanFrame}>
                                        <View style={[styles.corner, styles.cornerTL]} />
                                        <View style={[styles.corner, styles.cornerTR]} />
                                        <View style={[styles.corner, styles.cornerBL]} />
                                        <View style={[styles.corner, styles.cornerBR]} />
                                    </View>
                                </View>
                            </View>
                        )}
                        <Text style={[styles.scanHint, { color: theme.textSecondary }]}>
                            Position the QR code within the frame
                        </Text>
                    </View>
                )}

                {/* Result */}
                {result && (
                    <View style={[
                        styles.resultContainer,
                        result.success ? styles.resultSuccess : styles.resultError
                    ]}>
                        {result.success ? (
                            <CheckCircle2 size={24} color="#059669" />
                        ) : (
                            <XCircle size={24} color="#DC2626" />
                        )}
                        <View style={styles.resultText}>
                            <Text style={[styles.resultTitle, result.success ? styles.resultTitleSuccess : styles.resultTitleError]}>
                                {result.success ? 'Success!' : 'Validation Failed'}
                            </Text>
                            <Text style={[styles.resultMessage, result.success ? styles.resultMessageSuccess : styles.resultMessageError]}>
                                {result.message}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={resetScanner} style={styles.resetButton}>
                            <Text style={styles.resetButtonText}>Scan Next</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Footer */}
            <View style={[styles.footer, { borderTopColor: theme.border }]}>
                <Text style={[styles.footerText, { color: theme.textSecondary }]}>
                    Each ticket can only be validated once. Validated tickets will be marked as "used".
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    header: {
        paddingTop: 100,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#FFF',
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
    },
    modeToggle: {
        flexDirection: 'row',
        margin: 16,
        padding: 4,
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
    },
    modeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 10,
        gap: 8,
    },
    modeButtonActive: {
        backgroundColor: '#FFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    modeButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#9CA3AF',
    },
    modeButtonTextActive: {
        color: colors.primary,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    manualContainer: {
        alignItems: 'center',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 12,
    },
    codeInput: {
        width: '100%',
        backgroundColor: '#F9FAFB',
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 20,
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
        letterSpacing: 4,
        fontFamily: 'monospace',
    },
    hint: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 8,
        marginBottom: 24,
    },
    validateButton: {
        width: '100%',
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 14,
        gap: 8,
    },
    validateButtonDisabled: {
        opacity: 0.5,
    },
    validateButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    scanContainer: {
        flex: 1,
        alignItems: 'center',
    },
    cameraContainer: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 20,
        overflow: 'hidden',
        position: 'relative',
    },
    camera: {
        flex: 1,
    },
    scanOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanFrame: {
        width: 200,
        height: 200,
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderColor: colors.primary,
    },
    cornerTL: {
        top: 0,
        left: 0,
        borderTopWidth: 4,
        borderLeftWidth: 4,
        borderTopLeftRadius: 8,
    },
    cornerTR: {
        top: 0,
        right: 0,
        borderTopWidth: 4,
        borderRightWidth: 4,
        borderTopRightRadius: 8,
    },
    cornerBL: {
        bottom: 0,
        left: 0,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
        borderBottomLeftRadius: 8,
    },
    cornerBR: {
        bottom: 0,
        right: 0,
        borderBottomWidth: 4,
        borderRightWidth: 4,
        borderBottomRightRadius: 8,
    },
    scanHint: {
        fontSize: 14,
        marginTop: 16,
    },
    noPermission: {
        alignItems: 'center',
        padding: 40,
    },
    noPermissionText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },
    permissionButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    permissionButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    resultContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginTop: 20,
        gap: 12,
    },
    resultSuccess: {
        backgroundColor: '#ECFDF5',
        borderWidth: 1,
        borderColor: '#A7F3D0',
    },
    resultError: {
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    resultText: {
        flex: 1,
    },
    resultTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    resultTitleSuccess: {
        color: '#059669',
    },
    resultTitleError: {
        color: '#DC2626',
    },
    resultMessage: {
        fontSize: 13,
        marginTop: 2,
    },
    resultMessageSuccess: {
        color: '#10B981',
    },
    resultMessageError: {
        color: '#EF4444',
    },
    resetButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    resetButtonText: {
        color: '#FFF',
        fontSize: 13,
        fontWeight: '600',
    },
    footer: {
        padding: 16,
        paddingBottom: 34,
        borderTopWidth: 1,
    },
    footerText: {
        fontSize: 12,
        textAlign: 'center',
    },
});

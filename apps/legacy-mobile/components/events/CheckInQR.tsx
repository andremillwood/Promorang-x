import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { ShieldCheck, Info } from 'lucide-react-native';
import colors from '@/constants/colors';

interface CheckInQRProps {
    checkInCode: string;
    eventName: string;
    isVirtual?: boolean;
}


export default function CheckInQR({ checkInCode, eventName, isVirtual }: CheckInQRProps) {
    const qrValue = JSON.stringify({
        type: 'event_check_in',
        code: checkInCode,
        event: eventName
    });
    
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Your Entry Pass</Text>
                <Text style={styles.subtitle}>Show this to the organizer at the venue</Text>
            </View>

            <View style={styles.qrContainer}>
                <QRCode
                    value={qrValue}
                    size={160}
                    color="#1F2937"
                    backgroundColor="#FFFFFF"
                />
            </View>

            <View style={styles.infoContainer}>
                <View style={styles.infoRow}>
                    <ShieldCheck size={16} color="#8B5CF6" />
                    <Text style={styles.infoText}>
                        This code is personal and linked to your account.
                    </Text>
                </View>

                {isVirtual && (
                    <View style={[styles.infoRow, styles.virtualInfo]}>
                        <Info size={16} color="#3B82F6" />
                        <Text style={[styles.infoText, { color: '#3B82F6' }]}>
                            For virtual events, check-in is usually automatic upon joining.
                        </Text>
                    </View>
                )}
            </View>

            <View style={styles.codeContainer}>
                <Text style={styles.codeLabel}>ID: {checkInCode.slice(0, 8).toUpperCase()}...</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.primary,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    header: {
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 13,
        color: '#6B7280',
    },
    qrContainer: {
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 4,
        borderColor: colors.primary,
        marginBottom: 16,
    },
    infoContainer: {
        width: '100%',
        gap: 8,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 12,
        backgroundColor: '#F3E8FF',
        borderRadius: 12,
        gap: 8,
    },
    virtualInfo: {
        backgroundColor: '#EFF6FF',
    },
    infoText: {
        flex: 1,
        fontSize: 12,
        color: '#7C3AED',
        lineHeight: 16,
    },
    codeContainer: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        width: '100%',
        alignItems: 'center',
    },
    codeLabel: {
        fontSize: 10,
        color: '#9CA3AF',
        fontFamily: 'monospace',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
});

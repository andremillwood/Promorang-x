/**
 * TipCreatorModal (React Native)
 * 
 * Modal for tipping creators directly from their profile.
 * Reduces time-to-first-dollar for creators.
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    Animated,
    ActivityIndicator,
    Image,
    Alert,
    Dimensions,
} from 'react-native';
import { X, Gift, Coins, Heart, Sparkles } from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAuthStore } from '@/store/authStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

interface TipCreatorModalProps {
    visible: boolean;
    onClose: () => void;
    creatorId: string;
    creatorUsername: string;
    creatorDisplayName?: string;
    creatorImage?: string;
    onSuccess?: (amount: number) => void;
}

const TIP_OPTIONS = [1, 5, 10, 25, 50, 100];

export default function TipCreatorModal({
    visible,
    onClose,
    creatorId,
    creatorUsername,
    creatorDisplayName,
    creatorImage,
    onSuccess,
}: TipCreatorModalProps) {
    const theme = useThemeColors();
    const { token } = useAuthStore();

    const [tipAmount, setTipAmount] = useState(5);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [slideAnim] = useState(new Animated.Value(300));

    const displayName = creatorDisplayName || creatorUsername || 'this creator';
    const initial = displayName[0]?.toUpperCase() || 'U';

    React.useEffect(() => {
        if (visible) {
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 60,
                friction: 12,
                useNativeDriver: true,
            }).start();
        } else {
            slideAnim.setValue(300);
        }
    }, [visible]);

    const handleClose = () => {
        Animated.timing(slideAnim, {
            toValue: 300,
            duration: 200,
            useNativeDriver: true,
        }).start(() => {
            setTipAmount(5);
            setMessage('');
            onClose();
        });
    };

    const handleTip = async () => {
        if (tipAmount < 1) return;

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/users/tip`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    recipient_id: creatorId,
                    amount: tipAmount,
                    message: message.trim() || undefined,
                }),
            });

            const data = await response.json();

            if (data.success) {
                Alert.alert('Tip Sent! 💜', `You sent ${tipAmount} Gems to ${displayName}`);
                onSuccess?.(tipAmount);
                handleClose();
            } else {
                Alert.alert('Tip Failed', data.error || 'Unable to send tip. Please try again.');
            }
        } catch (error) {
            console.error('Failed to send tip:', error);
            Alert.alert('Error', 'Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <TouchableOpacity
                    style={styles.overlayTouchable}
                    activeOpacity={1}
                    onPress={handleClose}
                />
                <Animated.View
                    style={[
                        styles.container,
                        {
                            backgroundColor: theme.surface,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.creatorInfo}>
                            {creatorImage ? (
                                <Image
                                    source={{ uri: creatorImage }}
                                    style={styles.avatar}
                                />
                            ) : (
                                <View style={[styles.avatarPlaceholder]}>
                                    <Text style={styles.avatarInitial}>{initial}</Text>
                                </View>
                            )}
                            <View>
                                <Text style={[styles.title, { color: theme.text }]}>
                                    Support {displayName}
                                </Text>
                                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                                    Send a tip to show your appreciation
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                            <X size={24} color={theme.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    {/* Tip Amount Selection */}
                    <Text style={[styles.sectionLabel, { color: theme.text }]}>Select Amount</Text>
                    <View style={styles.amountGrid}>
                        {TIP_OPTIONS.map((amount) => (
                            <TouchableOpacity
                                key={amount}
                                style={[
                                    styles.amountButton,
                                    tipAmount === amount
                                        ? styles.amountButtonActive
                                        : { backgroundColor: theme.background, borderColor: theme.border },
                                ]}
                                onPress={() => setTipAmount(amount)}
                            >
                                <View style={styles.amountContent}>
                                    <Coins size={16} color={tipAmount === amount ? '#FFF' : theme.text} />
                                    <Text
                                        style={[
                                            styles.amountText,
                                            { color: tipAmount === amount ? '#FFF' : theme.text },
                                        ]}
                                    >
                                        {amount}
                                    </Text>
                                </View>
                                <Text
                                    style={[
                                        styles.amountUsd,
                                        { color: tipAmount === amount ? 'rgba(255,255,255,0.8)' : theme.textSecondary },
                                    ]}
                                >
                                    ${(amount * 0.01).toFixed(2)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Custom Amount */}
                    <View style={styles.customAmountRow}>
                        <TextInput
                            style={[
                                styles.customInput,
                                {
                                    backgroundColor: theme.background,
                                    borderColor: theme.border,
                                    color: theme.text,
                                },
                            ]}
                            value={String(tipAmount)}
                            onChangeText={(text) => setTipAmount(Math.max(1, parseInt(text, 10) || 1))}
                            keyboardType="number-pad"
                            placeholder="Custom"
                            placeholderTextColor={theme.textSecondary}
                        />
                        <View style={styles.gemsLabel}>
                            <Coins size={16} color={theme.textSecondary} />
                            <Text style={[styles.gemsText, { color: theme.textSecondary }]}>gems</Text>
                        </View>
                    </View>

                    {/* Message */}
                    <Text style={[styles.sectionLabel, { color: theme.text }]}>
                        Add a message (optional)
                    </Text>
                    <TextInput
                        style={[
                            styles.messageInput,
                            {
                                backgroundColor: theme.background,
                                borderColor: theme.border,
                                color: theme.text,
                            },
                        ]}
                        value={message}
                        onChangeText={setMessage}
                        placeholder="Keep creating awesome content! 🎉"
                        placeholderTextColor={theme.textSecondary}
                        maxLength={200}
                        multiline
                        numberOfLines={2}
                    />
                    <Text style={[styles.charCount, { color: theme.textSecondary }]}>
                        {message.length}/200
                    </Text>

                    {/* Summary */}
                    <View style={styles.summaryCard}>
                        <View>
                            <Text style={styles.summaryLabel}>You're sending</Text>
                            <View style={styles.summaryValue}>
                                <Sparkles size={18} color="#A855F7" />
                                <Text style={styles.summaryAmount}>{tipAmount} Gems</Text>
                            </View>
                        </View>
                        <View style={styles.summaryRight}>
                            <Text style={styles.summaryLabel}>Creator receives</Text>
                            <Text style={styles.summaryUsd}>${(tipAmount * 0.01).toFixed(2)}</Text>
                        </View>
                    </View>

                    {/* Actions */}
                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={[styles.cancelButton, { borderColor: theme.border }]}
                            onPress={handleClose}
                        >
                            <Text style={[styles.cancelText, { color: theme.text }]}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tipButton, loading && styles.buttonDisabled]}
                            onPress={handleTip}
                            disabled={loading || tipAmount < 1}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFF" size="small" />
                            ) : (
                                <>
                                    <Heart size={18} color="#FFF" />
                                    <Text style={styles.tipButtonText}>Send Tip</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    overlayTouchable: {
        flex: 1,
    },
    container: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    creatorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    avatarPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#EC4899',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarInitial: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFF',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
    },
    subtitle: {
        fontSize: 13,
        marginTop: 2,
    },
    closeButton: {
        padding: 4,
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 12,
    },
    amountGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 16,
    },
    amountButton: {
        width: (SCREEN_WIDTH - 48 - 20) / 3,
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        borderWidth: 1,
    },
    amountButtonActive: {
        backgroundColor: '#A855F7',
        borderColor: '#A855F7',
    },
    amountContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    amountText: {
        fontSize: 16,
        fontWeight: '700',
    },
    amountUsd: {
        fontSize: 11,
        marginTop: 2,
    },
    customAmountRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
    },
    customInput: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
    },
    gemsLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    gemsText: {
        fontSize: 13,
    },
    messageInput: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 14,
        fontSize: 14,
        minHeight: 60,
        textAlignVertical: 'top',
    },
    charCount: {
        fontSize: 11,
        textAlign: 'right',
        marginTop: 4,
        marginBottom: 16,
    },
    summaryCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        borderRadius: 14,
        padding: 16,
        marginBottom: 20,
    },
    summaryLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
    },
    summaryValue: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    summaryAmount: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
    },
    summaryRight: {
        alignItems: 'flex-end',
    },
    summaryUsd: {
        fontSize: 16,
        fontWeight: '600',
        color: '#10B981',
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        padding: 16,
        borderRadius: 14,
        borderWidth: 1,
        alignItems: 'center',
    },
    cancelText: {
        fontSize: 15,
        fontWeight: '600',
    },
    tipButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 16,
        borderRadius: 14,
        backgroundColor: '#A855F7',
    },
    tipButtonText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#FFF',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
});

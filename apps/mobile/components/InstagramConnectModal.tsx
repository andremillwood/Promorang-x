/**
 * InstagramConnectModal
 * 
 * Explains how to connect Instagram via ManyChat DM flow.
 * User DMs "promopoints" to @promorangco to start verification.
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Linking,
    Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Instagram, MessageCircle, ExternalLink, CheckCircle, Copy } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useThemeColors } from '@/hooks/useThemeColors';

const { width } = Dimensions.get('window');

interface InstagramConnectModalProps {
    visible: boolean;
    onClose: () => void;
}

const TRIGGER_WORD = 'promopoints';
const INSTAGRAM_HANDLE = '@promorangco';
const DM_URL = 'https://ig.me/m/promorangco';

export default function InstagramConnectModal({ visible, onClose }: InstagramConnectModalProps) {
    const theme = useThemeColors();
    const [copied, setCopied] = useState(false);

    const handleCopyKeyword = async () => {
        await Clipboard.setStringAsync(TRIGGER_WORD);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleOpenInstagram = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Linking.openURL(DM_URL);
    };

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
                        colors={['#EC4899', '#8B5CF6', '#6366F1']}
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
                                <Instagram size={28} color="#FFF" />
                            </View>
                            <View>
                                <Text style={styles.headerTitle}>Connect Your Instagram</Text>
                                <Text style={styles.headerSubtitle}>Verify your account in 30 seconds</Text>
                            </View>
                        </View>
                    </LinearGradient>

                    {/* Content */}
                    <View style={styles.content}>
                        {/* Step 1 */}
                        <View style={styles.step}>
                            <View style={[styles.stepNumber, { backgroundColor: theme.surfaceAlt }]}>
                                <Text style={styles.stepNumberText}>1</Text>
                            </View>
                            <View style={styles.stepContent}>
                                <Text style={[styles.stepTitle, { color: theme.text }]}>
                                    Open our Instagram page
                                </Text>
                                <Text style={[styles.stepDescription, { color: theme.textSecondary }]}>
                                    Go to <Text style={styles.highlight}>{INSTAGRAM_HANDLE}</Text> on Instagram
                                </Text>
                            </View>
                        </View>

                        {/* Step 2 */}
                        <View style={styles.step}>
                            <View style={[styles.stepNumber, { backgroundColor: theme.surfaceAlt }]}>
                                <Text style={styles.stepNumberText}>2</Text>
                            </View>
                            <View style={styles.stepContent}>
                                <Text style={[styles.stepTitle, { color: theme.text }]}>
                                    Send us a DM
                                </Text>
                                <Text style={[styles.stepDescription, { color: theme.textSecondary }]}>
                                    Type the keyword below exactly:
                                </Text>

                                <TouchableOpacity
                                    style={styles.keywordButton}
                                    onPress={handleCopyKeyword}
                                >
                                    <LinearGradient
                                        colors={['#8B5CF6', '#6366F1']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.keywordGradient}
                                    >
                                        <MessageCircle size={18} color="#FFF" />
                                        <Text style={styles.keywordText}>{TRIGGER_WORD}</Text>
                                        {copied ? (
                                            <CheckCircle size={18} color="#86EFAC" />
                                        ) : (
                                            <Copy size={18} color="rgba(255,255,255,0.7)" />
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>

                                {copied && (
                                    <Text style={styles.copiedText}>Copied to clipboard!</Text>
                                )}
                            </View>
                        </View>

                        {/* Step 3 */}
                        <View style={styles.step}>
                            <View style={[styles.stepNumber, { backgroundColor: theme.surfaceAlt }]}>
                                <Text style={styles.stepNumberText}>3</Text>
                            </View>
                            <View style={styles.stepContent}>
                                <Text style={[styles.stepTitle, { color: theme.text }]}>
                                    Follow the prompts
                                </Text>
                                <Text style={[styles.stepDescription, { color: theme.textSecondary }]}>
                                    Our bot will guide you through verifying your account and linking it to Promorang.
                                </Text>
                            </View>
                        </View>

                        {/* Privacy Note */}
                        <View style={[styles.privacyNote, { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.3)' }]}>
                            <CheckCircle size={20} color="#10B981" />
                            <Text style={styles.privacyText}>
                                <Text style={{ fontWeight: '700' }}>Privacy first:</Text> We never post on your behalf. We only verify your follower count to unlock rewards.
                            </Text>
                        </View>
                    </View>

                    {/* Footer Buttons */}
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[styles.secondaryButton, { borderColor: theme.border }]}
                            onPress={onClose}
                        >
                            <Text style={[styles.secondaryButtonText, { color: theme.textSecondary }]}>
                                Maybe Later
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={handleOpenInstagram}
                        >
                            <LinearGradient
                                colors={['#EC4899', '#8B5CF6']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.primaryButtonGradient}
                            >
                                <Instagram size={20} color="#FFF" />
                                <Text style={styles.primaryButtonText}>Open Instagram</Text>
                                <ExternalLink size={16} color="#FFF" />
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
        maxHeight: '90%',
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
    },
    iconCircle: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
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
    step: {
        flexDirection: 'row',
        gap: 16,
    },
    stepNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepNumberText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#8B5CF6',
    },
    stepContent: {
        flex: 1,
    },
    stepTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    stepDescription: {
        fontSize: 14,
        lineHeight: 20,
    },
    highlight: {
        color: '#8B5CF6',
        fontWeight: '700',
    },
    keywordButton: {
        marginTop: 12,
        borderRadius: 12,
        overflow: 'hidden',
    },
    keywordGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        gap: 8,
    },
    keywordText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFF',
        fontFamily: 'monospace',
    },
    copiedText: {
        fontSize: 12,
        color: '#10B981',
        marginTop: 8,
    },
    privacyNote: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    privacyText: {
        flex: 1,
        fontSize: 12,
        lineHeight: 18,
        color: '#10B981',
    },
    footer: {
        flexDirection: 'row',
        padding: 20,
        paddingTop: 0,
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
        fontSize: 16,
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
        gap: 8,
    },
    primaryButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFF',
    },
});

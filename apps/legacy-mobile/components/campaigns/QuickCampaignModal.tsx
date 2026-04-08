/**
 * QuickCampaignModal (React Native)
 * 
 * P1 High: Single-screen campaign creation for advertisers who want to
 * skip the multi-step wizard. Targets low-tech business owners.
 * 
 * Ported from web: apps/web/src/react-app/components/QuickCampaignModal.tsx
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    ScrollView,
    ActivityIndicator,
    Dimensions,
    Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { X, Zap, Gift, ShoppingBag, Camera, ArrowRight } from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAdvertiserStore } from '@/store/advertiserStore';

interface QuickCampaignModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess?: (campaignId: string) => void;
}

type RewardType = 'gems' | 'coupon' | 'product';

const REWARD_TYPES: Array<{ id: RewardType; label: string; icon: any }> = [
    { id: 'gems', label: 'Gems', icon: Zap },
    { id: 'coupon', label: 'Discount', icon: Gift },
    { id: 'product', label: 'Free Item', icon: ShoppingBag },
];

const GEMS_OPTIONS = [
    { value: 5, label: '5 Gems ($5)' },
    { value: 10, label: '10 Gems ($10)' },
    { value: 20, label: '20 Gems ($20)' },
    { value: 50, label: '50 Gems ($50)' },
];

const BUDGET_OPTIONS = [
    { value: 50, label: '$50' },
    { value: 100, label: '$100' },
    { value: 250, label: '$250' },
    { value: 500, label: '$500' },
];

export default function QuickCampaignModal({
    visible,
    onClose,
    onSuccess,
}: QuickCampaignModalProps) {
    const router = useRouter();
    const theme = useThemeColors();
    const { createCampaign } = useAdvertiserStore();

    const [name, setName] = useState('');
    const [rewardType, setRewardType] = useState<RewardType>('gems');
    const [rewardAmount, setRewardAmount] = useState(10);
    const [budget, setBudget] = useState(100);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!name.trim()) {
            setError('Please enter a campaign name');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const campaign = await createCampaign({
                name: name.trim(),
                description: `Quick campaign: ${name.trim()}`,
                status: 'active',
                start_date: new Date().toISOString(),
                end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                total_gem_budget: rewardType === 'gems' ? budget : 0,
            });

            if (campaign?.id) {
                onSuccess?.(campaign.id);
                onClose();
                router.push(`/advertiser/campaigns/${campaign.id}` as any);
            }
        } catch (err: any) {
            console.error('Quick campaign creation error:', err);
            setError(err?.message || 'Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        setName('');
        setRewardType('gems');
        setRewardAmount(10);
        setBudget(100);
        setError(null);
    };

    const handleClose = () => {
        handleReset();
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <TouchableOpacity
                    style={styles.backdrop}
                    activeOpacity={1}
                    onPress={handleClose}
                />

                <View style={[styles.modal, { backgroundColor: theme.surface }]}>
                    {/* Close Button */}
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={handleClose}
                        disabled={isSubmitting}
                    >
                        <X size={20} color={theme.textSecondary} />
                    </TouchableOpacity>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Header */}
                        <View style={styles.header}>
                            <View style={styles.iconContainer}>
                                <Zap size={24} color="#FFF" />
                            </View>
                            <View>
                                <Text style={[styles.title, { color: theme.text }]}>Quick Campaign</Text>
                                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                                    Live in 60 seconds
                                </Text>
                            </View>
                        </View>

                        {/* Form */}
                        <View style={styles.form}>
                            {/* Campaign Name */}
                            <View style={styles.field}>
                                <Text style={[styles.label, { color: theme.text }]}>
                                    What's this campaign for?
                                </Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="e.g., Summer Sale, New Product Launch"
                                    placeholderTextColor={theme.textSecondary}
                                    editable={!isSubmitting}
                                />
                            </View>

                            {/* Reward Type */}
                            <View style={styles.field}>
                                <Text style={[styles.label, { color: theme.text }]}>
                                    How will you reward users?
                                </Text>
                                <View style={styles.rewardTypeRow}>
                                    {REWARD_TYPES.map((type) => {
                                        const Icon = type.icon;
                                        const isSelected = rewardType === type.id;
                                        return (
                                            <TouchableOpacity
                                                key={type.id}
                                                style={[
                                                    styles.rewardTypeButton,
                                                    { borderColor: isSelected ? '#10B981' : theme.border, backgroundColor: isSelected ? '#10B98110' : theme.background },
                                                ]}
                                                onPress={() => setRewardType(type.id)}
                                                disabled={isSubmitting}
                                            >
                                                <Icon size={20} color={isSelected ? '#10B981' : theme.textSecondary} />
                                                <Text style={[styles.rewardTypeLabel, { color: isSelected ? '#10B981' : theme.text }]}>
                                                    {type.label}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>

                            {/* Gems Amount & Budget */}
                            {rewardType === 'gems' && (
                                <View style={styles.gemsRow}>
                                    <View style={[styles.field, { flex: 1 }]}>
                                        <Text style={[styles.label, { color: theme.text }]}>Gems per proof</Text>
                                        <View style={styles.optionRow}>
                                            {GEMS_OPTIONS.map((opt) => (
                                                <TouchableOpacity
                                                    key={opt.value}
                                                    style={[
                                                        styles.optionButton,
                                                        { borderColor: rewardAmount === opt.value ? '#10B981' : theme.border, backgroundColor: rewardAmount === opt.value ? '#10B98110' : theme.background },
                                                    ]}
                                                    onPress={() => setRewardAmount(opt.value)}
                                                    disabled={isSubmitting}
                                                >
                                                    <Text style={[styles.optionText, { color: rewardAmount === opt.value ? '#10B981' : theme.text }]}>
                                                        {opt.value}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                </View>
                            )}

                            {rewardType === 'gems' && (
                                <View style={styles.field}>
                                    <Text style={[styles.label, { color: theme.text }]}>Total budget</Text>
                                    <View style={styles.optionRow}>
                                        {BUDGET_OPTIONS.map((opt) => (
                                            <TouchableOpacity
                                                key={opt.value}
                                                style={[
                                                    styles.optionButton,
                                                    { borderColor: budget === opt.value ? '#10B981' : theme.border, backgroundColor: budget === opt.value ? '#10B98110' : theme.background },
                                                ]}
                                                onPress={() => setBudget(opt.value)}
                                                disabled={isSubmitting}
                                            >
                                                <Text style={[styles.optionText, { color: budget === opt.value ? '#10B981' : theme.text }]}>
                                                    {opt.label}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            )}

                            {/* Info Box */}
                            <View style={styles.infoBox}>
                                <Text style={styles.infoText}>
                                    <Text style={styles.infoBold}>What happens next: </Text>
                                    Users will see your campaign and can submit photo proof of their purchase.
                                </Text>
                            </View>

                            {/* Error */}
                            {error && (
                                <View style={styles.errorBox}>
                                    <Text style={styles.errorText}>{error}</Text>
                                </View>
                            )}

                            {/* Submit Button */}
                            <TouchableOpacity
                                style={[styles.submitButton, (!name.trim() || isSubmitting) && styles.submitButtonDisabled]}
                                onPress={handleSubmit}
                                disabled={!name.trim() || isSubmitting}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color="#FFF" size="small" />
                                ) : (
                                    <>
                                        <Camera size={20} color="#FFF" />
                                        <Text style={styles.submitButtonText}>Launch Campaign</Text>
                                        <ArrowRight size={16} color="#FFF" />
                                    </>
                                )}
                            </TouchableOpacity>

                            {/* Advanced Link */}
                            <TouchableOpacity
                                style={styles.advancedLink}
                                onPress={() => {
                                    handleClose();
                                    router.push('/advertiser/campaigns/create' as any);
                                }}
                            >
                                <Text style={[styles.advancedLinkText, { color: theme.textSecondary }]}>
                                    Need more options? <Text style={{ color: '#10B981' }}>Use full builder</Text>
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    modal: {
        maxHeight: height * 0.85,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        paddingBottom: 40,
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        padding: 8,
        zIndex: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 24,
        paddingRight: 40,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#10B981',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
    },
    subtitle: {
        fontSize: 14,
        marginTop: 2,
    },
    form: {
        gap: 20,
    },
    field: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
    },
    rewardTypeRow: {
        flexDirection: 'row',
        gap: 8,
    },
    rewardTypeButton: {
        flex: 1,
        padding: 12,
        borderRadius: 12,
        borderWidth: 2,
        alignItems: 'center',
        gap: 6,
    },
    rewardTypeLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    gemsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    optionRow: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap',
    },
    optionButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 10,
        borderWidth: 2,
    },
    optionText: {
        fontSize: 14,
        fontWeight: '600',
    },
    infoBox: {
        backgroundColor: '#10B98115',
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: '#10B98130',
    },
    infoText: {
        fontSize: 13,
        color: '#10B981',
        lineHeight: 20,
    },
    infoBold: {
        fontWeight: '700',
    },
    errorBox: {
        backgroundColor: '#EF444415',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#EF444430',
    },
    errorText: {
        fontSize: 13,
        color: '#EF4444',
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#10B981',
        borderRadius: 14,
        padding: 18,
    },
    submitButtonDisabled: {
        opacity: 0.5,
    },
    submitButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    advancedLink: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    advancedLinkText: {
        fontSize: 13,
    },
});

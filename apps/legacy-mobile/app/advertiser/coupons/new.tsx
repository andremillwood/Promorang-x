import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAdvertiserStore, CreateCouponInput, Coupon, RedemptionType } from '@/store/advertiserStore';
import { Card } from '@/components/ui/Card';
import {
    ArrowLeft,
    Gift,
    Calendar,
    Percent,
    DollarSign,
    Package,
    ChevronDown,
    Check,
    Hash,
    QrCode,
    Store,
    Smartphone,
    ShoppingCart
} from 'lucide-react-native';
import colors from '@/constants/colors';

type RewardType = Coupon['reward_type'];
type ValueUnit = Coupon['value_unit'];

const rewardTypes: { value: RewardType; label: string; description: string }[] = [
    { value: 'coupon', label: 'Coupon', description: 'Percentage or flat discount' },
    { value: 'giveaway', label: 'Giveaway', description: 'Physical or virtual item' },
    { value: 'credit', label: 'Credit', description: 'Gems or keys reward' },
    { value: 'discount', label: 'Discount', description: 'Fixed amount off' },
];

const valueUnits: { value: ValueUnit; label: string }[] = [
    { value: 'percentage', label: '%' },
    { value: 'usd', label: 'USD' },
    { value: 'gems', label: 'Gems' },
    { value: 'keys', label: 'Keys' },
    { value: 'item', label: 'Item' },
];

const leaderboardOptions = [
    { id: 'top-5', label: 'Top 5 Overall' },
    { id: 'top-10', label: 'Top 10 Overall' },
    { id: 'top-25', label: 'Top 25 Overall' },
    { id: 'growth-leaders', label: 'Growth Leaders (Weekly)' },
];

const redemptionTypes: { value: RedemptionType; label: string; description: string; icon: any }[] = [
    { value: 'marketplace', label: 'Checkout Only', description: 'Redeemed at checkout in the shop', icon: ShoppingCart },
    { value: 'standalone', label: 'In-Person Only', description: 'QR code scan or code entry at location', icon: QrCode },
    { value: 'hybrid', label: 'Both', description: 'Can be used online or in-person', icon: Smartphone },
];

export default function NewCouponScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { createCoupon, assignCoupon, drops } = useAdvertiserStore();
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showRewardTypePicker, setShowRewardTypePicker] = useState(false);
    const [showValueUnitPicker, setShowValueUnitPicker] = useState(false);
    
    const now = new Date();
    const inThirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        reward_type: 'coupon' as RewardType,
        value: '10',
        value_unit: 'percentage' as ValueUnit,
        quantity_total: '10',
        start_date: now.toISOString().split('T')[0],
        end_date: inThirtyDays.toISOString().split('T')[0],
        // IRL Redemption fields
        redemption_type: 'marketplace' as RedemptionType,
        merchant_validation_required: false,
        redemption_instructions: '',
        coupon_code: '',
    });

    const [assignTo, setAssignTo] = useState<{
        type: 'none' | 'drop' | 'leaderboard' | 'content';
        dropId: string;
        leaderboardId: string;
        contentId: string;
    }>({
        type: 'none',
        dropId: '',
        leaderboardId: 'top-10',
        contentId: '',
    });

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const validateForm = (): boolean => {
        if (!formData.title.trim()) {
            Alert.alert('Validation Error', 'Please enter a title');
            return false;
        }
        if (!formData.value || parseFloat(formData.value) <= 0) {
            Alert.alert('Validation Error', 'Please enter a valid reward value');
            return false;
        }
        if (!formData.quantity_total || parseInt(formData.quantity_total, 10) <= 0) {
            Alert.alert('Validation Error', 'Please enter a valid quantity');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);
        
        const couponInput: CreateCouponInput = {
            title: formData.title.trim(),
            description: formData.description.trim() || undefined,
            reward_type: formData.reward_type,
            value: parseFloat(formData.value),
            value_unit: formData.value_unit,
            quantity_total: parseInt(formData.quantity_total, 10),
            start_date: formData.start_date,
            end_date: formData.end_date,
            // IRL Redemption options
            redemption_type: formData.redemption_type,
            merchant_validation_required: formData.merchant_validation_required,
            redemption_instructions: formData.redemption_instructions.trim() || undefined,
            coupon_code: formData.coupon_code.trim() || undefined,
        };

        try {
            const result = await createCoupon(couponInput);
            if (result) {
                // Handle assignment if selected
                if (assignTo.type === 'drop' && assignTo.dropId) {
                    const drop = drops.find(d => d.id === assignTo.dropId);
                    await assignCoupon(result.id, {
                        target_type: 'drop',
                        target_id: assignTo.dropId,
                        target_label: drop?.title || assignTo.dropId,
                    });
                } else if (assignTo.type === 'leaderboard' && assignTo.leaderboardId) {
                    const option = leaderboardOptions.find(o => o.id === assignTo.leaderboardId);
                    await assignCoupon(result.id, {
                        target_type: 'leaderboard',
                        target_id: assignTo.leaderboardId,
                        target_label: option?.label || assignTo.leaderboardId,
                    });
                } else if (assignTo.type === 'content') {
                    await assignCoupon(result.id, {
                        target_type: 'content',
                        target_id: 'engagement-reward',
                        target_label: 'Content Engagement Reward',
                    });
                }

                Alert.alert('Success', 'Coupon created successfully!', [
                    { text: 'OK', onPress: () => router.back() }
                ]);
            } else {
                Alert.alert('Error', 'Failed to create coupon. Please try again.');
            }
        } catch (error) {
            console.error('Create coupon error:', error);
            Alert.alert('Error', 'An unexpected error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedRewardType = rewardTypes.find(r => r.value === formData.reward_type);
    const selectedValueUnit = valueUnits.find(v => v.value === formData.value_unit);

    const renderPicker = (
        visible: boolean,
        onClose: () => void,
        options: { value: string; label: string; description?: string }[],
        selectedValue: string,
        onSelect: (value: string) => void,
        title: string
    ) => {
        if (!visible) return null;
        
        return (
            <View style={styles.pickerOverlay}>
                <TouchableOpacity style={styles.pickerBackdrop} onPress={onClose} />
                <View style={[styles.pickerContainer, { paddingBottom: insets.bottom + 16 }]}>
                    <Text style={styles.pickerTitle}>{title}</Text>
                    <ScrollView style={styles.pickerScroll}>
                        {options.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                style={[
                                    styles.pickerOption,
                                    selectedValue === option.value && styles.pickerOptionSelected
                                ]}
                                onPress={() => {
                                    onSelect(option.value);
                                    onClose();
                                }}
                            >
                                <View style={styles.pickerOptionContent}>
                                    <Text style={[
                                        styles.pickerOptionLabel,
                                        selectedValue === option.value && styles.pickerOptionLabelSelected
                                    ]}>
                                        {option.label}
                                    </Text>
                                    {option.description && (
                                        <Text style={styles.pickerOptionDescription}>
                                            {option.description}
                                        </Text>
                                    )}
                                </View>
                                {selectedValue === option.value && (
                                    <Check size={20} color="#9333EA" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView 
            style={[styles.container, { paddingTop: insets.top }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#1F2937" />
                </TouchableOpacity>
                <View style={styles.headerTitle}>
                    <Text style={styles.title}>Create Incentive</Text>
                    <Text style={styles.subtitle}>Set up a new coupon or reward</Text>
                </View>
            </View>

            <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {/* Reward Type */}
                <Card style={styles.section}>
                    <Text style={styles.sectionTitle}>Reward Type</Text>
                    <TouchableOpacity 
                        style={styles.selectButton}
                        onPress={() => setShowRewardTypePicker(true)}
                    >
                        <View style={styles.selectContent}>
                            <Gift size={20} color="#9333EA" />
                            <View style={styles.selectText}>
                                <Text style={styles.selectLabel}>{selectedRewardType?.label}</Text>
                                <Text style={styles.selectDescription}>{selectedRewardType?.description}</Text>
                            </View>
                        </View>
                        <ChevronDown size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                </Card>

                {/* Coupon Details */}
                <Card style={styles.section}>
                    <Text style={styles.sectionTitle}>Coupon Details</Text>
                    
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Title *</Text>
                        <TextInput
                            style={styles.textInput}
                            value={formData.title}
                            onChangeText={(value) => handleChange('title', value)}
                            placeholder="e.g. 25% Off Premium Upgrade"
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Description (Optional)</Text>
                        <TextInput
                            style={[styles.textInput, styles.textArea]}
                            value={formData.description}
                            onChangeText={(value) => handleChange('description', value)}
                            placeholder="Describe what this incentive offers..."
                            placeholderTextColor="#9CA3AF"
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                        />
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.inputLabel}>Reward Value *</Text>
                            <View style={styles.valueInput}>
                                {formData.value_unit === 'percentage' ? (
                                    <Percent size={18} color="#6B7280" />
                                ) : (
                                    <DollarSign size={18} color="#6B7280" />
                                )}
                                <TextInput
                                    style={styles.valueTextInput}
                                    value={formData.value}
                                    onChangeText={(value) => handleChange('value', value)}
                                    placeholder="10"
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.inputLabel}>Unit</Text>
                            <TouchableOpacity 
                                style={styles.unitButton}
                                onPress={() => setShowValueUnitPicker(true)}
                            >
                                <Text style={styles.unitButtonText}>{selectedValueUnit?.label}</Text>
                                <ChevronDown size={18} color="#6B7280" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Quantity *</Text>
                        <View style={styles.quantityInput}>
                            <Package size={18} color="#6B7280" />
                            <TextInput
                                style={styles.quantityTextInput}
                                value={formData.quantity_total}
                                onChangeText={(value) => handleChange('quantity_total', value)}
                                placeholder="10"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="numeric"
                            />
                        </View>
                        <Text style={styles.inputHint}>How many coupons to create</Text>
                    </View>
                </Card>

                {/* Validity Period */}
                <Card style={styles.section}>
                    <Text style={styles.sectionTitle}>Validity Period</Text>
                    
                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.inputLabel}>Start Date</Text>
                            <View style={styles.dateInput}>
                                <Calendar size={18} color="#6B7280" />
                                <TextInput
                                    style={styles.dateTextInput}
                                    value={formData.start_date}
                                    onChangeText={(value) => handleChange('start_date', value)}
                                    placeholder="YYYY-MM-DD"
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>
                        </View>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.inputLabel}>End Date</Text>
                            <View style={styles.dateInput}>
                                <Calendar size={18} color="#6B7280" />
                                <TextInput
                                    style={styles.dateTextInput}
                                    value={formData.end_date}
                                    onChangeText={(value) => handleChange('end_date', value)}
                                    placeholder="YYYY-MM-DD"
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>
                        </View>
                    </View>
                </Card>

                {/* Redemption Method */}
                <Card style={styles.section}>
                    <Text style={styles.sectionTitle}>Redemption Method</Text>
                    <Text style={styles.sectionDescription}>
                        How will customers redeem this coupon?
                    </Text>
                    
                    <View style={styles.redemptionOptions}>
                        {redemptionTypes.map((option) => {
                            const IconComponent = option.icon;
                            const isSelected = formData.redemption_type === option.value;
                            return (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.redemptionOption,
                                        isSelected && styles.redemptionOptionSelected
                                    ]}
                                    onPress={() => setFormData(prev => ({ ...prev, redemption_type: option.value }))}
                                >
                                    <View style={[
                                        styles.redemptionIconContainer,
                                        isSelected && styles.redemptionIconContainerSelected
                                    ]}>
                                        <IconComponent size={24} color={isSelected ? '#9333EA' : '#6B7280'} />
                                    </View>
                                    <Text style={[
                                        styles.redemptionOptionLabel,
                                        isSelected && styles.redemptionOptionLabelSelected
                                    ]}>
                                        {option.label}
                                    </Text>
                                    <Text style={styles.redemptionOptionDescription}>
                                        {option.description}
                                    </Text>
                                    {isSelected && (
                                        <View style={styles.redemptionCheckmark}>
                                            <Check size={16} color="#9333EA" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* IRL-specific fields */}
                    {(formData.redemption_type === 'standalone' || formData.redemption_type === 'hybrid') && (
                        <>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Coupon Code (Optional)</Text>
                                <View style={styles.codeInput}>
                                    <Hash size={18} color="#6B7280" />
                                    <TextInput
                                        style={styles.codeTextInput}
                                        value={formData.coupon_code}
                                        onChangeText={(value) => handleChange('coupon_code', value.toUpperCase())}
                                        placeholder="e.g. SAVE25"
                                        placeholderTextColor="#9CA3AF"
                                        autoCapitalize="characters"
                                    />
                                </View>
                                <Text style={styles.inputHint}>Leave blank to auto-generate unique codes</Text>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Redemption Instructions</Text>
                                <TextInput
                                    style={[styles.textInput, styles.textArea]}
                                    value={formData.redemption_instructions}
                                    onChangeText={(value) => handleChange('redemption_instructions', value)}
                                    placeholder="e.g. Show this QR code to the cashier at checkout"
                                    placeholderTextColor="#9CA3AF"
                                    multiline
                                    numberOfLines={3}
                                    textAlignVertical="top"
                                />
                            </View>

                            <TouchableOpacity
                                style={styles.validationToggle}
                                onPress={() => setFormData(prev => ({ 
                                    ...prev, 
                                    merchant_validation_required: !prev.merchant_validation_required 
                                }))}
                            >
                                <View style={[
                                    styles.checkbox,
                                    formData.merchant_validation_required && styles.checkboxChecked
                                ]}>
                                    {formData.merchant_validation_required && (
                                        <Check size={14} color="#FFF" />
                                    )}
                                </View>
                                <View style={styles.validationToggleText}>
                                    <Text style={styles.validationToggleLabel}>Require Merchant Validation</Text>
                                    <Text style={styles.validationToggleHint}>
                                        Merchant must scan/verify before redemption is complete
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </>
                    )}
                </Card>

                {/* Assignment (Optional) */}
                <Card style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Assign (Optional)</Text>
                    <Text style={styles.sectionDescription}>
                        Assign as a reward for drops, leaderboard positions, or content engagement
                    </Text>
                    
                    <View style={styles.assignmentOptions}>
                        <TouchableOpacity 
                            style={[
                                styles.assignmentOption,
                                assignTo.type === 'none' && styles.assignmentOptionSelected
                            ]}
                            onPress={() => setAssignTo({ ...assignTo, type: 'none' })}
                        >
                            <Text style={[
                                styles.assignmentOptionText,
                                assignTo.type === 'none' && styles.assignmentOptionTextSelected
                            ]}>
                                None
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[
                                styles.assignmentOption,
                                assignTo.type === 'drop' && styles.assignmentOptionSelected
                            ]}
                            onPress={() => setAssignTo({ ...assignTo, type: 'drop' })}
                        >
                            <Text style={[
                                styles.assignmentOptionText,
                                assignTo.type === 'drop' && styles.assignmentOptionTextSelected
                            ]}>
                                Drop
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[
                                styles.assignmentOption,
                                assignTo.type === 'leaderboard' && styles.assignmentOptionSelected
                            ]}
                            onPress={() => setAssignTo({ ...assignTo, type: 'leaderboard' })}
                        >
                            <Text style={[
                                styles.assignmentOptionText,
                                assignTo.type === 'leaderboard' && styles.assignmentOptionTextSelected
                            ]}>
                                Leaderboard
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[
                                styles.assignmentOption,
                                assignTo.type === 'content' && styles.assignmentOptionSelected
                            ]}
                            onPress={() => setAssignTo({ ...assignTo, type: 'content' })}
                        >
                            <Text style={[
                                styles.assignmentOptionText,
                                assignTo.type === 'content' && styles.assignmentOptionTextSelected
                            ]}>
                                Content
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {assignTo.type === 'leaderboard' && (
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Leaderboard Target</Text>
                            <View style={styles.leaderboardOptions}>
                                {leaderboardOptions.map((option) => (
                                    <TouchableOpacity
                                        key={option.id}
                                        style={[
                                            styles.leaderboardOption,
                                            assignTo.leaderboardId === option.id && styles.leaderboardOptionSelected
                                        ]}
                                        onPress={() => setAssignTo({ ...assignTo, leaderboardId: option.id })}
                                    >
                                        <Text style={[
                                            styles.leaderboardOptionText,
                                            assignTo.leaderboardId === option.id && styles.leaderboardOptionTextSelected
                                        ]}>
                                            {option.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {assignTo.type === 'content' && (
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Content Engagement Reward</Text>
                            <Text style={styles.inputHint}>
                                This coupon will be awarded to users who engage with your content (likes, comments, shares).
                                You can select specific content after creation.
                            </Text>
                        </View>
                    )}
                </Card>

                {/* Submit Button */}
                <View style={styles.submitContainer}>
                    <TouchableOpacity 
                        style={styles.cancelButton}
                        onPress={() => router.back()}
                        disabled={isSubmitting}
                    >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.submitButton}
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                    >
                        <LinearGradient
                            colors={['#9333EA', '#EC4899']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.submitGradient}
                        >
                            {isSubmitting ? (
                                <Text style={styles.submitButtonText}>Creating...</Text>
                            ) : (
                                <>
                                    <Gift size={20} color={colors.white} />
                                    <Text style={styles.submitButtonText}>Create Incentive</Text>
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Pickers */}
            {renderPicker(
                showRewardTypePicker,
                () => setShowRewardTypePicker(false),
                rewardTypes,
                formData.reward_type,
                (value) => handleChange('reward_type', value),
                'Select Reward Type'
            )}
            {renderPicker(
                showValueUnitPicker,
                () => setShowValueUnitPicker(false),
                valueUnits,
                formData.value_unit,
                (value) => handleChange('value_unit', value),
                'Select Unit'
            )}
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backButton: {
        padding: 8,
        marginRight: 8,
    },
    headerTitle: {
        flex: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1F2937',
    },
    subtitle: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 2,
    },
    scrollContent: {
        padding: 16,
    },
    section: {
        padding: 16,
        borderRadius: 16,
        backgroundColor: colors.white,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 12,
    },
    sectionDescription: {
        fontSize: 13,
        color: '#6B7280',
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    textInput: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        color: '#1F2937',
    },
    textArea: {
        minHeight: 80,
        paddingTop: 14,
    },
    inputHint: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 6,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    selectButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    selectContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    selectText: {
        marginLeft: 12,
        flex: 1,
    },
    selectLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1F2937',
    },
    selectDescription: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    valueInput: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 12,
    },
    valueTextInput: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 8,
        fontSize: 15,
        color: '#1F2937',
    },
    unitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    unitButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1F2937',
    },
    quantityInput: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 12,
    },
    quantityTextInput: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 8,
        fontSize: 15,
        color: '#1F2937',
    },
    dateInput: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 12,
    },
    dateTextInput: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 8,
        fontSize: 15,
        color: '#1F2937',
    },
    assignmentOptions: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },
    assignmentOption: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 10,
        backgroundColor: '#F3F4F6',
    },
    assignmentOptionSelected: {
        backgroundColor: '#F3E8FF',
    },
    assignmentOptionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
    assignmentOptionTextSelected: {
        color: '#9333EA',
    },
    leaderboardOptions: {
        gap: 8,
    },
    leaderboardOption: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 10,
        backgroundColor: '#F3F4F6',
    },
    leaderboardOptionSelected: {
        backgroundColor: '#F3E8FF',
        borderWidth: 1,
        borderColor: '#9333EA',
    },
    leaderboardOptionText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
    },
    leaderboardOptionTextSelected: {
        color: '#9333EA',
        fontWeight: '600',
    },
    submitContainer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6B7280',
    },
    submitButton: {
        flex: 2,
        borderRadius: 12,
        overflow: 'hidden',
    },
    submitGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.white,
    },
    pickerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'flex-end',
    },
    pickerBackdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    pickerContainer: {
        backgroundColor: colors.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 20,
        maxHeight: '60%',
    },
    pickerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
        textAlign: 'center',
        marginBottom: 16,
    },
    pickerScroll: {
        paddingHorizontal: 16,
    },
    pickerOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 8,
        backgroundColor: '#F9FAFB',
    },
    pickerOptionSelected: {
        backgroundColor: '#F3E8FF',
        borderWidth: 1,
        borderColor: '#9333EA',
    },
    pickerOptionContent: {
        flex: 1,
    },
    pickerOptionLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1F2937',
    },
    pickerOptionLabelSelected: {
        color: '#9333EA',
    },
    pickerOptionDescription: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    // Redemption Method styles
    redemptionOptions: {
        gap: 12,
        marginBottom: 16,
    },
    redemptionOption: {
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        position: 'relative',
    },
    redemptionOptionSelected: {
        backgroundColor: '#F3E8FF',
        borderColor: '#9333EA',
    },
    redemptionIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    redemptionIconContainerSelected: {
        backgroundColor: '#E9D5FF',
    },
    redemptionOptionLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
    },
    redemptionOptionLabelSelected: {
        color: '#9333EA',
    },
    redemptionOptionDescription: {
        fontSize: 12,
        color: '#6B7280',
    },
    redemptionCheckmark: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#E9D5FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    codeInput: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
    },
    codeTextInput: {
        flex: 1,
        paddingVertical: 14,
        paddingLeft: 12,
        fontSize: 15,
        color: '#1F2937',
        fontWeight: '600',
        letterSpacing: 1,
    },
    validationToggle: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 12,
        gap: 12,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
    },
    checkboxChecked: {
        backgroundColor: '#9333EA',
        borderColor: '#9333EA',
    },
    validationToggleText: {
        flex: 1,
    },
    validationToggleLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
    },
    validationToggleHint: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
});

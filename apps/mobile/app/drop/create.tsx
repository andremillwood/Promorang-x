import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Image,
    Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import {
    ArrowLeft,
    ArrowRight,
    Check,
    Camera,
    FileText,
    Zap,
    Heart,
    Share2,
    MessageCircle,
    Users,
    Star,
    Clock,
    Diamond,
    Key,
    AlertCircle,
    ChevronDown,
    X,
    Info,
} from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAuthStore } from '@/store/authStore';
import colors from '@/constants/colors';
import { haptics } from '@/lib/haptics';
import { safeBack } from '@/lib/navigation';

const API_URL = 'https://promorang-api.vercel.app';

// Drop type definitions with full configuration
const DROP_TYPES = [
    {
        id: 'content_creation',
        name: 'Content Creation',
        description: 'Request UGC, reviews, or original content',
        icon: Camera,
        color: '#3B82F6',
        requiresProof: true,
        examples: ['Product review video', 'Unboxing content', 'Tutorial/How-to'],
        gemPoolRequired: false,
    },
    {
        id: 'content_clipping',
        name: 'Content Clipping',
        description: 'Share existing content to new platforms',
        icon: Share2,
        color: '#10B981',
        requiresProof: true,
        examples: ['Repost to TikTok', 'Share to Instagram', 'Cross-platform sharing'],
        gemPoolRequired: false,
    },
    {
        id: 'engagement',
        name: 'Engagement',
        description: 'Likes, comments, shares on your content',
        icon: Heart,
        color: '#EC4899',
        requiresProof: false,
        examples: ['Like campaign post', 'Comment on video', 'Share to stories'],
        gemPoolRequired: true,
        isMove: true,
    },
    {
        id: 'reviews',
        name: 'Reviews & Testimonials',
        description: 'Written or video reviews of products/services',
        icon: Star,
        color: '#F59E0B',
        requiresProof: true,
        examples: ['App store review', 'Google review', 'Video testimonial'],
        gemPoolRequired: false,
    },
    {
        id: 'affiliate_referral',
        name: 'Affiliate & Referral',
        description: 'Promote affiliate links or referral codes',
        icon: Users,
        color: '#8B5CF6',
        requiresProof: true,
        examples: ['Share referral link', 'Promote discount code', 'Affiliate promotion'],
        gemPoolRequired: false,
    },
    {
        id: 'surveys',
        name: 'Surveys & Feedback',
        description: 'Collect user feedback and opinions',
        icon: FileText,
        color: '#06B6D4',
        requiresProof: false,
        examples: ['Product feedback', 'Market research', 'User survey'],
        gemPoolRequired: true,
    },
];

const PLATFORMS = [
    { id: 'instagram', name: 'Instagram', color: '#E4405F' },
    { id: 'tiktok', name: 'TikTok', color: '#000000' },
    { id: 'youtube', name: 'YouTube', color: '#FF0000' },
    { id: 'twitter', name: 'X (Twitter)', color: '#1DA1F2' },
    { id: 'facebook', name: 'Facebook', color: '#1877F2' },
    { id: 'any', name: 'Any Platform', color: '#6B7280' },
];

const DIFFICULTIES = [
    { id: 'easy', name: 'Easy', description: '< 30 mins', color: '#10B981', gemMultiplier: 1 },
    { id: 'medium', name: 'Medium', description: '30-60 mins', color: '#F59E0B', gemMultiplier: 1.5 },
    { id: 'hard', name: 'Hard', description: '1+ hours', color: '#EF4444', gemMultiplier: 2 },
];

interface DropFormData {
    title: string;
    description: string;
    drop_type: string;
    platform: string;
    difficulty: string;
    content_url: string;
    preview_image: string | null;
    requirements: string;
    deliverables: string;
    time_commitment: string;
    deadline_days: number;
    max_participants: number;
    follower_threshold: number;
    // Economics
    gem_reward_base: number;
    gem_pool_total: number;
    key_cost: number;
    is_proof_drop: boolean;
    is_paid_drop: boolean;
}

export default function CreateDropScreen() {
    const router = useRouter();
    const theme = useThemeColors();
    const { token, user } = useAuthStore();

    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const progressAnim = useRef(new Animated.Value(0)).current;

    const [formData, setFormData] = useState<DropFormData>({
        title: '',
        description: '',
        drop_type: '',
        platform: '',
        difficulty: 'easy',
        content_url: '',
        preview_image: null,
        requirements: '',
        deliverables: '',
        time_commitment: '30 minutes',
        deadline_days: 7,
        max_participants: 50,
        follower_threshold: 0,
        gem_reward_base: 25,
        gem_pool_total: 500,
        key_cost: 1,
        is_proof_drop: true,
        is_paid_drop: false,
    });

    const selectedDropType = DROP_TYPES.find(t => t.id === formData.drop_type);

    const STEPS = [
        { title: 'Drop Type', subtitle: 'What kind of drop?' },
        { title: 'Details', subtitle: 'Describe your drop' },
        { title: 'Requirements', subtitle: 'Set expectations' },
        { title: 'Rewards', subtitle: 'Configure economics' },
        { title: 'Review', subtitle: 'Confirm & publish' },
    ];

    const updateProgress = (step: number) => {
        Animated.timing(progressAnim, {
            toValue: (step + 1) / STEPS.length,
            duration: 300,
            useNativeDriver: false,
        }).start();
    };

    const goToStep = async (step: number) => {
        await haptics.light();
        setCurrentStep(step);
        updateProgress(step);
    };

    const nextStep = async () => {
        if (!validateCurrentStep()) return;
        await haptics.light();
        const next = Math.min(currentStep + 1, STEPS.length - 1);
        setCurrentStep(next);
        updateProgress(next);
    };

    const prevStep = async () => {
        await haptics.light();
        const prev = Math.max(currentStep - 1, 0);
        setCurrentStep(prev);
        updateProgress(prev);
    };

    const validateCurrentStep = (): boolean => {
        switch (currentStep) {
            case 0:
                if (!formData.drop_type) {
                    Alert.alert('Required', 'Please select a drop type');
                    return false;
                }
                return true;
            case 1:
                if (!formData.title.trim()) {
                    Alert.alert('Required', 'Please enter a title');
                    return false;
                }
                if (!formData.description.trim()) {
                    Alert.alert('Required', 'Please enter a description');
                    return false;
                }
                if (!formData.platform) {
                    Alert.alert('Required', 'Please select a platform');
                    return false;
                }
                return true;
            case 2:
                if (!formData.requirements.trim()) {
                    Alert.alert('Required', 'Please specify requirements');
                    return false;
                }
                return true;
            case 3:
                if (selectedDropType?.gemPoolRequired && formData.gem_pool_total < 100) {
                    Alert.alert('Required', 'Gem pool must be at least 100 gems');
                    return false;
                }
                return true;
            default:
                return true;
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setFormData(prev => ({ ...prev, preview_image: result.assets[0].uri }));
        }
    };

    const handleSubmit = async () => {
        if (!validateCurrentStep()) return;

        setIsSubmitting(true);
        await haptics.medium();

        try {
            const deadline = new Date();
            deadline.setDate(deadline.getDate() + formData.deadline_days);

            const payload = {
                title: formData.title,
                description: formData.description,
                drop_type: formData.drop_type,
                platform: formData.platform,
                difficulty: formData.difficulty,
                content_url: formData.content_url || undefined,
                requirements: formData.requirements,
                deliverables: formData.deliverables,
                time_commitment: formData.time_commitment,
                deadline_at: deadline.toISOString(),
                max_participants: formData.max_participants,
                follower_threshold: formData.follower_threshold,
                gem_reward_base: formData.gem_reward_base,
                gem_pool_total: formData.gem_pool_total,
                key_cost: formData.is_paid_drop ? formData.key_cost : 0,
                is_proof_drop: formData.is_proof_drop,
                is_paid_drop: formData.is_paid_drop,
            };

            const response = await fetch(`${API_URL}/api/drops`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (result.success) {
                await haptics.success();
                Alert.alert(
                    'Drop Created! 🎉',
                    'Your drop is now live and ready for participants.',
                    [{ text: 'View My Drops', onPress: () => router.push('/drop/manage' as any) }]
                );
            } else {
                throw new Error(result.error || 'Failed to create drop');
            }
        } catch (error: any) {
            console.error('Error creating drop:', error);
            Alert.alert('Error', error.message || 'Failed to create drop');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Step 1: Drop Type Selection
    const renderDropTypeStep = () => (
        <View style={styles.stepContent}>
            <Text style={[styles.stepQuestion, { color: theme.text }]}>
                What type of drop do you want to create?
            </Text>

            <View style={styles.dropTypeGrid}>
                {DROP_TYPES.map((type) => {
                    const isSelected = formData.drop_type === type.id;
                    const IconComponent = type.icon;

                    return (
                        <TouchableOpacity
                            key={type.id}
                            style={[
                                styles.dropTypeCard,
                                { backgroundColor: theme.surface, borderColor: isSelected ? type.color : theme.border },
                                isSelected && { borderWidth: 2 }
                            ]}
                            onPress={() => {
                                haptics.light();
                                setFormData(prev => ({
                                    ...prev,
                                    drop_type: type.id,
                                    is_proof_drop: type.requiresProof,
                                    is_paid_drop: !type.requiresProof,
                                }));
                            }}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.dropTypeIconContainer, { backgroundColor: `${type.color}15` }]}>
                                <IconComponent size={24} color={type.color} />
                            </View>
                            <Text style={[styles.dropTypeName, { color: theme.text }]}>{type.name}</Text>
                            <Text style={[styles.dropTypeDesc, { color: theme.textSecondary }]} numberOfLines={2}>
                                {type.description}
                            </Text>
                            {type.isMove && (
                                <View style={[styles.moveBadge, { backgroundColor: '#F59E0B20' }]}>
                                    <Zap size={10} color="#F59E0B" />
                                    <Text style={styles.moveBadgeText}>Uses Move</Text>
                                </View>
                            )}
                            {isSelected && (
                                <View style={[styles.selectedCheck, { backgroundColor: type.color }]}>
                                    <Check size={14} color="#FFF" />
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>

            {selectedDropType && (
                <View style={[styles.typeInfoCard, { backgroundColor: `${selectedDropType.color}10`, borderColor: `${selectedDropType.color}30` }]}>
                    <Info size={16} color={selectedDropType.color} />
                    <View style={styles.typeInfoContent}>
                        <Text style={[styles.typeInfoTitle, { color: selectedDropType.color }]}>
                            {selectedDropType.requiresProof ? 'Proof Required' : 'Auto-Verified'}
                        </Text>
                        <Text style={[styles.typeInfoText, { color: theme.textSecondary }]}>
                            {selectedDropType.requiresProof
                                ? 'Participants must submit proof of completion for your review'
                                : 'Rewards are distributed automatically when action is verified'}
                        </Text>
                        <View style={styles.typeExamples}>
                            {selectedDropType.examples.map((ex, i) => (
                                <View key={i} style={[styles.exampleChip, { backgroundColor: theme.background }]}>
                                    <Text style={[styles.exampleText, { color: theme.text }]}>{ex}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>
            )}
        </View>
    );

    // Step 2: Details
    const renderDetailsStep = () => (
        <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Drop Title *</Text>
            <TextInput
                style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                placeholder="e.g., Share our new product launch"
                placeholderTextColor={theme.textSecondary}
                value={formData.title}
                onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
                maxLength={100}
            />

            <Text style={[styles.inputLabel, { color: theme.text }]}>Description *</Text>
            <TextInput
                style={[styles.textArea, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                placeholder="Describe what participants need to do..."
                placeholderTextColor={theme.textSecondary}
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
            />

            <Text style={[styles.inputLabel, { color: theme.text }]}>Platform *</Text>
            <View style={styles.platformGrid}>
                {PLATFORMS.map((platform) => (
                    <TouchableOpacity
                        key={platform.id}
                        style={[
                            styles.platformChip,
                            { backgroundColor: formData.platform === platform.id ? platform.color : theme.surface, borderColor: theme.border }
                        ]}
                        onPress={() => setFormData(prev => ({ ...prev, platform: platform.id }))}
                    >
                        <Text style={[
                            styles.platformText,
                            { color: formData.platform === platform.id ? '#FFF' : theme.text }
                        ]}>
                            {platform.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={[styles.inputLabel, { color: theme.text }]}>Content URL (Optional)</Text>
            <TextInput
                style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                placeholder="https://..."
                placeholderTextColor={theme.textSecondary}
                value={formData.content_url}
                onChangeText={(text) => setFormData(prev => ({ ...prev, content_url: text }))}
                keyboardType="url"
                autoCapitalize="none"
            />

            <Text style={[styles.inputLabel, { color: theme.text }]}>Preview Image</Text>
            <TouchableOpacity
                style={[styles.imageUpload, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={pickImage}
            >
                {formData.preview_image ? (
                    <Image source={{ uri: formData.preview_image }} style={styles.previewImage} />
                ) : (
                    <View style={styles.imageUploadPlaceholder}>
                        <Camera size={32} color={theme.textSecondary} />
                        <Text style={[styles.imageUploadText, { color: theme.textSecondary }]}>
                            Tap to upload image
                        </Text>
                    </View>
                )}
            </TouchableOpacity>

            <Text style={[styles.inputLabel, { color: theme.text }]}>Difficulty</Text>
            <View style={styles.difficultyRow}>
                {DIFFICULTIES.map((diff) => (
                    <TouchableOpacity
                        key={diff.id}
                        style={[
                            styles.difficultyChip,
                            { backgroundColor: formData.difficulty === diff.id ? diff.color : theme.surface, borderColor: theme.border }
                        ]}
                        onPress={() => setFormData(prev => ({ ...prev, difficulty: diff.id }))}
                    >
                        <Text style={[
                            styles.difficultyName,
                            { color: formData.difficulty === diff.id ? '#FFF' : theme.text }
                        ]}>
                            {diff.name}
                        </Text>
                        <Text style={[
                            styles.difficultyDesc,
                            { color: formData.difficulty === diff.id ? 'rgba(255,255,255,0.8)' : theme.textSecondary }
                        ]}>
                            {diff.description}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );

    // Step 3: Requirements
    const renderRequirementsStep = () => (
        <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Requirements *</Text>
            <Text style={[styles.inputHint, { color: theme.textSecondary }]}>
                What must participants do to complete this drop?
            </Text>
            <TextInput
                style={[styles.textArea, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                placeholder="• Post to your Instagram feed&#10;• Tag @yourbrand&#10;• Use hashtag #YourCampaign"
                placeholderTextColor={theme.textSecondary}
                value={formData.requirements}
                onChangeText={(text) => setFormData(prev => ({ ...prev, requirements: text }))}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
            />

            <Text style={[styles.inputLabel, { color: theme.text }]}>Deliverables</Text>
            <Text style={[styles.inputHint, { color: theme.textSecondary }]}>
                What proof should participants submit?
            </Text>
            <TextInput
                style={[styles.textArea, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                placeholder="Screenshot of post, link to content, etc."
                placeholderTextColor={theme.textSecondary}
                value={formData.deliverables}
                onChangeText={(text) => setFormData(prev => ({ ...prev, deliverables: text }))}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
            />

            <Text style={[styles.inputLabel, { color: theme.text }]}>Time Commitment</Text>
            <TextInput
                style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                placeholder="e.g., 30 minutes"
                placeholderTextColor={theme.textSecondary}
                value={formData.time_commitment}
                onChangeText={(text) => setFormData(prev => ({ ...prev, time_commitment: text }))}
            />

            <View style={styles.row}>
                <View style={styles.halfInput}>
                    <Text style={[styles.inputLabel, { color: theme.text }]}>Deadline (days)</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                        placeholder="7"
                        placeholderTextColor={theme.textSecondary}
                        value={String(formData.deadline_days)}
                        onChangeText={(text) => setFormData(prev => ({ ...prev, deadline_days: parseInt(text) || 7 }))}
                        keyboardType="number-pad"
                    />
                </View>
                <View style={styles.halfInput}>
                    <Text style={[styles.inputLabel, { color: theme.text }]}>Max Participants</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                        placeholder="50"
                        placeholderTextColor={theme.textSecondary}
                        value={String(formData.max_participants)}
                        onChangeText={(text) => setFormData(prev => ({ ...prev, max_participants: parseInt(text) || 50 }))}
                        keyboardType="number-pad"
                    />
                </View>
            </View>

            <Text style={[styles.inputLabel, { color: theme.text }]}>Minimum Followers (Optional)</Text>
            <TextInput
                style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                placeholder="0 (no minimum)"
                placeholderTextColor={theme.textSecondary}
                value={formData.follower_threshold > 0 ? String(formData.follower_threshold) : ''}
                onChangeText={(text) => setFormData(prev => ({ ...prev, follower_threshold: parseInt(text) || 0 }))}
                keyboardType="number-pad"
            />
        </ScrollView>
    );

    // Step 4: Rewards
    const renderRewardsStep = () => {
        const totalCost = formData.gem_pool_total;
        const perParticipant = Math.floor(formData.gem_pool_total / formData.max_participants);

        return (
            <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
                {/* Gem Pool Section */}
                <View style={[styles.rewardSection, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <View style={styles.rewardSectionHeader}>
                        <Diamond size={20} color="#8B5CF6" />
                        <Text style={[styles.rewardSectionTitle, { color: theme.text }]}>Gem Pool</Text>
                    </View>
                    <Text style={[styles.rewardSectionDesc, { color: theme.textSecondary }]}>
                        Total gems to distribute to participants. This amount will be held in escrow.
                    </Text>

                    <View style={styles.gemPoolInput}>
                        <TextInput
                            style={[styles.gemInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                            value={String(formData.gem_pool_total)}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, gem_pool_total: parseInt(text) || 0 }))}
                            keyboardType="number-pad"
                        />
                        <Text style={[styles.gemLabel, { color: theme.textSecondary }]}>💎 Gems</Text>
                    </View>

                    <View style={[styles.gemCalculation, { backgroundColor: theme.background }]}>
                        <View style={styles.gemCalcRow}>
                            <Text style={[styles.gemCalcLabel, { color: theme.textSecondary }]}>Per participant:</Text>
                            <Text style={[styles.gemCalcValue, { color: theme.text }]}>~{perParticipant} 💎</Text>
                        </View>
                        <View style={styles.gemCalcRow}>
                            <Text style={[styles.gemCalcLabel, { color: theme.textSecondary }]}>Max participants:</Text>
                            <Text style={[styles.gemCalcValue, { color: theme.text }]}>{formData.max_participants}</Text>
                        </View>
                    </View>
                </View>

                {/* Key Cost Section (for paid drops) */}
                <View style={[styles.rewardSection, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <View style={styles.rewardSectionHeader}>
                        <Key size={20} color="#F59E0B" />
                        <Text style={[styles.rewardSectionTitle, { color: theme.text }]}>Entry Cost</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.toggleRow}
                        onPress={() => setFormData(prev => ({ ...prev, is_paid_drop: !prev.is_paid_drop }))}
                    >
                        <View>
                            <Text style={[styles.toggleLabel, { color: theme.text }]}>Require Keys to Enter</Text>
                            <Text style={[styles.toggleDesc, { color: theme.textSecondary }]}>
                                Participants spend keys to join this drop
                            </Text>
                        </View>
                        <View style={[
                            styles.toggle,
                            { backgroundColor: formData.is_paid_drop ? colors.primary : theme.border }
                        ]}>
                            <View style={[
                                styles.toggleKnob,
                                { transform: [{ translateX: formData.is_paid_drop ? 20 : 0 }] }
                            ]} />
                        </View>
                    </TouchableOpacity>

                    {formData.is_paid_drop && (
                        <View style={styles.keyCostInput}>
                            <Text style={[styles.inputLabel, { color: theme.text }]}>Key Cost</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                                value={String(formData.key_cost)}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, key_cost: parseInt(text) || 1 }))}
                                keyboardType="number-pad"
                            />
                        </View>
                    )}
                </View>

                {/* Cost Summary */}
                <View style={[styles.costSummary, { backgroundColor: '#8B5CF610', borderColor: '#8B5CF630' }]}>
                    <AlertCircle size={18} color="#8B5CF6" />
                    <View style={styles.costSummaryContent}>
                        <Text style={[styles.costSummaryTitle, { color: '#8B5CF6' }]}>Total Cost: {totalCost} 💎</Text>
                        <Text style={[styles.costSummaryDesc, { color: theme.textSecondary }]}>
                            This amount will be deducted from your wallet and held in escrow until distributed to participants.
                        </Text>
                    </View>
                </View>
            </ScrollView>
        );
    };

    // Step 5: Review
    const renderReviewStep = () => (
        <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
            <View style={[styles.reviewCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Text style={[styles.reviewTitle, { color: theme.text }]}>{formData.title || 'Untitled Drop'}</Text>
                <Text style={[styles.reviewDesc, { color: theme.textSecondary }]}>{formData.description}</Text>

                <View style={styles.reviewDivider} />

                <View style={styles.reviewRow}>
                    <Text style={[styles.reviewLabel, { color: theme.textSecondary }]}>Type</Text>
                    <Text style={[styles.reviewValue, { color: theme.text }]}>
                        {selectedDropType?.name || formData.drop_type}
                    </Text>
                </View>
                <View style={styles.reviewRow}>
                    <Text style={[styles.reviewLabel, { color: theme.textSecondary }]}>Platform</Text>
                    <Text style={[styles.reviewValue, { color: theme.text }]}>
                        {PLATFORMS.find(p => p.id === formData.platform)?.name || formData.platform}
                    </Text>
                </View>
                <View style={styles.reviewRow}>
                    <Text style={[styles.reviewLabel, { color: theme.textSecondary }]}>Difficulty</Text>
                    <Text style={[styles.reviewValue, { color: theme.text }]}>
                        {DIFFICULTIES.find(d => d.id === formData.difficulty)?.name}
                    </Text>
                </View>
                <View style={styles.reviewRow}>
                    <Text style={[styles.reviewLabel, { color: theme.textSecondary }]}>Duration</Text>
                    <Text style={[styles.reviewValue, { color: theme.text }]}>{formData.deadline_days} days</Text>
                </View>
                <View style={styles.reviewRow}>
                    <Text style={[styles.reviewLabel, { color: theme.textSecondary }]}>Max Participants</Text>
                    <Text style={[styles.reviewValue, { color: theme.text }]}>{formData.max_participants}</Text>
                </View>

                <View style={styles.reviewDivider} />

                <View style={styles.reviewRow}>
                    <Text style={[styles.reviewLabel, { color: theme.textSecondary }]}>Gem Pool</Text>
                    <Text style={[styles.reviewValue, { color: '#8B5CF6' }]}>{formData.gem_pool_total} 💎</Text>
                </View>
                {formData.is_paid_drop && (
                    <View style={styles.reviewRow}>
                        <Text style={[styles.reviewLabel, { color: theme.textSecondary }]}>Entry Cost</Text>
                        <Text style={[styles.reviewValue, { color: '#F59E0B' }]}>{formData.key_cost} 🔑</Text>
                    </View>
                )}
                <View style={styles.reviewRow}>
                    <Text style={[styles.reviewLabel, { color: theme.textSecondary }]}>Proof Required</Text>
                    <Text style={[styles.reviewValue, { color: theme.text }]}>
                        {formData.is_proof_drop ? 'Yes' : 'No (Auto-verified)'}
                    </Text>
                </View>
            </View>

            <View style={[styles.termsCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Text style={[styles.termsText, { color: theme.textSecondary }]}>
                    By creating this drop, you agree to our Terms of Service and confirm you have the rights to distribute the rewards specified.
                </Text>
            </View>
        </ScrollView>
    );

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 0: return renderDropTypeStep();
            case 1: return renderDetailsStep();
            case 2: return renderRequirementsStep();
            case 3: return renderRewardsStep();
            case 4: return renderReviewStep();
            default: return null;
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => safeBack(router)} style={styles.backButton}>
                    <ArrowLeft size={24} color={theme.text} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>{STEPS[currentStep].title}</Text>
                    <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>{STEPS[currentStep].subtitle}</Text>
                </View>
                <Text style={[styles.stepIndicator, { color: theme.textSecondary }]}>
                    {currentStep + 1}/{STEPS.length}
                </Text>
            </View>

            {/* Progress Bar */}
            <View style={[styles.progressContainer, { backgroundColor: theme.border }]}>
                <Animated.View
                    style={[
                        styles.progressBar,
                        {
                            width: progressAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['0%', '100%'],
                            }),
                        },
                    ]}
                />
            </View>

            {/* Step Content */}
            <KeyboardAvoidingView
                style={styles.content}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={100}
            >
                {renderCurrentStep()}
            </KeyboardAvoidingView>

            {/* Footer Navigation */}
            <View style={[styles.footer, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
                {currentStep > 0 ? (
                    <TouchableOpacity style={[styles.footerButton, styles.secondaryButton, { borderColor: theme.border }]} onPress={prevStep}>
                        <ArrowLeft size={20} color={theme.text} />
                        <Text style={[styles.footerButtonText, { color: theme.text }]}>Back</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.footerButton} />
                )}

                {currentStep < STEPS.length - 1 ? (
                    <TouchableOpacity style={[styles.footerButton, styles.primaryButton]} onPress={nextStep}>
                        <Text style={styles.primaryButtonText}>Continue</Text>
                        <ArrowRight size={20} color="#FFF" />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={[styles.footerButton, styles.primaryButton, isSubmitting && styles.disabledButton]}
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                    >
                        <Text style={styles.primaryButtonText}>
                            {isSubmitting ? 'Creating...' : 'Create Drop'}
                        </Text>
                        {!isSubmitting && <Check size={20} color="#FFF" />}
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 8,
        marginRight: 8,
    },
    headerCenter: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    headerSubtitle: {
        fontSize: 13,
        marginTop: 2,
    },
    stepIndicator: {
        fontSize: 14,
        fontWeight: '600',
    },
    progressContainer: {
        height: 3,
    },
    progressBar: {
        height: '100%',
        backgroundColor: colors.primary,
    },
    content: {
        flex: 1,
    },
    stepContent: {
        flex: 1,
        padding: 16,
    },
    stepQuestion: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 20,
    },
    // Drop Type Grid
    dropTypeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    dropTypeCard: {
        width: '47%',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        position: 'relative',
    },
    dropTypeIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    dropTypeName: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 4,
    },
    dropTypeDesc: {
        fontSize: 12,
        lineHeight: 16,
    },
    moveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginTop: 8,
        alignSelf: 'flex-start',
    },
    moveBadgeText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#F59E0B',
    },
    selectedCheck: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    typeInfoCard: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginTop: 20,
        gap: 12,
    },
    typeInfoContent: {
        flex: 1,
    },
    typeInfoTitle: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 4,
    },
    typeInfoText: {
        fontSize: 13,
        lineHeight: 18,
    },
    typeExamples: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 12,
    },
    exampleChip: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    exampleText: {
        fontSize: 12,
    },
    // Form Inputs
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        marginTop: 16,
    },
    inputHint: {
        fontSize: 12,
        marginBottom: 8,
        marginTop: -4,
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
    },
    textArea: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        minHeight: 100,
    },
    platformGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    platformChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
    },
    platformText: {
        fontSize: 14,
        fontWeight: '500',
    },
    imageUpload: {
        height: 160,
        borderRadius: 12,
        borderWidth: 1,
        borderStyle: 'dashed',
        overflow: 'hidden',
    },
    imageUploadPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageUploadText: {
        marginTop: 8,
        fontSize: 14,
    },
    previewImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    difficultyRow: {
        flexDirection: 'row',
        gap: 10,
    },
    difficultyChip: {
        flex: 1,
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
    },
    difficultyName: {
        fontSize: 14,
        fontWeight: '600',
    },
    difficultyDesc: {
        fontSize: 11,
        marginTop: 4,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    halfInput: {
        flex: 1,
    },
    // Rewards
    rewardSection: {
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 16,
    },
    rewardSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 8,
    },
    rewardSectionTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    rewardSectionDesc: {
        fontSize: 13,
        lineHeight: 18,
        marginBottom: 16,
    },
    gemPoolInput: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    gemInput: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
    },
    gemLabel: {
        fontSize: 16,
        fontWeight: '600',
    },
    gemCalculation: {
        marginTop: 16,
        padding: 12,
        borderRadius: 10,
    },
    gemCalcRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    gemCalcLabel: {
        fontSize: 13,
    },
    gemCalcValue: {
        fontSize: 13,
        fontWeight: '600',
    },
    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    toggleLabel: {
        fontSize: 15,
        fontWeight: '600',
    },
    toggleDesc: {
        fontSize: 12,
        marginTop: 2,
    },
    toggle: {
        width: 50,
        height: 30,
        borderRadius: 15,
        padding: 3,
    },
    toggleKnob: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#FFF',
    },
    keyCostInput: {
        marginTop: 16,
    },
    costSummary: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        gap: 12,
    },
    costSummaryContent: {
        flex: 1,
    },
    costSummaryTitle: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 4,
    },
    costSummaryDesc: {
        fontSize: 12,
        lineHeight: 16,
    },
    // Review
    reviewCard: {
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 16,
    },
    reviewTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 8,
    },
    reviewDesc: {
        fontSize: 14,
        lineHeight: 20,
    },
    reviewDivider: {
        height: 1,
        backgroundColor: 'rgba(128,128,128,0.2)',
        marginVertical: 16,
    },
    reviewRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    reviewLabel: {
        fontSize: 14,
    },
    reviewValue: {
        fontSize: 14,
        fontWeight: '600',
    },
    termsCard: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    termsText: {
        fontSize: 12,
        lineHeight: 18,
        textAlign: 'center',
    },
    // Footer
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        borderTopWidth: 1,
        gap: 12,
    },
    footerButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },
    secondaryButton: {
        borderWidth: 1,
    },
    primaryButton: {
        backgroundColor: colors.primary,
    },
    disabledButton: {
        opacity: 0.6,
    },
    footerButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    primaryButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFF',
    },
});

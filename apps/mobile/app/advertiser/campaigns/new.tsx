import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAdvertiserStore } from '@/store/advertiserStore';
import { Card } from '@/components/ui/Card';
import {
    ArrowLeft,
    FileText,
    Image,
    Sparkles,
    Gift,
    CheckCircle,
    Plus,
    Trash2,
    Link as LinkIcon,
    Video,
    MessageSquare,
    Share2,
    PenTool,
    Heart,
    Star,
    Calendar,
    Ticket,
    ChevronDown,
    Check,
    Gem
} from 'lucide-react-native';
import colors from '@/constants/colors';

// Types matching web platform
interface ContentItem {
    id: string;
    type: 'image' | 'video' | 'link' | 'text';
    title: string;
    url?: string;
    description?: string;
}

interface DropItem {
    id: string;
    title: string;
    description: string;
    type: 'share' | 'create' | 'engage' | 'review';
    gemReward: number;
    keysCost: number;
    maxParticipants: number;
    requirements?: string;
}

interface CouponItem {
    id: string;
    title: string;
    description: string;
    discountType: 'percent' | 'fixed' | 'freebie';
    discountValue: number;
    quantity: number;
}

type Step = 1 | 2 | 3 | 4 | 5;

const dropTypes = [
    { value: 'share', label: 'Share Content', description: 'Share to social media', icon: Share2 },
    { value: 'create', label: 'Create Content', description: 'Create original content', icon: PenTool },
    { value: 'engage', label: 'Engage', description: 'Like, comment, save', icon: Heart },
    { value: 'review', label: 'Review', description: 'Write a review', icon: Star },
];

const contentTypes = [
    { value: 'link', label: 'Link/URL', icon: LinkIcon },
    { value: 'image', label: 'Image', icon: Image },
    { value: 'video', label: 'Video', icon: Video },
    { value: 'text', label: 'Text Post', icon: MessageSquare },
];

const discountTypes = [
    { value: 'percent', label: 'Percentage Off' },
    { value: 'fixed', label: 'Fixed Amount Off' },
    { value: 'freebie', label: 'Free Item' },
];

export default function NewCampaignScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { createCampaign } = useAdvertiserStore();
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentStep, setCurrentStep] = useState<Step>(1);
    
    // Campaign basics
    const [campaignName, setCampaignName] = useState('');
    const [campaignDescription, setCampaignDescription] = useState('');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState('');
    
    // Content to promote
    const [contentItems, setContentItems] = useState<ContentItem[]>([]);
    
    // Drops (creator tasks)
    const [drops, setDrops] = useState<DropItem[]>([]);
    
    // Coupons/Incentives
    const [coupons, setCoupons] = useState<CouponItem[]>([]);
    
    // PromoShare contribution
    const [promoShareContribution, setPromoShareContribution] = useState('100');
    
    // Pickers
    const [showDropTypePicker, setShowDropTypePicker] = useState<string | null>(null);
    const [showContentTypePicker, setShowContentTypePicker] = useState<string | null>(null);
    const [showDiscountTypePicker, setShowDiscountTypePicker] = useState<string | null>(null);

    // Content management
    const addContentItem = () => {
        setContentItems([...contentItems, {
            id: `content-${Date.now()}`,
            type: 'link',
            title: '',
            url: '',
            description: ''
        }]);
    };

    const updateContentItem = (id: string, updates: Partial<ContentItem>) => {
        setContentItems(contentItems.map(item => 
            item.id === id ? { ...item, ...updates } : item
        ));
    };

    const removeContentItem = (id: string) => {
        setContentItems(contentItems.filter(item => item.id !== id));
    };

    // Drop management
    const addDrop = () => {
        setDrops([...drops, {
            id: `drop-${Date.now()}`,
            title: '',
            description: '',
            type: 'share',
            gemReward: 10,
            keysCost: 1,
            maxParticipants: 100,
            requirements: ''
        }]);
    };

    const updateDrop = (id: string, updates: Partial<DropItem>) => {
        setDrops(drops.map(drop => 
            drop.id === id ? { ...drop, ...updates } : drop
        ));
    };

    const removeDrop = (id: string) => {
        setDrops(drops.filter(drop => drop.id !== id));
    };

    // Coupon management
    const addCoupon = () => {
        setCoupons([...coupons, {
            id: `coupon-${Date.now()}`,
            title: '',
            description: '',
            discountType: 'percent',
            discountValue: 10,
            quantity: 100
        }]);
    };

    const updateCoupon = (id: string, updates: Partial<CouponItem>) => {
        setCoupons(coupons.map(coupon => 
            coupon.id === id ? { ...coupon, ...updates } : coupon
        ));
    };

    const removeCoupon = (id: string) => {
        setCoupons(coupons.filter(coupon => coupon.id !== id));
    };

    // Calculate totals
    const totalDropRewards = drops.reduce((sum, drop) => sum + (drop.gemReward * drop.maxParticipants), 0);
    const totalBudgetNeeded = totalDropRewards + parseInt(promoShareContribution || '0', 10);

    const validateStep = (step: Step): boolean => {
        switch (step) {
            case 1:
                if (!campaignName.trim()) {
                    Alert.alert('Validation Error', 'Please enter a campaign name');
                    return false;
                }
                return true;
            case 2:
                return true; // Content is optional
            case 3:
                if (drops.length === 0) {
                    Alert.alert('Validation Error', 'Please add at least one drop to your campaign');
                    return false;
                }
                for (const drop of drops) {
                    if (!drop.title.trim()) {
                        Alert.alert('Validation Error', 'Please enter a title for all drops');
                        return false;
                    }
                }
                return true;
            case 4:
                return true; // Coupons are optional
            case 5:
                return true;
            default:
                return true;
        }
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep((currentStep + 1) as Step);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep((currentStep - 1) as Step);
        } else {
            router.back();
        }
    };

    const handleSubmit = async () => {
        if (!validateStep(3)) return; // Ensure drops are valid

        setIsSubmitting(true);
        
        try {
            const result = await createCampaign({
                name: campaignName.trim(),
                description: campaignDescription.trim() || undefined,
                start_date: startDate,
                end_date: endDate || undefined,
                content_items: contentItems,
                drops: drops,
                coupons: coupons,
                budget_gems: totalBudgetNeeded,
                promoshare_contribution: parseInt(promoShareContribution || '0', 10),
            } as any);
            
            if (result) {
                Alert.alert('Success', 'Campaign created successfully!', [
                    { text: 'OK', onPress: () => router.back() }
                ]);
            } else {
                Alert.alert('Error', 'Failed to create campaign. Please try again.');
            }
        } catch (error) {
            console.error('Create campaign error:', error);
            Alert.alert('Error', 'An unexpected error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const steps = [
        { number: 1, title: 'Basics', icon: FileText },
        { number: 2, title: 'Content', icon: Image },
        { number: 3, title: 'Drops', icon: Sparkles },
        { number: 4, title: 'Incentives', icon: Gift },
        { number: 5, title: 'Review', icon: CheckCircle },
    ];

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
                                    <Check size={20} color={colors.primary} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>
        );
    };

    // Render Step 1: Basics
    const renderBasicsStep = () => (
        <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Campaign Basics</Text>
            <Text style={styles.sectionSubtitle}>Name your campaign and set the timeline</Text>
            
            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Campaign Name *</Text>
                <TextInput
                    style={styles.textInput}
                    value={campaignName}
                    onChangeText={setCampaignName}
                    placeholder="e.g., Summer Fashion Launch"
                    placeholderTextColor="#9CA3AF"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                    style={[styles.textInput, styles.textArea]}
                    value={campaignDescription}
                    onChangeText={setCampaignDescription}
                    placeholder="What is this campaign about? What do you want creators to do?"
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                />
            </View>

            <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>Start Date</Text>
                    <View style={styles.dateInput}>
                        <Calendar size={18} color="#6B7280" />
                        <TextInput
                            style={styles.dateTextInput}
                            value={startDate}
                            onChangeText={setStartDate}
                            placeholder="YYYY-MM-DD"
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>End Date (Optional)</Text>
                    <View style={styles.dateInput}>
                        <Calendar size={18} color="#6B7280" />
                        <TextInput
                            style={styles.dateTextInput}
                            value={endDate}
                            onChangeText={setEndDate}
                            placeholder="YYYY-MM-DD"
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>
                </View>
            </View>
        </Card>
    );

    // Render Step 2: Content
    const renderContentStep = () => (
        <Card style={styles.section}>
            <View style={styles.sectionHeader}>
                <View>
                    <Text style={styles.sectionTitle}>Content to Promote</Text>
                    <Text style={styles.sectionSubtitle}>Add the content you want creators to share</Text>
                </View>
                <TouchableOpacity style={styles.addButton} onPress={addContentItem}>
                    <Plus size={18} color={colors.white} />
                    <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
            </View>
            
            {contentItems.length === 0 ? (
                <View style={styles.emptyState}>
                    <Image size={40} color="#9CA3AF" />
                    <Text style={styles.emptyTitle}>No content added yet</Text>
                    <Text style={styles.emptySubtitle}>Add content for creators to promote</Text>
                    <TouchableOpacity style={styles.emptyButton} onPress={addContentItem}>
                        <Plus size={16} color={colors.primary} />
                        <Text style={styles.emptyButtonText}>Add Your First Content</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                contentItems.map((item, index) => (
                    <View key={item.id} style={styles.itemCard}>
                        <View style={styles.itemHeader}>
                            <Text style={styles.itemNumber}>Content #{index + 1}</Text>
                            <TouchableOpacity onPress={() => removeContentItem(item.id)}>
                                <Trash2 size={18} color="#DC2626" />
                            </TouchableOpacity>
                        </View>
                        
                        <TouchableOpacity 
                            style={styles.selectButton}
                            onPress={() => setShowContentTypePicker(item.id)}
                        >
                            <View style={styles.selectContent}>
                                {contentTypes.find(t => t.value === item.type)?.icon && 
                                    React.createElement(contentTypes.find(t => t.value === item.type)!.icon, { size: 18, color: colors.primary })}
                                <Text style={[styles.selectLabel, { marginLeft: 8 }]}>
                                    {contentTypes.find(t => t.value === item.type)?.label}
                                </Text>
                            </View>
                            <ChevronDown size={18} color="#9CA3AF" />
                        </TouchableOpacity>
                        
                        <TextInput
                            style={[styles.textInput, { marginTop: 8 }]}
                            value={item.title}
                            onChangeText={(text) => updateContentItem(item.id, { title: text })}
                            placeholder="Content title"
                            placeholderTextColor="#9CA3AF"
                        />
                        
                        <TextInput
                            style={[styles.textInput, { marginTop: 8 }]}
                            value={item.url || ''}
                            onChangeText={(text) => updateContentItem(item.id, { url: text })}
                            placeholder="URL (Instagram post, TikTok, website, etc.)"
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>
                ))
            )}
        </Card>
    );

    // Render Step 3: Drops
    const renderDropsStep = () => (
        <Card style={styles.section}>
            <View style={styles.sectionHeader}>
                <View>
                    <Text style={styles.sectionTitle}>Drops (Creator Tasks)</Text>
                    <Text style={styles.sectionSubtitle}>Define tasks for creators to complete</Text>
                </View>
                <TouchableOpacity style={styles.addButton} onPress={addDrop}>
                    <Plus size={18} color={colors.white} />
                    <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
            </View>
            
            {drops.length === 0 ? (
                <View style={styles.emptyState}>
                    <Sparkles size={40} color="#9CA3AF" />
                    <Text style={styles.emptyTitle}>No drops added yet</Text>
                    <Text style={styles.emptySubtitle}>Add tasks for creators to earn rewards</Text>
                    <TouchableOpacity style={styles.emptyButton} onPress={addDrop}>
                        <Plus size={16} color={colors.primary} />
                        <Text style={styles.emptyButtonText}>Create Your First Drop</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                drops.map((drop, index) => (
                    <View key={drop.id} style={styles.itemCard}>
                        <View style={styles.itemHeader}>
                            <Text style={styles.itemNumber}>Drop #{index + 1}</Text>
                            <TouchableOpacity onPress={() => removeDrop(drop.id)}>
                                <Trash2 size={18} color="#DC2626" />
                            </TouchableOpacity>
                        </View>
                        
                        <TextInput
                            style={styles.textInput}
                            value={drop.title}
                            onChangeText={(text) => updateDrop(drop.id, { title: text })}
                            placeholder="Drop title"
                            placeholderTextColor="#9CA3AF"
                        />
                        
                        <TouchableOpacity 
                            style={[styles.selectButton, { marginTop: 8 }]}
                            onPress={() => setShowDropTypePicker(drop.id)}
                        >
                            <View style={styles.selectContent}>
                                {dropTypes.find(t => t.value === drop.type)?.icon && 
                                    React.createElement(dropTypes.find(t => t.value === drop.type)!.icon, { size: 18, color: colors.primary })}
                                <View style={{ marginLeft: 8 }}>
                                    <Text style={styles.selectLabel}>
                                        {dropTypes.find(t => t.value === drop.type)?.label}
                                    </Text>
                                    <Text style={styles.selectDescription}>
                                        {dropTypes.find(t => t.value === drop.type)?.description}
                                    </Text>
                                </View>
                            </View>
                            <ChevronDown size={18} color="#9CA3AF" />
                        </TouchableOpacity>
                        
                        <TextInput
                            style={[styles.textInput, styles.textArea, { marginTop: 8 }]}
                            value={drop.description}
                            onChangeText={(text) => updateDrop(drop.id, { description: text })}
                            placeholder="Describe what creators need to do..."
                            placeholderTextColor="#9CA3AF"
                            multiline
                            numberOfLines={2}
                            textAlignVertical="top"
                        />
                        
                        <View style={[styles.row, { marginTop: 8 }]}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.inputLabel}>💎 Gem Reward</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={String(drop.gemReward)}
                                    onChangeText={(text) => updateDrop(drop.id, { gemReward: parseInt(text) || 0 })}
                                    keyboardType="numeric"
                                    placeholder="10"
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.inputLabel}>🔑 Keys Cost</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={String(drop.keysCost)}
                                    onChangeText={(text) => updateDrop(drop.id, { keysCost: parseInt(text) || 0 })}
                                    keyboardType="numeric"
                                    placeholder="1"
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.inputLabel}>Max Participants</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={String(drop.maxParticipants)}
                                    onChangeText={(text) => updateDrop(drop.id, { maxParticipants: parseInt(text) || 0 })}
                                    keyboardType="numeric"
                                    placeholder="100"
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>
                        </View>
                    </View>
                ))
            )}
        </Card>
    );

    // Render Step 4: Incentives
    const renderIncentivesStep = () => (
        <>
            <Card style={styles.section}>
                <View style={styles.sectionHeader}>
                    <View>
                        <Text style={styles.sectionTitle}>Coupons & Incentives</Text>
                        <Text style={styles.sectionSubtitle}>Add coupons for participants (optional)</Text>
                    </View>
                    <TouchableOpacity style={styles.addButton} onPress={addCoupon}>
                        <Plus size={18} color={colors.white} />
                        <Text style={styles.addButtonText}>Add</Text>
                    </TouchableOpacity>
                </View>
                
                {coupons.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Gift size={40} color="#9CA3AF" />
                        <Text style={styles.emptyTitle}>No coupons added</Text>
                        <Text style={styles.emptySubtitle}>Coupons are optional but can boost participation</Text>
                        <TouchableOpacity style={styles.emptyButton} onPress={addCoupon}>
                            <Plus size={16} color={colors.primary} />
                            <Text style={styles.emptyButtonText}>Add a Coupon</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    coupons.map((coupon, index) => (
                        <View key={coupon.id} style={styles.itemCard}>
                            <View style={styles.itemHeader}>
                                <Text style={styles.itemNumber}>Coupon #{index + 1}</Text>
                                <TouchableOpacity onPress={() => removeCoupon(coupon.id)}>
                                    <Trash2 size={18} color="#DC2626" />
                                </TouchableOpacity>
                            </View>
                            
                            <TextInput
                                style={styles.textInput}
                                value={coupon.title}
                                onChangeText={(text) => updateCoupon(coupon.id, { title: text })}
                                placeholder="Coupon title (e.g., 20% Off)"
                                placeholderTextColor="#9CA3AF"
                            />
                            
                            <TouchableOpacity 
                                style={[styles.selectButton, { marginTop: 8 }]}
                                onPress={() => setShowDiscountTypePicker(coupon.id)}
                            >
                                <Text style={styles.selectLabel}>
                                    {discountTypes.find(t => t.value === coupon.discountType)?.label}
                                </Text>
                                <ChevronDown size={18} color="#9CA3AF" />
                            </TouchableOpacity>
                            
                            <View style={[styles.row, { marginTop: 8 }]}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.inputLabel}>
                                        {coupon.discountType === 'percent' ? 'Discount %' : 'Amount ($)'}
                                    </Text>
                                    <TextInput
                                        style={styles.textInput}
                                        value={String(coupon.discountValue)}
                                        onChangeText={(text) => updateCoupon(coupon.id, { discountValue: parseInt(text) || 0 })}
                                        keyboardType="numeric"
                                        placeholder="10"
                                        placeholderTextColor="#9CA3AF"
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.inputLabel}>Quantity</Text>
                                    <TextInput
                                        style={styles.textInput}
                                        value={String(coupon.quantity)}
                                        onChangeText={(text) => updateCoupon(coupon.id, { quantity: parseInt(text) || 0 })}
                                        keyboardType="numeric"
                                        placeholder="100"
                                        placeholderTextColor="#9CA3AF"
                                    />
                                </View>
                            </View>
                        </View>
                    ))
                )}
            </Card>
            
            {/* PromoShare Contribution */}
            <Card style={styles.promoShareCard}>
                <View style={styles.promoShareHeader}>
                    <Ticket size={24} color="#9333EA" />
                    <Text style={styles.promoShareTitle}>PromoShare Contribution</Text>
                </View>
                <Text style={styles.promoShareDescription}>
                    Contribute gems to the PromoShare jackpot. Participants earn lottery tickets for completing your drops!
                </Text>
                <View style={styles.promoShareInput}>
                    <TextInput
                        style={[styles.textInput, { flex: 1 }]}
                        value={promoShareContribution}
                        onChangeText={setPromoShareContribution}
                        keyboardType="numeric"
                        placeholder="100"
                        placeholderTextColor="#9CA3AF"
                    />
                    <Text style={styles.promoShareGems}>💎 gems to jackpot</Text>
                </View>
            </Card>
        </>
    );

    // Render Step 5: Review
    const renderReviewStep = () => (
        <>
            <Card style={styles.section}>
                <Text style={styles.sectionTitle}>Campaign Summary</Text>
                
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Campaign Name</Text>
                    <Text style={styles.summaryValue}>{campaignName || 'Not set'}</Text>
                </View>
                
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Duration</Text>
                    <Text style={styles.summaryValue}>
                        {startDate} - {endDate || 'Ongoing'}
                    </Text>
                </View>
                
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Content Items</Text>
                    <Text style={styles.summaryValue}>{contentItems.length}</Text>
                </View>
                
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Drops</Text>
                    <Text style={styles.summaryValue}>{drops.length}</Text>
                </View>
                
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Coupons</Text>
                    <Text style={styles.summaryValue}>{coupons.length}</Text>
                </View>
                
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>PromoShare Contribution</Text>
                    <Text style={styles.summaryValue}>{promoShareContribution} 💎</Text>
                </View>
            </Card>
            
            {/* Budget Summary */}
            <LinearGradient
                colors={['#EFF6FF', '#F5F3FF']}
                style={styles.budgetCard}
            >
                <Text style={styles.budgetTitle}>Budget Breakdown</Text>
                
                <View style={styles.budgetRow}>
                    <Text style={styles.budgetLabel}>Drop Rewards ({drops.length} drops)</Text>
                    <Text style={styles.budgetValue}>{totalDropRewards} 💎</Text>
                </View>
                
                <View style={styles.budgetRow}>
                    <Text style={styles.budgetLabel}>PromoShare Contribution</Text>
                    <Text style={styles.budgetValue}>{promoShareContribution} 💎</Text>
                </View>
                
                <View style={styles.budgetDivider} />
                
                <View style={styles.budgetRow}>
                    <Text style={styles.budgetTotalLabel}>Total Budget Needed</Text>
                    <Text style={styles.budgetTotalValue}>{totalBudgetNeeded} 💎</Text>
                </View>
            </LinearGradient>
        </>
    );

    return (
        <KeyboardAvoidingView 
            style={[styles.container, { paddingTop: insets.top }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handlePrevious} style={styles.backButton}>
                    <ArrowLeft size={24} color="#1F2937" />
                </TouchableOpacity>
                <View style={styles.headerTitle}>
                    <Text style={styles.title}>Create Campaign</Text>
                    <Text style={styles.subtitle}>Bundle content, drops, and incentives</Text>
                </View>
            </View>

            {/* Step Indicator */}
            <View style={styles.stepIndicator}>
                {steps.map((step, index) => {
                    const StepIcon = step.icon;
                    const isActive = currentStep === step.number;
                    const isCompleted = currentStep > step.number;
                    
                    return (
                        <React.Fragment key={step.number}>
                            <TouchableOpacity 
                                style={[
                                    styles.stepButton,
                                    isActive && styles.stepButtonActive,
                                    isCompleted && styles.stepButtonCompleted
                                ]}
                                onPress={() => setCurrentStep(step.number as Step)}
                            >
                                <StepIcon 
                                    size={16} 
                                    color={isActive ? '#9333EA' : isCompleted ? '#16A34A' : '#9CA3AF'} 
                                />
                                <Text style={[
                                    styles.stepText,
                                    isActive && styles.stepTextActive,
                                    isCompleted && styles.stepTextCompleted
                                ]}>
                                    {step.title}
                                </Text>
                            </TouchableOpacity>
                            {index < steps.length - 1 && (
                                <View style={[
                                    styles.stepLine,
                                    isCompleted && styles.stepLineCompleted
                                ]} />
                            )}
                        </React.Fragment>
                    );
                })}
            </View>

            <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {currentStep === 1 && renderBasicsStep()}
                {currentStep === 2 && renderContentStep()}
                {currentStep === 3 && renderDropsStep()}
                {currentStep === 4 && renderIncentivesStep()}
                {currentStep === 5 && renderReviewStep()}

                {/* Navigation Buttons */}
                <View style={styles.submitContainer}>
                    <TouchableOpacity 
                        style={styles.cancelButton}
                        onPress={handlePrevious}
                        disabled={isSubmitting}
                    >
                        <Text style={styles.cancelButtonText}>
                            {currentStep > 1 ? 'Previous' : 'Cancel'}
                        </Text>
                    </TouchableOpacity>
                    
                    {currentStep < 5 ? (
                        <TouchableOpacity 
                            style={styles.nextButton}
                            onPress={handleNext}
                        >
                            <LinearGradient
                                colors={[colors.primary, '#7C3AED']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.submitGradient}
                            >
                                <Text style={styles.submitButtonText}>Next Step</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity 
                            style={styles.submitButton}
                            onPress={handleSubmit}
                            disabled={isSubmitting || !campaignName || drops.length === 0}
                        >
                            <LinearGradient
                                colors={[colors.primary, '#7C3AED']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.submitGradient}
                            >
                                <Text style={styles.submitButtonText}>
                                    {isSubmitting ? 'Creating...' : `Create Campaign (${totalBudgetNeeded} 💎)`}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Pickers */}
            {showDropTypePicker && renderPicker(
                true,
                () => setShowDropTypePicker(null),
                dropTypes,
                drops.find(d => d.id === showDropTypePicker)?.type || 'share',
                (value) => {
                    if (showDropTypePicker) {
                        updateDrop(showDropTypePicker, { type: value as DropItem['type'] });
                    }
                },
                'Select Drop Type'
            )}
            {showContentTypePicker && renderPicker(
                true,
                () => setShowContentTypePicker(null),
                contentTypes,
                contentItems.find(c => c.id === showContentTypePicker)?.type || 'link',
                (value) => {
                    if (showContentTypePicker) {
                        updateContentItem(showContentTypePicker, { type: value as ContentItem['type'] });
                    }
                },
                'Select Content Type'
            )}
            {showDiscountTypePicker && renderPicker(
                true,
                () => setShowDiscountTypePicker(null),
                discountTypes,
                coupons.find(c => c.id === showDiscountTypePicker)?.discountType || 'percent',
                (value) => {
                    if (showDiscountTypePicker) {
                        updateCoupon(showDiscountTypePicker, { discountType: value as CouponItem['discountType'] });
                    }
                },
                'Select Discount Type'
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
    currencyInput: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 12,
    },
    currencyTextInput: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 8,
        fontSize: 15,
        color: '#1F2937',
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
        paddingVertical: 16,
        alignItems: 'center',
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
        backgroundColor: '#FFF7ED',
        borderWidth: 1,
        borderColor: colors.primary,
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
        color: colors.primary,
    },
    pickerOptionDescription: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    pickerOptionCost: {
        fontSize: 12,
        color: '#9333EA',
        fontWeight: '600',
        marginTop: 4,
    },
    // Step indicator styles
    stepIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    stepButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 8,
    },
    stepButtonActive: {
        backgroundColor: '#F3E8FF',
    },
    stepButtonCompleted: {
        backgroundColor: '#DCFCE7',
    },
    stepText: {
        fontSize: 11,
        fontWeight: '500',
        color: '#9CA3AF',
        marginLeft: 4,
    },
    stepTextActive: {
        color: '#9333EA',
    },
    stepTextCompleted: {
        color: '#16A34A',
    },
    stepLine: {
        width: 16,
        height: 2,
        backgroundColor: '#E5E7EB',
        marginHorizontal: 4,
    },
    stepLineCompleted: {
        backgroundColor: '#16A34A',
    },
    // Section styles
    sectionSubtitle: {
        fontSize: 13,
        color: '#6B7280',
        marginBottom: 16,
        marginTop: -8,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    // Add button
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 4,
    },
    addButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.white,
    },
    // Empty state
    emptyState: {
        alignItems: 'center',
        paddingVertical: 32,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#E5E7EB',
        borderRadius: 12,
    },
    emptyTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#6B7280',
        marginTop: 12,
    },
    emptySubtitle: {
        fontSize: 13,
        color: '#9CA3AF',
        marginTop: 4,
        textAlign: 'center',
    },
    emptyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: colors.primary,
        borderRadius: 8,
        gap: 6,
    },
    emptyButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.primary,
    },
    // Item card
    itemCard: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    itemNumber: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
    },
    // PromoShare card
    promoShareCard: {
        padding: 16,
        borderRadius: 16,
        backgroundColor: '#FAF5FF',
        borderWidth: 1,
        borderColor: '#E9D5FF',
        marginBottom: 16,
    },
    promoShareHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 8,
    },
    promoShareTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#581C87',
    },
    promoShareDescription: {
        fontSize: 13,
        color: '#7C3AED',
        marginBottom: 12,
        lineHeight: 18,
    },
    promoShareInput: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    promoShareGems: {
        fontSize: 14,
        color: '#9333EA',
        fontWeight: '500',
    },
    // Summary styles
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    summaryLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
    },
    // Budget card
    budgetCard: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
    },
    budgetTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E40AF',
        marginBottom: 12,
    },
    budgetRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    budgetLabel: {
        fontSize: 14,
        color: '#3B82F6',
    },
    budgetValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1E40AF',
    },
    budgetDivider: {
        height: 1,
        backgroundColor: '#BFDBFE',
        marginVertical: 12,
    },
    budgetTotalLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E40AF',
    },
    budgetTotalValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#9333EA',
    },
    // Next button
    nextButton: {
        flex: 2,
        borderRadius: 12,
        overflow: 'hidden',
    },
});

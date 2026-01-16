import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import {
    ArrowLeft, Calendar, MapPin, Globe, Check, Tag, Users,
    Image as ImageIcon, Clock, DollarSign, Sparkles
} from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAuthStore } from '@/store/authStore';
import colors from '@/constants/colors';
import DateTimePicker from '@react-native-community/datetimepicker';
import { safeBack } from '@/lib/navigation';

const API_URL = 'https://promorang-api.vercel.app';

const EVENT_CATEGORIES = [
    { value: 'concert', label: 'Concert', emoji: '🎵' },
    { value: 'conference', label: 'Conference', emoji: '🎤' },
    { value: 'meetup', label: 'Meetup', emoji: '🤝' },
    { value: 'festival', label: 'Festival', emoji: '🎉' },
    { value: 'workshop', label: 'Workshop', emoji: '🛠️' },
    { value: 'party', label: 'Party', emoji: '🎊' },
    { value: 'sports', label: 'Sports', emoji: '⚽' },
    { value: 'art', label: 'Art', emoji: '🎨' },
    { value: 'food', label: 'Food', emoji: '🍔' },
    { value: 'nightlife', label: 'Nightlife', emoji: '🌙' },
    { value: 'other', label: 'Other', emoji: '📅' },
];

interface EventFormData {
    title: string;
    description: string;
    category: string;
    event_date: Date;
    event_end_date: Date | null;
    location_name: string;
    location_address: string;
    is_virtual: boolean;
    virtual_url: string;
    ticket_price_range: string;
    max_attendees: string;
    flyer_url: string;
    banner_url: string;
    is_public: boolean;
    tags: string[];
    total_rewards_pool: string;
    total_gems_pool: string;
}

export default function CreateEventScreen() {
    const router = useRouter();
    const theme = useThemeColors();
    const { token, user } = useAuthStore();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [tagInput, setTagInput] = useState('');

    const [formData, setFormData] = useState<EventFormData>({
        title: '',
        description: '',
        category: 'other',
        event_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        event_end_date: null,
        location_name: '',
        location_address: '',
        is_virtual: false,
        virtual_url: '',
        ticket_price_range: '',
        max_attendees: '',
        flyer_url: '',
        banner_url: '',
        is_public: true,
        tags: [],
        total_rewards_pool: '',
        total_gems_pool: '',
    });

    const updateForm = (field: keyof EventFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const addTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            updateForm('tags', [...formData.tags, tagInput.trim()]);
            setTagInput('');
        }
    };

    const removeTag = (tag: string) => {
        updateForm('tags', formData.tags.filter(t => t !== tag));
    };

    const validateStep = (currentStep: number): boolean => {
        if (currentStep === 1 && !formData.title.trim()) {
            Alert.alert('Required', 'Please enter an event title');
            return false;
        }
        return true;
    };

    const handleSubmit = async (publish: boolean = false) => {
        if (!token) {
            Alert.alert('Login Required', 'Please login to create an event');
            router.push('/(auth)/login');
            return;
        }

        if (!formData.title.trim()) {
            Alert.alert('Required', 'Event title is required');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                title: formData.title,
                description: formData.description,
                category: formData.category,
                event_date: formData.event_date.toISOString(),
                event_end_date: formData.event_end_date?.toISOString() || null,
                location_name: formData.location_name,
                location_address: formData.location_address,
                is_virtual: formData.is_virtual,
                virtual_url: formData.virtual_url,
                ticket_price_range: formData.ticket_price_range,
                max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : null,
                flyer_url: formData.flyer_url,
                banner_url: formData.banner_url,
                is_public: formData.is_public,
                tags: formData.tags,
                total_rewards_pool: formData.total_rewards_pool ? parseFloat(formData.total_rewards_pool) : 0,
                total_gems_pool: formData.total_gems_pool ? parseFloat(formData.total_gems_pool) : 0,
                status: publish ? 'published' : 'draft',
            };

            const response = await fetch(`${API_URL}/api/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (data.status === 'success' || data.success) {
                Alert.alert(
                    'Success!',
                    publish ? 'Your event has been published!' : 'Your event has been saved as a draft.',
                    [{ text: 'OK', onPress: () => router.push('/events') }]
                );
            } else {
                throw new Error(data.error || 'Failed to create event');
            }
        } catch (error) {
            console.error('Create event error:', error);
            Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create event');
        } finally {
            setLoading(false);
        }
    };

    const renderStep1 = () => (
        <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
            {/* Title */}
            <View style={styles.field}>
                <Text style={[styles.label, { color: theme.text }]}>Event Title *</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
                    value={formData.title}
                    onChangeText={(v) => updateForm('title', v)}
                    placeholder="Give your event a catchy name"
                    placeholderTextColor={theme.textSecondary}
                />
            </View>

            {/* Category */}
            <View style={styles.field}>
                <Text style={[styles.label, { color: theme.text }]}>Category *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.categoryGrid}>
                        {EVENT_CATEGORIES.map((cat) => (
                            <TouchableOpacity
                                key={cat.value}
                                style={[
                                    styles.categoryItem,
                                    { backgroundColor: theme.card, borderColor: formData.category === cat.value ? colors.primary : theme.border }
                                ]}
                                onPress={() => updateForm('category', cat.value)}
                            >
                                <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                                <Text style={[styles.categoryLabel, { color: formData.category === cat.value ? colors.primary : theme.textSecondary }]}>
                                    {cat.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </View>

            {/* Description */}
            <View style={styles.field}>
                <Text style={[styles.label, { color: theme.text }]}>Description</Text>
                <TextInput
                    style={[styles.textArea, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
                    value={formData.description}
                    onChangeText={(v) => updateForm('description', v)}
                    placeholder="Tell people what your event is about..."
                    placeholderTextColor={theme.textSecondary}
                    multiline
                    numberOfLines={4}
                />
            </View>

            {/* Flyer URL */}
            <View style={styles.field}>
                <Text style={[styles.label, { color: theme.text }]}>
                    <ImageIcon size={14} color={theme.textSecondary} /> Flyer Image URL
                </Text>
                <TextInput
                    style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
                    value={formData.flyer_url}
                    onChangeText={(v) => updateForm('flyer_url', v)}
                    placeholder="https://example.com/flyer.jpg"
                    placeholderTextColor={theme.textSecondary}
                    keyboardType="url"
                />
            </View>
        </ScrollView>
    );

    const renderStep2 = () => (
        <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
            {/* Date */}
            <View style={styles.field}>
                <Text style={[styles.label, { color: theme.text }]}>
                    <Calendar size={14} color={theme.textSecondary} /> Event Date & Time *
                </Text>
                <TouchableOpacity
                    style={[styles.dateButton, { backgroundColor: theme.card, borderColor: theme.border }]}
                    onPress={() => setShowDatePicker(true)}
                >
                    <Text style={{ color: theme.text }}>{formData.event_date.toLocaleString()}</Text>
                </TouchableOpacity>
                {showDatePicker && (
                    <DateTimePicker
                        value={formData.event_date}
                        mode="datetime"
                        display="default"
                        onChange={(_event: any, date?: Date) => {
                            setShowDatePicker(false);
                            if (date) updateForm('event_date', date);
                        }}
                    />
                )}
            </View>

            {/* End Date */}
            <View style={styles.field}>
                <Text style={[styles.label, { color: theme.text }]}>
                    <Clock size={14} color={theme.textSecondary} /> End Date & Time (Optional)
                </Text>
                <TouchableOpacity
                    style={[styles.dateButton, { backgroundColor: theme.card, borderColor: theme.border }]}
                    onPress={() => setShowEndDatePicker(true)}
                >
                    <Text style={{ color: formData.event_end_date ? theme.text : theme.textSecondary }}>
                        {formData.event_end_date ? formData.event_end_date.toLocaleString() : 'Set end time'}
                    </Text>
                </TouchableOpacity>
                {showEndDatePicker && (
                    <DateTimePicker
                        value={formData.event_end_date || formData.event_date}
                        mode="datetime"
                        display="default"
                        onChange={(_event: any, date?: Date) => {
                            setShowEndDatePicker(false);
                            if (date) updateForm('event_end_date', date);
                        }}
                    />
                )}
            </View>

            {/* Virtual Toggle */}
            <View style={[styles.toggleRow, { backgroundColor: theme.card }]}>
                <View style={styles.toggleInfo}>
                    <Globe size={20} color={colors.primary} />
                    <Text style={[styles.toggleLabel, { color: theme.text }]}>Virtual/Online Event</Text>
                </View>
                <Switch
                    value={formData.is_virtual}
                    onValueChange={(v) => updateForm('is_virtual', v)}
                    trackColor={{ false: theme.border, true: colors.primary + '80' }}
                    thumbColor={formData.is_virtual ? colors.primary : '#f4f3f4'}
                />
            </View>

            {formData.is_virtual ? (
                <View style={styles.field}>
                    <Text style={[styles.label, { color: theme.text }]}>Virtual Event URL</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
                        value={formData.virtual_url}
                        onChangeText={(v) => updateForm('virtual_url', v)}
                        placeholder="https://zoom.us/j/..."
                        placeholderTextColor={theme.textSecondary}
                        keyboardType="url"
                    />
                </View>
            ) : (
                <>
                    <View style={styles.field}>
                        <Text style={[styles.label, { color: theme.text }]}>
                            <MapPin size={14} color={theme.textSecondary} /> Venue Name
                        </Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
                            value={formData.location_name}
                            onChangeText={(v) => updateForm('location_name', v)}
                            placeholder="e.g., The Grand Hall"
                            placeholderTextColor={theme.textSecondary}
                        />
                    </View>
                    <View style={styles.field}>
                        <Text style={[styles.label, { color: theme.text }]}>Address</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
                            value={formData.location_address}
                            onChangeText={(v) => updateForm('location_address', v)}
                            placeholder="123 Main St, City, Country"
                            placeholderTextColor={theme.textSecondary}
                        />
                    </View>
                </>
            )}

            {/* Max Attendees */}
            <View style={styles.field}>
                <Text style={[styles.label, { color: theme.text }]}>
                    <Users size={14} color={theme.textSecondary} /> Max Attendees
                </Text>
                <TextInput
                    style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
                    value={formData.max_attendees}
                    onChangeText={(v) => updateForm('max_attendees', v)}
                    placeholder="Leave empty for unlimited"
                    placeholderTextColor={theme.textSecondary}
                    keyboardType="number-pad"
                />
            </View>

            {/* Ticket Price */}
            <View style={styles.field}>
                <Text style={[styles.label, { color: theme.text }]}>Ticket Price Range</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
                    value={formData.ticket_price_range}
                    onChangeText={(v) => updateForm('ticket_price_range', v)}
                    placeholder="e.g., $20 - $50, Free"
                    placeholderTextColor={theme.textSecondary}
                />
            </View>
        </ScrollView>
    );

    const renderStep3 = () => (
        <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
            {/* Tags */}
            <View style={styles.field}>
                <Text style={[styles.label, { color: theme.text }]}>
                    <Tag size={14} color={theme.textSecondary} /> Tags
                </Text>
                <View style={styles.tagInputRow}>
                    <TextInput
                        style={[styles.tagInput, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
                        value={tagInput}
                        onChangeText={setTagInput}
                        placeholder="Add a tag"
                        placeholderTextColor={theme.textSecondary}
                        onSubmitEditing={addTag}
                    />
                    <TouchableOpacity style={styles.addTagButton} onPress={addTag}>
                        <Text style={styles.addTagText}>Add</Text>
                    </TouchableOpacity>
                </View>
                {formData.tags.length > 0 && (
                    <View style={styles.tagsContainer}>
                        {formData.tags.map((tag) => (
                            <TouchableOpacity key={tag} style={styles.tagChip} onPress={() => removeTag(tag)}>
                                <Text style={styles.tagChipText}>#{tag} ×</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>

            {/* Rewards Pool */}
            <Card style={StyleSheet.flatten([styles.rewardsCard, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }])}>
                <View style={styles.rewardsHeader}>
                    <Sparkles size={20} color="#10B981" />
                    <Text style={[styles.rewardsTitle, { color: theme.text }]}>Rewards Pool (Optional)</Text>
                </View>
                <View style={styles.rewardsRow}>
                    <View style={styles.rewardField}>
                        <Text style={[styles.rewardLabel, { color: theme.textSecondary }]}>Points</Text>
                        <TextInput
                            style={[styles.rewardInput, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
                            value={formData.total_rewards_pool}
                            onChangeText={(v) => updateForm('total_rewards_pool', v)}
                            placeholder="0"
                            placeholderTextColor={theme.textSecondary}
                            keyboardType="number-pad"
                        />
                    </View>
                    <View style={styles.rewardField}>
                        <Text style={[styles.rewardLabel, { color: theme.textSecondary }]}>Gems</Text>
                        <TextInput
                            style={[styles.rewardInput, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
                            value={formData.total_gems_pool}
                            onChangeText={(v) => updateForm('total_gems_pool', v)}
                            placeholder="0"
                            placeholderTextColor={theme.textSecondary}
                            keyboardType="number-pad"
                        />
                    </View>
                </View>
            </Card>

            {/* Visibility */}
            <View style={[styles.toggleRow, { backgroundColor: theme.card }]}>
                <View style={styles.toggleInfo}>
                    <Globe size={20} color={colors.primary} />
                    <View>
                        <Text style={[styles.toggleLabel, { color: theme.text }]}>Public Event</Text>
                        <Text style={[styles.toggleHint, { color: theme.textSecondary }]}>Anyone can discover</Text>
                    </View>
                </View>
                <Switch
                    value={formData.is_public}
                    onValueChange={(v) => updateForm('is_public', v)}
                    trackColor={{ false: theme.border, true: colors.primary + '80' }}
                    thumbColor={formData.is_public ? colors.primary : '#f4f3f4'}
                />
            </View>

            {/* Summary */}
            <Card style={StyleSheet.flatten([styles.summaryCard, { backgroundColor: colors.primary + '10' }])}>
                <Text style={[styles.summaryTitle, { color: theme.text }]}>Event Summary</Text>
                <View style={styles.summaryRow}>
                    <Text style={{ color: theme.textSecondary }}>Title:</Text>
                    <Text style={{ color: theme.text, fontWeight: '600' }}>{formData.title || 'Untitled'}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={{ color: theme.textSecondary }}>Category:</Text>
                    <Text style={{ color: theme.text, fontWeight: '600', textTransform: 'capitalize' }}>{formData.category}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={{ color: theme.textSecondary }}>Date:</Text>
                    <Text style={{ color: theme.text, fontWeight: '600' }}>{formData.event_date.toLocaleDateString()}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={{ color: theme.textSecondary }}>Location:</Text>
                    <Text style={{ color: theme.text, fontWeight: '600' }}>
                        {formData.is_virtual ? 'Virtual Event' : formData.location_name || 'Not set'}
                    </Text>
                </View>
            </Card>
        </ScrollView>
    );

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: theme.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <Stack.Screen
                options={{
                    title: 'Create Event',
                    headerStyle: { backgroundColor: theme.surface },
                    headerTintColor: theme.text,
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => safeBack(router)} style={styles.headerBack}>
                            <ArrowLeft size={24} color={theme.text} />
                        </TouchableOpacity>
                    ),
                }}
            />

            {/* Progress Steps */}
            <View style={[styles.stepsContainer, { backgroundColor: theme.surface }]}>
                {[1, 2, 3].map((s) => (
                    <TouchableOpacity
                        key={s}
                        style={[
                            styles.stepIndicator,
                            { backgroundColor: step >= s ? colors.primary : theme.border }
                        ]}
                        onPress={() => validateStep(step) && setStep(s)}
                    >
                        {step > s ? (
                            <Check size={16} color="#FFF" />
                        ) : (
                            <Text style={styles.stepNumber}>{s}</Text>
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            {/* Step Labels */}
            <View style={styles.stepLabels}>
                <Text style={[styles.stepLabel, step === 1 && styles.activeStepLabel]}>Basic Info</Text>
                <Text style={[styles.stepLabel, step === 2 && styles.activeStepLabel]}>Date & Location</Text>
                <Text style={[styles.stepLabel, step === 3 && styles.activeStepLabel]}>Settings</Text>
            </View>

            {/* Content */}
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}

            {/* Navigation */}
            <View style={[styles.footer, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
                {step > 1 ? (
                    <TouchableOpacity onPress={() => setStep(step - 1)} style={styles.backButton}>
                        <Text style={{ color: theme.textSecondary }}>Back</Text>
                    </TouchableOpacity>
                ) : (
                    <View />
                )}

                <View style={styles.footerActions}>
                    {step === 3 && (
                        <TouchableOpacity
                            onPress={() => handleSubmit(false)}
                            style={[styles.draftButton, { backgroundColor: theme.card }]}
                            disabled={loading}
                        >
                            <Text style={{ color: theme.text }}>Save Draft</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        onPress={() => step < 3 ? (validateStep(step) && setStep(step + 1)) : handleSubmit(true)}
                        style={styles.nextButton}
                        disabled={loading}
                    >
                        <Text style={styles.nextButtonText}>
                            {loading ? 'Saving...' : step < 3 ? 'Continue' : 'Publish Event'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    headerBack: { marginLeft: 8, padding: 8 },
    stepsContainer: { flexDirection: 'row', justifyContent: 'center', gap: 24, paddingVertical: 16 },
    stepIndicator: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
    stepNumber: { color: '#FFF', fontWeight: '700', fontSize: 16 },
    stepLabels: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 16, marginBottom: 16 },
    stepLabel: { fontSize: 12, color: '#999' },
    activeStepLabel: { color: colors.primary, fontWeight: '600' },
    stepContent: { flex: 1, paddingHorizontal: 20 },
    field: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
    input: { paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12, borderWidth: 1, fontSize: 16 },
    textArea: { paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12, borderWidth: 1, fontSize: 16, minHeight: 100, textAlignVertical: 'top' },
    categoryGrid: { flexDirection: 'row', gap: 12, paddingVertical: 4 },
    categoryItem: { width: 80, padding: 12, borderRadius: 12, borderWidth: 2, alignItems: 'center' },
    categoryEmoji: { fontSize: 24, marginBottom: 4 },
    categoryLabel: { fontSize: 11, fontWeight: '500' },
    dateButton: { paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12, borderWidth: 1 },
    toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 12, marginBottom: 20 },
    toggleInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    toggleLabel: { fontSize: 16, fontWeight: '500' },
    toggleHint: { fontSize: 12 },
    tagInputRow: { flexDirection: 'row', gap: 12 },
    tagInput: { flex: 1, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, borderWidth: 1 },
    addTagButton: { backgroundColor: colors.primary, paddingHorizontal: 20, borderRadius: 12, justifyContent: 'center' },
    addTagText: { color: '#FFF', fontWeight: '600' },
    tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
    tagChip: { backgroundColor: colors.primary + '20', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
    tagChipText: { color: colors.primary, fontSize: 13, fontWeight: '500' },
    rewardsCard: { padding: 16, borderRadius: 16, marginBottom: 20 },
    rewardsHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
    rewardsTitle: { fontSize: 16, fontWeight: '700' },
    rewardsRow: { flexDirection: 'row', gap: 16 },
    rewardField: { flex: 1 },
    rewardLabel: { fontSize: 12, marginBottom: 8 },
    rewardInput: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10, borderWidth: 1 },
    summaryCard: { padding: 20, borderRadius: 16, marginBottom: 20 },
    summaryTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderTopWidth: 1 },
    backButton: { padding: 12 },
    footerActions: { flexDirection: 'row', gap: 12 },
    draftButton: { paddingHorizontal: 20, paddingVertical: 14, borderRadius: 12 },
    nextButton: { backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12 },
    nextButtonText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});

/**
 * Post Entry (Simplified)
 * 
 * Lightweight post submission view for rank 0-1 users.
 * Simple flow: upload proof → describe → submit.
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Image,
    Dimensions,
    Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    Camera,
    Upload,
    X,
    ChevronLeft,
    Sparkles,
    Instagram,
    Image as ImageIcon,
    Send
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useThemeColors } from '@/hooks/useThemeColors';
import colors from '@/constants/colors';

const { width } = Dimensions.get('window');

const POST_TYPES = [
    { id: 'social_proof', label: 'Social Proof', description: 'Screenshot of your social activity', icon: Instagram },
    { id: 'photo', label: 'Photo', description: 'Original content you created', icon: ImageIcon },
    { id: 'check_in', label: 'Check-in', description: 'Photo from a location visit', icon: Camera },
];

export default function PostEntryScreen() {
    const router = useRouter();
    const theme = useThemeColors();
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [caption, setCaption] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setImageUri(result.assets[0].uri);
        }
    };

    const takePhoto = async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
            Alert.alert('Permission needed', 'Camera access is required to take photos');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setImageUri(result.assets[0].uri);
        }
    };

    const handleSubmit = async () => {
        if (!imageUri || !selectedType) {
            Alert.alert('Missing info', 'Please select a type and add an image');
            return;
        }

        setIsSubmitting(true);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // In production, upload to API
        setTimeout(() => {
            setIsSubmitting(false);
            Alert.alert(
                'Posted!',
                'Your content has been submitted. You\'ll earn points once it\'s verified.',
                [{ text: 'OK', onPress: () => router.back() }]
            );
        }, 1500);
    };

    const clearImage = () => {
        Haptics.selectionAsync();
        setImageUri(null);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <ChevronLeft size={24} color={theme.text} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Post Content</Text>
                    <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
                        Share proof of your activity
                    </Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Reward Banner */}
                <LinearGradient
                    colors={['rgba(139, 92, 246, 0.1)', 'rgba(236, 72, 153, 0.1)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.rewardBanner, { borderColor: 'rgba(139, 92, 246, 0.2)' }]}
                >
                    <Sparkles size={18} color="#8B5CF6" />
                    <Text style={styles.rewardText}>Earn +25-100 points per verified post</Text>
                </LinearGradient>

                {/* Post Type Selection */}
                <Text style={[styles.sectionTitle, { color: theme.text }]}>What are you posting?</Text>
                <View style={styles.typeGrid}>
                    {POST_TYPES.map((type) => {
                        const Icon = type.icon;
                        const isSelected = selectedType === type.id;

                        return (
                            <TouchableOpacity
                                key={type.id}
                                style={[
                                    styles.typeCard,
                                    { backgroundColor: theme.surface, borderColor: isSelected ? colors.primary : theme.border },
                                    isSelected && { borderWidth: 2 }
                                ]}
                                onPress={() => {
                                    Haptics.selectionAsync();
                                    setSelectedType(type.id);
                                }}
                            >
                                <Icon size={24} color={isSelected ? colors.primary : theme.textSecondary} />
                                <Text style={[styles.typeLabel, { color: isSelected ? colors.primary : theme.text }]}>
                                    {type.label}
                                </Text>
                                <Text style={[styles.typeDescription, { color: theme.textSecondary }]} numberOfLines={2}>
                                    {type.description}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Image Upload */}
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Add Image</Text>
                {imageUri ? (
                    <View style={styles.imagePreviewContainer}>
                        <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                        <TouchableOpacity
                            style={styles.removeImageButton}
                            onPress={clearImage}
                        >
                            <X size={20} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.uploadOptions}>
                        <TouchableOpacity
                            style={[styles.uploadButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
                            onPress={takePhoto}
                        >
                            <Camera size={28} color={colors.primary} />
                            <Text style={[styles.uploadLabel, { color: theme.text }]}>Take Photo</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.uploadButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
                            onPress={pickImage}
                        >
                            <Upload size={28} color={colors.primary} />
                            <Text style={[styles.uploadLabel, { color: theme.text }]}>Upload</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Caption */}
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Caption (optional)</Text>
                <TextInput
                    style={[styles.captionInput, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
                    placeholder="Add a description..."
                    placeholderTextColor={theme.textSecondary}
                    value={caption}
                    onChangeText={setCaption}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                />

                {/* Submit Button */}
                <TouchableOpacity
                    style={[
                        styles.submitButton,
                        (!imageUri || !selectedType) && styles.submitButtonDisabled
                    ]}
                    onPress={handleSubmit}
                    disabled={!imageUri || !selectedType || isSubmitting}
                >
                    <LinearGradient
                        colors={imageUri && selectedType ? ['#F97316', '#EC4899'] : ['#6B7280', '#6B7280']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.submitButtonGradient}
                    >
                        <Send size={18} color="#FFF" />
                        <Text style={styles.submitButtonText}>
                            {isSubmitting ? 'Posting...' : 'Post & Earn'}
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>
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
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    headerSubtitle: {
        fontSize: 12,
        marginTop: 2,
    },
    content: {
        padding: 20,
        paddingBottom: 100,
    },
    rewardBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
        gap: 10,
        marginBottom: 24,
    },
    rewardText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
        color: '#8B5CF6',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
    },
    typeGrid: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 24,
    },
    typeCard: {
        flex: 1,
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
        alignItems: 'center',
        gap: 8,
    },
    typeLabel: {
        fontSize: 13,
        fontWeight: '600',
        textAlign: 'center',
    },
    typeDescription: {
        fontSize: 10,
        textAlign: 'center',
        lineHeight: 14,
    },
    uploadOptions: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    uploadButton: {
        flex: 1,
        paddingVertical: 32,
        borderRadius: 16,
        borderWidth: 1,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    uploadLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    imagePreviewContainer: {
        position: 'relative',
        marginBottom: 24,
    },
    imagePreview: {
        width: '100%',
        height: 200,
        borderRadius: 16,
        backgroundColor: '#1A1A1A',
    },
    removeImageButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(0,0,0,0.6)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    captionInput: {
        borderRadius: 14,
        borderWidth: 1,
        padding: 14,
        fontSize: 15,
        minHeight: 100,
        marginBottom: 24,
    },
    submitButton: {
        borderRadius: 14,
        overflow: 'hidden',
    },
    submitButtonDisabled: {
        opacity: 0.5,
    },
    submitButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 8,
    },
    submitButtonText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FFF',
    },
});

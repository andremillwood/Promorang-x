import { useState } from 'react';
import { StyleSheet, ScrollView, TextInput, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { Colors as DesignColors, Typography } from '@/constants/DesignTokens';
import { useColorScheme } from '@/components/useColorScheme';
import { useAuth } from '@/context/AuthContext';
import { useCreateProposal } from '@/hooks/useProposals';
import { LinearGradient } from 'expo-linear-gradient';

export default function CreateProposalScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();
    const { user } = useAuth();
    const createProposal = useCreateProposal();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        budget: '',
        location: '',
    });

    const handleSubmit = async (status: 'draft' | 'sent') => {
        if (!user) return;
        if (status === 'sent' && (!formData.title || !formData.description)) {
            Alert.alert("Missing Info", "Please provide a title and description for your proposal.");
            return;
        }

        try {
            await createProposal.mutateAsync({
                title: formData.title || "Untitled Draft",
                description: formData.description,
                budget: parseFloat(formData.budget) || null,
                target_moment_id: null, // Can link to an existing moment later
                brand_id: null, // For now, open proposal. Later, select specific brand.
                status: status,
                metadata: { location: formData.location }
            });

            Alert.alert(
                status === 'sent' ? "Success!" : "Draft Saved",
                status === 'sent' ? "Your proposal has been submitted for review." : "You can find your draft in your workspace.",
                [{ text: "OK", onPress: () => router.back() }]
            );
        } catch (error: any) {
            // Error is handled by hook
        }
    };

    const inputBg = isDark ? DesignColors.gray[900] : DesignColors.white;
    const txtColor = isDark ? 'white' : 'black';

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: isDark ? DesignColors.black : DesignColors.gray[50] }]}
            contentContainerStyle={styles.contentContainer}
        >
            <View style={styles.header}>
                <View style={styles.headerIcon}>
                    <Ionicons name="sparkles" size={24} color={DesignColors.primary} />
                </View>
                <Text style={styles.title}>New Proposal</Text>
                <Text style={styles.subtitle}>Pitch your moment idea to brands</Text>
            </View>

            <View style={styles.form}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Title</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: inputBg, color: txtColor }]}
                        placeholder="e.g. Sunset Yoga & Matcha"
                        placeholderTextColor={DesignColors.gray[500]}
                        value={formData.title}
                        onChangeText={(text) => setFormData({ ...formData, title: text })}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Est. Budget</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: inputBg, color: txtColor }]}
                        placeholder="e.g. 5000"
                        placeholderTextColor={DesignColors.gray[500]}
                        keyboardType="numeric"
                        value={formData.budget}
                        onChangeText={(text) => setFormData({ ...formData, budget: text })}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Location</Text>
                    <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: isDark ? 'transparent' : 'rgba(0,0,0,0.05)' }]}>
                        <Ionicons name="location-outline" size={18} color={DesignColors.gray[500]} style={styles.inputIcon} />
                        <TextInput
                            style={[styles.inputNoBorder, { color: txtColor }]}
                            placeholder="e.g. Central Park"
                            placeholderTextColor={DesignColors.gray[500]}
                            value={formData.location}
                            onChangeText={(text) => setFormData({ ...formData, location: text })}
                        />
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Description</Text>
                    <TextInput
                        style={[styles.input, styles.textArea, { backgroundColor: inputBg, color: txtColor }]}
                        placeholder="What's the vibe? Why should brands fund this?"
                        placeholderTextColor={DesignColors.gray[500]}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                        value={formData.description}
                        onChangeText={(text) => setFormData({ ...formData, description: text })}
                    />
                </View>
            </View>

            <View style={styles.actions}>
                <Pressable
                    disabled={createProposal.isPending}
                    onPress={() => handleSubmit('sent')}
                >
                    <LinearGradient
                        colors={[DesignColors.primary, DesignColors.accent]}
                        style={styles.primaryButton}
                    >
                        <Text style={styles.primaryButtonText}>
                            {createProposal.isPending ? "Submitting..." : "Submit Proposal"}
                        </Text>
                        <Ionicons name="arrow-forward" size={18} color="white" />
                    </LinearGradient>
                </Pressable>

                <Pressable
                    style={styles.secondaryButton}
                    onPress={() => handleSubmit('draft')}
                    disabled={createProposal.isPending}
                >
                    <Text style={[styles.secondaryButtonText, { color: txtColor }]}>Save as Draft</Text>
                </Pressable>
            </View>

            <View style={{ height: 100 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
        backgroundColor: 'transparent',
    },
    headerIcon: {
        width: 60,
        height: 60,
        borderRadius: 20,
        backgroundColor: DesignColors.primary + '10',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: Typography.sizes["3xl"],
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: Typography.sizes.base,
        color: DesignColors.gray[500],
        marginTop: 4,
    },
    form: {
        backgroundColor: 'transparent',
        gap: 20,
    },
    inputGroup: {
        backgroundColor: 'transparent',
    },
    label: {
        fontSize: 12,
        fontWeight: 'bold',
        color: DesignColors.gray[500],
        letterSpacing: 1,
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    input: {
        padding: 16,
        borderRadius: 16,
        fontSize: 16,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        paddingHorizontal: 16,
    },
    inputIcon: {
        marginRight: 12,
    },
    inputNoBorder: {
        flex: 1,
        paddingVertical: 16,
        fontSize: 16,
    },
    textArea: {
        height: 120,
        paddingTop: 16,
    },
    actions: {
        marginTop: 40,
        backgroundColor: 'transparent',
        gap: 12,
    },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18,
        borderRadius: 100,
        gap: 8,
    },
    primaryButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    secondaryButton: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18,
    },
    secondaryButtonText: {
        fontWeight: '600',
        fontSize: 14,
    },
});

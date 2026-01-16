import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { ArrowLeft, Building2, Upload, CheckCircle2 } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AdvertiserOnboardingScreen() {
    const router = useRouter();
    const theme = useThemeColors();
    const insets = useSafeAreaInsets();
    const { becomeAdvertiser, isLoading } = useAuthStore();

    const [brandName, setBrandName] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const [step, setStep] = useState(1);
    const [error, setError] = useState('');

    const handleContinue = async () => {
        if (!brandName.trim()) {
            setError('Please enter a brand name');
            return;
        }

        try {
            setError('');
            await becomeAdvertiser(brandName, logoUrl);
            // Show success via state change or navigation
            router.replace('/advertiser/dashboard');
        } catch (err: any) {
            setError(err.message || 'Failed to create advertiser profile');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color={theme.text} />
                </TouchableOpacity>
                <View style={styles.progressContainer}>
                    <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
                        <View style={[styles.progressFill, { width: '50%', backgroundColor: colors.primary }]} />
                    </View>
                    <Text style={[styles.stepText, { color: theme.textSecondary }]}>Step 1 of 2</Text>
                </View>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.iconContainer}>
                        <View style={styles.iconCircle}>
                            <Building2 size={32} color={colors.primary} />
                        </View>
                    </View>

                    <Text style={[styles.title, { color: theme.text }]}>Setup your Brand Profile</Text>
                    <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                        Promorang helps brands connect with thousands of creators. Let's get your profile ready.
                    </Text>

                    <View style={styles.form}>
                        <Input
                            label="Brand Name"
                            value={brandName}
                            onChangeText={(text) => {
                                setBrandName(text);
                                setError('');
                            }}
                            placeholder="e.g. Acme Corp"
                            autoFocus
                            error={error}
                        />

                        <Input
                            label="Logo URL (Optional)"
                            value={logoUrl}
                            onChangeText={setLogoUrl}
                            placeholder="https://..."
                            autoCapitalize="none"
                        />

                        <View style={styles.infoBox}>
                            <CheckCircle2 size={16} color={colors.success} style={{ marginTop: 2 }} />
                            <Text style={styles.infoText}>
                                Access to advanced analytics, campaign tools, and our creator marketplace.
                            </Text>
                        </View>
                    </View>
                </ScrollView>

                <View style={[styles.footer, { paddingBottom: insets.bottom + 16, backgroundColor: theme.surface, borderTopColor: theme.border }]}>
                    <Button
                        title="Create Brand Profile"
                        onPress={handleContinue}
                        loading={isLoading}
                        variant="primary"
                        size="large"
                        fullWidth
                    />
                </View>
            </KeyboardAvoidingView>
        </View>
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
        paddingBottom: 16,
    },
    backButton: {
        padding: 8,
        marginRight: 16,
    },
    progressContainer: {
        flex: 1,
        marginRight: 40, // Balance the back button
    },
    progressBar: {
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 4,
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },
    stepText: {
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'right',
    },
    scrollContent: {
        padding: 24,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primary + '15', // 15 is roughly 8% opacity hex
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'center',
        marginBottom: 32,
    },
    form: {
        gap: 16,
    },
    infoBox: {
        flexDirection: 'row',
        gap: 8,
        backgroundColor: colors.success + '10',
        padding: 12,
        borderRadius: 12,
        marginTop: 8,
    },
    infoText: {
        fontSize: 13,
        color: colors.success,
        flex: 1,
        lineHeight: 18,
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
    }
});

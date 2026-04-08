import React, { useState } from 'react';
import { StyleSheet, ScrollView, TextInput, Alert, Platform, ActivityIndicator, Pressable, KeyboardAvoidingView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { Colors as DesignColors, Typography, Spacing, BorderRadius } from '@/constants/DesignTokens';
import { useColorScheme } from '@/components/useColorScheme';
import { useAuth } from '@/context/AuthContext';

// Helper to get API URL (duplicated for now, should be a util)
const getApiUrl = () => {
    const localhost = Platform.OS === 'ios' ? 'http://localhost:3000' : 'http://10.0.2.2:3000';
    return process.env.EXPO_PUBLIC_API_URL || localhost;
};

export default function HostApplicationScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();
    const { session } = useAuth();

    const [motivation, setMotivation] = useState('');
    const [momentIdea, setMomentIdea] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!motivation.trim() || !momentIdea.trim()) {
            Alert.alert('Missing Fields', 'Please fill out all fields to submit your application.');
            return;
        }

        setSubmitting(true);
        try {
            const API_URL = getApiUrl();
            const response = await fetch(`${API_URL}/api/host-applications`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({ motivation, moment_idea: momentIdea })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Submission failed');

            Alert.alert(
                'Application Received!',
                'We will review your application within 24 hours. You will be notified once approved.',
                [{ text: 'OK', onPress: () => router.back() }]
            );
        } catch (error: any) {
            console.error('Application Error:', error);
            Alert.alert('Error', error.message || 'Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const textColor = isDark ? 'white' : DesignColors.gray[900];
    const bgColor = isDark ? DesignColors.black : DesignColors.gray[50];
    const cardColor = isDark ? DesignColors.gray[900] : 'white';

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <Stack.Screen options={{ title: 'Unlock Hosting', headerBackTitle: 'Dashboard' }} />
            <ScrollView style={[styles.container, { backgroundColor: bgColor }]} contentContainerStyle={{ padding: 20, gap: 24 }}>

                {/* Intro Card */}
                <View style={[styles.card, { backgroundColor: cardColor, padding: 24, alignItems: 'center', gap: 12 }]}>
                    <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#8B5CF620', alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name="sparkles" size={32} color="#8B5CF6" />
                    </View>
                    <Text style={{ color: textColor, fontSize: 24, fontWeight: 'bold', textAlign: 'center' }}>Become a Host</Text>
                    <Text style={{ color: DesignColors.gray[500], textAlign: 'center', lineHeight: 20 }}>
                        Hosts are the heartbeat of Promorang. Create Moments, earn Gems, and build your local influence.
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 4, marginTop: 8 }}>
                        <View style={styles.badge}><Text style={styles.badgeText}>Priority Access</Text></View>
                        <View style={styles.badge}><Text style={styles.badgeText}>Earn Money</Text></View>
                    </View>
                </View>

                {/* Application Form */}
                <View>
                    <Text style={[styles.sectionTitle, { color: textColor }]}>Your Application</Text>
                    <View style={[styles.card, { backgroundColor: cardColor, padding: 20, gap: 20 }]}>

                        <View>
                            <Text style={[styles.label, { color: textColor }]}>Why do you want to host?</Text>
                            <TextInput
                                style={[styles.input, { color: textColor, borderColor: DesignColors.gray[300], height: 80, textAlignVertical: 'top' }]}
                                placeholder="I want to bring people together for..."
                                placeholderTextColor={DesignColors.gray[400]}
                                multiline
                                value={motivation}
                                onChangeText={setMotivation}
                            />
                        </View>

                        <View>
                            <Text style={[styles.label, { color: textColor }]}>Pitch your first Moment idea</Text>
                            <Text style={{ color: DesignColors.gray[500], fontSize: 12, marginBottom: 8 }}>Describe an event you'd like to organize.</Text>
                            <TextInput
                                style={[styles.input, { color: textColor, borderColor: DesignColors.gray[300], height: 80, textAlignVertical: 'top' }]}
                                placeholder="A sunset yoga session at..."
                                placeholderTextColor={DesignColors.gray[400]}
                                multiline
                                value={momentIdea}
                                onChangeText={setMomentIdea}
                            />
                        </View>

                        <Pressable
                            style={[
                                styles.primaryButton,
                                { opacity: (submitting || !motivation || !momentIdea) ? 0.5 : 1 }
                            ]}
                            disabled={submitting || !motivation || !momentIdea}
                            onPress={handleSubmit}
                        >
                            {submitting ? <ActivityIndicator color="white" /> : <Text style={styles.primaryButtonText}>Submit Application</Text>}
                        </Pressable>
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    card: {
        borderRadius: BorderRadius.xl,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: Typography.sizes.lg,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    label: {
        fontSize: Typography.sizes.sm,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderRadius: BorderRadius.lg,
        padding: 12,
        fontSize: 16,
    },
    primaryButton: {
        backgroundColor: '#8B5CF6', // Host Purple
        padding: 16,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        marginTop: 8,
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    primaryButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    badge: {
        backgroundColor: DesignColors.primary + '15',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 100,
    },
    badgeText: {
        color: DesignColors.primary,
        fontSize: 10,
        fontWeight: 'bold',
    }
});

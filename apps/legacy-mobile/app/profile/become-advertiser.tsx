import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import colors from '@/constants/colors';

export default function BecomeAdvertiserScreen() {
    const router = useRouter();
    const { becomeAdvertiser } = useAuthStore();
    const [brandName, setBrandName] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!brandName.trim()) {
            Alert.alert('Error', 'Brand Name is required');
            return;
        }

        setIsSubmitting(true);
        try {
            await becomeAdvertiser(brandName, logoUrl);
            Alert.alert('Success', 'You are now an Advertiser!', [
                { text: 'Go to Dashboard', onPress: () => router.push('/advertiser/dashboard') } // Adjust path if needed
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to upgrade');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Stack.Screen options={{ title: 'Become a Brand' }} />

            <View style={styles.header}>
                <Text style={styles.title}>Promote with Promorang</Text>
                <Text style={styles.subtitle}>Create drops, track performance, and grow your brand.</Text>
            </View>

            <View style={styles.form}>
                <Text style={styles.label}>Brand Name</Text>
                <Input
                    value={brandName}
                    onChangeText={setBrandName}
                    placeholder="Enter your brand name"
                />

                <Text style={styles.label}>Logo URL (Optional)</Text>
                <Input
                    value={logoUrl}
                    onChangeText={setLogoUrl}
                    placeholder="https://..."
                />

                <Button
                    title="Get Started"
                    onPress={handleSubmit}
                    isLoading={isSubmitting}
                    style={styles.button}
                />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.white },
    content: { padding: 24 },
    header: { marginBottom: 32 },
    title: { fontSize: 24, fontWeight: 'bold', color: colors.black, marginBottom: 8 },
    subtitle: { fontSize: 16, color: colors.darkGray },
    form: { gap: 16 },
    label: { fontSize: 14, fontWeight: '600', color: colors.black, marginBottom: 4 },
    button: { marginTop: 16 }
});

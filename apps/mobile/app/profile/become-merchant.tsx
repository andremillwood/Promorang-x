import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import colors from '@/constants/colors';
import { Store } from 'lucide-react-native';

export default function BecomeMerchantScreen() {
    const router = useRouter();
    const { user, becomeMerchant } = useAuthStore();
    const [storeName, setStoreName] = useState('');
    const [description, setDescription] = useState('');
    const [contactEmail, setContactEmail] = useState(user?.email || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!storeName.trim()) {
            Alert.alert('Error', 'Store Name is required');
            return;
        }

        setIsSubmitting(true);
        try {
            await becomeMerchant(storeName, description, contactEmail);
            Alert.alert('Success', 'Your merchant store has been created!', [
                { text: 'Go to Dashboard', onPress: () => router.push('/merchant/dashboard') }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to create store');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Stack.Screen options={{ title: 'Become a Merchant' }} />

            <View style={styles.header}>
                <Store size={48} color={colors.primary} style={styles.icon} />
                <Text style={styles.title}>Start Selling on Promorang</Text>
                <Text style={styles.subtitle}>Open your dedicated shop, list products, and reach new customers.</Text>
            </View>

            <View style={styles.form}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Store Name *</Text>
                    <Input
                        value={storeName}
                        onChangeText={setStoreName}
                        placeholder="My Awesome Store"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Description</Text>
                    <Input
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Tell customers about your store..."
                        multiline
                        numberOfLines={4}
                        style={styles.textArea}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Contact Email *</Text>
                    <Input
                        value={contactEmail}
                        onChangeText={setContactEmail}
                        placeholder="store@example.com"
                        keyboardType="email-address"
                    />
                </View>

                <Button
                    title="Launch Store"
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
    header: { marginBottom: 32, alignItems: 'center' },
    icon: { marginBottom: 16 },
    title: { fontSize: 24, fontWeight: 'bold', color: colors.black, textAlign: 'center', marginBottom: 8 },
    subtitle: { fontSize: 16, color: colors.darkGray, textAlign: 'center' },
    form: { gap: 20 },
    inputGroup: { gap: 8 },
    label: { fontSize: 14, fontWeight: '600', color: colors.black },
    textArea: { height: 100, textAlignVertical: 'top' },
    button: { marginTop: 10 }
});

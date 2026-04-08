import React, { useState } from 'react';
import { StyleSheet, ScrollView, TextInput, Alert, Platform, ActivityIndicator, Pressable, KeyboardAvoidingView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { Colors as DesignColors, Typography, Spacing, BorderRadius } from '@/constants/DesignTokens';
import { useColorScheme } from '@/components/useColorScheme';
import { usePayouts } from '@/hooks/usePayouts';
import { useUserBalance } from '@/hooks/useEconomy';

export default function PayoutsScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();
    const { methods, history, loading: payoutsLoading, addPayoutMethod, requestWithdrawal } = usePayouts();
    const { balance } = useUserBalance();

    // Withdrawal State
    const [amount, setAmount] = useState('');
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    // New Method State
    const [isAddingMethod, setIsAddingMethod] = useState(false);
    const [newMethodType, setNewMethodType] = useState('bank_transfer');
    const [newMethodDetails, setNewMethodDetails] = useState('');

    const gems = balance?.gems || 0;
    const maxWithdraw = (gems * 0.01).toFixed(2);

    const handleWithdraw = async () => {
        if (!amount || isNaN(parseFloat(amount))) {
            Alert.alert('Invalid Amount', 'Please enter a valid amount.');
            return;
        }
        if (parseFloat(amount) < 250) {
            Alert.alert('Minimum Threshold', 'Minimum withdrawal is $250.');
            return;
        }
        if (parseFloat(amount) > parseFloat(maxWithdraw)) {
            Alert.alert('Insufficient Balance', 'You cannot withdraw more than your available balance.');
            return;
        }
        if (!selectedMethod && methods.length > 0) {
            // Default to first if not selected
            // handled below
        }
        const methodId = selectedMethod || methods[0]?.id;
        if (!methodId) {
            Alert.alert('No Method', 'Please add a payout method first.');
            return;
        }

        setProcessing(true);
        const result = await requestWithdrawal(parseFloat(amount), methodId);
        setProcessing(false);

        if (result?.success) {
            Alert.alert('Success', 'Withdrawal request submitted for approval.');
            setAmount('');
            router.back();
        } else {
            Alert.alert('Error', result.error || 'Failed to request withdrawal.');
        }
    };

    const handleAddMethod = async () => {
        if (!newMethodDetails) {
            Alert.alert('Missing Info', 'Please provide account details.');
            return;
        }

        // Simple detail parsing for MVP
        const details = { account: newMethodDetails };

        await addPayoutMethod(newMethodType, details);
        setIsAddingMethod(false);
        setNewMethodDetails('');
    };

    const textColor = isDark ? 'white' : DesignColors.gray[900];
    const bgColor = isDark ? DesignColors.black : DesignColors.gray[50];
    const cardColor = isDark ? DesignColors.gray[900] : 'white';

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <Stack.Screen options={{ title: 'Manage Payouts', headerBackTitle: 'Wallet' }} />
            <ScrollView style={[styles.container, { backgroundColor: bgColor }]} contentContainerStyle={{ padding: 20, gap: 24 }}>

                {/* Balance Card */}
                <View style={[styles.card, { backgroundColor: cardColor, alignItems: 'center', padding: 24 }]}>
                    <Text style={{ color: DesignColors.gray[500], fontSize: 14 }}>Available for Payout</Text>
                    <Text style={{ color: textColor, fontSize: 36, fontWeight: 'bold', marginVertical: 8 }}>${maxWithdraw}</Text>
                    <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                        <Ionicons name="lock-closed" size={12} color={DesignColors.gray[400]} />
                        <Text style={{ color: DesignColors.gray[500], fontSize: 12 }}>Min. withdrawal $250.00</Text>
                    </View>
                </View>

                {/* Withdrawal Form */}
                <View>
                    <Text style={[styles.sectionTitle, { color: textColor }]}>Request Withdrawal</Text>
                    <View style={[styles.card, { backgroundColor: cardColor, padding: 16, gap: 16 }]}>
                        <View>
                            <Text style={[styles.label, { color: textColor }]}>Amount ($)</Text>
                            <TextInput
                                style={[styles.input, { color: textColor, borderColor: DesignColors.gray[300] }]}
                                placeholder="0.00"
                                placeholderTextColor={DesignColors.gray[400]}
                                keyboardType="decimal-pad"
                                value={amount}
                                onChangeText={setAmount}
                            />
                        </View>

                        <View>
                            <Text style={[styles.label, { color: textColor }]}>Payout Method</Text>
                            {methods.length > 0 ? (
                                <View style={{ gap: 8 }}>
                                    {methods.map(m => (
                                        <Pressable
                                            key={m.id}
                                            onPress={() => setSelectedMethod(m.id)}
                                            style={[
                                                styles.methodOption,
                                                { borderColor: (selectedMethod === m.id || (!selectedMethod && m.is_default)) ? DesignColors.primary : DesignColors.gray[200] }
                                            ]}
                                        >
                                            <Ionicons name={m.method_type === 'bank_transfer' ? 'business' : 'card'} size={20} color={textColor} />
                                            <Text style={{ color: textColor, flex: 1, marginLeft: 8 }}>
                                                {m.method_type.toUpperCase()} •••• {JSON.stringify(m.details).slice(-4).replace(/[^0-9]/g, 'X')}
                                            </Text>
                                            {(selectedMethod === m.id || (!selectedMethod && m.is_default)) && (
                                                <Ionicons name="checkmark-circle" size={20} color={DesignColors.primary} />
                                            )}
                                        </Pressable>
                                    ))}
                                </View>
                            ) : (
                                <Text style={{ color: DesignColors.error, fontSize: 13 }}>No payout methods linked.</Text>
                            )}
                        </View>

                        <Pressable
                            style={[
                                styles.primaryButton,
                                { opacity: (parseFloat(amount || '0') < 250 || processing) ? 0.5 : 1 }
                            ]}
                            disabled={parseFloat(amount || '0') < 250 || processing}
                            onPress={handleWithdraw}
                        >
                            {processing ? <ActivityIndicator color="white" /> : <Text style={styles.primaryButtonText}>Withdraw Funds</Text>}
                        </Pressable>
                    </View>
                </View>

                {/* Add Method */}
                <View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <Text style={[styles.sectionTitle, { color: textColor, marginBottom: 0 }]}>Payout Methods</Text>
                        <Pressable onPress={() => setIsAddingMethod(!isAddingMethod)}>
                            <Text style={{ color: DesignColors.primary, fontWeight: '600' }}>{isAddingMethod ? 'Cancel' : 'Add New'}</Text>
                        </Pressable>
                    </View>

                    {isAddingMethod && (
                        <View style={[styles.card, { backgroundColor: cardColor, padding: 16, gap: 16, marginBottom: 16 }]}>
                            <Text style={{ color: textColor, fontWeight: 'bold' }}>Link New Account</Text>
                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                {['bank_transfer', 'paypal', 'venmo'].map(type => (
                                    <Pressable
                                        key={type}
                                        onPress={() => setNewMethodType(type)}
                                        style={{
                                            padding: 8,
                                            borderWidth: 1,
                                            borderRadius: 8,
                                            borderColor: newMethodType === type ? DesignColors.primary : DesignColors.gray[200],
                                            backgroundColor: newMethodType === type ? DesignColors.primary + '10' : 'transparent'
                                        }}
                                    >
                                        <Text style={{ color: newMethodType === type ? DesignColors.primary : DesignColors.gray[500], fontSize: 12 }}>
                                            {type === 'bank_transfer' ? 'Bank' : type.charAt(0).toUpperCase() + type.slice(1)}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                            <TextInput
                                style={[styles.input, { color: textColor, borderColor: DesignColors.gray[300] }]}
                                placeholder={newMethodType === 'bank_transfer' ? "Account Number / IBAN" : "Email / Username"}
                                placeholderTextColor={DesignColors.gray[400]}
                                value={newMethodDetails}
                                onChangeText={setNewMethodDetails}
                            />
                            <Pressable style={styles.secondaryButton} onPress={handleAddMethod}>
                                <Text style={{ color: DesignColors.primary, fontWeight: '600' }}>Save Method</Text>
                            </Pressable>
                        </View>
                    )}
                </View>

                {/* History */}
                <View>
                    <Text style={[styles.sectionTitle, { color: textColor }]}>History</Text>
                    {history.length === 0 ? (
                        <Text style={{ color: DesignColors.gray[500], fontStyle: 'italic' }}>No withdrawals yet.</Text>
                    ) : (
                        <View style={{ gap: 12 }}>
                            {history.map(tx => (
                                <View key={tx.id} style={[styles.card, { backgroundColor: cardColor, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                                    <View>
                                        <Text style={{ color: textColor, fontWeight: 'bold' }}>Withdrawal</Text>
                                        <Text style={{ color: DesignColors.gray[500], fontSize: 12 }}>{new Date(tx.created_at).toLocaleDateString()}</Text>
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Text style={{ color: textColor, fontWeight: 'bold' }}>${tx.amount.toFixed(2)}</Text>
                                        <Text style={{
                                            color: tx.status === 'pending' ? '#F59E0B' : tx.status === 'approved' ? DesignColors.success : DesignColors.error,
                                            fontSize: 12, fontWeight: '600'
                                        }}>
                                            {tx.status.toUpperCase()}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
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
        backgroundColor: DesignColors.black,
        padding: 16,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        marginTop: 8,
    },
    primaryButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: DesignColors.primary,
        padding: 12,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
    },
    methodOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
    },
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, Clipboard, TouchableOpacity, Alert } from 'react-native';
import { Instagram, Copy, CheckCircle, Info, RefreshCw } from 'lucide-react-native';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import colors from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';

const API_URL = 'https://promorang-api.vercel.app';

interface InstagramVerificationModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: (points: number) => void;
}

export const InstagramVerificationModal: React.FC<InstagramVerificationModalProps> = ({
    visible,
    onClose,
    onSuccess
}) => {
    const [step, setStep] = useState(1);
    const [username, setUsername] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleRegister = async () => {
        if (!username) {
            Alert.alert('Error', 'Please enter your Instagram username');
            return;
        }

        setLoading(true);
        try {
            const token = useAuthStore.getState().token;
            const response = await fetch(`${API_URL}/api/users/register-instagram`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ instagram_username: username }),
            });

            const data = await response.json();
            if (data.success) {
                setVerificationCode(data.verification_code);
                setStep(2);
            } else {
                throw new Error(data.error || 'Failed to register');
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        setLoading(true);
        try {
            const token = useAuthStore.getState().token;
            const response = await fetch(`${API_URL}/api/users/claim-instagram-points`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });

            const data = await response.json();
            if (data.success) {
                Alert.alert('Success', data.message);
                onSuccess(data.points_awarded);
                onClose();
                // Reset for next time
                setStep(1);
                setUsername('');
                setVerificationCode('');
            } else {
                throw new Error(data.error || 'Verification failed');
            }
        } catch (error: any) {
            Alert.alert('Verification Failed', 'Make sure the code is in your bio and try again in a few minutes.');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        Clipboard.setString(verificationCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Modal visible={visible} onClose={onClose} title="Instagram Verification" size="lg">
            <View style={styles.container}>
                {step === 1 ? (
                    <View style={styles.content}>
                        <View style={styles.iconContainer}>
                            <Instagram size={48} color={colors.primary} />
                        </View>
                        <Text style={styles.title}>Claim Reward Points</Text>
                        <Text style={styles.description}>
                            Enter your Instagram username to generate a verification code.
                        </Text>

                        <Input
                            label="Instagram Username"
                            placeholder="@username"
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                            style={styles.input}
                        />

                        <View style={styles.infoBox}>
                            <Info size={16} color={colors.darkGray} />
                            <Text style={styles.infoText}>
                                Points are awarded based on your follower count. Minimum 1,000 followers required.
                            </Text>
                        </View>

                        <Button
                            title="Generate Code"
                            onPress={handleRegister}
                            isLoading={loading}
                            variant="primary"
                            size="lg"
                        />
                    </View>
                ) : (
                    <View style={styles.content}>
                        <View style={styles.iconContainer}>
                            <CheckCircle size={48} color={colors.success} />
                        </View>
                        <Text style={styles.title}>Verification Code Generated</Text>
                        <Text style={styles.description}>
                            Copy the code below and paste it into your Instagram bio.
                        </Text>

                        <TouchableOpacity style={styles.codeContainer} onPress={copyToClipboard}>
                            <Text style={styles.codeText}>{verificationCode}</Text>
                            {copied ? <CheckCircle size={20} color={colors.success} /> : <Copy size={20} color={colors.primary} />}
                        </TouchableOpacity>

                        <View style={styles.instructionBox}>
                            <Text style={styles.instructionTitle}>Instructions:</Text>
                            <Text style={styles.instructionItem}>1. Copy the code above.</Text>
                            <Text style={styles.instructionItem}>2. Go to your Instagram Profile.</Text>
                            <Text style={styles.instructionItem}>3. Edit Bio and paste the code.</Text>
                            <Text style={styles.instructionItem}>4. Return here and tap Verify.</Text>
                        </View>

                        <Button
                            title="I've added it, Verify Now"
                            onPress={handleVerify}
                            isLoading={loading}
                            variant="primary"
                            size="lg"
                            leftIcon={<RefreshCw size={20} color={colors.white} />}
                        />

                        <TouchableOpacity onPress={() => setStep(1)} style={styles.backButton}>
                            <Text style={styles.backText}>Change Username</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: 10,
    },
    content: {
        alignItems: 'center',
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: `${colors.primary}10`,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: colors.black,
        textAlign: 'center',
        marginBottom: 10,
    },
    description: {
        fontSize: 14,
        color: colors.darkGray,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    input: {
        width: '100%',
        marginBottom: 20,
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: colors.gray,
        padding: 12,
        borderRadius: 8,
        marginBottom: 24,
        alignItems: 'flex-start',
    },
    infoText: {
        fontSize: 12,
        color: colors.darkGray,
        marginLeft: 8,
        flex: 1,
    },
    codeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.gray,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: colors.primary,
        padding: 16,
        borderRadius: 12,
        width: '100%',
        marginBottom: 24,
    },
    codeText: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.primary,
        letterSpacing: 2,
    },
    instructionBox: {
        width: '100%',
        backgroundColor: `${colors.success}05`,
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: `${colors.success}20`,
    },
    instructionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.black,
        marginBottom: 10,
    },
    instructionItem: {
        fontSize: 14,
        color: colors.darkGray,
        marginBottom: 6,
    },
    backButton: {
        marginTop: 16,
        padding: 8,
    },
    backText: {
        fontSize: 14,
        color: colors.darkGray,
        textDecorationLine: 'underline',
    },
});

import { StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { View, Text } from '@/components/Themed';
import { Colors as DesignColors, Typography, Spacing, BorderRadius } from '@/constants/DesignTokens';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';
import React from 'react';

export default function LoginScreen() {
    const { signInWithGoogle, isLoading } = useAuth();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Ionicons name="sparkles" size={48} color={DesignColors.primary} style={{ marginBottom: Spacing.md }} />
                    <Text style={styles.title}>Promorang</Text>
                    <Text style={styles.subtitle}>Where moments happen, together.</Text>
                </View>

                <View style={styles.actions}>
                    <Pressable
                        onPress={() => signInWithGoogle()}
                        style={({ pressed }) => [
                            styles.button,
                            { backgroundColor: isDark ? DesignColors.white : DesignColors.black },
                            pressed && { opacity: 0.9 }
                        ]}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color={isDark ? DesignColors.black : DesignColors.white} />
                        ) : (
                            <>
                                <Ionicons name="logo-google" size={20} color={isDark ? DesignColors.black : DesignColors.white} style={{ marginRight: 10 }} />
                                <Text style={[styles.buttonText, { color: isDark ? DesignColors.black : DesignColors.white }]}>
                                    Sign in with Google
                                </Text>
                            </>
                        )}
                    </Pressable>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: Spacing.container,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: Spacing["2xl"],
    },
    header: {
        alignItems: 'center',
    },
    title: {
        fontSize: Typography.sizes["4xl"],
        fontWeight: 'bold',
        fontFamily: 'SpaceMono', // or custom font if available
        marginBottom: Spacing.xs,
    },
    subtitle: {
        fontSize: Typography.sizes.lg,
        color: DesignColors.gray[500],
        textAlign: 'center',
        maxWidth: '80%',
    },
    actions: {
        width: '100%',
        gap: Spacing.md,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: BorderRadius.xl,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    buttonText: {
        fontSize: Typography.sizes.base,
        fontWeight: '600',
    },
});

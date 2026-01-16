import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '@/constants/colors';

export default function PromoShareDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ title: 'PromoShare Details' }} />
            <View style={styles.content}>
                <Text style={styles.title}>PromoShare Details</Text>
                <Text style={styles.subtitle}>ID: {id}</Text>
                <Text style={styles.description}>
                    This is a placeholder for the PromoShare detail screen.
                </Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    content: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.black,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: colors.darkGray,
        marginBottom: 20,
    },
    description: {
        fontSize: 14,
        color: colors.darkGray,
        textAlign: 'center',
    },
});

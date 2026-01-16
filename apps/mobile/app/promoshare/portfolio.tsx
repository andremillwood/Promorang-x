import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '@/constants/colors';

export default function PromoSharePortfolioScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ title: 'My PromoShare Portfolio' }} />
            <View style={styles.content}>
                <Text style={styles.title}>My Portfolio</Text>
                <Text style={styles.description}>
                    This is a placeholder for the PromoShare portfolio screen.
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
    description: {
        fontSize: 14,
        color: colors.darkGray,
        textAlign: 'center',
    },
});

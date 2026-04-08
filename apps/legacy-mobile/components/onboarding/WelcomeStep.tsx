import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { motion, AnimatePresence } from 'framer-motion'; // Assuming framer-motion-react-native or similar if available, otherwise just RN components. 
// Wait, Framer Motion doesn't work out of the box with RN nicely without extras. 
// I'll stick to standard RN + maybe Reanimated if I was sure it was configured. 
// But the current mobile app seems to use standard components in first-contact.tsx.

const { height, width } = Dimensions.get('window');

interface WelcomeStepProps {
    onContinue: () => void;
}

export default function WelcomeStep({ onContinue }: WelcomeStepProps) {
    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.headline}>Welcome to Promorang.</Text>
                <Text style={styles.subtext}>
                    This is a place for moments — real ones.{"\n\n"}
                    Some you join.{"\n"}
                    Some you create.{"\n"}
                    Some you remember.
                </Text>
            </View>

            <TouchableOpacity
                style={styles.button}
                onPress={onContinue}
                activeOpacity={0.8}
            >
                <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        padding: 32,
        backgroundColor: '#000',
    },
    content: {
        marginTop: height * 0.15,
    },
    headline: {
        fontSize: 48,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: -1,
        marginBottom: 24,
    },
    subtext: {
        fontSize: 20,
        color: '#A1A1AA',
        lineHeight: 28,
        fontWeight: '500',
    },
    button: {
        backgroundColor: '#F97316',
        paddingVertical: 20,
        borderRadius: 24,
        alignItems: 'center',
        shadowColor: '#F97316',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

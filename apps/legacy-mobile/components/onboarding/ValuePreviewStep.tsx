import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { OnboardingIntent } from './IntentOrientationStep';

import * as Haptics from 'expo-haptics';

const { height } = Dimensions.get('window');

interface ValuePreviewStepProps {
    intent: OnboardingIntent;
    onContinue: () => void;
}

export default function ValuePreviewStep({ intent, onContinue }: ValuePreviewStepProps) {
    const handleContinue = async () => {
        // Haptic feedback for "See what's possible"
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onContinue();
    };

    const getContent = () => {
        switch (intent) {
            case 'participant':
                return {
                    title: "Moments are happening near you.",
                    description: "This is how it works in real life: you find the energy, join in, and become part of the story.",
                    image: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=1000&auto=format&fit=crop",
                    badge: "See what's possible"
                };
            case 'creator':
                return {
                    title: "Your community, your energy.",
                    description: "Here's what you can do: gather your people, host unforgettable experiences, and see the impact immediately.",
                    image: "https://images.unsplash.com/photo-1529148482759-b35b25c5f217?q=80&w=1000&auto=format&fit=crop",
                    badge: "See what's possible"
                };
            case 'brand':
                return {
                    title: "Authentic connections at scale.",
                    description: "This is how it works: host moments that people actually remember, and reward real participation.",
                    image: "https://images.unsplash.com/photo-1534452285072-c4cfe559b2ad?q=80&w=1000&auto=format&fit=crop",
                    badge: "See what's possible"
                };
            case 'merchant':
                return {
                    title: "Tangible foot traffic.",
                    description: "Here's what you can do: turn digital energy into physical visits and loyal customers.",
                    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1000&auto=format&fit=crop",
                    badge: "See what's possible"
                };
            default:
                return {
                    title: "Welcome to the story.",
                    description: "Someone invited you to experience something real. Here's a glimpse of what's inside.",
                    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1000&auto=format&fit=crop",
                    badge: "See what's possible"
                };
        }
    };

    const content = getContent();

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>{content.badge}</Text>
                </View>
                <Text style={styles.headline}>{content.title}</Text>
                <Text style={styles.subtext}>{content.description}</Text>

                <View style={styles.imageContainer}>
                    <Image source={{ uri: content.image }} style={styles.image} />
                    <View style={styles.overlay} />
                </View>
            </View>

            <TouchableOpacity
                style={styles.button}
                onPress={handleContinue}
                activeOpacity={0.8}
            >
                <Text style={styles.buttonText}>This is what I want</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        padding: 32,
        justifyContent: 'space-between',
    },
    content: {
        marginTop: 40,
    },
    badgeContainer: {
        alignSelf: 'flex-start',
        backgroundColor: '#27272A',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 100,
        marginBottom: 20,
    },
    badgeText: {
        color: '#A1A1AA',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    headline: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 16,
    },
    subtext: {
        fontSize: 18,
        color: '#A1A1AA',
        lineHeight: 26,
        marginBottom: 40,
    },
    imageContainer: {
        height: height * 0.3,
        borderRadius: 32,
        overflow: 'hidden',
        backgroundColor: '#18181B',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    button: {
        backgroundColor: '#fff',
        paddingVertical: 20,
        borderRadius: 24,
        alignItems: 'center',
    },
    buttonText: {
        color: '#000',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

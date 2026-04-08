import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Users, Zap, Building2, UserPlus, ChevronRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export type OnboardingIntent = 'participant' | 'creator' | 'brand' | 'merchant' | 'invited';

interface IntentOrientationStepProps {
    onSelect: (intent: OnboardingIntent) => void;
}

const INTENTS = [
    {
        id: 'participant' as const,
        label: "I'm here to join moments",
        description: "Discover nearby events and join challenges.",
        icon: Users,
        color: '#3B82F6',
    },
    {
        id: 'creator' as const,
        label: "I want to create moments",
        description: "Host events and gather people.",
        icon: Zap,
        color: '#F97316',
    },
    {
        id: 'brand' as const,
        label: "I'm for a brand or business",
        description: "Connect via authentic activations.",
        icon: Building2,
        color: '#A855F7',
    },
    {
        id: 'merchant' as const,
        label: "I'm a destination / merchant",
        description: "Verify location and drive foot traffic.",
        icon: UserPlus,
        color: '#10B981',
    }
];

export default function IntentOrientationStep({ onSelect }: IntentOrientationStepProps) {
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headline}>What brings you here today?</Text>
                <Text style={styles.subtext}>This helps us tailor your experience.</Text>
            </View>

            <View style={styles.list}>
                {INTENTS.map((intent) => (
                    <TouchableOpacity
                        key={intent.id}
                        style={styles.card}
                        onPress={() => onSelect(intent.id)}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: `${intent.color}15` }]}>
                            <intent.icon size={24} color={intent.color} />
                        </View>
                        <View style={styles.cardContent}>
                            <Text style={styles.cardLabel}>{intent.label}</Text>
                            <Text style={styles.cardDescription}>{intent.description}</Text>
                        </View>
                        <ChevronRight size={20} color="#3F3F46" />
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#000',
        padding: 24,
        paddingTop: 64,
    },
    header: {
        marginBottom: 40,
    },
    headline: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 12,
    },
    subtext: {
        fontSize: 16,
        color: '#71717A',
    },
    list: {
        gap: 16,
    },
    card: {
        backgroundColor: '#18181B',
        borderRadius: 24,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#27272A',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    cardContent: {
        flex: 1,
    },
    cardLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    cardDescription: {
        fontSize: 14,
        color: '#A1A1AA',
    },
});

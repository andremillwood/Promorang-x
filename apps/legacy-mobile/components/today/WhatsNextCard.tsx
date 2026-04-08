import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useWhatsNext } from '@/hooks/useWhatsNext';
import { useThemeColors } from '@/hooks/useThemeColors';

interface WhatsNextCardProps {
    variant?: 'default' | 'compact';
    onActionClick?: () => void;
}

export const WhatsNextCard: React.FC<WhatsNextCardProps> = ({
    variant = 'default',
    onActionClick
}) => {
    const router = useRouter();
    const theme = useThemeColors();
    const { suggestion, isLoading } = useWhatsNext();

    if (isLoading || !suggestion) {
        return null;
    }

    const Icon = suggestion.icon;

    if (variant === 'compact') {
        return (
            <TouchableOpacity
                onPress={() => {
                    onActionClick?.();
                    router.push(suggestion.path as any);
                }}
                activeOpacity={0.7}
                style={[styles.compactContainer, { backgroundColor: theme.card, borderColor: theme.border }]}
            >
                <View style={[styles.compactIcon, { backgroundColor: suggestion.bgColor }]}>
                    <Icon size={16} color={suggestion.color} />
                </View>
                <Text style={[styles.compactLabel, { color: theme.text }]} numberOfLines={1}>
                    {suggestion.label}
                </Text>
                <ChevronRight size={16} color={theme.textSecondary} />
            </TouchableOpacity>
        );
    }

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['rgba(245, 158, 11, 0.1)', 'rgba(236, 72, 153, 0.1)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.gradient, { borderColor: 'rgba(245, 158, 11, 0.2)' }]}
            >
                <View style={styles.header}>
                    <Sparkles size={14} color="#F59E0B" />
                    <Text style={styles.headerText}>WHAT'S NEXT</Text>
                    {suggestion.isFirstTime && (
                        <View style={styles.newBadge}>
                            <Text style={styles.newBadgeText}>NEW</Text>
                        </View>
                    )}
                </View>

                <View style={styles.content}>
                    <View style={[styles.iconContainer, { backgroundColor: suggestion.bgColor }]}>
                        <Icon size={24} color={suggestion.color} />
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={[styles.title, { color: theme.text }]}>{suggestion.label}</Text>
                        <Text style={[styles.description, { color: theme.textSecondary }]}>
                            {suggestion.description}
                        </Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                        onActionClick?.();
                        router.push(suggestion.path as any);
                    }}
                >
                    <LinearGradient
                        colors={['#F59E0B', '#EC4899']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.buttonGradient}
                    >
                        <Text style={styles.buttonText}>Let's Go</Text>
                        <ChevronRight size={18} color="#FFF" />
                    </LinearGradient>
                </TouchableOpacity>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    gradient: {
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
    },
    compactContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 16,
    },
    compactIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    compactLabel: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 12,
    },
    headerText: {
        fontSize: 11,
        fontWeight: '800',
        color: '#F59E0B',
        letterSpacing: 1,
    },
    newBadge: {
        backgroundColor: '#F59E0B',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    newBadgeText: {
        color: '#FFF',
        fontSize: 9,
        fontWeight: '900',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 20,
    },
    iconContainer: {
        width: 52,
        height: 52,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 4,
    },
    description: {
        fontSize: 13,
        lineHeight: 18,
    },
    button: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    buttonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        gap: 6,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: '700',
    },
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Flame, Heart, Mic, Sparkles, ChevronRight, MessageCircle, Users } from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useRouter } from 'expo-router';

interface ReflectionItem {
    id: string;
    message: string;
    category: 'activity' | 'milestone' | 'streak' | 'community';
    icon: string;
    accent_color: string;
}

interface ReflectionStripProps {
    reflections: ReflectionItem[];
}

export const ReflectionStrip: React.FC<ReflectionStripProps> = ({ reflections }) => {
    const theme = useThemeColors();

    if (!reflections || reflections.length === 0) return null;

    return (
        <View style={styles.container}>
            <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>NOTICED</Text>
            {reflections.map((reflection) => {
                const iconColors: Record<string, string> = {
                    blue: '#3B82F6', pink: '#EC4899', purple: '#8B5CF6',
                    orange: '#F59E0B', emerald: '#10B981'
                };
                const iconColor = iconColors[reflection.accent_color] || '#3B82F6';

                const IconComponent = reflection.icon === 'flame' ? Flame :
                    reflection.icon === 'heart' ? Heart :
                        reflection.icon === 'mic' ? Mic : Sparkles;

                return (
                    <View
                        key={reflection.id}
                        style={[styles.reflectionItem, { backgroundColor: theme.card, borderColor: theme.border }]}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: iconColor + '15' }]}>
                            <IconComponent size={14} color={iconColor} />
                        </View>
                        <Text style={[styles.reflectionText, { color: theme.text }]}>
                            {reflection.message}
                        </Text>
                    </View>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 2,
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    reflectionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 8,
        gap: 12,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    reflectionText: {
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
    },
});

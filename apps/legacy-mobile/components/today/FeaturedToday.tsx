import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MessageCircle, Users } from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useRouter } from 'expo-router';

interface FeaturedItem {
    id: string;
    type: 'promorang_drop' | 'community' | 'seasonal_quest';
    title: string;
    preview: string;
    accent_color: string;
    drop_id?: string;
    expires_at?: string;
    prize_pool_gems?: number;
}

interface FeaturedTodayProps {
    items: FeaturedItem[];
}

export const FeaturedToday: React.FC<FeaturedTodayProps> = ({ items }) => {
    const theme = useThemeColors();
    const router = useRouter();

    if (!items || items.length === 0) return null;

    return (
        <View style={styles.container}>
            <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>FEATURED TODAY</Text>
            {items.map((item) => {
                const colors: Record<string, string> = {
                    emerald: '#10B981', indigo: '#6366F1', blue: '#3B82F6', purple: '#8B5CF6', amber: '#F59E0B'
                };
                const color = colors[item.accent_color] || colors.blue;

                return (
                    <TouchableOpacity
                        key={item.id}
                        style={[styles.featuredItem, { backgroundColor: theme.card, borderColor: theme.border }]}
                        activeOpacity={0.7}
                        onPress={() => {
                            if (item.type === 'seasonal_quest') {
                                router.push('/rewards' as any);
                            } else {
                                router.push('/(tabs)/discover' as any);
                            }
                        }}
                    >
                        <View style={styles.featuredContent}>
                            <Text style={[styles.featuredTitle, { color: theme.text }]}>{item.title}</Text>
                            <Text style={[styles.featuredPreview, { color: color }]}>{item.preview}</Text>
                        </View>
                        <View style={[styles.featuredIconBg, { backgroundColor: color + '15' }]}>
                            {item.type === 'promorang_drop' ? (
                                <MessageCircle size={18} color={color} />
                            ) : (
                                <Users size={18} color={color} />
                            )}
                        </View>
                    </TouchableOpacity>
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
    featuredItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 18,
        borderRadius: 18,
        borderWidth: 1,
        marginBottom: 10,
        gap: 16,
    },
    featuredContent: {
        flex: 1,
    },
    featuredTitle: {
        fontSize: 15,
        fontWeight: '800',
        marginBottom: 4,
    },
    featuredPreview: {
        fontSize: 13,
        fontWeight: '600',
    },
    featuredIconBg: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

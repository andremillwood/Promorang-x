import React, { useRef } from 'react';
import { TouchableOpacity, StyleSheet, View, Text, ViewStyle, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LucideIcon } from 'lucide-react-native';
import colors from '@/constants/colors';

interface HubNodeProps {
    id: string;
    name: string;
    icon: LucideIcon;
    status: 'locked' | 'unlocked' | 'completed';
    onPress: () => void;
    style?: ViewStyle;
}

export const HubNode: React.FC<HubNodeProps> = ({
    name,
    icon: Icon,
    status,
    onPress,
    style
}) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePress = () => {
        if (status === 'locked') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            // Shake animation for locked nodes
            Animated.sequence([
                Animated.timing(scaleAnim, { toValue: 0.9, duration: 100, useNativeDriver: true }),
                Animated.timing(scaleAnim, { toValue: 1.1, duration: 100, useNativeDriver: true }),
                Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
            ]).start();
            return;
        }

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        // Pop animation for unlocked/completed nodes
        Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 0.9, duration: 100, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
        ]).start();
        onPress();
    };

    const getBackgroundColor = () => {
        switch (status) {
            case 'completed': return colors.primary;
            case 'unlocked': return colors.info;
            case 'locked': return colors.lightGray;
        }
    };

    return (
        <View style={[styles.container, style]}>
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <TouchableOpacity
                    onPress={handlePress}
                    activeOpacity={0.8}
                    style={[
                        styles.node,
                        { backgroundColor: getBackgroundColor() },
                        status === 'locked' && styles.lockedNode
                    ]}
                >
                    <Icon size={32} color={colors.white} />
                </TouchableOpacity>
            </Animated.View>
            <Text style={[
                styles.title,
                status === 'locked' && styles.lockedText
            ]}>
                {name}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginVertical: 16,
    },
    node: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 8,
        borderBottomWidth: 6,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    lockedNode: {
        shadowOpacity: 0,
        elevation: 0,
        borderBottomWidth: 0,
    },
    title: {
        marginTop: 8,
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.black,
    },
    lockedText: {
        color: colors.darkGray,
    },
});

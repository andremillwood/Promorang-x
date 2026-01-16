import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Flame } from 'lucide-react-native';
import colors from '@/constants/colors';
import * as Haptics from 'expo-haptics';

interface StreakIndicatorProps {
    streak: number;
    onPress?: () => void;
}

export const StreakIndicator: React.FC<StreakIndicatorProps> = ({ streak, onPress }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 1.2, duration: 100, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
        ]).start();
        onPress?.();
    };

    return (
        <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
            <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
                <Flame size={20} color={streak > 0 ? '#FF6600' : colors.darkGray} fill={streak > 0 ? '#FF6600' : 'none'} />
                <Text style={[styles.text, streak === 0 && styles.inactiveText]}>{streak}</Text>
            </Animated.View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF5EB',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#FFE0CC',
    },
    text: {
        marginLeft: 4,
        fontSize: 14,
        fontWeight: '700',
        color: '#FF6600',
    },
    inactiveText: {
        color: colors.darkGray,
    },
});

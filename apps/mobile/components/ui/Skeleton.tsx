import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle, StyleProp } from 'react-native';
import colors from '@/constants/colors';

interface SkeletonProps {
    width?: number | string;
    height?: number | string;
    borderRadius?: number;
    style?: StyleProp<ViewStyle>;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    width = '100%',
    height = 20,
    borderRadius = 4,
    style,
}) => {
    const opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        const pulse = Animated.sequence([
            Animated.timing(opacity, {
                toValue: 0.7,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0.3,
                duration: 1000,
                useNativeDriver: true,
            }),
        ]);

        Animated.loop(pulse).start();
    }, [opacity]);

    return (
        <Animated.View
            style={[
                styles.skeleton,
                {
                    width: width as any,
                    height: height as any,
                    borderRadius,
                    opacity,
                },
                style,
            ]}
        />
    );
};

export const SkeletonCard: React.FC = () => {
    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Skeleton width={40} height={40} borderRadius={20} />
                <View style={styles.headerText}>
                    <Skeleton width="60%" height={14} style={{ marginBottom: 6 }} />
                    <Skeleton width="40%" height={10} />
                </View>
            </View>
            <Skeleton width="100%" height={150} borderRadius={12} style={{ marginBottom: 12 }} />
            <Skeleton width="90%" height={16} style={{ marginBottom: 8 }} />
            <Skeleton width="70%" height={16} />
        </View>
    );
};

const styles = StyleSheet.create({
    skeleton: {
        backgroundColor: colors.lightGray,
    },
    card: {
        backgroundColor: colors.white,
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.lightGray,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    headerText: {
        marginLeft: 12,
        flex: 1,
    },
});

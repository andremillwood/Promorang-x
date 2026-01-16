import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { haptics } from '@/lib/haptics';

const { width, height } = Dimensions.get('window');

interface ConfettiPiece {
    id: number;
    x: Animated.Value;
    y: Animated.Value;
    rotation: Animated.Value;
    scale: Animated.Value;
    color: string;
    size: number;
}

interface ConfettiProps {
    active: boolean;
    count?: number;
    duration?: number;
    colors?: string[];
    onComplete?: () => void;
}

const DEFAULT_COLORS = [
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#F59E0B', // Amber
    '#10B981', // Green
    '#3B82F6', // Blue
    '#FFD700', // Gold
    '#EF4444', // Red
];

export function Confetti({
    active,
    count = 50,
    duration = 3000,
    colors = DEFAULT_COLORS,
    onComplete,
}: ConfettiProps) {
    const pieces = useRef<ConfettiPiece[]>([]);
    const [isAnimating, setIsAnimating] = React.useState(false);

    useEffect(() => {
        if (active && !isAnimating) {
            startConfetti();
        }
    }, [active]);

    const startConfetti = async () => {
        setIsAnimating(true);
        await haptics.celebrate();

        // Create confetti pieces
        pieces.current = Array.from({ length: count }, (_, i) => ({
            id: i,
            x: new Animated.Value(Math.random() * width),
            y: new Animated.Value(-50),
            rotation: new Animated.Value(0),
            scale: new Animated.Value(1),
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 10 + 6,
        }));

        // Animate each piece
        const animations = pieces.current.map((piece, index) => {
            const startX = Math.random() * width;
            const targetX = startX + (Math.random() - 0.5) * 200;
            const targetY = height + 100;
            const rotations = Math.random() * 10 + 5;

            return Animated.parallel([
                Animated.timing(piece.y, {
                    toValue: targetY,
                    duration: duration + Math.random() * 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(piece.x, {
                    toValue: targetX,
                    duration: duration + Math.random() * 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(piece.rotation, {
                    toValue: rotations * 360,
                    duration: duration + Math.random() * 1000,
                    useNativeDriver: true,
                }),
                Animated.sequence([
                    Animated.timing(piece.scale, {
                        toValue: 1.2,
                        duration: 200,
                        useNativeDriver: true,
                    }),
                    Animated.timing(piece.scale, {
                        toValue: 0.8,
                        duration: duration - 200,
                        useNativeDriver: true,
                    }),
                ]),
            ]);
        });

        Animated.parallel(animations).start(() => {
            setIsAnimating(false);
            onComplete?.();
        });
    };

    if (!isAnimating) return null;

    return (
        <View style={styles.container} pointerEvents="none">
            {pieces.current.map((piece) => (
                <Animated.View
                    key={piece.id}
                    style={[
                        styles.piece,
                        {
                            width: piece.size,
                            height: piece.size * 0.6,
                            backgroundColor: piece.color,
                            transform: [
                                { translateX: piece.x },
                                { translateY: piece.y },
                                {
                                    rotate: piece.rotation.interpolate({
                                        inputRange: [0, 360],
                                        outputRange: ['0deg', '360deg'],
                                    }),
                                },
                                { scale: piece.scale },
                            ],
                        },
                    ]}
                />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 9999,
    },
    piece: {
        position: 'absolute',
        borderRadius: 2,
    },
});

export default Confetti;

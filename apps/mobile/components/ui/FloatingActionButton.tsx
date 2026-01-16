import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
    Modal,
    Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
    Plus,
    X,
    FileText,
    Zap,
    Calendar,
    Camera,
    Gift,
} from 'lucide-react-native';
import { haptics } from '@/lib/haptics';
import colors from '@/constants/colors';

const { width, height } = Dimensions.get('window');

interface FABAction {
    id: string;
    label: string;
    icon: any;
    color: string;
    route: string;
}

const FAB_ACTIONS: FABAction[] = [
    { id: 'drop', label: 'Create Drop', icon: Zap, color: '#F59E0B', route: '/drop/create' },
    { id: 'event', label: 'Host Event', icon: Calendar, color: '#EC4899', route: '/events/create' },
    { id: 'manage', label: 'Manage Drops', icon: FileText, color: '#3B82F6', route: '/drop/manage' },
];

interface FloatingActionButtonProps {
    visible?: boolean;
}

export function FloatingActionButton({ visible = true }: FloatingActionButtonProps) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const animation = useRef(new Animated.Value(0)).current;
    const rotateAnimation = useRef(new Animated.Value(0)).current;

    const toggleMenu = async () => {
        await haptics.medium();
        const toValue = isOpen ? 0 : 1;

        Animated.parallel([
            Animated.spring(animation, {
                toValue,
                friction: 5,
                tension: 40,
                useNativeDriver: true,
            }),
            Animated.timing(rotateAnimation, {
                toValue,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();

        setIsOpen(!isOpen);
    };

    const handleActionPress = async (action: FABAction) => {
        await haptics.light();
        toggleMenu();
        
        // Small delay to let animation complete
        setTimeout(() => {
            router.push(action.route as any);
        }, 150);
    };

    const rotation = rotateAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '45deg'],
    });

    const backdropOpacity = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });

    if (!visible) return null;

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <Animated.View
                    style={[
                        styles.backdrop,
                        { opacity: backdropOpacity },
                    ]}
                >
                    <Pressable style={styles.backdropPressable} onPress={toggleMenu} />
                </Animated.View>
            )}

            {/* FAB Container */}
            <View style={styles.container} pointerEvents="box-none">
                {/* Action Buttons */}
                {FAB_ACTIONS.map((action, index) => {
                    const translateY = animation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -70 * (index + 1)],
                    });

                    const scale = animation.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0, 0.5, 1],
                    });

                    const opacity = animation.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0, 0, 1],
                    });

                    return (
                        <Animated.View
                            key={action.id}
                            style={[
                                styles.actionContainer,
                                {
                                    transform: [{ translateY }, { scale }],
                                    opacity,
                                },
                            ]}
                        >
                            <TouchableOpacity
                                style={styles.actionLabelContainer}
                                onPress={() => handleActionPress(action)}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.actionLabel}>{action.label}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: action.color }]}
                                onPress={() => handleActionPress(action)}
                                activeOpacity={0.8}
                            >
                                <action.icon size={22} color="#FFF" />
                            </TouchableOpacity>
                        </Animated.View>
                    );
                })}

                {/* Main FAB */}
                <TouchableOpacity
                    style={styles.mainFab}
                    onPress={toggleMenu}
                    activeOpacity={0.9}
                >
                    <LinearGradient
                        colors={[colors.primary, '#7C3AED']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.mainFabGradient}
                    >
                        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
                            <Plus size={28} color="#FFF" strokeWidth={2.5} />
                        </Animated.View>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 998,
    },
    backdropPressable: {
        flex: 1,
    },
    container: {
        position: 'absolute',
        bottom: 90,
        right: 20,
        alignItems: 'flex-end',
        zIndex: 999,
    },
    mainFab: {
        width: 60,
        height: 60,
        borderRadius: 30,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
    },
    mainFabGradient: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
        marginLeft: 12,
    },
    actionLabelContainer: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    actionLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFF',
    },
});

export default FloatingActionButton;

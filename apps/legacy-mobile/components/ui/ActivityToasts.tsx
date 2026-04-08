import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Trophy, Star, Gift, Zap } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useThemeColors } from '@/hooks/useThemeColors';

const { width } = Dimensions.get('window');

interface Toast {
    id: string;
    message: string;
    type: 'points' | 'achievement' | 'streak' | 'reward';
    value?: string | number;
}

interface ToastContextType {
    showToast: (message: string, type: Toast['type'], value?: string | number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within a ToastProvider');
    return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const theme = useThemeColors();

    const showToast = useCallback((message: string, type: Toast['type'], value?: string | number) => {
        const id = Math.random().toString(36).substring(7);
        setToasts(prev => [...prev, { id, message, type, value }]);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <View style={styles.toastContainer} pointerEvents="none">
                {toasts.map((toast, index) => (
                    <ToastItem key={toast.id} toast={toast} index={index} theme={theme} />
                ))}
            </View>
        </ToastContext.Provider>
    );
};

const ToastItem = ({ toast, index, theme }: { toast: Toast, index: number, theme: any }) => {
    const slideAnim = useState(new Animated.Value(-100))[0];
    const opacityAnim = useState(new Animated.Value(0))[0];

    useEffect(() => {
        Animated.parallel([
            Animated.spring(slideAnim, {
                toValue: 20 + (index * 70),
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();

        const timer = setTimeout(() => {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: -100,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        }, 2700);

        return () => clearTimeout(timer);
    }, []);

    const getIcon = () => {
        switch (toast.type) {
            case 'points': return <Zap size={20} color="#F59E0B" />;
            case 'achievement': return <Trophy size={20} color="#8B5CF6" />;
            case 'streak': return <Star size={20} color="#EF4444" />;
            case 'reward': return <Gift size={20} color="#10B981" />;
        }
    };

    const getColors = () => {
        switch (toast.type) {
            case 'points': return ['#FEF3C7', '#B45309'];
            case 'achievement': return ['#EDE9FE', '#6D28D9'];
            case 'streak': return ['#FEE2E2', '#B91C1C'];
            case 'reward': return ['#D1FAE5', '#047857'];
        }
    };

    const [bg, text] = getColors();

    return (
        <Animated.View
            style={[
                styles.toast,
                {
                    opacity: opacityAnim,
                    transform: [{ translateY: slideAnim }],
                    backgroundColor: bg,
                    borderColor: text + '44',
                }
            ]}
        >
            <View style={styles.iconContainer}>
                {getIcon()}
            </View>
            <View style={styles.content}>
                <Text style={[styles.message, { color: text }]}>{toast.message}</Text>
                {toast.value && (
                    <Text style={[styles.value, { color: text }]}>+{toast.value}</Text>
                )}
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    toastContainer: {
        position: 'absolute',
        top: 60,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 9999,
    },
    toast: {
        position: 'absolute',
        flexDirection: 'row',
        alignItems: 'center',
        width: width * 0.9,
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    iconContainer: {
        marginRight: 12,
    },
    content: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    message: {
        fontSize: 14,
        fontWeight: '800',
    },
    value: {
        fontSize: 14,
        fontWeight: '900',
    },
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Bell, Search, User, ChevronLeft } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { useThemeColors } from '@/hooks/useThemeColors';

interface AppHeaderProps {
    title?: string;
    showLogo?: boolean;
    showSearch?: boolean;
    showNotifications?: boolean;
    showAvatar?: boolean;
    showBack?: boolean;
    transparent?: boolean;
    hideLeft?: boolean;
    rightAction?: React.ReactNode;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
    title,
    showLogo = true,
    showSearch = false,
    showNotifications = true,
    showAvatar = true,
    showBack = false,
    transparent = false,
    hideLeft = false,
    rightAction,
}) => {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const theme = useThemeColors();
    const { user, isAuthenticated, isGuest } = useAuthStore();

    const handleAvatarPress = () => {
        if (isAuthenticated) {
            router.push('/(tabs)/profile');
        } else {
            router.push('/(auth)/login');
        }
    };

    const handleNotificationsPress = () => {
        router.push('/notifications');
    };

    const containerStyle = [
        styles.container,
        { paddingTop: insets.top + 8 },
        transparent ? styles.transparent : { backgroundColor: theme.surface, borderBottomColor: theme.border }
    ];

    const iconColor = transparent ? '#FFF' : theme.text;
    const secondaryIconBg = transparent ? 'rgba(255,255,255,0.2)' : theme.background;

    return (
        <View style={containerStyle}>
            <View style={styles.content}>
                <View style={styles.leftSection}>
                    {showBack && (
                        <TouchableOpacity
                            onPress={() => router.back()}
                            style={[styles.backButton, { backgroundColor: secondaryIconBg }]}
                        >
                            <ChevronLeft size={24} color={iconColor} />
                        </TouchableOpacity>
                    )}
                    {!hideLeft && (
                        <>
                            {showLogo ? (
                                <View style={styles.logoContainer}>
                                    <Image
                                        source={require('@/assets/images/icon.png')}
                                        style={styles.logoImage}
                                        resizeMode="contain"
                                    />
                                    <Text style={[styles.brandName, { color: transparent ? '#FFF' : theme.text }]}>Promorang</Text>
                                </View>
                            ) : title ? (
                                <Text style={[styles.title, { color: transparent ? '#FFF' : theme.text }]}>{title}</Text>
                            ) : null}
                        </>
                    )}
                </View>

                <View style={styles.rightSection}>
                    {showSearch && (
                        <TouchableOpacity
                            style={[styles.iconButton, { backgroundColor: secondaryIconBg }]}
                            activeOpacity={0.7}
                            onPress={() => router.push('/search')}
                        >
                            <Search size={22} color={iconColor} />
                        </TouchableOpacity>
                    )}

                    {showNotifications && !isGuest && (
                        <TouchableOpacity
                            style={[styles.iconButton, { backgroundColor: secondaryIconBg }]}
                            onPress={handleNotificationsPress}
                            activeOpacity={0.7}
                        >
                            <Bell size={22} color={iconColor} />
                            <View style={[styles.notificationBadge, { borderColor: transparent ? 'transparent' : theme.surface }]} />
                        </TouchableOpacity>
                    )}

                    {showAvatar && (
                        <TouchableOpacity
                            style={styles.avatarButton}
                            onPress={handleAvatarPress}
                            activeOpacity={0.7}
                        >
                            {isAuthenticated && user?.avatar_url ? (
                                <Image
                                    source={{ uri: user.avatar_url }}
                                    style={styles.avatar}
                                />
                            ) : (
                                <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: transparent ? 'rgba(255,255,255,0.2)' : theme.border }]}>
                                    <User size={18} color={iconColor} />
                                </View>
                            )}
                        </TouchableOpacity>
                    )}

                    {rightAction}

                    {isGuest && (
                        <TouchableOpacity
                            style={[styles.signInButton, transparent && { backgroundColor: 'rgba(255,255,255,0.3)' }]}
                            onPress={() => router.push('/(auth)/login')}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.signInText}>Sign In</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderBottomWidth: 1,
    },
    transparent: {
        backgroundColor: 'transparent',
        borderBottomWidth: 0,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoImage: {
        width: 32,
        height: 32,
        borderRadius: 8,
        marginRight: 8,
    },
    brandName: {
        ...typography.presets.h3,
        color: colors.black,
        letterSpacing: 0.5,
    },
    title: {
        ...typography.presets.bodyLarge,
        fontWeight: typography.weight.semibold,
        color: colors.black,
    },
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.gray,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    notificationBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FF4757',
        borderWidth: 1.5,
        borderColor: colors.white,
    },
    avatarButton: {
        width: 36,
        height: 36,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
    },
    avatarPlaceholder: {
        backgroundColor: colors.lightGray,
        justifyContent: 'center',
        alignItems: 'center',
    },
    signInButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: colors.primary,
        borderRadius: 20,
    },
    signInText: {
        ...typography.presets.bodySmall,
        fontWeight: typography.weight.semibold,
        color: '#FFFFFF',
    },
});

export default AppHeader;

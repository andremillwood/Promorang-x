import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import {
    User,
    Bell,
    Lock,
    Eye,
    Moon,
    LogOut,
    ChevronRight,
    Info,
    ShieldCheck,
    CreditCard,
    Sun,
    Monitor,
    Megaphone
} from 'lucide-react-native';
import colors from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore, ThemeMode } from '@/store/themeStore';
import { useThemeColors } from '@/hooks/useThemeColors';

export default function SettingsScreen() {
    const router = useRouter();
    const theme = useThemeColors();
    const { user, logout } = useAuthStore();
    const { themeMode, setThemeMode } = useThemeStore();
    const [pushEnabled, setPushEnabled] = useState(true);

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                        router.replace('/(auth)/login');
                    }
                }
            ]
        );
    };

    const renderSettingItem = (icon: any, title: string, subtitle?: string, onPress?: () => void, rightElement?: any) => (
        <TouchableOpacity
            style={[styles.settingItem, { borderBottomColor: theme.border }]}
            onPress={onPress}
            disabled={!onPress}
        >
            <View style={styles.settingIconContainer}>
                {icon}
            </View>
            <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, { color: theme.text }]}>{title}</Text>
                {subtitle && <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>{subtitle}</Text>}
            </View>
            {rightElement || <ChevronRight size={20} color={theme.textSecondary} />}
        </TouchableOpacity>
    );

    const renderThemeOption = (mode: ThemeMode, label: string, Icon: any) => {
        const isActive = themeMode === mode;
        return (
            <TouchableOpacity
                style={[
                    styles.themeOption,
                    { borderColor: theme.border },
                    isActive && { borderColor: colors.primary, backgroundColor: colors.primary + '10' }
                ]}
                onPress={() => setThemeMode(mode)}
            >
                <Icon size={20} color={isActive ? colors.primary : theme.textSecondary} />
                <Text style={[
                    styles.themeLabel,
                    { color: theme.textSecondary },
                    isActive && { color: colors.primary, fontWeight: '700' }
                ]}>
                    {label}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen
                options={{
                    title: 'Settings',
                    headerShown: true,
                    headerStyle: { backgroundColor: theme.surface },
                    headerTintColor: colors.primary,
                    headerTitleStyle: { fontWeight: '700', color: theme.text },
                }}
            />

            <View style={[styles.section, { backgroundColor: theme.surface, borderTopColor: theme.border, borderBottomColor: theme.border }]}>
                <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Account</Text>
                {renderSettingItem(
                    <User size={22} color={colors.primary} />,
                    'Edit Profile',
                    'Name, Bio, Profile Picture',
                    () => router.push('/profile/edit' as any)
                )}
                {renderSettingItem(
                    <Lock size={22} color={colors.primary} />,
                    'Privacy & Security',
                    'Password, Data usage',
                    () => { }
                )}
                {renderSettingItem(
                    <CreditCard size={22} color={colors.primary} />,
                    'Wallet & Payouts',
                    'Manage your earnings',
                    () => router.push('/(tabs)/wallet' as any)
                )}
                {user?.role === 'advertiser' ? (
                    renderSettingItem(
                        <Megaphone size={22} color={colors.primary} />,
                        'Advertiser Dashboard',
                        'Manage campaigns & drops',
                        () => router.push('/advertiser/dashboard')
                    )
                ) : (
                    renderSettingItem(
                        <Megaphone size={22} color={colors.primary} />,
                        'Become an Advertiser',
                        'Create drops & grow your brand',
                        () => router.push('/advertiser/onboarding')
                    )
                )}
            </View>

            <View style={[styles.section, { backgroundColor: theme.surface, borderTopColor: theme.border, borderBottomColor: theme.border }]}>
                <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Preferences</Text>
                {renderSettingItem(
                    <Bell size={22} color={colors.primary} />,
                    'Push Notifications',
                    'Gems, Drops, Activity',
                    undefined,
                    <Switch
                        value={pushEnabled}
                        onValueChange={setPushEnabled}
                        trackColor={{ false: theme.border, true: colors.primary }}
                    />
                )}

                <View style={styles.themeSection}>
                    <View style={styles.themeHeader}>
                        <Moon size={22} color={colors.primary} />
                        <Text style={[styles.themeTitle, { color: theme.text }]}>Appearance</Text>
                    </View>
                    <View style={styles.themeOptionsRow}>
                        {renderThemeOption('light', 'Light', Sun)}
                        {renderThemeOption('dark', 'Dark', Moon)}
                        {renderThemeOption('system', 'System', Monitor)}
                    </View>
                </View>
            </View>

            <View style={[styles.section, { backgroundColor: theme.surface, borderTopColor: theme.border, borderBottomColor: theme.border }]}>
                <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Support</Text>
                {renderSettingItem(
                    <ShieldCheck size={22} color={colors.primary} />,
                    'Terms & Privacy Policy',
                    undefined,
                    () => { }
                )}
                {renderSettingItem(
                    <Info size={22} color={colors.primary} />,
                    'About Promorang',
                    'v1.0.24',
                    () => { }
                )}
            </View>

            <TouchableOpacity
                style={[styles.logoutButton, { backgroundColor: theme.surface, borderTopColor: theme.border, borderBottomColor: theme.border }]}
                onPress={handleLogout}
            >
                <LogOut size={20} color={colors.error} />
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
                <Text style={[styles.footerText, { color: theme.textSecondary }]}>Made with ❤️ for Influencers</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    section: {
        marginTop: 20,
        borderTopWidth: 1,
        borderBottomWidth: 1,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        marginLeft: 16,
        marginTop: 16,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    settingIconContainer: {
        width: 32,
        alignItems: 'center',
    },
    settingTextContainer: {
        flex: 1,
        marginLeft: 12,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    settingSubtitle: {
        fontSize: 13,
        marginTop: 2,
    },
    themeSection: {
        padding: 16,
    },
    themeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    themeTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 12,
    },
    themeOptionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    themeOption: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 2,
    },
    themeLabel: {
        fontSize: 12,
        marginTop: 6,
        fontWeight: '500',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 32,
        padding: 16,
        borderTopWidth: 1,
        borderBottomWidth: 1,
    },
    logoutText: {
        color: colors.error,
        fontSize: 16,
        fontWeight: '700',
        marginLeft: 8,
    },
    footer: {
        padding: 32,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
    },
});

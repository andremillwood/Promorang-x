/**
 * TodayLayout (Focused Bottom Nav)
 * 
 * Provides a focused bottom navigation for Today screen
 * that gates tabs based on user maturity state.
 * 
 * Rank 0-1: Shop, Deals, Market
 * Rank 2+: Full navigation
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { SlideInDown } from 'react-native-reanimated';
import {
    Store,
    Gift,
    BarChart3,
    Compass,
    Trophy,
    Home,
    Calendar,
    TrendingUp,
    User
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useMaturityStore, UserMaturityState } from '@/store/maturityStore';
import colors from '@/constants/colors';

const { width } = Dimensions.get('window');

interface TodayLayoutProps {
    children: React.ReactNode;
}

const FOCUSED_TABS = [
    { id: 'shop', path: '/store', icon: Store, label: 'Shop' },
    { id: 'deals', path: '/deals', icon: Gift, label: 'Deals' },
    { id: 'today', path: '/today', icon: Home, label: 'Today' },
    { id: 'events', path: '/events', icon: Calendar, label: 'Events' },
    { id: 'scout', path: '/bounty', icon: TrendingUp, label: 'Scout' },
];

// Full tabs for higher-rank users (State 2+)
const FULL_TABS = [
    { id: 'home', path: '/(tabs)', icon: Home, label: 'Home' },
    { id: 'discover', path: '/(tabs)/discover', icon: Compass, label: 'Discover' },
    { id: 'today', path: '/today', icon: Calendar, label: 'Today' },
    { id: 'earn', path: '/(tabs)/marketplace', icon: Trophy, label: 'Earn' },
    { id: 'profile', path: '/(tabs)/profile', icon: User, label: 'Profile' },
];

export default function TodayLayout({ children }: TodayLayoutProps) {
    const router = useRouter();
    const pathname = usePathname();
    const theme = useThemeColors();
    const { maturityState } = useMaturityStore();

    // Determine which tabs to show based on maturity
    const isFocusedMode = maturityState < UserMaturityState.OPERATOR_PRO;
    const tabs = isFocusedMode ? FOCUSED_TABS : FULL_TABS;

    const handleTabPress = (path: string) => {
        Haptics.selectionAsync();
        router.push(path as any);
    };

    const isActiveTab = (path: string) => {
        if (path === '/today') return pathname === '/today' || pathname.startsWith('/today/');
        return pathname === path || pathname.startsWith(path);
    };

    return (
        <View style={styles.container}>
            {/* Content */}
            <View style={styles.content}>
                {children}
            </View>

            {/* Bottom Navigation */}
            <SafeAreaView edges={['bottom']} style={[styles.bottomNav, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
                <Animated.View
                    entering={SlideInDown.duration(600).springify()}
                    style={styles.tabsContainer}
                >
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = isActiveTab(tab.path);

                        return (
                            <TouchableOpacity
                                key={tab.id}
                                style={styles.tab}
                                onPress={() => handleTabPress(tab.path)}
                                activeOpacity={0.7}
                            >
                                <View style={[
                                    styles.tabIconContainer,
                                    isActive && { backgroundColor: `${colors.primary}15` }
                                ]}>
                                    <Icon
                                        size={22}
                                        color={isActive ? colors.primary : theme.textSecondary}
                                    />
                                </View>
                                <Text style={[
                                    styles.tabLabel,
                                    { color: isActive ? colors.primary : theme.textSecondary },
                                    isActive && styles.tabLabelActive
                                ]}>
                                    {tab.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </Animated.View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    bottomNav: {
        borderTopWidth: 1,
        paddingTop: 8,
        paddingBottom: 8,
    },
    tabsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    tab: {
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        minWidth: width / 5 - 16,
    },
    tabIconContainer: {
        width: 40,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 2,
    },
    tabLabel: {
        fontSize: 10,
        fontWeight: '500',
    },
    tabLabelActive: {
        fontWeight: '700',
    },
});

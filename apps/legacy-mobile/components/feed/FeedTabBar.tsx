import React, { useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated';
import { Star, Activity, DollarSign, Gift, Calendar, ShoppingBag, TrendingUp } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useThemeColors } from '@/hooks/useThemeColors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = 50;

export type FeedTab = 'for-you' | 'social' | 'drops' | 'rewards' | 'events' | 'products' | 'forecasts';

interface FeedTabBarProps {
    activeTab: FeedTab;
    onTabChange: (tab: FeedTab) => void;
    tabs?: FeedTab[];
}

export const TAB_CONFIG: Record<FeedTab, { label: string; icon: any }> = {
    'for-you': { label: 'For You', icon: Star },
    'social': { label: 'Social', icon: Activity },
    'drops': { label: 'Drops', icon: DollarSign },
    'rewards': { label: 'Rewards', icon: Gift },
    'events': { label: 'Events', icon: Calendar },
    'products': { label: 'Shop', icon: ShoppingBag },
    'forecasts': { label: 'Forecasts', icon: TrendingUp },
};

const DEFAULT_TABS: FeedTab[] = ['for-you', 'social', 'drops', 'forecasts', 'products', 'events'];

export const FeedTabBar: React.FC<FeedTabBarProps> = ({
    activeTab,
    onTabChange,
    tabs = DEFAULT_TABS,
}) => {
    const theme = useThemeColors();
    const activeIndex = tabs.indexOf(activeTab);
    const translateX = useSharedValue(0);

    const goToTab = useCallback((index: number) => {
        if (index >= 0 && index < tabs.length) {
            onTabChange(tabs[index]);
        }
    }, [tabs, onTabChange]);

    // Swipe gesture for tab navigation
    const swipeGesture = Gesture.Pan()
        .activeOffsetX([-20, 20])
        .failOffsetY([-10, 10])
        .onUpdate((event) => {
            translateX.value = event.translationX;
        })
        .onEnd((event) => {
            const velocity = event.velocityX;
            
            // Determine if swipe was significant enough
            if (Math.abs(event.translationX) > SWIPE_THRESHOLD || Math.abs(velocity) > 500) {
                if (event.translationX > 0 && activeIndex > 0) {
                    // Swipe right - go to previous tab
                    runOnJS(goToTab)(activeIndex - 1);
                } else if (event.translationX < 0 && activeIndex < tabs.length - 1) {
                    // Swipe left - go to next tab
                    runOnJS(goToTab)(activeIndex + 1);
                }
            }
            
            translateX.value = withSpring(0, { damping: 20, stiffness: 300 });
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value * 0.1 }], // Subtle feedback
    }));

    return (
        <GestureDetector gesture={swipeGesture}>
            <Animated.View style={[styles.container, { backgroundColor: theme.surface, borderBottomColor: theme.border }, animatedStyle]}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {tabs.map((tabKey) => {
                        const tab = TAB_CONFIG[tabKey];
                        const isActive = activeTab === tabKey;
                        const IconComponent = tab.icon;

                        return (
                            <TouchableOpacity
                                key={tabKey}
                                style={[
                                    styles.tab,
                                    isActive && styles.activeTab,
                                    isActive && { backgroundColor: theme.primary + '15' }
                                ]}
                                onPress={() => onTabChange(tabKey)}
                                activeOpacity={0.7}
                            >
                                <IconComponent
                                    size={18}
                                    color={isActive ? colors.primary : theme.textSecondary}
                                />
                                <Text style={[
                                    styles.tabLabel,
                                    { color: theme.textSecondary },
                                    isActive && styles.activeTabLabel,
                                    isActive && { color: colors.primary }
                                ]}>
                                    {tab.label}
                                </Text>
                                {isActive && <View style={styles.activeIndicator} />}
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </Animated.View>
        </GestureDetector>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.lightGray,
    },
    scrollContent: {
        paddingHorizontal: 8,
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        marginHorizontal: 4,
        position: 'relative',
    },
    activeTab: {
        backgroundColor: 'rgba(255, 107, 53, 0.08)',
        borderRadius: 12,
    },
    tabLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.darkGray,
        marginLeft: 8,
    },
    activeTabLabel: {
        color: colors.primary,
    },
    activeIndicator: {
        position: 'absolute',
        bottom: 0,
        left: 16,
        right: 16,
        height: 3,
        backgroundColor: colors.primary,
        borderTopLeftRadius: 3,
        borderTopRightRadius: 3,
    },
});

export default FeedTabBar;

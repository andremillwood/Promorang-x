import React, { useRef, useCallback } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

interface Tab {
  key: string;
  label: string;
  icon?: React.ReactNode;
}

interface SwipeableTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  children: React.ReactNode[];
}

export function SwipeableTabs({ tabs, activeTab, onTabChange, children }: SwipeableTabsProps) {
  const activeIndex = tabs.findIndex(t => t.key === activeTab);
  const translateX = useSharedValue(-activeIndex * SCREEN_WIDTH);

  const updateTab = useCallback((index: number) => {
    if (index >= 0 && index < tabs.length) {
      onTabChange(tabs[index].key);
    }
  }, [tabs, onTabChange]);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-5, 5])
    .onUpdate((event) => {
      const newTranslateX = -activeIndex * SCREEN_WIDTH + event.translationX;
      // Clamp to prevent over-scrolling
      const minX = -(tabs.length - 1) * SCREEN_WIDTH;
      const maxX = 0;
      translateX.value = Math.max(minX - 50, Math.min(maxX + 50, newTranslateX));
    })
    .onEnd((event) => {
      const velocity = event.velocityX;
      let newIndex = activeIndex;

      if (Math.abs(event.translationX) > SWIPE_THRESHOLD || Math.abs(velocity) > 500) {
        if (event.translationX > 0 && activeIndex > 0) {
          newIndex = activeIndex - 1;
        } else if (event.translationX < 0 && activeIndex < tabs.length - 1) {
          newIndex = activeIndex + 1;
        }
      }

      translateX.value = withSpring(-newIndex * SCREEN_WIDTH, {
        damping: 20,
        stiffness: 200,
      });

      if (newIndex !== activeIndex) {
        runOnJS(updateTab)(newIndex);
      }
    });

  // Sync translateX when activeTab changes externally (e.g., tab bar tap)
  React.useEffect(() => {
    translateX.value = withSpring(-activeIndex * SCREEN_WIDTH, {
      damping: 20,
      stiffness: 200,
    });
  }, [activeIndex]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Tab Indicator Bar */}
      <View style={styles.tabBar}>
        {tabs.map((tab, index) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeIndex === index && styles.activeTab]}
            onPress={() => onTabChange(tab.key)}
            activeOpacity={0.7}
          >
            {tab.icon}
            <Text style={[styles.tabLabel, activeIndex === index && styles.activeTabLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
        {/* Animated indicator */}
        <Animated.View
          style={[
            styles.indicator,
            {
              width: `${100 / tabs.length}%`,
              left: `${(activeIndex * 100) / tabs.length}%`,
            },
          ]}
        />
      </View>

      {/* Swipeable Content */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.contentContainer, animatedStyle]}>
          {children.map((child, index) => (
            <View key={tabs[index]?.key || index} style={styles.page}>
              {child}
            </View>
          ))}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    position: 'relative',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  activeTab: {},
  tabLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  activeTabLabel: {
    color: '#1F2937',
    fontWeight: '600',
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    height: 2,
    backgroundColor: '#F97316',
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    width: SCREEN_WIDTH * 10, // Support up to 10 tabs
  },
  page: {
    width: SCREEN_WIDTH,
    flex: 1,
  },
});

export default SwipeableTabs;

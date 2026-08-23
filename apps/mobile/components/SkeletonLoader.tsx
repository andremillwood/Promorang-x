import React, { useEffect } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Text, View } from '@/components/Themed';
import { Colors } from '@/constants/DesignTokens';
import { useColorScheme } from '@/components/useColorScheme';

interface SkeletonProps {
  width?: number | `${number}%` | 'auto';
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}: SkeletonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.8, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const baseColor = isDark ? Colors.gray[800] : Colors.gray[200];

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: baseColor,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

export function LivingFeedCardSkeleton() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View
      style={[
        styles.feedSkeletonCard,
        {
          backgroundColor: isDark ? Colors.gray[900] : Colors.white,
          borderColor: isDark ? Colors.gray[800] : Colors.gray[200],
        },
      ]}
    >
      <View style={styles.topRow}>
        <Skeleton width={120} height={26} borderRadius={13} />
        <Skeleton width={38} height={38} borderRadius={19} />
      </View>
      <View style={styles.bottomBlock}>
        <Skeleton width={80} height={14} borderRadius={4} style={{ marginBottom: 8 }} />
        <Skeleton width="90%" height={26} borderRadius={6} style={{ marginBottom: 8 }} />
        <Skeleton width="65%" height={14} borderRadius={4} style={{ marginBottom: 16 }} />
        <View style={styles.footerRow}>
          <Skeleton width={110} height={18} borderRadius={4} />
          <Skeleton width={90} height={36} borderRadius={18} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  feedSkeletonCard: {
    height: 380,
    borderRadius: 28,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  bottomBlock: {
    backgroundColor: 'transparent',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
});

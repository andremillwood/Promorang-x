import React, { useCallback } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Bookmark, Share2, Heart } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = 80;
const ACTION_WIDTH = 80;

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: {
    icon?: React.ReactNode;
    label: string;
    color: string;
    backgroundColor: string;
  };
  rightAction?: {
    icon?: React.ReactNode;
    label: string;
    color: string;
    backgroundColor: string;
  };
  disabled?: boolean;
}

export function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction = {
    icon: <Share2 size={24} color="#FFFFFF" />,
    label: 'Share',
    color: '#FFFFFF',
    backgroundColor: '#3B82F6',
  },
  rightAction = {
    icon: <Bookmark size={24} color="#FFFFFF" />,
    label: 'Save',
    color: '#FFFFFF',
    backgroundColor: '#10B981',
  },
  disabled = false,
}: SwipeableCardProps) {
  const translateX = useSharedValue(0);
  const isActive = useSharedValue(false);

  const handleSwipeLeft = useCallback(() => {
    onSwipeLeft?.();
  }, [onSwipeLeft]);

  const handleSwipeRight = useCallback(() => {
    onSwipeRight?.();
  }, [onSwipeRight]);

  const panGesture = Gesture.Pan()
    .enabled(!disabled)
    .activeOffsetX([-15, 15])
    .failOffsetY([-10, 10])
    .onStart(() => {
      isActive.value = true;
    })
    .onUpdate((event) => {
      // Limit swipe distance
      const maxSwipe = ACTION_WIDTH + 20;
      translateX.value = Math.max(-maxSwipe, Math.min(maxSwipe, event.translationX));
    })
    .onEnd((event) => {
      isActive.value = false;
      
      // Check if swipe exceeded threshold
      if (translateX.value > SWIPE_THRESHOLD && onSwipeRight) {
        runOnJS(handleSwipeRight)();
      } else if (translateX.value < -SWIPE_THRESHOLD && onSwipeLeft) {
        runOnJS(handleSwipeLeft)();
      }

      // Spring back to center
      translateX.value = withSpring(0, {
        damping: 20,
        stiffness: 300,
      });
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const leftActionStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD / 2, SWIPE_THRESHOLD],
      [0, 0.5, 1],
      Extrapolation.CLAMP
    );
    const scale = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0.8, 1],
      Extrapolation.CLAMP
    );
    return {
      opacity,
      transform: [{ scale }],
    };
  });

  const rightActionStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, -SWIPE_THRESHOLD / 2, 0],
      [1, 0.5, 0],
      Extrapolation.CLAMP
    );
    const scale = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0.8],
      Extrapolation.CLAMP
    );
    return {
      opacity,
      transform: [{ scale }],
    };
  });

  return (
    <View style={styles.container}>
      {/* Left Action (revealed when swiping right) */}
      <Animated.View
        style={[
          styles.actionContainer,
          styles.leftAction,
          { backgroundColor: rightAction.backgroundColor },
          leftActionStyle,
        ]}
      >
        {rightAction.icon}
        <Text style={[styles.actionLabel, { color: rightAction.color }]}>
          {rightAction.label}
        </Text>
      </Animated.View>

      {/* Right Action (revealed when swiping left) */}
      <Animated.View
        style={[
          styles.actionContainer,
          styles.rightAction,
          { backgroundColor: leftAction.backgroundColor },
          rightActionStyle,
        ]}
      >
        {leftAction.icon}
        <Text style={[styles.actionLabel, { color: leftAction.color }]}>
          {leftAction.label}
        </Text>
      </Animated.View>

      {/* Card Content */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.card, cardStyle]}>
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  card: {
    backgroundColor: '#FFFFFF',
    zIndex: 1,
  },
  actionContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: ACTION_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  leftAction: {
    left: 0,
  },
  rightAction: {
    right: 0,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default SwipeableCard;

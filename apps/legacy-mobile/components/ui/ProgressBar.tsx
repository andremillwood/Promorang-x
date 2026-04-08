import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import colors from '@/constants/colors';

interface ProgressBarProps {
  progress: number; // 0 to 1
  height?: number;
  backgroundColor?: string;
  progressColor?: string;
  style?: ViewStyle;
  animated?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 8,
  backgroundColor = colors.lightGray,
  progressColor = colors.primary,
  style,
  animated = true,
}) => {
  // Ensure progress is between 0 and 1
  const clampedProgress = Math.min(Math.max(progress, 0), 1);

  return (
    <View
      style={[
        styles.container,
        { height, backgroundColor },
        style,
      ]}
    >
      <View
        style={[
          styles.progress,
          {
            width: `${clampedProgress * 100}%`,
            backgroundColor: progressColor,
          },
          animated && styles.animated,
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 4,
    overflow: 'hidden',
    width: '100%',
  },
  progress: {
    height: '100%',
  },
  animated: {
    transition: 'width 0.3s ease-in-out',
  },
});
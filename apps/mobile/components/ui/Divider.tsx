import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import colors from '@/constants/colors';

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  size = 1,
  color = colors.lightGray,
  style,
}) => {
  return (
    <View
      style={[
        orientation === 'horizontal' ? styles.horizontal : styles.vertical,
        {
          [orientation === 'horizontal' ? 'height' : 'width']: size,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  horizontal: {
    width: '100%',
  },
  vertical: {
    height: '100%',
  },
});
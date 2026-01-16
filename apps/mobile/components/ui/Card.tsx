import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import colors from '@/constants/colors';
import { useThemeColors } from '@/hooks/useThemeColors';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'small' | 'medium' | 'large';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
  padding = 'medium',
}) => {
  const theme = useThemeColors();

  const getVariantStyle = () => {
    switch (variant) {
      case 'default':
        return [styles.defaultCard, { backgroundColor: theme.card }];
      case 'elevated':
        return [styles.elevatedCard, { backgroundColor: theme.card }];
      case 'outlined':
        return [styles.outlinedCard, { backgroundColor: theme.card, borderColor: theme.border }];
      default:
        return [styles.defaultCard, { backgroundColor: theme.card }];
    }
  };

  const getPaddingStyle = () => {
    switch (padding) {
      case 'none':
        return styles.noPadding;
      case 'small':
        return styles.smallPadding;
      case 'medium':
        return styles.mediumPadding;
      case 'large':
        return styles.largePadding;
      default:
        return styles.mediumPadding;
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.card }, getVariantStyle(), getPaddingStyle(), style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  // Variants
  defaultCard: {
    backgroundColor: colors.white,
  },
  elevatedCard: {
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  outlinedCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  // Padding
  noPadding: {
    padding: 0,
  },
  smallPadding: {
    padding: 8,
  },
  mediumPadding: {
    padding: 16,
  },
  largePadding: {
    padding: 24,
  },
});
import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import colors from '@/constants/colors';

interface BadgeProps {
  text: string;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'default';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  text,
  variant = 'default',
  size = 'md',
  style,
  textStyle,
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'primary':
        return { backgroundColor: colors.primary, textColor: colors.white };
      case 'success':
        return { backgroundColor: colors.success, textColor: colors.white };
      case 'warning':
        return { backgroundColor: colors.warning, textColor: colors.black };
      case 'error':
        return { backgroundColor: colors.error, textColor: colors.white };
      case 'info':
        return { backgroundColor: colors.info, textColor: colors.white };
      case 'default':
      default:
        return { backgroundColor: colors.lightGray, textColor: colors.black };
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return { paddingVertical: 2, paddingHorizontal: 6, fontSize: 10 };
      case 'md':
        return { paddingVertical: 4, paddingHorizontal: 8, fontSize: 12 };
      case 'lg':
        return { paddingVertical: 6, paddingHorizontal: 10, fontSize: 14 };
      default:
        return { paddingVertical: 4, paddingHorizontal: 8, fontSize: 12 };
    }
  };

  const variantStyle = getVariantStyle();
  const sizeStyle = getSizeStyle();

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: variantStyle.backgroundColor },
        {
          paddingVertical: sizeStyle.paddingVertical,
          paddingHorizontal: sizeStyle.paddingHorizontal,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: variantStyle.textColor, fontSize: sizeStyle.fontSize },
          textStyle,
        ]}
        numberOfLines={1}
      >
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 99,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '500',
  },
});
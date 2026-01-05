import { Image } from 'expo-image';
import { View, StyleSheet, Text, ViewStyle } from 'react-native';
import colors from '@/constants/colors';

interface AvatarProps {
  source?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  name?: string;
  style?: ViewStyle;
  borderColor?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  source,
  size = 'md',
  name,
  style,
  borderColor,
}) => {
  const getInitials = (name: string) => {
    if (!name) return '';
    const nameParts = name.split(' ');
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    return (
      nameParts[0].charAt(0).toUpperCase() +
      nameParts[nameParts.length - 1].charAt(0).toUpperCase()
    );
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'xs':
        return { width: 24, height: 24, fontSize: 10 };
      case 'sm':
        return { width: 32, height: 32, fontSize: 12 };
      case 'md':
        return { width: 40, height: 40, fontSize: 16 };
      case 'lg':
        return { width: 56, height: 56, fontSize: 20 };
      case 'xl':
        return { width: 80, height: 80, fontSize: 28 };
      default:
        return { width: 40, height: 40, fontSize: 16 };
    }
  };

  const sizeStyle = getSizeStyle();

  return (
    <View
      style={[
        styles.container,
        {
          width: sizeStyle.width,
          height: sizeStyle.height,
          borderColor: borderColor || colors.primary,
        },
        style,
      ]}
    >
      {source ? (
        <Image
          source={source}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
      ) : name ? (
        <Text
          style={[
            styles.initials,
            { fontSize: sizeStyle.fontSize },
          ]}
        >
          {getInitials(name)}
        </Text>
      ) : (
        <View style={styles.placeholder} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 9999,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    borderWidth: 2,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  initials: {
    color: colors.white,
    fontWeight: '600',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.darkGray,
  },
});
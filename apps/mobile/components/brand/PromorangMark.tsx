import { Image, type ImageStyle, type StyleProp } from 'react-native';

import promorangMark from '../../assets/images/promorang-mark.png';

type PromorangMarkProps = {
  size?: number;
  style?: StyleProp<ImageStyle>;
};

export function PromorangMark({ size = 36, style }: PromorangMarkProps) {
  return (
    <Image
      source={promorangMark}
      accessibilityLabel="PROMORANG"
      resizeMode="contain"
      style={[{ width: size, height: size }, style]}
    />
  );
}

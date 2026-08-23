import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

type ResponsivePressableProps = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle> | ((state: { pressed: boolean }) => StyleProp<ViewStyle>);
};

const DEFAULT_HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 };

export function ResponsivePressable({ style, hitSlop = DEFAULT_HIT_SLOP, ...props }: ResponsivePressableProps) {
  return (
    <Pressable
      {...props}
      hitSlop={hitSlop}
      style={(state) => [
        typeof style === 'function' ? style(state) : style,
        state.pressed && !props.disabled ? styles.pressed : null,
      ]}
    />
  );
}

const styles = {
  pressed: { opacity: 0.88, transform: [{ scale: 0.97 }] },
} satisfies Record<string, ViewStyle>;

import type { ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';

type MapViewProps = {
  children?: ReactNode;
  style?: ViewStyle;
};

export default function MapView({ children, style }: MapViewProps) {
  return <View style={style}>{children}</View>;
}

export function Marker() {
  return null;
}

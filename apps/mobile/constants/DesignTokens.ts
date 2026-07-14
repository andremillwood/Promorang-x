/**
 * Promorang mobile design tokens.
 * Mirrors DESIGN.md: cinematic black, charcoal glass, restrained orange movement.
 */
export const Colors = {
  primary: '#FF6A1A',
  primaryDark: '#D94B00',
  secondary: '#151515',
  accent: '#FFB067',
  black: '#080808',
  white: '#F7F5F2',
  gray: {
    50: '#F7F5F2',
    100: '#ECE9E4',
    200: '#D5D1CB',
    300: '#B5B0A9',
    400: '#918C85',
    500: '#716D67',
    600: '#54514D',
    700: '#393735',
    800: '#242321',
    900: '#171716',
    950: '#0D0D0C',
  },
  success: '#67C587',
  error: '#EF625B',
  green: '#67C587',
  red: '#EF625B',
  warning: '#F2B84B',
  info: '#65A7E8',
  purple: '#A58AE8',
  ambientWash: 'rgba(255, 106, 26, 0.08)',
  glass: 'rgba(24, 24, 23, 0.92)',
  darkGlass: 'rgba(12, 12, 12, 0.86)',
  border: 'rgba(255, 255, 255, 0.10)',
};

export const Typography = {
  families: { serif: 'System', sans: 'System', mono: 'SpaceMono' },
  sizes: { xs: 11, sm: 13, base: 15, lg: 18, xl: 21, '2xl': 26, '3xl': 32, '4xl': 40 },
  weights: { light: '300', regular: '400', medium: '500', semibold: '600', bold: '700', heavy: '900' },
} as const;

export const Spacing = { container: 18, xs: 4, sm: 8, md: 14, lg: 22, xl: 30, '2xl': 44 };
export const BorderRadius = { sm: 6, md: 10, lg: 14, xl: 18, '2xl': 26, full: 9999 };
export const Shadows = {
  soft: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.24, shadowRadius: 12, elevation: 3 },
  medium: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.34, shadowRadius: 24, elevation: 7 },
};

export const vibecodeColors = {
  primary: {
    50: '#FFF5F0',
    100: '#FFE6D6',
    200: '#FFC7A8',
    300: '#FFA77A',
    400: '#FF884C',
    500: '#FF6B00',
    600: '#CC5600',
    700: '#994000',
    800: '#662B00',
    900: '#331500'
  },
  secondary: {
    50: '#F0F0FF',
    100: '#E0E0FF',
    200: '#C2C1FF',
    300: '#A3A1FF',
    400: '#8582FF',
    500: '#6C63FF',
    600: '#4D42FF',
    700: '#3A30CC',
    800: '#282499',
    900: '#151866'
  }
};

export const surfaceTokens = {
  light: {
    background: '#FAFBFC',
    card: '#FFFFFF'
  },
  dark: {
    background: '#0D0D0D',
    card: '#141414'
  },
  black: {
    background: '#000000',
    card: '#080808'
  }
};

export type MotionToken = {
  duration: number;
  easing: string;
};

export const motionTokens: Record<string, MotionToken> = {
  quick: { duration: 150, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
  standard: { duration: 250, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
  expressive: { duration: 450, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }
};

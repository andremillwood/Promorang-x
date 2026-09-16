// Legacy palette retained for existing consumers. New product UI should prefer
// promorangPrimitives + promorangSemantic below.
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

/**
 * PROMORANG Product Design System 01
 *
 * Primitive tokens are raw values. Product components should generally consume
 * semantic tokens instead of reaching into this object directly.
 */
export const promorangPrimitives = {
  color: {
    ink950: '#0B0B0C',
    ink900: '#101011',
    ink800: '#151516',
    ink700: '#202022',
    paper50: '#FFF9EC',
    paper100: '#F6ECD8',
    paper300: '#D8C8AA',
    signal500: '#FF5500',
    signal400: '#FF7A33',
    amber: '#F6D48A',
    violet: '#B5A2FF',
    cyan: '#64D8E8',
    green: '#70D7A0',
    white: '#FFFFFF'
  },
  space: {
    4: 4,
    8: 8,
    12: 12,
    16: 16,
    20: 20,
    24: 24,
    32: 32,
    40: 40,
    48: 48,
    64: 64
  },
  radius: {
    8: 8,
    12: 12,
    16: 16,
    20: 20,
    24: 24,
    32: 32
  },
  opacity: {
    40: 0.4,
    60: 0.6,
    80: 0.8,
    100: 1
  }
} as const;

/**
 * Semantic roles are the contract between product intent and visual output.
 * Names describe why a value exists, not merely what color it happens to be.
 */
export const promorangSemantic = {
  surface: {
    canvas: promorangPrimitives.color.ink950,
    raised: promorangPrimitives.color.ink800,
    soft: promorangPrimitives.color.ink900,
    objectPaper: promorangPrimitives.color.paper100
  },
  text: {
    primary: promorangPrimitives.color.white,
    secondary: 'rgba(255,255,255,0.60)',
    muted: 'rgba(255,255,255,0.40)',
    onPaper: '#1A120C'
  },
  action: {
    primary: promorangPrimitives.color.signal500,
    primaryText: '#050505',
    secondary: 'rgba(255,255,255,0.08)'
  },
  signal: {
    live: promorangPrimitives.color.green,
    reward: promorangPrimitives.color.amber,
    collectible: promorangPrimitives.color.violet,
    info: promorangPrimitives.color.cyan
  },
  border: {
    quiet: 'rgba(255,255,255,0.10)',
    active: 'rgba(255,85,0,0.40)',
    paper: 'rgba(26,18,12,0.14)'
  },
  layout: {
    pageGutter: promorangPrimitives.space[20],
    sectionGap: promorangPrimitives.space[48],
    objectGap: promorangPrimitives.space[16]
  },
  radius: {
    object: promorangPrimitives.radius[24],
    card: promorangPrimitives.radius[20],
    control: 999
  }
} as const;

export const promorangTypography = {
  utility: {
    family: '"DM Sans", system-ui, sans-serif',
    weights: { regular: 400, medium: 500, semibold: 600, bold: 700 }
  },
  editorial: {
    family: '"Fraunces", Georgia, serif',
    weights: { regular: 400, semibold: 600, bold: 700 }
  },
  mono: {
    family: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
  }
} as const;

export type MotionToken = {
  duration: number;
  easing: string;
};

export const motionTokens: Record<string, MotionToken> = {
  quick: { duration: 150, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
  standard: { duration: 250, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
  expressive: { duration: 450, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }
};

export const promorangDesignLaws = [
  'one-move',
  'objects-over-cards',
  'world-over-dashboard',
  'utility-is-quiet'
] as const;

export type PromorangDesignLaw = (typeof promorangDesignLaws)[number];

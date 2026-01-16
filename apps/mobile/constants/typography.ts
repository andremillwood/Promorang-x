/**
 * Typography scale for the Promorang mobile application.
 * Aligned with the web design system.
 */

export const typography = {
    // Font Sizes
    size: {
        xs: 12,
        sm: 14,
        base: 16,
        lg: 18,
        xl: 20,
        '2xl': 24,
        '3xl': 30,
        '4xl': 36,
    },

    // Line Heights
    lineHeight: {
        tight: 1.25,
        snug: 1.375,
        normal: 1.5,
        relaxed: 1.625,
        loose: 2,
    },

    // Font Weights
    weight: {
        normal: '400' as const,
        medium: '500' as const,
        semibold: '600' as const,
        bold: '700' as const,
        extrabold: '800' as const,
        black: '900' as const,
    },

    // Predefined Styles
    presets: {
        h1: {
            fontSize: 30,
            fontWeight: '800' as const,
            lineHeight: 36,
        },
        h2: {
            fontSize: 24,
            fontWeight: '700' as const,
            lineHeight: 32,
        },
        h3: {
            fontSize: 20,
            fontWeight: '700' as const,
            lineHeight: 28,
        },
        bodyLarge: {
            fontSize: 18,
            fontWeight: '400' as const,
            lineHeight: 26,
        },
        body: {
            fontSize: 16,
            fontWeight: '400' as const,
            lineHeight: 24,
        },
        bodySmall: {
            fontSize: 14,
            fontWeight: '400' as const,
            lineHeight: 20,
        },
        caption: {
            fontSize: 12,
            fontWeight: '500' as const,
            lineHeight: 16,
        },
    }
};

export default typography;

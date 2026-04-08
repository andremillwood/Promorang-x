/**
 * DesignTokens.ts
 * 
 * Centralized theme tokens for the Promorang mobile experience.
 * Inspired by Airbnb's clarity, Pinterest's visual density, and high-end glassmorphism.
 */

export const Colors = {
    // Brand Palette
    primary: "#EAB308", // Dynamic Gold
    primaryDark: "#CA8A04",
    secondary: "#0F172A", // Deep Slate / Midnight
    accent: "#EC4899", // Vibrant Pink for highlights

    // Neutral Palette
    black: "#000000",
    white: "#FFFFFF",
    gray: {
        50: "#F8FAFC",
        100: "#F1F5F9",
        200: "#E2E8F0",
        300: "#CBD5E1",
        400: "#94A3B8",
        500: "#64748B",
        600: "#475569",
        700: "#334155",
        800: "#1E293B",
        900: "#0F172A",
        950: "#020617",
    },

    // Semantic
    success: "#10B981",
    error: "#EF4444",
    warning: "#F59E0B",
    info: "#3B82F6",

    // Specialized Surfaces
    ambientWash: "rgba(234, 179, 8, 0.05)",
    glass: "rgba(255, 255, 255, 0.7)",
    darkGlass: "rgba(15, 23, 42, 0.8)",
    border: "rgba(226, 232, 240, 0.5)",
};

export const Typography = {
    // Font Families (Assuming system fonts or loaded Inter/Serif)
    families: {
        serif: "System", // TODO: Load a premium Serif font like 'Playfair Display'
        sans: "System",  // Inter/System Sans
        mono: "SpaceMono",
    },

    // Font Sizes
    sizes: {
        xs: 12,
        sm: 14,
        base: 16,
        lg: 18,
        xl: 20,
        "2xl": 24,
        "3xl": 30,
        "4xl": 36,
    },

    // Weights
    weights: {
        light: "300",
        regular: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
        heavy: "900",
    },
};

export const Spacing = {
    container: 20,
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    "2xl": 48,
};

export const BorderRadius = {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    "2xl": 24,
    full: 9999,
};

export const Shadows = {
    soft: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    medium: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 4,
    },
};

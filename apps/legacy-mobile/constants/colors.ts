const common = {
  primary: "#FF6600",
  success: "#4CAF50",
  error: "#F44336",
  warning: "#FFC107",
  info: "#2196F3",
  transparent: "transparent",
  overlay: "rgba(0, 0, 0, 0.5)",
};

export const theme = {
  light: {
    ...common,
    background: "#F2F2F2",
    surface: "#FFFFFF",
    text: "#000000",
    textSecondary: "#8A8A8A",
    border: "#E5E5E5",
    card: "#FFFFFF",
  },
  dark: {
    ...common,
    background: "#121212",
    surface: "#1E1E1E",
    text: "#FFFFFF",
    textSecondary: "#AAAAAA",
    border: "#333333",
    card: "#252525",
  }
};

// Legacy support for direct color access (defaults to light)
const colors = {
  ...theme.light,
  gray: theme.light.background,
  darkGray: theme.light.textSecondary,
  lightGray: theme.light.border,
  black: theme.light.text,
  white: theme.light.surface,
};

export default colors;
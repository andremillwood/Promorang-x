const tintColorLight = '#ff6600'; // Promorang Orange
const tintColorDark = '#ff751a'; // Promorang Orange (Dark Mode)

export default {
  light: {
    text: '#141414',
    background: '#fbfaf6', // Warm cream
    tint: tintColorLight,
    tabIconDefault: '#888888', // Increased contrast against light background
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#f4f3f0',
    background: '#0f0f0f',
    tint: tintColorDark,
    tabIconDefault: '#888888', // Increased contrast against dark background
    tabIconSelected: tintColorDark,
  },
};

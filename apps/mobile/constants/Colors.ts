const tintColorLight = '#ff6600'; // Promorang Orange
const tintColorDark = '#ff751a'; // Promorang Orange (Dark Mode)

export default {
  light: {
    text: '#141414',
    background: '#fbfaf6', // Warm cream
    tint: tintColorLight,
    tabIconDefault: '#595959', // Enhanced contrast (5.2:1) against light cream
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#f4f3f0',
    background: '#0f0f0f',
    tint: tintColorDark,
    tabIconDefault: '#a3a3a3', // Enhanced contrast (5.5:1) against dark background
    tabIconSelected: tintColorDark,
  },
};

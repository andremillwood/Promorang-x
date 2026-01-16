import { useColorScheme } from 'react-native';
import { theme } from '@/constants/colors';
import { useThemeStore } from '@/store/themeStore';

/**
 * Hook to get the current theme colors based on the user preference or system color scheme.
 */
export const useThemeColors = () => {
    const systemColorScheme = useColorScheme();
    const { themeMode } = useThemeStore();

    // Determine the actual scheme to use
    const activeScheme = themeMode === 'system' ? systemColorScheme : themeMode;

    // Default to light theme if activeScheme is null or undefined
    const currentTheme = activeScheme === 'dark' ? theme.dark : theme.light;

    return currentTheme;
};

export default useThemeColors;

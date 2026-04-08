import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Haptic feedback utilities for micro-interactions
 * Inspired by Duolingo's satisfying feedback on every action
 */

export const haptics = {
    // Light tap - for button presses, selections
    light: async () => {
        if (Platform.OS !== 'web') {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
    },

    // Medium tap - for confirmations, toggles
    medium: async () => {
        if (Platform.OS !== 'web') {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
    },

    // Heavy tap - for important actions, completions
    heavy: async () => {
        if (Platform.OS !== 'web') {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }
    },

    // Selection changed - for pickers, sliders
    selection: async () => {
        if (Platform.OS !== 'web') {
            await Haptics.selectionAsync();
        }
    },

    // Success - for completed tasks, achievements
    success: async () => {
        if (Platform.OS !== 'web') {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
    },

    // Warning - for alerts, confirmations needed
    warning: async () => {
        if (Platform.OS !== 'web') {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
    },

    // Error - for failed actions, validation errors
    error: async () => {
        if (Platform.OS !== 'web') {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
    },

    // Celebration pattern - for big achievements (like Duolingo's streak celebration)
    celebrate: async () => {
        if (Platform.OS !== 'web') {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setTimeout(async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }, 100);
            setTimeout(async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }, 200);
            setTimeout(async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            }, 300);
        }
    },

    // Coin/gem collect pattern - for earning rewards
    collect: async () => {
        if (Platform.OS !== 'web') {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setTimeout(async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }, 50);
        }
    },

    // Level up pattern
    levelUp: async () => {
        if (Platform.OS !== 'web') {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            setTimeout(async () => {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }, 150);
        }
    },
};

export default haptics;

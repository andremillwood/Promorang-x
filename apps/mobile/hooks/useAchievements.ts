import { useState, useCallback } from 'react';
import { AchievementType } from '@/components/ui/AchievementToast';

interface Achievement {
    id: string;
    type: AchievementType;
    title: string;
    subtitle?: string;
    value?: string | number;
}

interface UseAchievementsReturn {
    currentAchievement: Achievement | null;
    showAchievement: (achievement: Omit<Achievement, 'id'>) => void;
    hideAchievement: () => void;
    showConfetti: boolean;
    triggerConfetti: () => void;
}

export function useAchievements(): UseAchievementsReturn {
    const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
    const [showConfetti, setShowConfetti] = useState(false);

    const showAchievement = useCallback((achievement: Omit<Achievement, 'id'>) => {
        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setCurrentAchievement({ ...achievement, id });

        // Auto-trigger confetti for big achievements
        if (['level_up', 'first_drop', 'leaderboard'].includes(achievement.type)) {
            setShowConfetti(true);
        }
    }, []);

    const hideAchievement = useCallback(() => {
        setCurrentAchievement(null);
        setShowConfetti(false);
    }, []);

    const triggerConfetti = useCallback(() => {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
    }, []);

    return {
        currentAchievement,
        showAchievement,
        hideAchievement,
        showConfetti,
        triggerConfetti,
    };
}

// Pre-built achievement templates for common actions
export const ACHIEVEMENT_TEMPLATES = {
    dropComplete: (gemsEarned: number) => ({
        type: 'drop_complete' as AchievementType,
        title: 'Drop Complete!',
        subtitle: 'Great job completing this task',
        value: `+${gemsEarned} 💎`,
    }),

    couponEarned: (couponName: string) => ({
        type: 'coupon_earned' as AchievementType,
        title: 'Coupon Unlocked!',
        subtitle: couponName,
    }),

    firstDrop: () => ({
        type: 'first_drop' as AchievementType,
        title: '🎉 First Drop Complete!',
        subtitle: 'Welcome to the Promorang economy',
    }),

    streakMilestone: (days: number) => ({
        type: 'streak' as AchievementType,
        title: `${days} Day Streak!`,
        subtitle: 'Keep it going for bonus rewards',
        value: `🔥 ${days}`,
    }),

    levelUp: (newLevel: string) => ({
        type: 'level_up' as AchievementType,
        title: 'Level Up!',
        subtitle: `You've reached ${newLevel}`,
    }),

    referralSuccess: (userName: string) => ({
        type: 'referral' as AchievementType,
        title: 'Referral Success!',
        subtitle: `${userName} joined using your code`,
    }),

    gemsEarned: (amount: number, source: string) => ({
        type: 'gems_earned' as AchievementType,
        title: `+${amount} Gems Earned`,
        subtitle: source,
        value: `💎 ${amount}`,
    }),

    leaderboardRank: (rank: number) => ({
        type: 'leaderboard' as AchievementType,
        title: 'New Rank Achieved!',
        subtitle: `You're now #${rank} on the leaderboard`,
        value: `#${rank}`,
    }),
};

export default useAchievements;

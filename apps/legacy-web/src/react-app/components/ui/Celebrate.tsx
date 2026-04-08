/**
 * Celebrate - Reusable Confetti Celebration Component
 * 
 * Triggers confetti bursts for milestone moments like:
 * - First deal claimed
 * - First proof posted
 * - Streak milestones (7, 14, 30 days)
 * - Draw wins
 * - Rank ups
 * 
 * Usage:
 * <Celebrate trigger={shouldCelebrate} variant="confetti" />
 */

import { useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';

export type CelebrationType =
    | 'confetti'      // Standard confetti burst
    | 'fireworks'     // Multiple bursts like fireworks
    | 'sparkles'      // Subtle star particles
    | 'coins'         // Gold coin-like particles
    | 'streak';       // Flame-colored celebration

interface CelebrateProps {
    /** When true, triggers the celebration animation */
    trigger: boolean;
    /** Type of celebration effect */
    variant?: CelebrationType;
    /** Duration in ms (default: 3000) */
    duration?: number;
    /** Callback when celebration ends */
    onComplete?: () => void;
}

// Promorang brand colors for confetti
const BRAND_COLORS = ['#fb923c', '#f97316', '#ea580c', '#c2410c', '#fbbf24', '#f59e0b'];
const PURPLE_COLORS = ['#a855f7', '#9333ea', '#7c3aed', '#6d28d9', '#c084fc'];
const EMERALD_COLORS = ['#10b981', '#059669', '#047857', '#34d399', '#6ee7b7'];
const GOLD_COLORS = ['#fbbf24', '#f59e0b', '#d97706', '#fcd34d', '#fef3c7'];

export default function Celebrate({
    trigger,
    variant = 'confetti',
    duration = 3000,
    onComplete
}: CelebrateProps) {

    const fireConfetti = useCallback(() => {
        const end = Date.now() + duration;

        switch (variant) {
            case 'fireworks':
                // Multiple bursts over time
                const fireworksInterval = setInterval(() => {
                    if (Date.now() > end) {
                        clearInterval(fireworksInterval);
                        onComplete?.();
                        return;
                    }

                    confetti({
                        startVelocity: 30,
                        spread: 360,
                        ticks: 60,
                        zIndex: 9999,
                        particleCount: 50,
                        origin: {
                            x: Math.random(),
                            y: Math.random() - 0.2,
                        },
                        colors: BRAND_COLORS,
                    });
                }, 250);
                break;

            case 'sparkles':
                // Subtle star burst
                confetti({
                    particleCount: 30,
                    spread: 60,
                    origin: { y: 0.6 },
                    colors: PURPLE_COLORS,
                    ticks: 200,
                    gravity: 0.8,
                    scalar: 0.8,
                    shapes: ['star'],
                    zIndex: 9999,
                });
                setTimeout(() => onComplete?.(), duration);
                break;

            case 'coins':
                // Gold coin-like burst
                confetti({
                    particleCount: 50,
                    spread: 70,
                    origin: { y: 0.5 },
                    colors: GOLD_COLORS,
                    ticks: 300,
                    gravity: 1.2,
                    scalar: 1.2,
                    shapes: ['circle'],
                    zIndex: 9999,
                });
                setTimeout(() => onComplete?.(), duration);
                break;

            case 'streak':
                // Flame-colored side cannons
                const streakColors = ['#fb923c', '#f97316', '#ea580c', '#ef4444', '#dc2626'];

                // Left cannon
                confetti({
                    particleCount: 40,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0, y: 0.6 },
                    colors: streakColors,
                    zIndex: 9999,
                });

                // Right cannon
                confetti({
                    particleCount: 40,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1, y: 0.6 },
                    colors: streakColors,
                    zIndex: 9999,
                });

                setTimeout(() => onComplete?.(), duration);
                break;

            case 'confetti':
            default:
                // Classic confetti burst from center
                const confettiEnd = Date.now() + duration;

                (function frame() {
                    confetti({
                        particleCount: 3,
                        angle: 60,
                        spread: 55,
                        origin: { x: 0, y: 0.7 },
                        colors: [...BRAND_COLORS, ...EMERALD_COLORS],
                        zIndex: 9999,
                    });

                    confetti({
                        particleCount: 3,
                        angle: 120,
                        spread: 55,
                        origin: { x: 1, y: 0.7 },
                        colors: [...BRAND_COLORS, ...EMERALD_COLORS],
                        zIndex: 9999,
                    });

                    if (Date.now() < confettiEnd) {
                        requestAnimationFrame(frame);
                    } else {
                        onComplete?.();
                    }
                })();
                break;
        }
    }, [variant, duration, onComplete]);

    useEffect(() => {
        if (trigger) {
            fireConfetti();
        }
    }, [trigger, fireConfetti]);

    // This component doesn't render anything visible
    // The confetti is rendered on a canvas overlay
    return null;
}

/**
 * Hook for programmatic celebration control
 * 
 * Usage:
 * const { celebrate, isCelebrating } = useCelebration();
 * celebrate('fireworks');
 */
export function useCelebration() {
    const celebrate = useCallback((variant: CelebrationType = 'confetti', duration = 3000) => {
        const end = Date.now() + duration;

        switch (variant) {
            case 'fireworks':
                const interval = setInterval(() => {
                    if (Date.now() > end) {
                        clearInterval(interval);
                        return;
                    }
                    confetti({
                        startVelocity: 30,
                        spread: 360,
                        ticks: 60,
                        zIndex: 9999,
                        particleCount: 50,
                        origin: { x: Math.random(), y: Math.random() - 0.2 },
                        colors: BRAND_COLORS,
                    });
                }, 250);
                break;

            case 'sparkles':
                confetti({
                    particleCount: 30,
                    spread: 60,
                    origin: { y: 0.6 },
                    colors: PURPLE_COLORS,
                    ticks: 200,
                    scalar: 0.8,
                    shapes: ['star'],
                    zIndex: 9999,
                });
                break;

            case 'coins':
                confetti({
                    particleCount: 50,
                    spread: 70,
                    origin: { y: 0.5 },
                    colors: GOLD_COLORS,
                    ticks: 300,
                    gravity: 1.2,
                    scalar: 1.2,
                    shapes: ['circle'],
                    zIndex: 9999,
                });
                break;

            case 'streak':
                confetti({
                    particleCount: 40,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0, y: 0.6 },
                    colors: ['#fb923c', '#f97316', '#ea580c', '#ef4444'],
                    zIndex: 9999,
                });
                confetti({
                    particleCount: 40,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1, y: 0.6 },
                    colors: ['#fb923c', '#f97316', '#ea580c', '#ef4444'],
                    zIndex: 9999,
                });
                break;

            case 'confetti':
            default:
                (function frame() {
                    confetti({
                        particleCount: 3,
                        angle: 60,
                        spread: 55,
                        origin: { x: 0, y: 0.7 },
                        colors: [...BRAND_COLORS, ...EMERALD_COLORS],
                        zIndex: 9999,
                    });
                    confetti({
                        particleCount: 3,
                        angle: 120,
                        spread: 55,
                        origin: { x: 1, y: 0.7 },
                        colors: [...BRAND_COLORS, ...EMERALD_COLORS],
                        zIndex: 9999,
                    });
                    if (Date.now() < end) {
                        requestAnimationFrame(frame);
                    }
                })();
                break;
        }
    }, []);

    return { celebrate };
}

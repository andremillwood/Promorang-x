/**
 * PageTransition - Smooth Page Entry Animation Wrapper
 * 
 * Wraps page content with a fade-in slide-up animation
 * for a more polished page load experience.
 * 
 * Usage:
 * <PageTransition>
 *   <YourPageContent />
 * </PageTransition>
 */

import type { ReactNode } from 'react';

interface PageTransitionProps {
    children: ReactNode;
    /** Animation variant */
    variant?: 'fade' | 'slide-up' | 'slide-left' | 'scale';
    /** Delay before animation starts (ms) */
    delay?: number;
    /** Duration of animation (ms) */
    duration?: number;
    /** Additional className */
    className?: string;
}

export default function PageTransition({
    children,
    variant = 'slide-up',
    delay = 0,
    duration = 400,
    className = ''
}: PageTransitionProps) {

    const getAnimationClass = () => {
        switch (variant) {
            case 'fade':
                return 'animate-fade-in';
            case 'slide-up':
                return 'animate-slide-up';
            case 'slide-left':
                return 'animate-slide-left';
            case 'scale':
                return 'animate-pop-in';
            default:
                return 'animate-slide-up';
        }
    };

    return (
        <div
            className={`${getAnimationClass()} ${className}`}
            style={{
                animationDuration: `${duration}ms`,
                animationDelay: `${delay}ms`,
                animationFillMode: 'both'
            }}
        >
            {children}
        </div>
    );
}

/**
 * Staggered children animation wrapper
 * Each child animates in sequence with a delay
 */
interface StaggeredTransitionProps {
    children: ReactNode[];
    /** Base delay between children (ms) */
    stagger?: number;
    /** Animation variant */
    variant?: 'fade' | 'slide-up' | 'slide-left' | 'scale';
    /** Additional className for container */
    className?: string;
}

export function StaggeredTransition({
    children,
    stagger = 100,
    variant = 'slide-up',
    className = ''
}: StaggeredTransitionProps) {
    return (
        <div className={className}>
            {children.map((child, index) => (
                <PageTransition
                    key={index}
                    variant={variant}
                    delay={index * stagger}
                >
                    {child}
                </PageTransition>
            ))}
        </div>
    );
}

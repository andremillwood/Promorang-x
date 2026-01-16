/**
 * SkeletonShimmer - Branded Loading Skeleton Component
 * 
 * Replaces generic gray pulse with a branded gradient shimmer
 * that feels more polished and on-brand.
 * 
 * Usage:
 * <SkeletonShimmer className="h-48 rounded-xl" />
 * <SkeletonShimmer variant="card" />
 * <SkeletonShimmer variant="text" lines={3} />
 */

// Simple classname merge utility
const cn = (...classes: (string | undefined | null | false)[]) =>
    classes.filter(Boolean).join(' ');

export type SkeletonVariant = 'default' | 'card' | 'text' | 'avatar' | 'button' | 'headline';

interface SkeletonShimmerProps {
    className?: string;
    variant?: SkeletonVariant;
    /** Number of lines for text variant */
    lines?: number;
    /** Whether to animate (default: true) */
    animate?: boolean;
}

export default function SkeletonShimmer({
    className,
    variant = 'default',
    lines = 1,
    animate = true
}: SkeletonShimmerProps) {
    const baseClasses = cn(
        'bg-pr-surface-3 rounded-lg',
        animate && 'skeleton-shimmer',
        className
    );

    switch (variant) {
        case 'card':
            return (
                <div className={cn('rounded-2xl overflow-hidden', className)}>
                    {/* Card image area */}
                    <div className={cn('h-32 w-full', baseClasses)} />
                    {/* Card content */}
                    <div className="p-4 space-y-3 bg-pr-surface-card">
                        <div className={cn('h-5 w-3/4', baseClasses)} />
                        <div className={cn('h-4 w-1/2', baseClasses)} />
                    </div>
                </div>
            );

        case 'text':
            return (
                <div className={cn('space-y-2', className)}>
                    {Array.from({ length: lines }).map((_, i) => (
                        <div
                            key={i}
                            className={cn(
                                'h-4',
                                baseClasses,
                                // Last line is shorter for natural text appearance
                                i === lines - 1 ? 'w-2/3' : 'w-full'
                            )}
                            style={{ animationDelay: `${i * 0.1}s` }}
                        />
                    ))}
                </div>
            );

        case 'avatar':
            return (
                <div className={cn('w-12 h-12 rounded-full', baseClasses, className)} />
            );

        case 'button':
            return (
                <div className={cn('h-10 w-24 rounded-lg', baseClasses, className)} />
            );

        case 'headline':
            return (
                <div className={cn('space-y-4', className)}>
                    {/* Hero area */}
                    <div className={cn('h-48 w-full rounded-2xl', baseClasses)} />
                    {/* Stats row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className={cn('h-32 rounded-xl', baseClasses)} />
                        <div className={cn('h-32 rounded-xl', baseClasses)} style={{ animationDelay: '0.1s' }} />
                    </div>
                    {/* Draw card */}
                    <div className={cn('h-40 rounded-xl', baseClasses)} style={{ animationDelay: '0.2s' }} />
                </div>
            );

        default:
            return <div className={baseClasses} />;
    }
}

/**
 * Pre-composed skeleton layouts for common pages
 */

export function TodaySkeleton() {
    return (
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <SkeletonShimmer className="h-8 w-24" />
                    <SkeletonShimmer className="h-4 w-32" />
                </div>
                <SkeletonShimmer variant="avatar" className="w-10 h-10" />
            </div>

            {/* Headline card */}
            <SkeletonShimmer className="h-48 w-full rounded-2xl" />

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-4">
                <SkeletonShimmer className="h-32 rounded-xl" />
                <SkeletonShimmer className="h-32 rounded-xl" />
            </div>

            {/* Draw card */}
            <SkeletonShimmer className="h-40 w-full rounded-2xl" />

            {/* Opportunity cards */}
            <div className="space-y-3">
                <SkeletonShimmer className="h-5 w-40" />
                <SkeletonShimmer className="h-16 rounded-xl" />
                <SkeletonShimmer className="h-16 rounded-xl" />
                <SkeletonShimmer className="h-16 rounded-xl" />
            </div>
        </div>
    );
}

export function CardSkeleton() {
    return <SkeletonShimmer variant="card" />;
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="flex items-center gap-4 p-4 rounded-xl bg-pr-surface-card border border-pr-border"
                >
                    <SkeletonShimmer variant="avatar" />
                    <div className="flex-1 space-y-2">
                        <SkeletonShimmer className="h-5 w-3/4" />
                        <SkeletonShimmer className="h-4 w-1/2" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function ProfileSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <SkeletonShimmer variant="avatar" className="w-20 h-20" />
                <div className="flex-1 space-y-2">
                    <SkeletonShimmer className="h-6 w-32" />
                    <SkeletonShimmer className="h-4 w-24" />
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <SkeletonShimmer className="h-20 rounded-xl" />
                <SkeletonShimmer className="h-20 rounded-xl" />
                <SkeletonShimmer className="h-20 rounded-xl" />
            </div>

            {/* Content */}
            <SkeletonShimmer variant="text" lines={4} />
        </div>
    );
}

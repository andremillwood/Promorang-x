import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
    title: string;
    value: string | number;
    change?: {
        value: number;
        isPositive: boolean;
        formatted: string;
    };
    icon?: React.ReactNode;
    subtitle?: string;
    tooltip?: string;
    loading?: boolean;
    className?: string;
}

import { InfoTooltip } from '@/components/ui/info-tooltip';

/**
 * Reusable metric card component for analytics dashboards
 */
export function MetricCard({
    title,
    value,
    change,
    icon,
    subtitle,
    tooltip,
    loading = false,
    className,
}: MetricCardProps) {
    if (loading) {
        return (
            <div className={cn('rounded-xl border border-border bg-card p-5 md:p-6', className)}>
                <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-muted rounded w-1/2" />
                    <div className="h-8 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/3" />
                </div>
            </div>
        );
    }

    return (
        <div className={cn('rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-lg md:p-6', className)}>
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        {tooltip && <InfoTooltip content={tooltip} />}
                    </div>
                    <p className="text-2xl font-bold tracking-tight sm:text-3xl">{value}</p>

                    {change && (
                        <div className="flex items-center gap-1 mt-2">
                            {change.isPositive ? (
                                <TrendingUp className="h-4 w-4 text-green-500" />
                            ) : change.value === 0 ? (
                                <Minus className="h-4 w-4 text-muted-foreground" />
                            ) : (
                                <TrendingDown className="h-4 w-4 text-red-500" />
                            )}
                            <span
                                className={cn(
                                    'text-sm font-medium',
                                    change.isPositive ? 'text-green-500' : change.value === 0 ? 'text-muted-foreground' : 'text-red-500'
                                )}
                            >
                                {change.formatted}
                            </span>
                            {subtitle && <span className="text-sm text-muted-foreground ml-1">{subtitle}</span>}
                        </div>
                    )}

                    {subtitle && !change && (
                        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
                    )}
                </div>

                {icon && (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary md:h-12 md:w-12">
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
}

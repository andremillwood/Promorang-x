/**
 * Shared utilities for analytics components
 * Formatting, calculations, and data transformations
 */

/**
 * Format currency values
 */
export const formatCurrency = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return '$0.00';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
};

/**
 * Format compact currency (e.g., $1.2K, $3.5M)
 */
export const formatCompactCurrency = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return '$0';

    const absValue = Math.abs(value);
    const sign = value < 0 ? '-' : '';

    if (absValue >= 1000000) {
        return `${sign}$${(absValue / 1000000).toFixed(1)}M`;
    }
    if (absValue >= 1000) {
        return `${sign}$${(absValue / 1000).toFixed(1)}K`;
    }
    return `${sign}$${absValue.toFixed(0)}`;
};

/**
 * Format percentage
 */
export const formatPercent = (value: number | null | undefined, decimals = 1): string => {
    if (value === null || value === undefined) return '0%';
    return `${value.toFixed(decimals)}%`;
};

/**
 * Format large numbers with K/M suffix
 */
export const formatCompactNumber = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return '0';

    const absValue = Math.abs(value);
    const sign = value < 0 ? '-' : '';

    if (absValue >= 1000000) {
        return `${sign}${(absValue / 1000000).toFixed(1)}M`;
    }
    if (absValue >= 1000) {
        return `${sign}${(absValue / 1000).toFixed(1)}K`;
    }
    return `${sign}${absValue.toFixed(0)}`;
};

/**
 * Calculate percentage change between two values
 */
export const calculatePercentChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
};

/**
 * Calculate growth rate
 */
export const calculateGrowthRate = (current: number, previous: number): {
    value: number;
    isPositive: boolean;
    formatted: string;
} => {
    const change = calculatePercentChange(current, previous);
    return {
        value: change,
        isPositive: change >= 0,
        formatted: `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`,
    };
};

/**
 * Format date for display
 */
export const formatDate = (date: string | Date): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(d);
};

/**
 * Format date range
 */
export const formatDateRange = (start: Date, end: Date): string => {
    const startStr = formatDate(start);
    const endStr = formatDate(end);
    return `${startStr} - ${endStr}`;
};

/**
 * Get preset date ranges
 */
export const getPresetDateRanges = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return {
        today: {
            label: 'Today',
            start: today,
            end: now,
        },
        last7Days: {
            label: 'Last 7 Days',
            start: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000),
            end: now,
        },
        last30Days: {
            label: 'Last 30 Days',
            start: new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000),
            end: now,
        },
        last90Days: {
            label: 'Last 90 Days',
            start: new Date(today.getTime() - 89 * 24 * 60 * 60 * 1000),
            end: now,
        },
        thisMonth: {
            label: 'This Month',
            start: new Date(now.getFullYear(), now.getMonth(), 1),
            end: now,
        },
        lastMonth: {
            label: 'Last Month',
            start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
            end: new Date(now.getFullYear(), now.getMonth(), 0),
        },
        thisYear: {
            label: 'This Year',
            start: new Date(now.getFullYear(), 0, 1),
            end: now,
        },
    };
};

/**
 * Export data to CSV
 */
export const exportToCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
        console.warn('No data to export');
        return;
    }

    // Get headers from first object
    const headers = Object.keys(data[0]);

    // Create CSV content
    const csvContent = [
        headers.join(','),
        ...data.map(row =>
            headers.map(header => {
                const value = row[header];
                // Escape commas and quotes
                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            }).join(',')
        ),
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

/**
 * Calculate moving average
 */
export const calculateMovingAverage = (data: number[], window: number): number[] => {
    const result: number[] = [];

    for (let i = 0; i < data.length; i++) {
        const start = Math.max(0, i - window + 1);
        const subset = data.slice(start, i + 1);
        const avg = subset.reduce((sum, val) => sum + val, 0) / subset.length;
        result.push(avg);
    }

    return result;
};

/**
 * Get trend direction
 */
export const getTrendDirection = (data: number[]): 'up' | 'down' | 'flat' => {
    if (data.length < 2) return 'flat';

    const first = data[0];
    const last = data[data.length - 1];

    if (last > first * 1.05) return 'up';
    if (last < first * 0.95) return 'down';
    return 'flat';
};

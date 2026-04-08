import {
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { formatCurrency, formatCompactNumber, formatPercent } from './utils';

interface PieChartProps {
    data: Array<{
        name: string;
        value: number;
        color?: string;
    }>;
    height?: number;
    formatValue?: 'currency' | 'number' | 'percent';
    showLegend?: boolean;
    innerRadius?: number;
}

const DEFAULT_COLORS = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
];

/**
 * Reusable pie/donut chart component
 */
export function PieChart({
    data,
    height = 300,
    formatValue = 'number',
    showLegend = true,
    innerRadius = 0,
}: PieChartProps) {
    const formatValueFn = (value: number) => {
        switch (formatValue) {
            case 'currency':
                return formatCurrency(value);
            case 'percent':
                return formatPercent(value);
            default:
                return formatCompactNumber(value);
        }
    };

    const total = data.reduce((sum, item) => sum + item.value, 0);

    const renderCustomLabel = ({
        cx,
        cy,
        midAngle,
        innerRadius,
        outerRadius,
        percent,
    }: any) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        if (percent < 0.05) return null; // Don't show label for small slices

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                className="text-xs font-semibold"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <ResponsiveContainer width="100%" height={height}>
            <RechartsPieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomLabel}
                    outerRadius={height / 3}
                    innerRadius={innerRadius}
                    fill="#8884d8"
                    dataKey="value"
                >
                    {data.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                        />
                    ))}
                </Pie>
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                    }}
                    formatter={(value: number) => formatValueFn(value)}
                />
                {showLegend && (
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value, entry: any) => {
                            const percentage = ((entry.payload.value / total) * 100).toFixed(1);
                            return `${value} (${percentage}%)`;
                        }}
                    />
                )}
            </RechartsPieChart>
        </ResponsiveContainer>
    );
}

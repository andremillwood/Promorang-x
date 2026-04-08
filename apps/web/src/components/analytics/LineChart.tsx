import {
    LineChart as RechartsLineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { formatCurrency, formatCompactNumber } from './utils';

interface LineChartProps {
    data: any[];
    xKey: string;
    yKeys: Array<{
        key: string;
        label: string;
        color: string;
    }>;
    height?: number;
    formatYAxis?: 'currency' | 'number' | 'percent';
    showLegend?: boolean;
    showGrid?: boolean;
}

/**
 * Reusable line chart component
 */
export function LineChart({
    data,
    xKey,
    yKeys,
    height = 300,
    formatYAxis = 'number',
    showLegend = true,
    showGrid = true,
}: LineChartProps) {
    const formatValue = (value: number) => {
        switch (formatYAxis) {
            case 'currency':
                return formatCurrency(value);
            case 'percent':
                return `${value}%`;
            default:
                return formatCompactNumber(value);
        }
    };

    return (
        <ResponsiveContainer width="100%" height={height}>
            <RechartsLineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
                <XAxis
                    dataKey={xKey}
                    className="text-xs text-muted-foreground"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis
                    className="text-xs text-muted-foreground"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={formatValue}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    formatter={(value: number) => formatValue(value)}
                />
                {showLegend && <Legend />}
                {yKeys.map((yKey) => (
                    <Line
                        key={yKey.key}
                        type="monotone"
                        dataKey={yKey.key}
                        stroke={yKey.color}
                        strokeWidth={2}
                        name={yKey.label}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                ))}
            </RechartsLineChart>
        </ResponsiveContainer>
    );
}

import {
    BarChart as RechartsBarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
} from 'recharts';
import { formatCurrency, formatCompactNumber } from './utils';

interface BarChartProps {
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
    layout?: 'vertical' | 'horizontal';
    colorByValue?: boolean;
}

/**
 * Reusable bar chart component
 */
export function BarChart({
    data,
    xKey,
    yKeys,
    height = 300,
    formatYAxis = 'number',
    showLegend = true,
    showGrid = true,
    layout = 'horizontal',
    colorByValue = false,
}: BarChartProps) {
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

    const getColorByValue = (value: number, index: number) => {
        const colors = [
            'hsl(var(--chart-1))',
            'hsl(var(--chart-2))',
            'hsl(var(--chart-3))',
            'hsl(var(--chart-4))',
            'hsl(var(--chart-5))',
        ];
        return colors[index % colors.length];
    };

    return (
        <ResponsiveContainer width="100%" height={height}>
            <RechartsBarChart
                data={data}
                layout={layout}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
                {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
                {layout === 'horizontal' ? (
                    <>
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
                    </>
                ) : (
                    <>
                        <XAxis
                            type="number"
                            className="text-xs text-muted-foreground"
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                            tickFormatter={formatValue}
                        />
                        <YAxis
                            dataKey={xKey}
                            type="category"
                            className="text-xs text-muted-foreground"
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        />
                    </>
                )}
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
                    <Bar
                        key={yKey.key}
                        dataKey={yKey.key}
                        fill={yKey.color}
                        name={yKey.label}
                        radius={[4, 4, 0, 0]}
                    >
                        {colorByValue && data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getColorByValue(entry[yKey.key], index)} />
                        ))}
                    </Bar>
                ))}
            </RechartsBarChart>
        </ResponsiveContainer>
    );
}

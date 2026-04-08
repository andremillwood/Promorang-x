import { Card } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface KPICardProps {
  title: string;
  value: string;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ReactNode;
  trend?: number[];
}

export function KPICard({ title, value, change, changeType, icon, trend }: KPICardProps) {
  const data = trend ? trend.map((val, i) => ({ value: val, i })) : [];
  
  return (
    <Card className="p-6 flex flex-col justify-between h-full relative overflow-hidden">
      <div className="flex items-start justify-between mb-4 z-10">
        <div className="p-2 bg-pr-surface-2 rounded-lg">
          {icon}
        </div>
        <div className={`flex items-center space-x-1 text-sm font-medium px-2 py-1 rounded-full ${
          changeType === 'increase' ? 'text-green-600 bg-green-50' : 
          changeType === 'decrease' ? 'text-red-600 bg-red-50' : 'text-gray-600 bg-gray-50'
        }`}>
          {changeType === 'increase' ? <ArrowUpRight className="w-3 h-3" /> : 
           changeType === 'decrease' ? <ArrowDownRight className="w-3 h-3" /> : null}
          <span>{Math.abs(change)}%</span>
        </div>
      </div>
      
      <div className="z-10">
        <h3 className="text-pr-text-2 text-sm font-medium">{title}</h3>
        <div className="text-2xl font-bold text-pr-text-1 mt-1">{value}</div>
      </div>

      {data.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-16 opacity-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="currentColor" 
                fill="currentColor" 
                className={changeType === 'increase' ? 'text-green-500' : 'text-red-500'} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}

export function TrendLine({ data, color = "#8884d8" }: { data: any[], color?: string }) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="name" hide />
          <YAxis hide />
          <Tooltip 
            contentStyle={{ backgroundColor: 'var(--pr-surface-card)', borderRadius: '8px', border: '1px solid var(--pr-border)' }}
            itemStyle={{ color: 'var(--pr-text-1)' }}
          />
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ActivityBreakdown({ data }: { data: any[] }) {
  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={index} className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-sm text-pr-text-2">{item.name}</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-pr-text-1">{item.value}%</span>
            <div className="w-24 h-2 bg-pr-surface-2 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full" 
                style={{ width: `${item.value}%`, backgroundColor: item.color }} 
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

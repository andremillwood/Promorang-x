import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

type FeatureCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
  payout: string;
  bgColorClass?: string;
  textColorClass?: string;
  className?: string;
};

export const FeatureCard = ({
  icon,
  title,
  description,
  payout,
  bgColorClass = 'bg-blue-100',
  textColorClass = 'text-blue-600',
  className = '',
}: FeatureCardProps) => {
  return (
    <div 
      className={cn(
        'bg-pr-surface-card rounded-2xl p-6 shadow-sm border border-pr-border',
        'hover:shadow-lg transition-all duration-200 hover:-translate-y-1',
        className
      )}
    >
      <div className={cn('rounded-xl p-3 w-fit mb-4', bgColorClass)}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-pr-text-1 mb-2">{title}</h3>
      <p className="text-pr-text-2 mb-4">{description}</p>
      <div className={cn('font-semibold text-sm', textColorClass)}>
        {payout}
      </div>
    </div>
  );
};

// Usage example:
/*
<FeatureCard
  icon={<Zap className="w-8 h-8 text-blue-600" />}
  title="Complete Tasks"
  description="Micro-tasks and content creation"
  payout="$25 avg"
  bgColorClass="bg-blue-100"
  textColorClass="text-blue-600"
/>
*/

FeatureCard.displayName = 'FeatureCard';

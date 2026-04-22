import { Crown, Award, Zap, Home, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { UserTier, userTiers, getTierBadge } from '@/lib/mark-terminology';

interface TierBadgeProps {
  tier: UserTier;
  showProgress?: boolean;
  currentMarks?: number;
  targetMarks?: number;
  size?: 'sm' | 'md' | 'lg';
}

const tierIcons: Record<UserTier, React.ReactNode> = {
  guest: <User className="w-3 h-3" />,
  regular: <Home className="w-3 h-3" />,
  mover: <Zap className="w-3 h-3" />,
  host: <Crown className="w-3 h-3" />,
};

export function TierBadge({ 
  tier, 
  showProgress = false, 
  currentMarks = 0, 
  targetMarks = 0,
  size = 'md' 
}: TierBadgeProps) {
  const tierInfo = getTierBadge(tier);
  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  const badge = (
    <Badge 
      className={cn(
        tierInfo.color,
        sizeClasses[size],
        'font-medium gap-1 border-0'
      )}
    >
      {tierIcons[tier]}
      {tierInfo.label}
    </Badge>
  );

  if (!showProgress) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {badge}
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-medium">{tierInfo.label}</p>
            <p className="text-xs text-muted-foreground">{tierInfo.description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  const progress = targetMarks > 0 ? (currentMarks / targetMarks) * 100 : 100;

  return (
    <div className="space-y-1">
      {badge}
      {showProgress && targetMarks > 0 && (
        <div className="space-y-1">
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden w-24">
            <div 
              className={cn("h-full rounded-full", tierInfo.color.split(' ')[0].replace('bg-', 'bg-').replace('100', '500'))}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground">
            {currentMarks} / {targetMarks} to next
          </p>
        </div>
      )}
    </div>
  );
}

// Compact version for lists
export function TierDot({ tier }: { tier: UserTier }) {
  const tierInfo = userTiers[tier];
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn(
            "w-2 h-2 rounded-full inline-block",
            tierInfo.color.split(' ')[0].replace('bg-', 'bg-').replace('100', '500')
          )} />
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">{tierInfo.label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Tier comparison/combo display
export function TierComparison({ 
  userTier, 
  targetTier 
}: { 
  userTier: UserTier; 
  targetTier: UserTier;
}) {
  const userInfo = userTiers[userTier];
  const targetInfo = userTiers[targetTier];
  
  const tierLevels = { guest: 1, regular: 2, mover: 3, host: 4 };
  const userLevel = tierLevels[userTier];
  const targetLevel = tierLevels[targetTier];
  
  if (userLevel >= targetLevel) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <TierBadge tier={userTier} size="sm" />
        <span className="text-muted-foreground">→</span>
        <span className="text-green-600 font-medium">Peer</span>
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-2 text-sm">
      <TierBadge tier={userTier} size="sm" />
      <span className="text-muted-foreground">→</span>
      <TierBadge tier={targetTier} size="sm" />
      <span className="text-amber-600 text-xs">
        {targetLevel - userLevel} tier{targetLevel - userLevel > 1 ? 's' : ''} above you
      </span>
    </div>
  );
}

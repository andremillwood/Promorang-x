import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type MomentStatus = 'draft' | 'scheduled' | 'joinable' | 'active' | 'closed' | 'archived';

interface MomentStatusBadgeProps {
  status: MomentStatus;
  className?: string;
}

const statusConfig: Record<MomentStatus, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive'; className: string }> = {
  draft: {
    label: 'Draft',
    variant: 'outline',
    className: 'border-muted-foreground/50 text-muted-foreground',
  },
  scheduled: {
    label: 'Scheduled',
    variant: 'secondary',
    className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
  },
  joinable: {
    label: 'Open to Join',
    variant: 'default',
    className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  },
  active: {
    label: 'Happening Now',
    variant: 'default',
    className: 'bg-primary/10 text-primary border-primary/30 animate-pulse',
  },
  closed: {
    label: 'Completed',
    variant: 'secondary',
    className: 'bg-muted text-muted-foreground',
  },
  archived: {
    label: 'Archived',
    variant: 'outline',
    className: 'border-muted text-muted-foreground',
  },
};

export function MomentStatusBadge({ status, className }: MomentStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.joinable;
  
  return (
    <Badge 
      variant={config.variant}
      className={cn('border', config.className, className)}
    >
      {config.label}
    </Badge>
  );
}

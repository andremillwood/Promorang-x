import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { FileQuestion } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  children?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export default function EmptyState({
  icon: Icon = FileQuestion,
  title,
  description,
  action,
  secondaryAction,
  children,
  size = 'md',
}: EmptyStateProps) {
  const sizeClasses = {
    sm: {
      container: 'py-8',
      icon: 'w-10 h-10',
      title: 'text-base',
      description: 'text-sm',
    },
    md: {
      container: 'py-12',
      icon: 'w-12 h-12',
      title: 'text-lg',
      description: 'text-sm',
    },
    lg: {
      container: 'py-16',
      icon: 'w-16 h-16',
      title: 'text-xl',
      description: 'text-base',
    },
  };

  const classes = sizeClasses[size];

  return (
    <div className={`flex flex-col items-center justify-center text-center ${classes.container}`}>
      <div className="rounded-full bg-pr-surface-2 p-4 mb-4">
        <Icon className={`${classes.icon} text-pr-text-2`} />
      </div>
      <h3 className={`font-semibold text-pr-text-1 mb-2 ${classes.title}`}>{title}</h3>
      {description && (
        <p className={`text-pr-text-2 max-w-sm mb-4 ${classes.description}`}>{description}</p>
      )}
      {children}
      {(action || secondaryAction) && (
        <div className="flex items-center gap-3 mt-4">
          {action && (
            <button
              onClick={action.onClick}
              className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                action.variant === 'secondary'
                  ? 'bg-pr-surface-2 text-pr-text-1 hover:bg-pr-surface-3'
                  : 'bg-orange-500 text-white hover:bg-orange-600'
              }`}
            >
              {action.label}
            </button>
          )}
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="px-4 py-2 rounded-xl font-medium text-pr-text-2 hover:text-pr-text-1 transition-colors"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

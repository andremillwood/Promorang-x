import React from "react";
import { LucideIcon } from "lucide-react";

export interface EmptyStateProps {
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  className?: string;
  children?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  className = "",
  children,
}) => {
  return (
    <div
      role="status"
      aria-label={title}
      className={`text-center py-12 px-6 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm ${className}`}
    >
      {Icon && (
        <div className="w-16 h-16 bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Icon className="w-8 h-8" />
        </div>
      )}
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-gray-600 dark:text-gray-300 max-w-md mx-auto leading-relaxed">
          {description}
        </p>
      )}
      {actionLabel && (actionHref || onAction) && (
        <div className="mt-6">
          {actionHref ? (
            <a
              href={actionHref}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FF5500] to-[#FF7F00] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md hover:shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {actionLabel}
            </a>
          ) : (
            <button
              type="button"
              onClick={onAction}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FF5500] to-[#FF7F00] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md hover:shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {actionLabel}
            </button>
          )}
        </div>
      )}
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
};

export default EmptyState;

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'white' | 'muted';
  className?: string;
  label?: string;
}

export default function LoadingSpinner({
  size = 'md',
  color = 'primary',
  className = '',
  label,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
    xl: 'h-16 w-16 border-4',
  };

  const colorClasses = {
    primary: 'border-orange-500 border-t-transparent',
    white: 'border-white border-t-transparent',
    muted: 'border-pr-text-2 border-t-transparent',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div
        className={`animate-spin rounded-full ${sizeClasses[size]} ${colorClasses[color]}`}
        role="status"
        aria-label={label || 'Loading'}
      />
      {label && <p className="text-sm text-pr-text-2">{label}</p>}
    </div>
  );
}

export function LoadingPage({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <LoadingSpinner size="lg" label={label} />
    </div>
  );
}

export function LoadingOverlay({ label }: { label?: string }) {
  return (
    <div className="absolute inset-0 bg-pr-surface-1/80 backdrop-blur-sm flex items-center justify-center z-50">
      <LoadingSpinner size="lg" label={label} />
    </div>
  );
}

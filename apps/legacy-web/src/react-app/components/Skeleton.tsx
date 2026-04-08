import { cn } from '../../lib/utils';

interface SkeletonProps {
  className?: string;
  count?: number;
  height?: string | number;
  width?: string | number;
  circle?: boolean;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  style?: React.CSSProperties;
}

export function Skeleton({
  className = '',
  count = 1,
  height,
  width,
  circle = false,
  rounded = 'md',
  style,
  ...props
}: SkeletonProps) {
  const radiusMap = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };

  const skeletons = Array.from({ length: count }).map((_, i) => (
    <div
      key={i}
      className={cn(
        'animate-pulse bg-pr-surface-3 dark:bg-gray-700',
        circle ? 'rounded-full' : radiusMap[rounded],
        className
      )}
      style={{
        height: height || '1.25rem',
        width: circle ? height || '1.25rem' : width || '100%',
        ...style,
      }}
      {...props}
    />
  ));

  return <>{skeletons}</>;
}

// Compound components for common patterns
type SkeletonCompoundProps = Omit<SkeletonProps, 'width' | 'height' | 'circle'>;

export function SkeletonText({ className = '', count = 1, ...props }: SkeletonCompoundProps) {
  return (
    <div className="space-y-2">
      <Skeleton className={cn('h-4', className)} count={count} {...props} />
    </div>
  );
}

export function SkeletonTitle({ className = '', ...props }: SkeletonCompoundProps) {
  return <Skeleton className={cn('h-6 w-3/4 mb-2', className)} {...props} />;
}

export function SkeletonParagraph({ lines = 3, className = '', ...props }: SkeletonCompoundProps & { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          className={cn('h-4', i === lines - 1 ? 'w-5/6' : 'w-full', className)} 
          {...props} 
        />
      ))}
    </div>
  );
}

export function SkeletonAvatar({ size = 'md', className = '', ...props }: { size?: 'sm' | 'md' | 'lg' } & SkeletonCompoundProps) {
  const sizeMap = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };
  
  return <Skeleton className={cn(sizeMap[size], 'rounded-full', className)} circle {...props} />;
}

export function SkeletonCard({ className = '', ...props }: SkeletonCompoundProps) {
  return (
    <div className={cn('space-y-4 p-4 border border-pr-surface-3 rounded-lg', className)} {...props}>
      <Skeleton className="h-40 w-full rounded-lg" />
      <SkeletonTitle />
      <SkeletonParagraph lines={2} />
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}

import React, { ReactNode } from 'react';
import { cn } from '../../lib/utils';

type CardActionBarProps = {
  children: ReactNode;
  className?: string;
  align?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
};

export const CardActionBar = ({
  children,
  className = '',
  align = 'between',
  wrap = true,
  ...props
}: CardActionBarProps) => {
  const alignment = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  };

  return (
    <div
      className={cn(
        'flex flex-row items-center gap-3',
        wrap ? 'flex-wrap' : 'flex-nowrap',
        alignment[align],
        'mt-4',
        className
      )}
      {...props}
    >
      {React.Children.map(children, (child, index) => (
        <div key={index} className="flex-shrink-0">
          {child}
        </div>
      ))}
    </div>
  );
};

// Example usage:
/*
<CardActionBar align="between" wrap>
  <Button variant="outline" size="sm">
    <Share2 className="mr-2 h-4 w-4" />
    Share
  </Button>
  <div className="flex items-center gap-2">
    <Button variant="ghost" size="sm">
      <Heart className="h-4 w-4" />
    </Button>
    <Button variant="primary" size="sm">
      Invest
    </Button>
  </div>
</CardActionBar>
*/

// Add display name for better debugging
CardActionBar.displayName = 'CardActionBar';

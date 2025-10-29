import { forwardRef, isValidElement, cloneElement } from 'react';
import type { ButtonHTMLAttributes, ReactElement } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
};

const baseClasses =
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 disabled:opacity-50 disabled:pointer-events-none';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', type = 'button', asChild = false, children, ...props }, ref) => {
    if (asChild && isValidElement(children)) {
      return cloneElement(children as ReactElement, {
        ref,
        className: `${baseClasses} ${className} ${(children as ReactElement).props.className || ''}`.trim(),
        ...props
      });
    }

    return (
      <button
        ref={ref}
        type={type}
        className={`${baseClasses} ${className}`.trim()}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

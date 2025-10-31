import { ButtonHTMLAttributes, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  isLoading?: boolean;
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles = [
      'inline-flex items-center justify-center',
      'rounded-[var(--btn-radius)]',
      'px-4 py-2 text-sm font-medium',
      'transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
      'disabled:opacity-50 disabled:cursor-not-allowed',
    ];

    const variantStyles = {
      primary: [
        'bg-blue-600 text-white',
        'hover:bg-blue-700',
        'active:bg-blue-800',
        'dark:bg-blue-500 dark:hover:bg-blue-600',
      ],
      secondary: [
        'bg-gray-100 text-gray-900',
        'hover:bg-gray-200',
        'dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600',
      ],
      outline: [
        'border border-gray-300 bg-transparent text-gray-700',
        'hover:bg-gray-50',
        'dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700',
      ],
      ghost: [
        'bg-transparent text-gray-700',
        'hover:bg-gray-100',
        'dark:text-gray-200 dark:hover:bg-gray-800',
      ],
      link: [
        'bg-transparent text-blue-600 underline-offset-4',
        'hover:underline',
        'dark:text-blue-400',
      ],
    };

    return (
      <button
        ref={ref}
        className={twMerge(
          ...baseStyles,
          ...variantStyles[variant],
          isLoading && 'opacity-70 cursor-wait',
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps };

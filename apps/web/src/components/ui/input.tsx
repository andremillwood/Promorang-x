import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', ...props }, ref) => {
    const baseClasses =
      'block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500';

    return (
      <input
        ref={ref}
        className={`${baseClasses} ${className}`.trim()}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

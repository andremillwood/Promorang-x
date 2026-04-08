import { forwardRef } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', leftIcon, rightIcon, containerClassName = '', ...props }, ref) => {
    const baseClasses =
      'block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 transition-all';

    const paddingClasses = [
      leftIcon ? 'pl-10' : '',
      rightIcon ? 'pr-10' : ''
    ].filter(Boolean).join(' ');

    return (
      <div className={`relative ${containerClassName}`.trim()}>
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          className={`${baseClasses} ${paddingClasses} ${className}`.trim()}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500">
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';


import React, { forwardRef, isValidElement, cloneElement } from 'react';
import type { ButtonHTMLAttributes, ReactElement, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingText?: ReactNode;
  leftIcon?: ReactElement;
  rightIcon?: ReactElement;
  asChild?: boolean;
};

const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-500 disabled:opacity-50 disabled:pointer-events-none';

const variants = {
  primary: 'bg-orange-600 text-white hover:bg-orange-700 active:bg-orange-800',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300',
  outline: 'border border-gray-300 bg-transparent hover:bg-gray-50 active:bg-gray-100',
  ghost: 'hover:bg-gray-100 active:bg-gray-200',
  link: 'text-orange-600 hover:underline underline-offset-4 p-0 h-auto',
  destructive: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
};

const sizes = {
  sm: 'h-8 px-3 text-sm rounded-lg',
  md: 'h-10 px-4 py-2 text-base rounded-xl',
  lg: 'h-12 px-6 text-lg rounded-xl',
};

const iconSizes = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

const ButtonComponent = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className = '',
    type = 'button',
    variant = 'primary',
    size = 'md',
    isLoading = false,
    loadingText,
    leftIcon,
    rightIcon,
    children,
    disabled,
    asChild = false,
    ...props
  }, ref) => {
    if (asChild && isValidElement(children)) {
      return cloneElement(children as ReactElement, {
        ref,
        className: `${baseClasses} ${variants[variant]} ${sizes[size]} ${className} ${(children as ReactElement).props.className || ''}`.trim(),
        disabled: disabled || isLoading,
        ...props
      });
    }

    const content = isLoading && loadingText !== undefined ? loadingText : children;

    const buttonClasses = [
      baseClasses,
      variants[variant],
      sizes[size],
      className,
      (isLoading || disabled) ? 'cursor-not-allowed' : 'cursor-pointer',
    ].filter(Boolean).join(' ');

    return (
      <button
        ref={ref}
        type={type}
        className={buttonClasses}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <Loader2 className={`animate-spin ${iconSizes[size]} mr-2`} />
        )}
        {!isLoading && leftIcon && React.cloneElement(leftIcon, {
          className: `${iconSizes[size]} mr-2 ${leftIcon.props.className || ''}`.trim()
        })}
        {content}
        {!isLoading && rightIcon && React.cloneElement(rightIcon, {
          className: `${iconSizes[size]} ml-2 ${rightIcon.props.className || ''}`.trim()
        })}
      </button>
    );
  }
);

ButtonComponent.displayName = 'Button';

export const Button = ButtonComponent;

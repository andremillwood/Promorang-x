import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

type AuthLayoutProps = {
  children: ReactNode;
  title: string;
  subtitle?: string;
};

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen-dynamic bg-pr-surface-2 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center">
          <img
            className="h-12 w-auto"
            src="/logo.svg"
            alt="Your Company"
          />
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-pr-text-1">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-2 text-center text-sm text-pr-text-2">
            {subtitle}
          </p>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-pr-surface-card py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {children}
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;

import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuth } from '@/react-app/hooks/useAuth';
import { UserRole } from '@/react-app/hooks/useAuth';
import { hasRole } from '@/react-app/utils/roles';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requiredRole = 'user',
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { user, isPending } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isPending) return;
    
    // If no user is logged in, redirect to login
    if (!user) {
      router.push(redirectTo);
      return;
    }

    // If user doesn't have required role, redirect to home or specified route
    if (requiredRole !== 'user' && !hasRole(user.user_type, requiredRole)) {
      router.push('/unauthorized');
    }
  }, [user, isPending, requiredRole, router, redirectTo]);

  // Show loading state while checking auth
  if (isPending || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen-dynamic">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Check if user has required role
  if (requiredRole !== 'user' && !hasRole(user.user_type, requiredRole)) {
    return (
      <div className="flex items-center justify-center min-h-screen-dynamic">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Unauthorized</h1>
          <p>You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

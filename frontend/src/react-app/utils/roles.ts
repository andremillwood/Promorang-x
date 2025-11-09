import type { UserRole } from '@/react-app/hooks/useAuth';
import type { ComponentType } from 'react';
import React, { FC } from 'react';

type RoleHierarchy = {
  [key in UserRole]: UserRole[];
};

/**
 * Defines the hierarchy of roles and their permissions
 * Each role inherits permissions from roles to its right
 */
const roleHierarchy: RoleHierarchy = {
  admin: ['admin', 'creator', 'investor', 'advertiser', 'user'],
  creator: ['creator', 'user'],
  investor: ['investor', 'user'],
  advertiser: ['advertiser', 'user'],
  user: ['user']
};

/**
 * Checks if a user has the required role or higher
 * @param userRole - The user's role
 * @param requiredRole - The minimum required role
 * @returns boolean - True if user has required role or higher
 */
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return roleHierarchy[userRole]?.includes(requiredRole) || false;
}

// Simple fallback component
const DefaultFallback = () => null;

/**
 * Higher-order component for role-based route protection
 * @param requiredRole - The minimum role required to access the component
 * @param Component - The component to protect
 * @param FallbackComponent - Component to render if user doesn't have permission
 * @returns Protected component or fallback
 */
export function withRole<T extends object>(
  requiredRole: UserRole,
  Component: ComponentType<T>,
  FallbackComponent: ComponentType<T> = DefaultFallback as ComponentType<any>
) {
  const WrappedComponent: FC<T & { userRole?: UserRole }> = (props) => {
    const { userRole = 'user', ...rest } = props;
    const hasAccess = hasRole(userRole, requiredRole);
    
    if (!hasAccess) {
      return React.createElement(FallbackComponent, rest as T);
    }
    
    return React.createElement(Component, rest as T);
  };
  
  return WrappedComponent;
}

/**
 * Hook to check if current user has required role
 * @param requiredRole - The role to check against
 * @param userRole - Current user's role
 * @returns Object with hasAccess boolean and isAdmin boolean
 */
export function useRoleCheck(requiredRole: UserRole, userRole?: UserRole) {
  const hasAccess = userRole ? hasRole(userRole, requiredRole) : false;
  const isAdmin = userRole === 'admin';
  
  return { hasAccess, isAdmin };
}

/**
 * Get all roles that have at least the specified level of access
 * @param minRole - The minimum role level
 * @returns Array of roles that meet or exceed the minimum level
 */
export function getRolesAtOrAbove(minRole: UserRole): UserRole[] {
  return roleHierarchy[minRole] || [];
}

/**
 * Check if a user has any of the specified roles
 * @param userRole - The user's role
 * @param allowedRoles - Array of roles to check against
 * @returns boolean - True if user has any of the allowed roles
 */
export function hasAnyRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.some(role => hasRole(userRole, role));
}

// Export the UserRole type for convenience
export type { UserRole };

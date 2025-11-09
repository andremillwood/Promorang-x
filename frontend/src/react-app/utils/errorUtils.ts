/**
 * Utility functions for handling and displaying errors in a user-friendly way
 */

type ErrorLike = Error | { message?: string; error?: any; status?: number; code?: string } | string | null | undefined;

/**
 * Safely extracts an error message from various error object shapes
 */
export function getErrorMessage(error: ErrorLike): string {
  if (!error) return 'An unknown error occurred';
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (error.message) return String(error.message);
  if (error.error) return getErrorMessage(error.error);
  if (error.code) return `Error (${error.code})`;
  return 'An unknown error occurred';
}

/**
 * Extracts additional error details for debugging
 */
export function getErrorDetails(error: ErrorLike): Record<string, any> {
  if (!error || typeof error !== 'object') return {};
  
  const details: Record<string, any> = {};
  
  // Extract common error properties
  if ('code' in error) details.code = error.code;
  if ('status' in error) details.status = error.status;
  if ('details' in error) details.details = error.details;
  
  // Extract Supabase-specific errors
  if (error instanceof Error && 'code' in error) {
    details.code = (error as any).code;
  }
  
  return details;
}

/**
 * Component-friendly error formatter
 */
export function formatErrorForDisplay(error: ErrorLike): {
  title: string;
  message: string;
  details?: Record<string, any>;
} {
  const message = getErrorMessage(error);
  const details = getErrorDetails(error);
  
  // Handle common error cases
  if (message.includes('Email not confirmed')) {
    return {
      title: 'Email Not Verified',
      message: 'Please check your email and verify your account before signing in.',
      details
    };
  }
  
  if (message.includes('Invalid login credentials')) {
    return {
      title: 'Invalid Credentials',
      message: 'The email or password you entered is incorrect. Please try again.',
      details
    };
  }
  
  // Default error format
  return {
    title: 'An Error Occurred',
    message,
    details: Object.keys(details).length > 0 ? details : undefined
  };
}

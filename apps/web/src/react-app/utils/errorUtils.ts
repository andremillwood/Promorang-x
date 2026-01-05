/**
 * Utility functions for handling and displaying errors in a user-friendly way
 */

type ErrorPayload = {
  message?: unknown;
  error?: unknown;
  status?: number;
  code?: string;
  details?: unknown;
};

type ErrorLike = Error | ErrorPayload | string | null | undefined;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isErrorPayload = (value: unknown): value is ErrorPayload =>
  isRecord(value) && ('message' in value || 'error' in value || 'code' in value || 'status' in value || 'details' in value);

/**
 * Safely extracts an error message from various error object shapes
 */
export function getErrorMessage(error: ErrorLike): string {
  if (!error) return 'An unknown error occurred';
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (isErrorPayload(error)) {
    if (typeof error.message === 'string') return error.message;
    if (error.error) return getErrorMessage(error.error as ErrorLike);
    if (error.code) return `Error (${error.code})`;
  }
  return 'An unknown error occurred';
}

/**
 * Extracts additional error details for debugging
 */
export function getErrorDetails(error: ErrorLike): Record<string, unknown> {
  if (!isRecord(error)) return {};

  const details: Record<string, unknown> = {};

  if ('code' in error && typeof error.code !== 'undefined') {
    details.code = error.code as unknown;
  }

  if ('status' in error && typeof error.status !== 'undefined') {
    details.status = error.status as unknown;
  }

  if ('details' in error && typeof error.details !== 'undefined') {
    details.details = error.details as unknown;
  }

  if (error instanceof Error) {
    const errorWithCode = error as Error & { code?: unknown };
    if (typeof errorWithCode.code !== 'undefined') {
      details.code = errorWithCode.code;
    }
  }

  return details;
}

/**
 * Component-friendly error formatter
 */
export function formatErrorForDisplay(error: ErrorLike): {
  title: string;
  message: string;
  details?: Record<string, unknown>;
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

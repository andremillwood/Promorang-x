declare module '@/react-app/services/errorLogger' {
  export type ErrorSeverity = 'critical' | 'error' | 'warning' | 'info';

  export type ErrorCategory =
    | 'authentication'
    | 'network'
    | 'validation'
    | 'api'
    | 'ui'
    | 'unknown';

  export interface ErrorContext {
    componentStack?: string;
    userId?: string | null;
    pathname?: string;
    [key: string]: unknown;
  }

  export interface LogErrorOptions {
    error: Error | unknown;
    category?: ErrorCategory;
    severity?: ErrorSeverity;
    context?: ErrorContext;
    tags?: Record<string, string>;
  }

  export interface ErrorLogger {
    logError(options: LogErrorOptions): Promise<void>;
  }

  export const errorLogger: ErrorLogger;
  export const ErrorSeverity: Record<string, ErrorSeverity>;
  export const ErrorCategory: Record<string, ErrorCategory>;
  export function logAuthError(error: unknown, context?: ErrorContext): Promise<void>;
  export function logApiError(
    error: unknown,
    endpoint: string,
    context?: ErrorContext
  ): Promise<void>;
  export function logUnexpectedError(
    error: unknown,
    componentName: string,
    context?: ErrorContext
  ): Promise<void>;
}

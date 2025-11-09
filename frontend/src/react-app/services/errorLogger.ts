import { AuthError } from '@supabase/supabase-js';

// Types for our error logging
type ErrorContext = {
  componentStack?: string;
  userId?: string | null;
  pathname?: string;
  [key: string]: unknown;
};

// Error categories for better organization
export const ErrorCategories = {
  AUTH: 'authentication',
  NETWORK: 'network',
  VALIDATION: 'validation',
  API: 'api',
  UI: 'ui',
  UNKNOWN: 'unknown',
} as const;

type ErrorCategoryType = typeof ErrorCategories[keyof typeof ErrorCategories];

// Error severity levels
export const ErrorSeverities = {
  CRITICAL: 'critical',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const;

type ErrorSeverityType = typeof ErrorSeverities[keyof typeof ErrorSeverities];

interface LogErrorParams {
  error: Error | AuthError | unknown;
  category?: ErrorCategoryType;
  severity?: ErrorSeverityType;
  context?: ErrorContext;
  tags?: Record<string, string>;
}

/**
 * Centralized error logging service
 * Handles different types of errors and logs them appropriately
 */
export class ErrorLogger {
  // Expose the error categories and severities as static properties
  static readonly ErrorCategory = ErrorCategories;
  static readonly ErrorSeverity = ErrorSeverities;
  private static instance: ErrorLogger;
  private readonly isProduction: boolean;
  private readonly logToConsole: boolean;
  
  private constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.logToConsole = !this.isProduction || process.env.NEXT_PUBLIC_DEBUG === 'true';
  }

  public static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  private formatError(error: Error | AuthError | unknown): {
    name: string;
    message: string;
    stack?: string;
    code?: string;
    status?: number;
  } {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack,
        ...(error instanceof AuthError && {
          code: error.status?.toString(),
          status: error.status,
        }),
      };
    }
    
    return {
      name: 'UnknownError',
      message: String(error),
    };
  }

  private getErrorContext(context: ErrorContext = {}) {
    // Add any global context you want to include with every error
    return {
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      url: typeof window !== 'undefined' ? window.location.href : '',
      ...context,
    };
  }

  private consoleLog(level: 'error' | 'warn' | 'info', message: string, data: any) {
    if (!this.logToConsole) return;
    
    const logMethod = console[level] || console.log;
    const style = 'color: white; background: #ef4444; padding: 2px 6px; border-radius: 4px;';
    
    logMethod(
      `%c[${level.toUpperCase()}]`,
      style,
      message,
      '\nDetails:',
      data
    );
  }

  private async sendToErrorService(
    errorData: ReturnType<typeof this.formatError>,
    category: ErrorCategoryType,
    severity: ErrorSeverityType,
    context: ErrorContext,
    tags: Record<string, string> = {}
  ) {
    if (!this.isProduction) {
      // In development, we'll just log to the console
      this.consoleLog(
        severity === ErrorSeverity.CRITICAL || severity === ErrorSeverity.ERROR ? 'error' : 'warn',
        `[${category}] ${errorData.name}: ${errorData.message}`,
        { error: errorData, context, severity, tags }
      );
      return;
    }

    try {
      // In production, send the error to your error tracking service
      // Replace this with your actual error tracking service (e.g., Sentry, LogRocket, etc.)
      const response = await fetch('/api/log-error', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: errorData,
          category,
          severity,
          context: this.getErrorContext(context),
          tags,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to log error to server');
      }
    } catch (error) {
      // If error logging fails, log to console as a fallback
      this.consoleLog(
        'error',
        'Failed to send error to logging service',
        { error, originalError: errorData }
      );
    }
  }

  public async logError({
    error,
    category = ErrorCategory.UNKNOWN,
    severity = ErrorSeverity.ERROR,
    context = {},
    tags = {},
  }: LogErrorParams) {
    const errorData = this.formatError(error);
    
    // Always log to console in development or when explicitly enabled
    this.consoleLog(
      severity === ErrorSeverity.CRITICAL || severity === ErrorSeverity.ERROR ? 'error' : 'warn',
      `[${category}] ${errorData.name}: ${errorData.message}`,
      { error: errorData, context, severity, tags }
    );

    // In production, also send to error tracking service
    if (this.isProduction) {
      await this.sendToErrorService(errorData, category, severity, context, tags);
    }
  }
}

export const errorLogger = ErrorLogger.getInstance();

export const ErrorSeverity = ErrorSeverities;

// Convenience functions for common error types
export const logAuthError = (error: unknown, context: ErrorContext = {}) => {
  errorLogger.logError({
    error,
    category: ErrorCategory.AUTH,
    severity: ErrorSeverity.ERROR,
    context,
  });};

export const logApiError = (error: unknown, endpoint: string, context: ErrorContext = {}) => {
  errorLogger.logError({
    error,
    category: ErrorCategory.API,
    severity: ErrorSeverity.ERROR,
    context: {
      ...context,
      endpoint,
    },
  });
};

export const logUnexpectedError = (error: unknown, componentName: string, context: ErrorContext = {}) => {
  errorLogger.logError({
    error,
    category: ErrorCategory.UI,
    severity: ErrorSeverity.ERROR,
    context: {
      ...context,
      component: componentName,
    },
  });
};

export default errorLogger;

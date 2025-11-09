declare module '@/react-app/services/errorLogger' {
  type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';
  
  interface ErrorContext {
    [key: string]: any;
  }

  interface LogErrorOptions {
    error: Error | unknown;
    category: string;
    severity?: ErrorSeverity;
    context?: ErrorContext;
    timestamp?: Date;
  }

  interface ErrorLogger {
    logError(options: LogErrorOptions): void;
  }

  const errorLogger: ErrorLogger;
  
  export { errorLogger, ErrorSeverity, ErrorContext, LogErrorOptions };
}

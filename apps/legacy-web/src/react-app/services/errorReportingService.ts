import { errorLogger, ErrorCategory, ErrorSeverity } from './errorLogger';

const REPORT_ENDPOINT = '/api/report-error';
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds

interface SerializedError {
  name: string;
  message: string;
  stack?: string;
}

interface ErrorReport {
  error: SerializedError;
  context?: Record<string, unknown>;
  user?: {
    id?: string;
    email?: string;
  };
  componentStack?: string;
  timestamp: string;
  url: string;
  userAgent: string;
}

const toError = (value: unknown): Error => {
  if (value instanceof Error) {
    return value;
  }

  let message: string;
  try {
    message = typeof value === 'string' ? value : JSON.stringify(value);
  } catch {
    message = String(value);
  }

  return new Error(message);
};

const serializeError = (error: Error): SerializedError => ({
  name: error.name,
  message: error.message,
  ...(error.stack ? { stack: error.stack } : {}),
});

class ErrorReportingService {
  private queue: ErrorReport[] = [];
  private isReporting = false;
  private retryCount = 0;
  private userContext: { id?: string; email?: string } | null = null;

  async reportError(
    error: unknown,
    context: Record<string, unknown> = {},
    componentStack?: string
  ): Promise<void> {
    const normalizedError = toError(error);
    const report: ErrorReport = {
      error: serializeError(normalizedError),
      context: { ...context },
      componentStack,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    };

    if (this.userContext) {
      report.user = { ...this.userContext };
    }

    // Add to queue and process
    this.queue.push(report);
    await this.processQueue();
  }

  private async processQueue(): Promise<void> {
    if (this.isReporting || this.queue.length === 0) return;

    this.isReporting = true;
    const report = this.queue[0];

    try {
      const response = await fetch(REPORT_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report),
      });

      if (response.ok) {
        // Successfully reported, remove from queue
        this.queue.shift();
        this.retryCount = 0;
        // Process next item in queue if any
        if (this.queue.length > 0) {
          setTimeout(() => {
            void this.processQueue();
          }, 0);
        }
      } else {
        throw new Error(`Failed to report error: ${response.statusText}`);
      }
    } catch (error) {
      this.retryCount++;
      if (this.retryCount <= MAX_RETRIES) {
        // Retry with exponential backoff
        const delay = RETRY_DELAY * Math.pow(2, this.retryCount - 1);
        setTimeout(() => {
          void this.processQueue();
        }, delay);
      } else {
        // Max retries reached, give up and log to console
        const normalizedError = toError(error);
        console.error('Failed to report error after multiple retries:', normalizedError);
        await errorLogger.logError({
          error: normalizedError,
          category: ErrorCategory.API,
          severity: ErrorSeverity.ERROR,
          context: {
            endpoint: REPORT_ENDPOINT,
            retryCount: this.retryCount,
            queueLength: this.queue.length,
          },
        });
        this.queue.shift();
        this.retryCount = 0;
        if (this.queue.length > 0) {
          setTimeout(() => {
            void this.processQueue();
          }, 0);
        }
      }
    } finally {
      this.isReporting = false;
    }
  }

  // Add user context to all future reports
  setUserContext(user: { id?: string; email?: string }) {
    this.userContext = { ...user };
  }
}

export const errorReportingService = new ErrorReportingService();

// Example usage:
// try {
//   // Your code
// } catch (error) {
//   errorReportingService.reportError(
//     error as Error,
//     { component: 'MyComponent', action: 'fetchData' },
//     errorInfo?.componentStack
//   );
// }

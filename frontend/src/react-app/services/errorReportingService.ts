import { errorLogger } from './errorLogger';

const REPORT_ENDPOINT = '/api/report-error';
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds

interface ErrorReport {
  error: Error;
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

class ErrorReportingService {
  private queue: ErrorReport[] = [];
  private isReporting = false;
  private retryCount = 0;

  async reportError(
    error: Error,
    context: Record<string, unknown> = {},
    componentStack?: string
  ) {
    const report: ErrorReport = {
      error,
      context,
      componentStack,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    };

    // Add to queue and process
    this.queue.push(report);
    await this.processQueue();
  }

  private async processQueue() {
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
          setTimeout(() => this.processQueue(), 0);
        }
      } else {
        throw new Error(`Failed to report error: ${response.statusText}`);
      }
    } catch (error) {
      this.retryCount++;
      if (this.retryCount <= MAX_RETRIES) {
        // Retry with exponential backoff
        const delay = RETRY_DELAY * Math.pow(2, this.retryCount - 1);
        setTimeout(() => this.processQueue(), delay);
      } else {
        // Max retries reached, give up and log to console
        console.error('Failed to report error after multiple retries:', error);
        this.queue.shift();
        this.retryCount = 0;
        if (this.queue.length > 0) {
          setTimeout(() => this.processQueue(), 0);
        }
      }
    } finally {
      this.isReporting = false;
    }
  }

  // Add user context to all future reports
  setUserContext(user: { id?: string; email?: string }) {
    // This would be used to add user context to all future reports
    // Implementation depends on your user management system
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

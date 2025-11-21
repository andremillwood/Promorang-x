# Error Handling System

This document outlines the error handling system implemented in the application. The system provides a robust way to catch, log, and monitor errors in both development and production environments.

## Table of Contents
1. [Architecture](#architecture)
2. [Components](#components)
3. [Usage](#usage)
4. [Monitoring](#monitoring)
5. [Best Practices](#best-practices)
6. [Troubleshooting](#troubleshooting)

## Architecture

The error handling system consists of several key components:

1. **Error Boundary**: Catches React component errors and displays a fallback UI
2. **Error Logger**: Centralized service for logging errors with categories and severity levels
3. **Error Reporting Service**: Handles sending error reports to the server
4. **API Endpoints**: Server endpoints for receiving and storing error reports
5. **Monitoring Dashboard**: Admin interface for viewing and managing errors

## Components

### 1. Error Boundary (`EnhancedErrorBoundary`)

A React component that catches JavaScript errors in child components, logs them, and displays a fallback UI.

**Location**: `src/react-app/components/common/EnhancedErrorBoundary.tsx`

**Features**:
- Catches errors in child components
- Provides user-friendly error messages
- Allows users to retry actions
- Includes error reporting functionality
- Shows detailed error information for debugging

### 2. Error Logger (`errorLogger`)

A singleton service for logging errors with categories and severity levels.

**Location**: `src/react-app/services/errorLogger.ts`

**Error Categories**:
- `AUTH`: Authentication and authorization errors
- `NETWORK`: Network-related errors
- `VALIDATION`: Data validation errors
- `API`: API request/response errors
- `UI`: User interface errors
- `UNKNOWN`: Unclassified errors

**Severity Levels**:
- `CRITICAL`: System is down or data is corrupted
- `ERROR`: Operation failed but application can continue
- `WARNING`: Unexpected but handled condition
- `INFO`: Informational messages

### 3. Error Reporting Service (`errorReportingService`)

Handles sending error reports to the server with retry logic and offline support.

**Location**: `src/react-app/services/errorReportingService.ts`

### 4. API Endpoints

- `POST /api/report-error`: Reports client-side errors
- `GET /api/error-logs`: Retrieves error logs (admin only)
- `PATCH /api/error-logs/:id`: Updates error status (e.g., mark as resolved)

### 5. Monitoring Dashboard

Admin interface for monitoring and managing errors.

**Location**: `src/react-app/pages/admin/ErrorDashboard.tsx`

## Usage

### Basic Error Handling

```typescript
try {
  // Your code here
} catch (error) {
  errorLogger.error({
    error,
    category: ErrorLogger.ErrorCategory.API,
    severity: ErrorLogger.ErrorSeverity.ERROR,
    context: { component: 'MyComponent' },
  });
}
```

### Using the Error Boundary

```typescript
import EnhancedErrorBoundary from '@/react-app/components/common/EnhancedErrorBoundary';

function MyApp() {
  return (
    <EnhancedErrorBoundary>
      <MyComponent />
    </EnhancedErrorBoundary>
  );
}
```

### Custom Error Handling

```typescript
// Custom error class
export class ApiError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
    this.name = 'ApiError';
  }
}

// Usage
try {
  throw new ApiError('Not found', 404);
} catch (error) {
  if (error instanceof ApiError) {
    // Handle API error
  }
}
```

## Monitoring

### Accessing the Dashboard

1. Log in as an admin user
2. Navigate to `/admin/errors`

### Dashboard Features

- Filter errors by severity and category
- Search through error messages and context
- View error details
- Mark errors as resolved
- View error trends over time

## Best Practices

1. **Be Specific with Error Categories**: Choose the most specific category that applies.
2. **Include Context**: Always include relevant context with errors.
3. **Handle Errors Gracefully**: Provide clear feedback to users.
4. **Monitor Error Rates**: Set up alerts for increased error rates.
5. **Regularly Review Logs**: Schedule time to review and address recurring issues.

## Troubleshooting

### Common Issues

1. **Errors not appearing in the dashboard**
   - Check the browser console for network errors
   - Verify the user has admin privileges
   - Check the server logs for any issues

2. **Error boundary not catching errors**
   - Ensure the error occurs during rendering, in a lifecycle method, or in a constructor
   - Check that the error isn't caught by a try/catch block before reaching the boundary

3. **Performance impact**
   - Monitor the size of error logs
   - Consider implementing log rotation or archiving for old logs

### Getting Help

If you encounter issues with the error handling system, please contact the development team with the following information:

1. Steps to reproduce the issue
2. Expected behavior
3. Actual behavior
4. Any error messages or logs
5. Browser/device information

---

*Last updated: November 3, 2025*

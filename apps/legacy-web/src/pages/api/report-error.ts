import { NextApiRequest, NextApiResponse } from 'next';
import { errorLogger } from '@/react-app/services/errorLogger';

interface ErrorReport {
  error: {
    name: string;
    message: string;
    stack?: string;
  };
  context?: Record<string, unknown>;
  componentStack?: string;
  timestamp: string;
  url: string;
  userAgent: string;
  userReported?: boolean;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const report = req.body as ErrorReport;
    
    // Log the error to the server
    errorLogger.error({
      message: report.error.message,
      name: report.error.name,
      stack: report.error.stack,
      componentStack: report.componentStack,
      context: report.context,
      url: report.url,
      userAgent: report.userAgent,
      userReported: report.userReported || false,
    });

    // In a production environment, you might want to:
    // 1. Store the error in a database
    // 2. Send an alert to your team
    // 3. Integrate with an error tracking service

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing error report:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to process error report' 
    });
  }
}

// Disable body parsing for this endpoint to get the raw body
// This is useful if you want to verify webhook signatures or similar
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};

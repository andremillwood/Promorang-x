import cors, { CorsOptions } from 'cors';
import { Request, Response, NextFunction } from 'express';

// Type definitions for CORS callbacks
type OriginCallback = (err: Error | null, origin?: boolean) => void;

export interface CorsRequest extends Request {
  cors?: {
    enabled?: boolean;
    origin?: string | boolean;
    method?: string;
    allowedHeaders?: string | string[];
    exposedHeaders?: string | string[];
    credentials?: boolean;
    maxAge?: number;
  };
}

// Parse allowed origins from environment variable
const origins = (process.env.CORS_ORIGINS ?? '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

// CORS options
const corsOptions: CorsOptions = {
  origin: (origin: string | undefined, callback: OriginCallback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if the origin is in the allowed list
    if (origins.includes(origin)) {
      return callback(null, true);
    }
    
    console.error(`CORS blocked for origin: ${origin}. Allowed origins:`, origins);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
};

// CORS middleware
export const corsMw = cors(corsOptions);

// Type guard to check if a request is a CORS preflight request
function isCorsPreflight(req: Request): boolean {
  return (
    req.method === 'OPTIONS' &&
    !!req.headers['access-control-request-method']
  );
}

// Middleware to handle CORS preflight requests
export const corsPreflightHandler = (req: Request, res: Response, next: NextFunction) => {
  if (isCorsPreflight(req)) {
    // Handle preflight requests
    const methods = Array.isArray(corsOptions.methods) 
      ? corsOptions.methods.join(',') 
      : corsOptions.methods || '';
      
    const headers = Array.isArray(corsOptions.allowedHeaders)
      ? corsOptions.allowedHeaders.join(',')
      : corsOptions.allowedHeaders || '';
    
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Methods', methods);
    res.setHeader('Access-Control-Allow-Headers', headers);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    return res.status(200).end();
  }
  next();
};

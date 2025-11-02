import cors, { CorsOptions } from 'cors';
import { Request, Response, NextFunction } from 'express';

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

// Development CORS options - allows all origins in development
const devCorsOptions: CorsOptions = {
  origin: (origin: string | undefined, callback: OriginCallback) => {
    // In development, allow all origins
    callback(null, true);
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  optionsSuccessStatus: 200,
};

// Production CORS options - more restrictive
const prodCorsOptions: CorsOptions = {
  origin: (process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean),
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  optionsSuccessStatus: 200,
};

// Use development CORS in development, production in production
const corsOptions = process.env.NODE_ENV === 'production' ? prodCorsOptions : devCorsOptions;

export const corsMw = cors(corsOptions);

function isCorsPreflight(req: Request): boolean {
  return (
    req.method === 'OPTIONS' &&
    req.headers.origin &&
    req.headers['access-control-request-method']
  );
}

export function corsPreflightHandler(req: Request, res: Response, next: NextFunction) {
  if (isCorsPreflight(req)) {
    // Handle preflight requests
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.status(200).end();
    return;
  }
  next();
}

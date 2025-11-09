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
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'x-refresh-token',
    'X-Requested-With',
    'Accept',
    'Accept-Encoding',
    'Accept-Language',
    'Cache-Control',
    'Connection',
    'DNT',
    'Origin',
    'Pragma',
    'Referer',
    'User-Agent'
  ],
  exposedHeaders: ['x-refresh-token'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  optionsSuccessStatus: 204,
  maxAge: 600, // 10 minutes
  preflightContinue: false
};

function expandOrigins(origins: string[]): string[] {
  const expanded = new Set<string>();

  for (const origin of origins) {
    if (!origin) continue;
    expanded.add(origin);

    try {
      const url = new URL(origin);
      const baseHost = url.hostname.replace(/^www\./, '');
      const port = url.port ? `:${url.port}` : '';

      if (baseHost && baseHost !== url.hostname) {
        // Already had www; add bare domain
        expanded.add(`${url.protocol}//${baseHost}${port}`);
      } else if (baseHost) {
        // Bare domain provided; add www variant
        expanded.add(`${url.protocol}//www.${baseHost}${port}`);
      }
    } catch (error) {
      // Ignore malformed entries and continue
      continue;
    }
  }

  return Array.from(expanded);
}

const configuredOrigins = (process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);

function normalizeOrigin(origin: string): string | null {
  try {
    const url = new URL(origin);
    const host = url.host; // host already contains port if present
    return `${url.protocol}//${host}`;
  } catch (error) {
    return null;
  }
}

const allowedOrigins = new Set(
  expandOrigins(configuredOrigins.length ? configuredOrigins : ['https://promorang.co'])
    .map(normalizeOrigin)
    .filter((origin): origin is string => Boolean(origin))
);

// Production CORS options - more restrictive
const prodCorsOptions: CorsOptions = {
  origin: (requestOrigin: string | undefined, callback: OriginCallback) => {
    if (!requestOrigin) {
      // Non-browser or same-origin request - allow
      return callback(null, true);
    }

    const normalizedOrigin = normalizeOrigin(requestOrigin);
    if (normalizedOrigin && allowedOrigins.has(normalizedOrigin)) {
      return callback(null, true);
    }

    // Try expanding variants (www vs bare) for dynamic matches
    if (normalizedOrigin) {
      const variants = expandOrigins([normalizedOrigin]);
      for (const variant of variants) {
        const normalizedVariant = normalizeOrigin(variant);
        if (normalizedVariant && allowedOrigins.has(normalizedVariant)) {
          return callback(null, true);
        }
      }
    }

    return callback(new Error(`Origin ${requestOrigin} not allowed by CORS`), false);
  },
  credentials: true,
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'x-refresh-token',
    'X-Requested-With',
    'Accept',
    'Accept-Encoding',
    'Accept-Language',
    'Cache-Control',
    'Connection',
    'DNT',
    'Origin',
    'Pragma',
    'Referer',
    'User-Agent'
  ],
  exposedHeaders: ['x-refresh-token'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  optionsSuccessStatus: 204,
  maxAge: 600, // 10 minutes
  preflightContinue: false
};

// Use development CORS in development, production in production
const corsOptions = process.env.NODE_ENV === 'production' ? prodCorsOptions : devCorsOptions;

export const corsMw = cors(corsOptions);

function isCorsPreflight(req: Request): boolean {
  return (
    req.method === 'OPTIONS' &&
    Boolean(req.headers.origin) &&
    Boolean(req.headers['access-control-request-method'])
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

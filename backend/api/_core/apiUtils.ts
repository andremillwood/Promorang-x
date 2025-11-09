import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from './supabase';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
    [key: string]: any;
  };
}

export const handleError = (res: Response, error: any, message: string) => {
  console.error(`${message}:`, error);
  res.status(500).json({ 
    success: false, 
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message 
  });
};

// Note: requireAuth middleware has been moved to _core/auth.ts
// Import it from there instead: import { requireAuth } from '../_core/auth';

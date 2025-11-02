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

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }
  next();
};

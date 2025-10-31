import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
        role?: string;
        [key: string]: any;
      };
      token?: string;
    }
  }
}

// This export is needed to make this a module
export {};

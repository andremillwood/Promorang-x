import type { Response } from 'express';
import type { AuthenticatedRequest } from './apiUtils';

const authMiddleware = require('../../middleware/auth');

export function requireAuth(req: AuthenticatedRequest, res: Response, next: () => void) {
  return authMiddleware.requireAuth(req, res, next);
}

import type { Request, Response } from 'express';

export type AuthenticatedRequest = Request & {
  user?: {
    id: string;
    email?: string;
    role?: string;
    user_type?: string;
  };
};

export function handleError(res: Response, error: unknown, fallbackMessage = 'Request failed') {
  const message = error instanceof Error ? error.message : fallbackMessage;
  console.error(fallbackMessage, error);
  return res.status(500).json({ success: false, error: message });
}

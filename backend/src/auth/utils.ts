import { sign, verify, JwtPayload } from 'jsonwebtoken';
import { config } from '../config';

// JWT token interface
export interface TokenPayload extends JwtPayload {
  userId: string;
  id?: string;
  email: string;
  username?: string;
  display_name?: string;
  user_type?: string;
  role?: string;
  advertiser_tier?: string | null;
}

// Generate JWT token
export const generateToken = (payload: Omit<TokenPayload, 'exp' | 'iat'>): string => {
  const enrichedPayload: TokenPayload = {
    ...payload,
    id: payload.id || payload.userId,
    role: payload.role || payload.user_type,
  } as TokenPayload;

  return sign(enrichedPayload, config.jwtSecret, { expiresIn: '7d' });
};

// Verify JWT token
export const verifyToken = (token: string): TokenPayload => {
  return verify(token, config.jwtSecret) as TokenPayload;
};

// Hash password (using bcryptjs which is compatible with Vercel)
import { hash, compare } from 'bcryptjs';

export const hashPassword = async (password: string): Promise<string> => {
  return await hash(password, 10);
};

export const verifyPassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  if (!password || !hashedPassword) {
    console.error('Missing password or hash for verification');
    return false;
  }
  return await compare(password, hashedPassword);
};

// Generate refresh token (longer expiration)
export const generateRefreshToken = (payload: { userId: string }): string => {
  return sign(
    { userId: payload.userId },
    config.jwtSecret,
    { expiresIn: '30d' }
  );
};

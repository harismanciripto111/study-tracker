import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import { config } from '../config';

export interface TokenPayload {
  userId: string;
  role: string;
}

/**
 * Generate a signed JWT token for a user.
 */
export function generateToken(userId: string, role: string): string {
  const payload: TokenPayload = { userId, role };
  const options: SignOptions = {
    expiresIn: (config.jwtExpiresIn as SignOptions['expiresIn']) ?? '7d',
  };
  return jwt.sign(payload, config.jwtSecret, options);
}

/**
 * Verify a JWT token and return its payload.
 * Throws JsonWebTokenError / TokenExpiredError on failure.
 */
export function verifyToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload & TokenPayload;
  return {
    userId: decoded.userId,
    role: decoded.role,
  };
}

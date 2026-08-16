import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET || process.env.intrushield;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('[CRITICAL SECURITY ERROR] JWT_SECRET environment variable is missing in production environment.');
    }
    return 'intrushield-secret-key-soc-2026-dev-only';
  }
  return secret;
}

const JWT_SECRET = getJwtSecret();

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export function generateToken(payload: { id: string; email: string; role: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyToken(token: string): { id: string; email: string; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
  } catch {
    return null;
  }
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. Missing or malformed Bearer token.' });
    return;
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);

  if (!decoded) {
    res.status(401).json({ error: 'Invalid or expired authentication token.' });
    return;
  }

  req.user = decoded;
  next();
}
